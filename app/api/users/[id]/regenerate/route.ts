import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateApiKey } from "@/lib/auth";
import { generateApiKey, hashApiKey, getKeyPrefix } from "@/lib/api-key-hash";

// POST /api/users/[id]/regenerate - Regenerate API key for a user (admin only)
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const { error } = await authenticateApiKey(req, {
      requireAdmin: true,
      rateLimitType: "admin",
    });

    if (error) return error;

    // Check if user exists
    const userToUpdate = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!userToUpdate) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate new API key using the secure method
    const newApiKey = generateApiKey(userToUpdate.name);
    const apiKeyHash = await hashApiKey(newApiKey);
    const apiKeyPrefix = getKeyPrefix(newApiKey);

    await prisma.user.update({
      where: { id },
      data: {
        apiKeyHash,
        apiKeyPrefix,
      },
    });

    // Return the new API key (only time it's visible)
    return NextResponse.json({ apiKey: newApiKey });
  } catch (error) {
    console.error("Regenerate API key error:", error instanceof Error ? error.message : "Unknown");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
