# Production Mode Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace all mock/demo data with a real SQLite database so friends can create accounts and use the hackathon proxy.

**Architecture:** Use Prisma ORM with SQLite for persistent storage. Create API routes for CRUD operations on users/API keys. Replace in-memory state with database queries. Admin can create keys, users authenticate with those keys.

**Tech Stack:** Prisma, SQLite, Next.js API Routes

---

## Task 1: Install and Configure Prisma

**Files:**
- Create: `prisma/schema.prisma`
- Modify: `package.json`

**Step 1: Install Prisma dependencies**

Run:
```bash
cd /home/louiskaneko/dev/HackathonProxy/.worktrees/production-mode
npm install prisma @prisma/client
npx prisma init --datasource-provider sqlite
```

**Step 2: Define the database schema**

Replace `prisma/schema.prisma` with:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./hackathon.db"
}

model User {
  id        String   @id @default(cuid())
  name      String
  apiKey    String   @unique
  isAdmin   Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  requests  Request[]
}

model Request {
  id        String   @id @default(cuid())
  userId    String
  model     String
  tokens    Int      @default(0)
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Step 3: Generate Prisma client and create database**

Run:
```bash
npx prisma db push
npx prisma generate
```

**Step 4: Create Prisma client singleton**

Create `lib/prisma.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
```

**Step 5: Add .gitignore entries**

Add to `.gitignore`:
```
prisma/hackathon.db
prisma/hackathon.db-journal
```

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: add Prisma with SQLite database schema

- User model with apiKey, name, isAdmin
- Request model for tracking usage
- Prisma client singleton

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 2: Create Database Seed Script

**Files:**
- Create: `prisma/seed.ts`
- Modify: `package.json`

**Step 1: Create seed script**

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const admin = await prisma.user.upsert({
    where: { apiKey: "admin" },
    update: {},
    create: {
      name: "Admin",
      apiKey: "admin",
      isAdmin: true,
    },
  });

  console.log("Created admin user:", admin);

  // Create some sample users for testing
  const louis = await prisma.user.upsert({
    where: { apiKey: "sk-hackathon-louis" },
    update: {},
    create: {
      name: "Louis",
      apiKey: "sk-hackathon-louis",
      isAdmin: true,
    },
  });

  console.log("Created user:", louis);
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

Add to `package.json` after "devDependencies":

```json
"prisma": {
  "seed": "npx tsx prisma/seed.ts"
}
```

**Step 3: Run seed**

```bash
npx prisma db seed
```

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add database seed script with admin user

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 3: Update Login API to Use Database

**Files:**
- Modify: `app/api/auth/login/route.ts`

**Step 1: Replace mock login with database lookup**

Replace entire file `app/api/auth/login/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { apiKey } = await req.json();

    if (!apiKey || typeof apiKey !== "string") {
      return NextResponse.json({ error: "API key required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { apiKey },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      isAdmin: user.isAdmin,
      apiKey: user.apiKey.length > 12 ? user.apiKey.slice(0, 12) + "..." : user.apiKey,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

**Step 2: Test login manually**

Run dev server and test:
```bash
npm run dev &
sleep 5
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"apiKey": "admin"}'
```

Expected: `{"id":"...","name":"Admin","isAdmin":true,"apiKey":"admin"}`

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: replace mock login with database authentication

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 4: Create Users API for Admin

**Files:**
- Create: `app/api/users/route.ts`
- Create: `app/api/users/[id]/route.ts`

**Step 1: Create users list/create API**

Create `app/api/users/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/users - List all users (admin only)
export async function GET(req: NextRequest) {
  try {
    // Get the requesting user's API key from header or query
    const apiKey = req.headers.get("x-api-key");

    if (!apiKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestingUser = await prisma.user.findUnique({
      where: { apiKey },
    });

    if (!requestingUser?.isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        apiKey: true,
        isAdmin: true,
        createdAt: true,
        _count: {
          select: { requests: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      users.map((u) => ({
        id: u.id,
        name: u.name,
        apiKey: u.apiKey,
        isAdmin: u.isAdmin,
        requests: u._count.requests,
        createdAt: u.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/users - Create new user (admin only)
export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get("x-api-key");

    if (!apiKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestingUser = await prisma.user.findUnique({
      where: { apiKey },
    });

    if (!requestingUser?.isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { name } = await req.json();

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Generate API key
    const safeName = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const randomPart = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
    const newApiKey = `sk-hackathon-${safeName}-${randomPart}`;

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        apiKey: newApiKey,
        isAdmin: false,
      },
    });

    return NextResponse.json({
      id: user.id,
      name: user.name,
      apiKey: user.apiKey,
      isAdmin: user.isAdmin,
      requests: 0,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

**Step 2: Create single user API (delete)**

Create `app/api/users/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// DELETE /api/users/[id] - Delete a user (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const apiKey = req.headers.get("x-api-key");

    if (!apiKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestingUser = await prisma.user.findUnique({
      where: { apiKey },
    });

    if (!requestingUser?.isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Prevent self-deletion
    if (requestingUser.id === id) {
      return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add users API for admin CRUD operations

- GET /api/users - list all users with request counts
- POST /api/users - create new user with generated API key
- DELETE /api/users/[id] - delete user

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 5: Update Admin Page to Use API

**Files:**
- Modify: `app/(authenticated)/admin/page.tsx`

**Step 1: Replace mock data with API calls**

Replace entire file `app/(authenticated)/admin/page.tsx`:

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";
import { Key, Plus, Shield, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { UserKeyCard } from "@/components/UserKeyCard";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

interface UserData {
  id: string;
  name: string;
  apiKey: string;
  requests: number;
  createdAt: string;
}

export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [newUserName, setNewUserName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get raw API key from localStorage
  const getRawApiKey = () => {
    const stored = localStorage.getItem("hackathon-user");
    if (stored) {
      const parsed = JSON.parse(stored);
      // If it's truncated, try to get from session or prompt
      if (parsed.apiKey?.endsWith("...")) {
        return localStorage.getItem("hackathon-raw-key") || "";
      }
      return parsed.apiKey || "";
    }
    return "";
  };

  const fetchUsers = useCallback(async () => {
    try {
      setError(null);
      const apiKey = getRawApiKey();
      const res = await fetch("/api/users", {
        headers: { "x-api-key": apiKey },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (!authLoading && user && !user.isAdmin) {
      router.push("/");
      return;
    }
    if (user?.isAdmin) {
      fetchUsers();
    }
  }, [user, authLoading, router, fetchUsers]);

  if (authLoading || !user || !user.isAdmin) return null;

  const handleCreateUser = async () => {
    if (!newUserName.trim()) return;

    try {
      setError(null);
      const apiKey = getRawApiKey();
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({ name: newUserName }),
      });

      if (!res.ok) {
        throw new Error("Failed to create user");
      }

      const newUser = await res.json();
      setUsers([newUser, ...users]);
      setNewUserName("");
      setIsCreating(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure? This will revoke their access.")) return;

    try {
      setError(null);
      const apiKey = getRawApiKey();
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
        headers: { "x-api-key": apiKey },
      });

      if (!res.ok) {
        throw new Error("Failed to delete user");
      }

      setUsers(users.filter((u) => u.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }} className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-info/10 border border-info/20">
            <Shield className="w-5 h-5 text-info" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            <span className="text-text-ghost">~/</span>
            <span className="text-gold">admin</span>
          </h1>
        </div>
        <p className="text-sm text-text-tertiary">Manage API keys for your hackathon crew.</p>
      </motion.div>

      {error && (
        <div className="p-4 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
          {error}
        </div>
      )}

      {/* Add user section */}
      <div className="surface-elevated p-5 border-info/20">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold flex items-center gap-2 text-text-primary">
            <Key className="w-4 h-4 text-info" />
            API Keys
          </h3>
          <div className="flex gap-2">
            <button onClick={fetchUsers} className="btn-ghost text-sm" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
            {!isCreating && (
              <button onClick={() => setIsCreating(true)} className="btn-primary text-sm">
                <Plus className="w-4 h-4" />
                Add User
              </button>
            )}
          </div>
        </div>

        {isCreating && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }} className="mb-5 p-4 bg-surface-0 rounded-lg border border-border-dim">
            <label className="block text-sm text-text-tertiary mb-2">Friend&apos;s name</label>
            <div className="flex gap-3">
              <input type="text" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="e.g. Dave" className="input-field flex-1" autoFocus />
              <button onClick={handleCreateUser} disabled={!newUserName.trim()} className="btn-primary disabled:opacity-50">
                Create
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewUserName("");
                }}
                className="px-4 py-2 rounded-lg bg-surface-1 border border-border text-text-secondary text-sm hover:bg-surface-2 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {isLoadingUsers ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((u) => (
              <UserKeyCard key={u.id} user={u} onDelete={u.id !== user.id ? () => handleDeleteUser(u.id) : undefined} />
            ))}
            {users.length === 0 && (
              <div className="text-center py-8 text-text-tertiary">
                No users yet. Click &quot;Add User&quot; to create one.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="surface-elevated p-5">
        <h3 className="font-semibold mb-3 text-text-primary">How it works</h3>
        <ul className="text-sm text-text-tertiary space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-gold">1.</span>
            <span>Create a key for each friend</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gold">2.</span>
            <span>Share the key with them (securely!)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gold">3.</span>
            <span>They use it to login here and configure Claude Code</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gold">4.</span>
            <span>Usage is tracked per key automatically</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
```

**Step 2: Update auth context to store raw key**

Modify `lib/auth-context.tsx` - in the `login` function, add:

```typescript
// After: localStorage.setItem("hackathon-user", JSON.stringify(userData));
// Add:
localStorage.setItem("hackathon-raw-key", apiKey);
```

And in `logout` function, add:
```typescript
localStorage.removeItem("hackathon-raw-key");
```

**Step 3: Update UserKeyCard to accept function for onDelete**

Modify `components/UserKeyCard.tsx` - change `onDelete` prop type from `((id: string) => void) | undefined` to `(() => void) | undefined` if needed.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: connect admin page to users API

- Fetch users from database
- Create users via API
- Delete users via API
- Store raw API key for auth headers

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 6: Create Stats API for Dashboard

**Files:**
- Create: `app/api/stats/route.ts`

**Step 1: Create stats API**

Create `app/api/stats/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const apiKey = req.headers.get("x-api-key");

    if (!apiKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { apiKey },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    // Get total requests
    const totalRequests = await prisma.request.count();

    // Get active users today (users who made requests in last 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeToday = await prisma.request.groupBy({
      by: ["userId"],
      where: {
        createdAt: { gte: oneDayAgo },
      },
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
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add stats API endpoint for dashboard

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 7: Create Leaderboard API

**Files:**
- Create: `app/api/leaderboard/route.ts`

**Step 1: Create leaderboard API**

Create `app/api/leaderboard/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const apiKey = req.headers.get("x-api-key");

    if (!apiKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { apiKey },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    // Get users with their request counts and most used model
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        requests: {
          select: {
            model: true,
            createdAt: true,
          },
        },
      },
    });

    // Process data for leaderboard
    const leaderboard = users
      .map((u) => {
        // Count models
        const modelCounts: Record<string, number> = {};
        u.requests.forEach((r) => {
          modelCounts[r.model] = (modelCounts[r.model] || 0) + 1;
        });

        // Get top model
        const topModel = Object.entries(modelCounts)
          .sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

        // Get unique models used
        const modelsUsed = Object.keys(modelCounts);

        // Get last active
        const lastRequest = u.requests.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];

        const lastActive = lastRequest
          ? formatTimeAgo(new Date(lastRequest.createdAt))
          : "Never";

        return {
          id: u.id,
          name: u.name,
          requests: u.requests.length,
          topModel,
          modelsUsed,
          lastActive,
        };
      })
      .sort((a, b) => b.requests - a.requests)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("Leaderboard error:", error);
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
git add -A
git commit -m "feat: add leaderboard API endpoint

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 8: Update Dashboard to Use APIs

**Files:**
- Modify: `app/(authenticated)/dashboard/page.tsx`

**Step 1: Replace mock data with API calls**

Replace entire file `app/(authenticated)/dashboard/page.tsx`:

```typescript
"use client";

import { useState, useEffect } from "react";
import { Activity, Zap, Cpu, Users } from "lucide-react";
import { motion } from "framer-motion";
import { StatsCard } from "@/components/StatsCard";
import { OnlineFriends } from "@/components/OnlineFriends";
import { QuickLeaderboard } from "@/components/QuickLeaderboard";
import { useAuth } from "@/lib/auth-context";

interface Stats {
  totalRequests: number;
  activeToday: number;
  topModel: string;
  totalUsers: number;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  requests: number;
  topModel: string;
}

interface Friend {
  id: string;
  name: string;
  isOnline: boolean;
  lastSeen?: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const rawKey = localStorage.getItem("hackathon-raw-key") || "";

      try {
        // Fetch stats
        const statsRes = await fetch("/api/stats", {
          headers: { "x-api-key": rawKey },
        });
        if (statsRes.ok) {
          setStats(await statsRes.json());
        }

        // Fetch leaderboard (top 4 for dashboard)
        const leaderboardRes = await fetch("/api/leaderboard", {
          headers: { "x-api-key": rawKey },
        });
        if (leaderboardRes.ok) {
          const data = await leaderboardRes.json();
          setLeaderboard(data.slice(0, 4));
        }

        // Fetch presence for friends
        const presenceRes = await fetch("/api/presence");
        if (presenceRes.ok) {
          const presence = await presenceRes.json();

          // Get users and combine with presence
          const usersRes = await fetch("/api/leaderboard", {
            headers: { "x-api-key": rawKey },
          });
          if (usersRes.ok) {
            const users = await usersRes.json();
            setFriends(
              users.map((u: { id: string; name: string; lastActive: string }) => ({
                id: u.id,
                name: u.name,
                isOnline: presence[u.id] === true,
                lastSeen: u.lastActive,
              }))
            );
          }
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }} className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          <span className="text-text-ghost">~/</span>
          <span className="text-gold">dashboard</span>
        </h1>
        <p className="text-sm text-text-tertiary">
          Welcome back, <span className="text-text-secondary font-medium">{user?.name}</span>. Here&apos;s what&apos;s happening.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={Zap} label="Total Requests" value={stats?.totalRequests?.toLocaleString() || "0"} subtext="all time" color="gold" delay={0} />
        <StatsCard icon={Activity} label="Active Today" value={stats?.activeToday || 0} subtext="crew members" color="success" delay={0.05} />
        <StatsCard icon={Cpu} label="Top Model" value={stats?.topModel || "N/A"} subtext="most used" color="info" delay={0.1} />
        <StatsCard icon={Users} label="Total Users" value={stats?.totalUsers || 0} subtext="in crew" color="success" delay={0.15} />
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OnlineFriends friends={friends} />
        <QuickLeaderboard entries={leaderboard} />
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: connect dashboard to real APIs

- Fetch stats from /api/stats
- Fetch leaderboard from /api/leaderboard
- Combine presence with user data for online status

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 9: Update Leaderboard Page to Use API

**Files:**
- Modify: `app/(authenticated)/leaderboard/page.tsx`

**Step 1: Replace mock data with API call**

Replace entire file `app/(authenticated)/leaderboard/page.tsx`:

```typescript
"use client";

import { useState, useEffect } from "react";
import { Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { LeaderboardTable } from "@/components/LeaderboardTable";

interface LeaderboardEntry {
  rank: number;
  name: string;
  requests: number;
  topModel: string;
  modelsUsed: string[];
  lastActive: string;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const rawKey = localStorage.getItem("hackathon-raw-key") || "";
        const res = await fetch("/api/leaderboard", {
          headers: { "x-api-key": rawKey },
        });
        if (res.ok) {
          setLeaderboard(await res.json());
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  // Fill with placeholders if less than 3 entries
  const podiumEntries = [
    leaderboard[1] || { name: "—", requests: 0 },
    leaderboard[0] || { name: "—", requests: 0 },
    leaderboard[2] || { name: "—", requests: 0 },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }} className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gold/10 border border-gold/20">
            <Trophy className="w-5 h-5 text-gold" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            <span className="text-text-ghost">~/</span>
            <span className="text-gold">leaderboard</span>
          </h1>
        </div>
        <p className="text-sm text-text-tertiary">Who&apos;s grinding the hardest? Updated in real-time.</p>
      </motion.div>

      {/* Podium */}
      <div className="grid grid-cols-3 gap-4">
        {/* 2nd place */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4, ease: [0.23, 1, 0.32, 1] }} className="surface-elevated p-5 text-center mt-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-surface-2 border-2 border-border flex items-center justify-center text-2xl font-bold text-text-secondary mb-3">{podiumEntries[0]?.name?.[0] || "?"}</div>
          <div className="text-text-tertiary text-2xl font-bold mb-1">2nd</div>
          <div className="font-medium text-text-primary">{podiumEntries[0]?.name}</div>
          <div className="text-sm text-gold font-mono mt-1">{podiumEntries[0]?.requests} req</div>
        </motion.div>

        {/* 1st place */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4, ease: [0.23, 1, 0.32, 1] }} className="surface-elevated p-5 text-center border-gold/20 bg-gold/[0.03]">
          <div className="w-20 h-20 mx-auto rounded-full bg-gold/15 border-2 border-gold/30 flex items-center justify-center text-3xl font-bold text-gold mb-3">{podiumEntries[1]?.name?.[0] || "?"}</div>
          <div className="text-gold text-3xl font-bold mb-1">1st</div>
          <div className="font-medium text-lg text-text-primary">{podiumEntries[1]?.name}</div>
          <div className="text-sm text-gold font-mono mt-1">{podiumEntries[1]?.requests} req</div>
        </motion.div>

        {/* 3rd place */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4, ease: [0.23, 1, 0.32, 1] }} className="surface-elevated p-5 text-center mt-12">
          <div className="w-14 h-14 mx-auto rounded-full bg-copper/15 border-2 border-copper/30 flex items-center justify-center text-xl font-bold text-copper mb-3">{podiumEntries[2]?.name?.[0] || "?"}</div>
          <div className="text-copper text-xl font-bold mb-1">3rd</div>
          <div className="font-medium text-text-primary">{podiumEntries[2]?.name}</div>
          <div className="text-sm text-gold font-mono mt-1">{podiumEntries[2]?.requests} req</div>
        </motion.div>
      </div>

      {leaderboard.length > 0 && <LeaderboardTable entries={leaderboard} />}

      {leaderboard.length === 0 && (
        <div className="text-center py-12 text-text-tertiary">
          No requests yet. Start using the proxy to appear on the leaderboard!
        </div>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: connect leaderboard page to real API

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 10: Add Request Tracking Endpoint

**Files:**
- Create: `app/api/track/route.ts`

**Step 1: Create request tracking API**

Create `app/api/track/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST /api/track - Track a request (called by proxy)
export async function POST(req: NextRequest) {
  try {
    const { apiKey, model, tokens } = await req.json();

    if (!apiKey || !model) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { apiKey },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    await prisma.request.create({
      data: {
        userId: user.id,
        model,
        tokens: tokens || 0,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Track error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add request tracking endpoint for proxy integration

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 11: Final Verification and Cleanup

**Step 1: Run linter**

```bash
npm run lint
```

Fix any issues.

**Step 2: Test the application**

```bash
npm run dev
```

1. Open http://localhost:3000/login
2. Login with "admin"
3. Go to Admin page
4. Create a new user
5. Copy their API key
6. Logout
7. Login with new user's API key
8. Verify dashboard and leaderboard work

**Step 3: Final commit**

```bash
git add -A
git commit -m "chore: final cleanup and verification

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Summary

After completing all tasks, the application will:
- Store users and API keys in SQLite database
- Allow admins to create/delete users with generated API keys
- Track request usage per user
- Display real stats on dashboard
- Show real leaderboard based on usage
- Persist all data across restarts
