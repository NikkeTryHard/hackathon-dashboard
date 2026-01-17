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
