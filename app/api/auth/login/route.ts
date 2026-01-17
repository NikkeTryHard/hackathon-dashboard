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
