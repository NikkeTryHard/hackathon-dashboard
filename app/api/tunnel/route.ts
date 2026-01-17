import { NextRequest, NextResponse } from "next/server";
import { tunnelManager } from "@/lib/tunnel-manager";
import { authenticateCookie } from "@/lib/auth";
import { tunnelActionSchema, validateBody } from "@/lib/validation";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

let initialized = false;

function ensureInitialized() {
  if (!initialized && typeof window === "undefined") {
    tunnelManager.start();
    initialized = true;
  }
}

// GET - Requires authentication now
export async function GET(_req: NextRequest) {
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
