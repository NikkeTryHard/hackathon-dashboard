import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST /api/users/[id]/regenerate - Regenerate API key for a user (admin only)
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // Check if user exists
    const userToUpdate = await prisma.user.findUnique({
      where: { id },
    });

    if (!userToUpdate) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate new API key: sk-hackathon-<name-slug>-<random-12-chars>
    const safeName = userToUpdate.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const randomPart = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
    const newApiKey = `sk-hackathon-${safeName}-${randomPart}`;

    await prisma.user.update({
      where: { id },
      data: { apiKey: newApiKey },
    });

    return NextResponse.json({ apiKey: newApiKey });
  } catch (error) {
    console.error("Regenerate API key error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
