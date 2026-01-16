import { NextRequest, NextResponse } from "next/server";

// In-memory store (replace with your DB)
const presenceStore = new Map<string, { lastSeen: number; online: boolean }>();

export async function POST(req: NextRequest) {
  try {
    const { userId, offline } = await req.json();

    if (offline) {
      presenceStore.set(userId, { lastSeen: Date.now(), online: false });
    } else {
      presenceStore.set(userId, { lastSeen: Date.now(), online: true });
    }

    // TODO: Persist to your backend

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function GET() {
  // Clean up stale entries (offline if no heartbeat in 60s)
  const now = Date.now();
  const staleThreshold = 60000;

  const presence: Record<string, boolean> = {};

  presenceStore.forEach((value, key) => {
    const isOnline = value.online && now - value.lastSeen < staleThreshold;
    presence[key] = isOnline;
  });

  return NextResponse.json(presence);
}
