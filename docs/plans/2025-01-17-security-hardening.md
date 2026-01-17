# Security Hardening Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all security vulnerabilities from Critical to Low priority, protecting the HackathonProxy app against DDoS, brute force, data breaches, and common web attacks.

**Architecture:** Add middleware-based security layer with rate limiting, migrate to hashed API keys with SHA-256 prefix lookup, add authentication to all endpoints, implement proper session management with secure cookies, add input validation with Zod, and configure security headers.

**Tech Stack:** Next.js 16 App Router, Prisma/SQLite, zod (validation), argon2 (hashing), rate-limiter-flexible (rate limiting), secure-headers middleware

---

## Phase 1: Dependencies & Infrastructure

### Task 1: Install Security Dependencies

**Files:**

- Modify: `package.json`

**Step 1: Install production dependencies**

Run:

```bash
npm install zod argon2 rate-limiter-flexible lru-cache
```

**Step 2: Install dev dependencies for testing**

Run:

```bash
npm install -D @types/argon2
```

**Step 3: Verify installation**

Run: `npm ls zod argon2 rate-limiter-flexible lru-cache`
Expected: All packages listed without errors

**Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add security dependencies (zod, argon2, rate-limiter-flexible, lru-cache)"
```

---

### Task 2: Create Rate Limiter Utility

**Files:**

- Create: `lib/rate-limit.ts`

**Step 1: Create the rate limiter module**

```typescript
import { RateLimiterMemory } from "rate-limiter-flexible";
import { NextResponse } from "next/server";

// Different limiters for different endpoints
const limiters = {
  // Strict: Login attempts (5 per minute per IP)
  login: new RateLimiterMemory({
    points: 5,
    duration: 60,
    keyPrefix: "login",
  }),

  // Standard: API calls (100 per minute per API key)
  api: new RateLimiterMemory({
    points: 100,
    duration: 60,
    keyPrefix: "api",
  }),

  // Relaxed: Read-only endpoints (200 per minute per IP)
  read: new RateLimiterMemory({
    points: 200,
    duration: 60,
    keyPrefix: "read",
  }),

  // Very strict: Admin actions (20 per minute per API key)
  admin: new RateLimiterMemory({
    points: 20,
    duration: 60,
    keyPrefix: "admin",
  }),

  // Presence heartbeat (60 per minute per user - once per second)
  presence: new RateLimiterMemory({
    points: 60,
    duration: 60,
    keyPrefix: "presence",
  }),
};

export type RateLimitType = keyof typeof limiters;

export async function rateLimit(key: string, type: RateLimitType = "api"): Promise<{ success: boolean; remaining: number; resetMs: number }> {
  try {
    const limiter = limiters[type];
    const result = await limiter.consume(key);
    return {
      success: true,
      remaining: result.remainingPoints,
      resetMs: result.msBeforeNext,
    };
  } catch (rejRes) {
    const rej = rejRes as { remainingPoints: number; msBeforeNext: number };
    return {
      success: false,
      remaining: rej.remainingPoints ?? 0,
      resetMs: rej.msBeforeNext ?? 60000,
    };
  }
}

export function rateLimitResponse(resetMs: number): NextResponse {
  return NextResponse.json(
    { error: "Too many requests. Please slow down." },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.ceil(resetMs / 1000)),
        "X-RateLimit-Remaining": "0",
      },
    },
  );
}

export function getClientIP(request: Request): string {
  // Check common proxy headers
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Cloudflare
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) {
    return cfIp;
  }

  return "unknown";
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add lib/rate-limit.ts
git commit -m "feat: add rate limiter utility with per-endpoint limits"
```

---

### Task 3: Create Input Validation Schemas

**Files:**

- Create: `lib/validation.ts`

**Step 1: Create Zod schemas for all API inputs**

```typescript
import { z } from "zod";

// Login schema
export const loginSchema = z.object({
  apiKey: z
    .string()
    .min(1, "API key is required")
    .max(200, "API key too long")
    .regex(/^[\w-]+$/, "Invalid API key format"),
});

// Create user schema
export const createUserSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name too long")
    .regex(/^[\w\s-]+$/, "Name contains invalid characters"),
});

// Track request schema
export const trackRequestSchema = z.object({
  model: z
    .string()
    .min(1, "Model is required")
    .max(100, "Model name too long")
    .regex(/^[\w./-]+$/, "Invalid model name format"),
  tokens: z.number().int().min(0).max(10000000).optional().default(0),
});

// Presence schema
export const presenceSchema = z.object({
  userId: z
    .string()
    .min(1, "User ID is required")
    .max(50, "User ID too long")
    .regex(/^[\w-]+$/, "Invalid user ID format"),
  offline: z.boolean().optional().default(false),
});

// Tunnel action schema
export const tunnelActionSchema = z.object({
  action: z.enum(["restart"]),
});

// Allowed models whitelist (add your models here)
export const ALLOWED_MODELS = [
  "claude-3-opus",
  "claude-3-sonnet",
  "claude-3-haiku",
  "claude-3.5-sonnet",
  "claude-3.5-haiku",
  "gpt-4",
  "gpt-4-turbo",
  "gpt-4o",
  "gpt-3.5-turbo",
  // Add more as needed, or remove this whitelist if you want to allow any model
] as const;

// Validate and parse with helpful error messages
export function validateBody<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const firstError = result.error.errors[0];
  return {
    success: false,
    error: firstError?.message || "Invalid input",
  };
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add lib/validation.ts
git commit -m "feat: add Zod validation schemas for all API inputs"
```

---

### Task 4: Create API Key Hashing Utility

**Files:**

- Create: `lib/api-key-hash.ts`

**Step 1: Create the hashing module**

```typescript
import * as argon2 from "argon2";
import { randomBytes } from "crypto";

// API key format: sk-hackathon-{name}-{random}
// We store: { prefix (first 12 chars for lookup), hash (argon2) }

const PREFIX_LENGTH = 16; // "sk-hackathon-xxx" enough to identify

/**
 * Generate a new API key
 */
export function generateApiKey(userName: string): string {
  const safeName = userName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 10);
  const randomPart = randomBytes(24).toString("base64url"); // 192 bits of entropy
  return `sk-hackathon-${safeName}-${randomPart}`;
}

/**
 * Extract the prefix for database lookup
 */
export function getKeyPrefix(apiKey: string): string {
  return apiKey.slice(0, PREFIX_LENGTH);
}

/**
 * Hash an API key for storage
 */
export async function hashApiKey(apiKey: string): Promise<string> {
  return argon2.hash(apiKey, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16, // 64 MB
    timeCost: 3,
    parallelism: 1,
  });
}

/**
 * Verify an API key against a hash
 */
export async function verifyApiKey(apiKey: string, hash: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, apiKey);
  } catch {
    return false;
  }
}

/**
 * Check if a hash needs to be rehashed (e.g., if argon2 params changed)
 */
export function needsRehash(hash: string): boolean {
  return argon2.needsRehash(hash);
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add lib/api-key-hash.ts
git commit -m "feat: add API key hashing utility with argon2id"
```

---

### Task 5: Create Bounded Presence Store

**Files:**

- Create: `lib/presence-store.ts`

**Step 1: Create LRU-bounded presence store**

```typescript
import { LRUCache } from "lru-cache";

interface PresenceEntry {
  lastSeen: number;
  online: boolean;
}

// Bounded to 1000 entries max, auto-evicts least recently used
const presenceCache = new LRUCache<string, PresenceEntry>({
  max: 1000,
  ttl: 5 * 60 * 1000, // 5 minute TTL
});

const STALE_THRESHOLD_MS = 60_000; // 60 seconds

export function setPresence(userId: string, online: boolean): void {
  presenceCache.set(userId, {
    lastSeen: Date.now(),
    online,
  });
}

export function getPresence(userId: string): boolean {
  const entry = presenceCache.get(userId);
  if (!entry) return false;

  const isStale = Date.now() - entry.lastSeen > STALE_THRESHOLD_MS;
  return entry.online && !isStale;
}

export function getAllPresence(): Record<string, boolean> {
  const now = Date.now();
  const result: Record<string, boolean> = {};

  for (const [key, value] of presenceCache.entries()) {
    const isOnline = value.online && now - value.lastSeen < STALE_THRESHOLD_MS;
    result[key] = isOnline;
  }

  return result;
}

export function getPresenceStats(): { total: number; online: number } {
  const all = getAllPresence();
  const online = Object.values(all).filter(Boolean).length;
  return { total: Object.keys(all).length, online };
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add lib/presence-store.ts
git commit -m "feat: add LRU-bounded presence store (max 1000 entries)"
```

---

## Phase 2: Database Schema Migration

### Task 6: Update Prisma Schema for Hashed Keys

**Files:**

- Modify: `prisma/schema.prisma`

**Step 1: Update the User model**

Replace the schema with:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../lib/generated/prisma"
}

datasource db {
  provider = "sqlite"
}

model User {
  id           String   @id @default(cuid())
  name         String
  apiKeyPrefix String   @unique // First 16 chars for lookup
  apiKeyHash   String   // Argon2 hash of full key
  isAdmin      Boolean  @default(false)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  requests Request[]

  @@index([apiKeyPrefix])
}

model Request {
  id        String   @id @default(cuid())
  userId    String
  model     String
  tokens    Int      @default(0)
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([createdAt])
}
```

**Step 2: Generate migration**

Run:

```bash
cd /home/louiskaneko/dev/HackathonProxy && npx prisma migrate dev --name add_hashed_api_keys
```

Note: This will warn about data loss for the `apiKey` column. For a 4-person hackathon, you can recreate users. If you need to migrate existing keys, we'll add a migration script.

**Step 3: Regenerate Prisma client**

Run:

```bash
npx prisma generate
```

Expected: Prisma Client generated

**Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: update schema for hashed API keys with prefix lookup"
```

---

### Task 7: Create Admin Seed Script

**Files:**

- Create: `prisma/seed-admin.ts`

**Step 1: Create the seed script**

```typescript
import { PrismaClient } from "../lib/generated/prisma";
import { generateApiKey, getKeyPrefix, hashApiKey } from "../lib/api-key-hash";

const prisma = new PrismaClient();

async function main() {
  // Generate admin API key
  const adminKey = generateApiKey("admin");
  const prefix = getKeyPrefix(adminKey);
  const hash = await hashApiKey(adminKey);

  // Create or update admin user
  const admin = await prisma.user.upsert({
    where: { apiKeyPrefix: prefix },
    update: {},
    create: {
      name: "Admin",
      apiKeyPrefix: prefix,
      apiKeyHash: hash,
      isAdmin: true,
    },
  });

  console.log("=".repeat(60));
  console.log("ADMIN USER CREATED");
  console.log("=".repeat(60));
  console.log(`Name: ${admin.name}`);
  console.log(`ID: ${admin.id}`);
  console.log("");
  console.log("YOUR ADMIN API KEY (save this, it cannot be recovered):");
  console.log("");
  console.log(`  ${adminKey}`);
  console.log("");
  console.log("=".repeat(60));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Step 2: Add seed script to package.json**

Add to scripts section:

```json
"seed:admin": "tsx prisma/seed-admin.ts"
```

**Step 3: Commit**

```bash
git add prisma/seed-admin.ts package.json
git commit -m "feat: add admin seed script for initial setup"
```

---

## Phase 3: Secure API Endpoints

### Task 8: Create Auth Helper

**Files:**

- Create: `lib/auth.ts`

**Step 1: Create authentication helper**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "./prisma";
import { getKeyPrefix, verifyApiKey } from "./api-key-hash";
import { rateLimit, rateLimitResponse, getClientIP, RateLimitType } from "./rate-limit";

export interface AuthenticatedUser {
  id: string;
  name: string;
  isAdmin: boolean;
}

interface AuthResult {
  user: AuthenticatedUser | null;
  error: NextResponse | null;
}

/**
 * Authenticate request via x-api-key header
 */
export async function authenticateApiKey(req: NextRequest, options: { requireAdmin?: boolean; rateLimitType?: RateLimitType } = {}): Promise<AuthResult> {
  const { requireAdmin = false, rateLimitType = "api" } = options;

  // Get API key from header
  const apiKey = req.headers.get("x-api-key");

  if (!apiKey) {
    return {
      user: null,
      error: NextResponse.json({ error: "Unauthorized - API key required" }, { status: 401 }),
    };
  }

  // Rate limit by API key prefix
  const prefix = getKeyPrefix(apiKey);
  const limit = await rateLimit(prefix, rateLimitType);

  if (!limit.success) {
    return {
      user: null,
      error: rateLimitResponse(limit.resetMs),
    };
  }

  // Find user by prefix
  const user = await prisma.user.findUnique({
    where: { apiKeyPrefix: prefix },
    select: { id: true, name: true, isAdmin: true, apiKeyHash: true },
  });

  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: "Invalid API key" }, { status: 401 }),
    };
  }

  // Verify full key hash
  const isValid = await verifyApiKey(apiKey, user.apiKeyHash);

  if (!isValid) {
    return {
      user: null,
      error: NextResponse.json({ error: "Invalid API key" }, { status: 401 }),
    };
  }

  // Check admin requirement
  if (requireAdmin && !user.isAdmin) {
    return {
      user: null,
      error: NextResponse.json({ error: "Admin access required" }, { status: 403 }),
    };
  }

  return {
    user: { id: user.id, name: user.name, isAdmin: user.isAdmin },
    error: null,
  };
}

/**
 * Authenticate request via userId cookie (for tunnel endpoint)
 */
export async function authenticateCookie(options: { requireAdmin?: boolean } = {}): Promise<AuthResult> {
  const { requireAdmin = false } = options;

  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    return {
      user: null,
      error: NextResponse.json({ error: "Unauthorized - login required" }, { status: 401 }),
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, isAdmin: true },
  });

  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: "Invalid session" }, { status: 401 }),
    };
  }

  if (requireAdmin && !user.isAdmin) {
    return {
      user: null,
      error: NextResponse.json({ error: "Admin access required" }, { status: 403 }),
    };
  }

  return {
    user: { id: user.id, name: user.name, isAdmin: user.isAdmin },
    error: null,
  };
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add lib/auth.ts
git commit -m "feat: add centralized auth helper with rate limiting"
```

---

### Task 9: Secure Login Endpoint

**Files:**

- Modify: `app/api/auth/login/route.ts`

**Step 1: Rewrite with rate limiting and validation**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { loginSchema, validateBody } from "@/lib/validation";
import { getKeyPrefix, verifyApiKey } from "@/lib/api-key-hash";
import { rateLimit, rateLimitResponse, getClientIP } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    // Rate limit by IP (strict for login)
    const clientIP = getClientIP(req);
    const limit = await rateLimit(clientIP, "login");

    if (!limit.success) {
      return rateLimitResponse(limit.resetMs);
    }

    // Parse and validate body
    const body = await req.json();
    const validation = validateBody(loginSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { apiKey } = validation.data;

    // Find user by prefix
    const prefix = getKeyPrefix(apiKey);
    const user = await prisma.user.findUnique({
      where: { apiKeyPrefix: prefix },
      select: { id: true, name: true, isAdmin: true, apiKeyHash: true },
    });

    if (!user) {
      // Use same error message to prevent enumeration
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    // Verify full key
    const isValid = await verifyApiKey(apiKey, user.apiKeyHash);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    // Set secure session cookie
    const cookieStore = await cookies();
    cookieStore.set("userId", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({
      id: user.id,
      name: user.name,
      isAdmin: user.isAdmin,
      // Return masked key prefix for display only
      apiKey: prefix + "...",
    });
  } catch (error) {
    console.error("Login error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add app/api/auth/login/route.ts
git commit -m "fix: secure login with rate limiting, validation, hashed keys, secure cookies"
```

---

### Task 10: Secure Users Endpoints

**Files:**

- Modify: `app/api/users/route.ts`

**Step 1: Rewrite with security measures**

```typescript
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateApiKey } from "@/lib/auth";
import { createUserSchema, validateBody } from "@/lib/validation";
import { generateApiKey, getKeyPrefix, hashApiKey } from "@/lib/api-key-hash";

// GET /api/users - List all users (admin only)
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await authenticateApiKey(req, {
      requireAdmin: true,
      rateLimitType: "admin",
    });

    if (error) return error;

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        apiKeyPrefix: true,
        isAdmin: true,
        createdAt: true,
        _count: { select: { requests: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      users.map((u) => ({
        id: u.id,
        name: u.name,
        apiKey: u.apiKeyPrefix + "...", // Only show prefix
        isAdmin: u.isAdmin,
        requests: u._count.requests,
        createdAt: u.createdAt.toISOString(),
      })),
    );
  } catch (error) {
    console.error("Get users error:", error instanceof Error ? error.message : "Unknown");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/users - Create new user (admin only)
export async function POST(req: NextRequest) {
  try {
    const { user, error } = await authenticateApiKey(req, {
      requireAdmin: true,
      rateLimitType: "admin",
    });

    if (error) return error;

    const body = await req.json();
    const validation = validateBody(createUserSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { name } = validation.data;

    // Generate secure API key
    const newApiKey = generateApiKey(name);
    const prefix = getKeyPrefix(newApiKey);
    const hash = await hashApiKey(newApiKey);

    // Check for prefix collision (extremely unlikely but handle it)
    const existing = await prisma.user.findUnique({
      where: { apiKeyPrefix: prefix },
    });

    if (existing) {
      return NextResponse.json({ error: "Key generation collision, please try again" }, { status: 409 });
    }

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        apiKeyPrefix: prefix,
        apiKeyHash: hash,
        isAdmin: false,
      },
    });

    // Return full API key ONCE - it cannot be recovered after this
    return NextResponse.json({
      id: newUser.id,
      name: newUser.name,
      apiKey: newApiKey, // Full key - show once!
      isAdmin: newUser.isAdmin,
      requests: 0,
      createdAt: newUser.createdAt.toISOString(),
      warning: "Save this API key now. It cannot be recovered.",
    });
  } catch (error) {
    console.error("Create user error:", error instanceof Error ? error.message : "Unknown");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add app/api/users/route.ts
git commit -m "fix: secure users endpoint with auth, validation, hashed keys"
```

---

### Task 11: Secure User Delete Endpoint

**Files:**

- Modify: `app/api/users/[id]/route.ts`

**Step 1: Rewrite with security measures**

```typescript
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateApiKey } from "@/lib/auth";

// DELETE /api/users/[id] - Delete a user (admin only)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Validate ID format
    if (!id || !/^[\w-]+$/.test(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const { user, error } = await authenticateApiKey(req, {
      requireAdmin: true,
      rateLimitType: "admin",
    });

    if (error) return error;

    // Prevent self-deletion
    if (user!.id === id) {
      return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
    }

    // Check if user exists
    const userToDelete = await prisma.user.findUnique({
      where: { id },
    });

    if (!userToDelete) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error instanceof Error ? error.message : "Unknown");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

**Step 2: Commit**

```bash
git add app/api/users/[id]/route.ts
git commit -m "fix: secure user delete endpoint with auth and validation"
```

---

### Task 12: Secure Track Endpoint

**Files:**

- Modify: `app/api/track/route.ts`

**Step 1: Rewrite with security measures**

```typescript
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateApiKey } from "@/lib/auth";
import { trackRequestSchema, validateBody, ALLOWED_MODELS } from "@/lib/validation";

// POST /api/track - Track a request made through the proxy
export async function POST(req: NextRequest) {
  try {
    const { user, error } = await authenticateApiKey(req, {
      rateLimitType: "api",
    });

    if (error) return error;

    const body = await req.json();
    const validation = validateBody(trackRequestSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { model, tokens } = validation.data;

    // Optional: Validate against allowed models whitelist
    // Uncomment if you want strict model validation
    // if (!ALLOWED_MODELS.includes(model as any)) {
    //   return NextResponse.json({ error: "Unknown model" }, { status: 400 });
    // }

    const request = await prisma.request.create({
      data: {
        userId: user!.id,
        model,
        tokens,
      },
    });

    return NextResponse.json({
      success: true,
      requestId: request.id,
    });
  } catch (error) {
    console.error("Track request error:", error instanceof Error ? error.message : "Unknown");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/track - Get user's own request history
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await authenticateApiKey(req, {
      rateLimitType: "read",
    });

    if (error) return error;

    // Get user's requests (last 100)
    const requests = await prisma.request.findMany({
      where: { userId: user!.id },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        model: true,
        tokens: true,
        createdAt: true,
      },
    });

    const totalRequests = await prisma.request.count({
      where: { userId: user!.id },
    });

    const modelCounts = await prisma.request.groupBy({
      by: ["model"],
      where: { userId: user!.id },
      _count: { model: true },
      orderBy: { _count: { model: "desc" } },
    });

    return NextResponse.json({
      totalRequests,
      modelBreakdown: modelCounts.map((m) => ({
        model: m.model,
        count: m._count.model,
      })),
      recentRequests: requests,
    });
  } catch (error) {
    console.error("Get requests error:", error instanceof Error ? error.message : "Unknown");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

**Step 2: Commit**

```bash
git add app/api/track/route.ts
git commit -m "fix: secure track endpoint with auth, validation, rate limiting"
```

---

### Task 13: Secure Stats Endpoint

**Files:**

- Modify: `app/api/stats/route.ts`

**Step 1: Rewrite with security measures**

```typescript
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateApiKey } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await authenticateApiKey(req, {
      rateLimitType: "read",
    });

    if (error) return error;

    // Get total requests
    const totalRequests = await prisma.request.count();

    // Get active users today
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeToday = await prisma.request.groupBy({
      by: ["userId"],
      where: { createdAt: { gte: oneDayAgo } },
    });

    // Get top model
    const modelCounts = await prisma.request.groupBy({
      by: ["model"],
      _count: { model: true },
      orderBy: { _count: { model: "desc" } },
      take: 1,
    });

    const topModel = modelCounts[0]?.model || "No data yet";

    // Get total users
    const totalUsers = await prisma.user.count();

    return NextResponse.json({
      totalRequests,
      activeToday: activeToday.length,
      topModel,
      totalUsers,
    });
  } catch (error) {
    console.error("Stats error:", error instanceof Error ? error.message : "Unknown");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

**Step 2: Commit**

```bash
git add app/api/stats/route.ts
git commit -m "fix: secure stats endpoint with auth and rate limiting"
```

---

### Task 14: Secure Leaderboard Endpoint

**Files:**

- Modify: `app/api/leaderboard/route.ts`

**Step 1: Rewrite with pagination and security**

```typescript
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateApiKey } from "@/lib/auth";

const MAX_USERS = 50; // Limit results to prevent memory issues

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await authenticateApiKey(req, {
      rateLimitType: "read",
    });

    if (error) return error;

    // Get users with aggregated request counts (more efficient than loading all requests)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        _count: { select: { requests: true } },
      },
      orderBy: {
        requests: { _count: "desc" },
      },
      take: MAX_USERS,
    });

    // Get additional stats per user in parallel
    const leaderboard = await Promise.all(
      users.map(async (u, index) => {
        // Get top model for this user
        const topModelResult = await prisma.request.groupBy({
          by: ["model"],
          where: { userId: u.id },
          _count: { model: true },
          orderBy: { _count: { model: "desc" } },
          take: 1,
        });

        // Get unique models
        const uniqueModels = await prisma.request.groupBy({
          by: ["model"],
          where: { userId: u.id },
        });

        // Get last request time
        const lastRequest = await prisma.request.findFirst({
          where: { userId: u.id },
          orderBy: { createdAt: "desc" },
          select: { createdAt: true },
        });

        return {
          rank: index + 1,
          id: u.id,
          name: u.name,
          requests: u._count.requests,
          topModel: topModelResult[0]?.model || "N/A",
          modelsUsed: uniqueModels.map((m) => m.model),
          lastActive: lastRequest ? formatTimeAgo(lastRequest.createdAt) : "Never",
        };
      }),
    );

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("Leaderboard error:", error instanceof Error ? error.message : "Unknown");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
```

**Step 2: Commit**

```bash
git add app/api/leaderboard/route.ts
git commit -m "fix: secure leaderboard with auth, pagination, efficient queries"
```

---

### Task 15: Secure Presence Endpoint

**Files:**

- Modify: `app/api/presence/route.ts`

**Step 1: Rewrite with auth and bounded store**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { authenticateApiKey, authenticateCookie } from "@/lib/auth";
import { presenceSchema, validateBody } from "@/lib/validation";
import { setPresence, getAllPresence } from "@/lib/presence-store";
import { rateLimit, rateLimitResponse, getClientIP } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    // Authenticate via API key or cookie
    const apiKey = req.headers.get("x-api-key");

    let userId: string;

    if (apiKey) {
      const { user, error } = await authenticateApiKey(req, {
        rateLimitType: "presence",
      });
      if (error) return error;
      userId = user!.id;
    } else {
      const { user, error } = await authenticateCookie();
      if (error) return error;

      // Rate limit by IP for cookie-based auth
      const ip = getClientIP(req);
      const limit = await rateLimit(ip, "presence");
      if (!limit.success) return rateLimitResponse(limit.resetMs);

      userId = user!.id;
    }

    const body = await req.json();
    const validation = validateBody(presenceSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Validate that the userId matches the authenticated user
    if (validation.data.userId !== userId) {
      return NextResponse.json({ error: "Cannot set presence for other users" }, { status: 403 });
    }

    setPresence(userId, !validation.data.offline);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Presence POST error:", error instanceof Error ? error.message : "Unknown");
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // Require authentication for reading presence too
    const apiKey = req.headers.get("x-api-key");

    if (apiKey) {
      const { error } = await authenticateApiKey(req, { rateLimitType: "read" });
      if (error) return error;
    } else {
      const { error } = await authenticateCookie();
      if (error) return error;
    }

    return NextResponse.json(getAllPresence());
  } catch (error) {
    console.error("Presence GET error:", error instanceof Error ? error.message : "Unknown");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

**Step 2: Commit**

```bash
git add app/api/presence/route.ts
git commit -m "fix: secure presence endpoint with auth, validation, bounded store"
```

---

### Task 16: Secure Tunnel Endpoint

**Files:**

- Modify: `app/api/tunnel/route.ts`

**Step 1: Rewrite with auth on GET**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { tunnelManager } from "@/lib/tunnel-manager";
import { authenticateCookie } from "@/lib/auth";
import { tunnelActionSchema, validateBody } from "@/lib/validation";
import { rateLimit, rateLimitResponse, getClientIP } from "@/lib/rate-limit";

let initialized = false;

function ensureInitialized() {
  if (!initialized && typeof window === "undefined") {
    tunnelManager.start();
    initialized = true;
  }
}

// GET - Requires authentication now
export async function GET(req: NextRequest) {
  try {
    const { error } = await authenticateCookie();
    if (error) return error;

    ensureInitialized();
    const status = tunnelManager.getStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error("Tunnel GET error:", error instanceof Error ? error.message : "Unknown");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Admin only
export async function POST(req: NextRequest) {
  try {
    const { user, error } = await authenticateCookie({ requireAdmin: true });
    if (error) return error;

    // Rate limit admin actions by user ID
    const limit = await rateLimit(user!.id, "admin");
    if (!limit.success) return rateLimitResponse(limit.resetMs);

    const body = await req.json();
    const validation = validateBody(tunnelActionSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    if (validation.data.action === "restart") {
      tunnelManager.restart();
      return NextResponse.json({ message: "Restarting tunnel..." });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Tunnel POST error:", error instanceof Error ? error.message : "Unknown");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

**Step 2: Commit**

```bash
git add app/api/tunnel/route.ts
git commit -m "fix: secure tunnel endpoint - require auth on GET, admin on POST"
```

---

## Phase 4: Security Headers & Middleware

### Task 17: Create Security Middleware

**Files:**

- Create: `middleware.ts`

**Step 1: Create the middleware**

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Get the response
  const response = NextResponse.next();

  // Add security headers
  const headers = response.headers;

  // Prevent clickjacking
  headers.set("X-Frame-Options", "DENY");

  // Prevent MIME type sniffing
  headers.set("X-Content-Type-Options", "nosniff");

  // XSS Protection (legacy but still useful)
  headers.set("X-XSS-Protection", "1; mode=block");

  // Referrer Policy
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions Policy
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()");

  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js needs these
    "style-src 'self' 'unsafe-inline'", // Tailwind needs inline styles
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self' https://*.trycloudflare.com https://*.share.zrok.io",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
  ].join("; ");

  headers.set("Content-Security-Policy", csp);

  // Strict Transport Security (only in production)
  if (process.env.NODE_ENV === "production") {
    headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

**Step 2: Verify middleware is picked up**

Run: `npm run dev`
Expected: Server starts without errors

Check headers in browser DevTools Network tab.

**Step 3: Commit**

```bash
git add middleware.ts
git commit -m "feat: add security middleware with CSP, XSS, clickjacking protection"
```

---

### Task 18: Update Next.js Config

**Files:**

- Modify: `next.config.ts`

**Step 1: Tighten allowed origins**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only allow specific tunnel origins, not wildcards
  allowedDevOrigins: [
    "https://hackathoncrew.share.zrok.io",
    // Add your specific cloudflare tunnel URL here after it's stable
    // "https://your-specific-tunnel.trycloudflare.com",
  ],

  // Disable x-powered-by header
  poweredByHeader: false,

  // Enable strict mode
  reactStrictMode: true,
};

export default nextConfig;
```

**Step 2: Commit**

```bash
git add next.config.ts
git commit -m "fix: tighten allowed origins, disable powered-by header"
```

---

## Phase 5: Client-Side Security Updates

### Task 19: Update Auth Context for Secure Storage

**Files:**

- Modify: `lib/auth-context.tsx`

**Step 1: Remove raw API key storage**

```typescript
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { safeJsonParse } from "@/lib/api-utils";

interface User {
  id: string;
  name: string;
  apiKey: string; // This is now just the masked prefix
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (apiKey: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for existing session via API call instead of localStorage
    // The session cookie will be sent automatically
    const checkSession = async () => {
      try {
        const stored = sessionStorage.getItem("hackathon-user");
        if (stored) {
          setUser(safeJsonParse<User | null>(stored, null));
        }
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async (apiKey: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
        credentials: "include", // Include cookies
      });

      if (!res.ok) return false;

      const userData = await res.json();
      setUser(userData);

      // Store in sessionStorage (clears on browser close) instead of localStorage
      // Don't store the raw API key at all
      sessionStorage.setItem("hackathon-user", JSON.stringify(userData));

      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("hackathon-user");
    // Clear the session cookie by calling logout endpoint
    fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => {});
    router.push("/login");
  };

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
```

**Step 2: Commit**

```bash
git add lib/auth-context.tsx
git commit -m "fix: use sessionStorage instead of localStorage, don't store raw API key"
```

---

### Task 20: Create Logout Endpoint

**Files:**

- Create: `app/api/auth/logout/route.ts`

**Step 1: Create the logout endpoint**

```typescript
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();

    // Clear the session cookie
    cookieStore.set("userId", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0, // Expire immediately
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error instanceof Error ? error.message : "Unknown");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

**Step 2: Commit**

```bash
git add app/api/auth/logout/route.ts
git commit -m "feat: add secure logout endpoint that clears session cookie"
```

---

### Task 21: Update API Utils

**Files:**

- Modify: `lib/api-utils.ts`

**Step 1: Update to work without raw key storage**

```typescript
/**
 * Safely parse JSON with error handling
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Get API key for authenticated API calls
 * Now prompts user to enter key since we don't store it
 */
export function getRawApiKey(): string {
  if (typeof window === "undefined") return "";

  // Check session for temporary key storage during admin operations
  const sessionKey = sessionStorage.getItem("hackathon-temp-key");
  if (sessionKey) return sessionKey;

  // Prompt user to enter their API key for admin operations
  const key = prompt("Enter your API key to perform this action:");
  if (key) {
    // Store temporarily for this session
    sessionStorage.setItem("hackathon-temp-key", key);
    return key;
  }

  return "";
}

/**
 * Clear temporary API key from session
 */
export function clearTempApiKey(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("hackathon-temp-key");
  }
}
```

**Step 2: Commit**

```bash
git add lib/api-utils.ts
git commit -m "fix: update API utils to not persist raw API keys"
```

---

## Phase 6: Testing & Verification

### Task 22: Create Security Test Script

**Files:**

- Create: `scripts/test-security.sh`

**Step 1: Create the test script**

```bash
#!/bin/bash

# Security Test Script for HackathonProxy
# Run this to verify security measures are working

BASE_URL="${1:-http://localhost:3000}"

echo "=================================="
echo "Security Test Suite"
echo "Base URL: $BASE_URL"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

pass() { echo -e "${GREEN}✓ PASS${NC}: $1"; }
fail() { echo -e "${RED}✗ FAIL${NC}: $1"; }

# Test 1: Rate limiting on login
echo "Test 1: Rate limiting on login..."
for i in {1..7}; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"apiKey":"test-key"}')
  if [ "$STATUS" = "429" ]; then
    pass "Rate limit triggered after $i requests"
    break
  fi
done

# Test 2: Tunnel endpoint requires auth
echo ""
echo "Test 2: Tunnel endpoint requires auth..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/tunnel")
if [ "$STATUS" = "401" ]; then
  pass "Tunnel GET requires auth (401)"
else
  fail "Tunnel GET returned $STATUS (expected 401)"
fi

# Test 3: Presence endpoint requires auth
echo ""
echo "Test 3: Presence endpoint requires auth..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/presence")
if [ "$STATUS" = "401" ]; then
  pass "Presence GET requires auth (401)"
else
  fail "Presence GET returned $STATUS (expected 401)"
fi

# Test 4: Security headers
echo ""
echo "Test 4: Security headers..."
HEADERS=$(curl -s -I "$BASE_URL" 2>&1)

if echo "$HEADERS" | grep -qi "X-Frame-Options: DENY"; then
  pass "X-Frame-Options header present"
else
  fail "X-Frame-Options header missing"
fi

if echo "$HEADERS" | grep -qi "X-Content-Type-Options: nosniff"; then
  pass "X-Content-Type-Options header present"
else
  fail "X-Content-Type-Options header missing"
fi

if echo "$HEADERS" | grep -qi "Content-Security-Policy"; then
  pass "Content-Security-Policy header present"
else
  fail "Content-Security-Policy header missing"
fi

# Test 5: Invalid input validation
echo ""
echo "Test 5: Input validation..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"apiKey":"<script>alert(1)</script>"}')
if [ "$STATUS" = "400" ]; then
  pass "XSS in API key rejected (400)"
else
  fail "XSS input returned $STATUS (expected 400)"
fi

echo ""
echo "=================================="
echo "Security tests complete"
echo "=================================="
```

**Step 2: Make executable**

Run:

```bash
chmod +x scripts/test-security.sh
```

**Step 3: Commit**

```bash
git add scripts/test-security.sh
git commit -m "test: add security verification script"
```

---

### Task 23: Run Full Security Test

**Step 1: Start the dev server**

Run:

```bash
npm run dev
```

**Step 2: Run security tests**

In another terminal:

```bash
./scripts/test-security.sh http://localhost:3000
```

Expected: All tests pass

**Step 3: Create admin user**

Run:

```bash
npm run seed:admin
```

Save the admin API key!

**Step 4: Test login with new hashed key system**

Open browser to http://localhost:3000/login and test with the admin key.

---

### Task 24: Final Commit & Summary

**Step 1: Review all changes**

Run:

```bash
git status
git log --oneline -20
```

**Step 2: Create summary commit if needed**

If any files were missed:

```bash
git add -A
git commit -m "chore: final security hardening cleanup"
```

**Step 3: Tag the secure version**

```bash
git tag -a v1.1.0-secure -m "Security hardening complete"
```

---

## Summary

### Vulnerabilities Fixed

| Priority    | Issue                       | Status                                       |
| ----------- | --------------------------- | -------------------------------------------- |
| 🔴 Critical | No rate limiting            | ✅ Fixed - per-endpoint rate limits          |
| 🔴 Critical | Plaintext API keys          | ✅ Fixed - Argon2 hashing with prefix lookup |
| 🔴 Critical | Unauthenticated presence    | ✅ Fixed - requires auth                     |
| 🔴 Critical | Unauthenticated tunnel GET  | ✅ Fixed - requires auth                     |
| 🟠 High     | Weak API key generation     | ✅ Fixed - 192 bits entropy                  |
| 🟠 High     | No CSRF protection          | ✅ Fixed - SameSite cookies                  |
| 🟠 High     | Insecure cookies            | ✅ Fixed - HttpOnly, Secure, SameSite        |
| 🟠 High     | Wildcard tunnel origin      | ✅ Fixed - specific origins only             |
| 🟡 Medium   | Unbounded presence store    | ✅ Fixed - LRU cache with max 1000           |
| 🟡 Medium   | No input validation         | ✅ Fixed - Zod schemas                       |
| 🟡 Medium   | Heavy leaderboard queries   | ✅ Fixed - pagination + efficient queries    |
| 🟡 Medium   | SQLite in webroot           | ⚠️ Noted - move if deploying to production   |
| 🟢 Low      | Verbose error logging       | ✅ Fixed - sanitized messages                |
| 🟢 Low      | No security headers         | ✅ Fixed - CSP, XSS, clickjacking protection |
| 🟢 Low      | Raw API key in localStorage | ✅ Fixed - sessionStorage, no raw key        |

### New Dependencies

- `zod` - Input validation
- `argon2` - Secure password/key hashing
- `rate-limiter-flexible` - Rate limiting
- `lru-cache` - Bounded in-memory storage

### Files Changed/Created

**Created:**

- `lib/rate-limit.ts`
- `lib/validation.ts`
- `lib/api-key-hash.ts`
- `lib/presence-store.ts`
- `lib/auth.ts`
- `middleware.ts`
- `prisma/seed-admin.ts`
- `app/api/auth/logout/route.ts`
- `scripts/test-security.sh`

**Modified:**

- `prisma/schema.prisma`
- `package.json`
- `next.config.ts`
- `app/api/auth/login/route.ts`
- `app/api/users/route.ts`
- `app/api/users/[id]/route.ts`
- `app/api/track/route.ts`
- `app/api/stats/route.ts`
- `app/api/leaderboard/route.ts`
- `app/api/presence/route.ts`
- `app/api/tunnel/route.ts`
- `lib/auth-context.tsx`
- `lib/api-utils.ts`
