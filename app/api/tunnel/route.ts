import { NextResponse } from "next/server";
import { tunnelManager } from "@/lib/tunnel-manager";

let initialized = false;

function ensureInitialized() {
  if (!initialized && typeof window === "undefined") {
    tunnelManager.start();
    initialized = true;
  }
}

export async function GET() {
  ensureInitialized();
  const status = tunnelManager.getStatus();
  return NextResponse.json(status);
}

export async function POST(req: Request) {
  const { action } = await req.json();
  if (action === "restart") {
    tunnelManager.restart();
    return NextResponse.json({ message: "Restarting tunnel..." });
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
