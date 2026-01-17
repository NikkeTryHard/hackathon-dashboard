import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "./prisma";
import { getKeyPrefix, verifyApiKey } from "./api-key-hash";
import { rateLimit, rateLimitResponse, RateLimitType } from "./rate-limit";

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
