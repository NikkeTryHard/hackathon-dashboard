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
