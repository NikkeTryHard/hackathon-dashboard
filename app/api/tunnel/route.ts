import { NextResponse } from "next/server";
import { tunnelManager } from "@/lib/tunnel-manager";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

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
  // Admin-only: verify user is admin before allowing restart
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized - login required" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true },
  });

  if (!user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden - admin access required" }, { status: 403 });
  }

  const { action } = await req.json();
  if (action === "restart") {
    tunnelManager.restart();
    return NextResponse.json({ message: "Restarting tunnel..." });
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
