import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateApiKey } from "@/lib/auth";

// DELETE /api/users/[id] - Delete a user (admin only)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Validate ID format
    if (!id || !/^[\w-]+$/.test(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const { user, error } = await authenticateApiKey(req, {
      requireAdmin: true,
      rateLimitType: "admin",
    });

    if (error) return error;

    // Prevent self-deletion
    if (user!.id === id) {
      return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
    }

    // Check if user exists
    const userToDelete = await prisma.user.findUnique({
      where: { id },
    });

    if (!userToDelete) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error instanceof Error ? error.message : "Unknown");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
