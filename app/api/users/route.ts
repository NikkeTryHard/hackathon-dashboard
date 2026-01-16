import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/users - List all users (admin only)
export async function GET(req: NextRequest) {
  try {
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

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        apiKey: true,
        isAdmin: true,
        createdAt: true,
        _count: {
          select: { requests: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      users.map((u) => ({
        id: u.id,
        name: u.name,
        apiKey: u.apiKey,
        isAdmin: u.isAdmin,
        requests: u._count.requests,
        createdAt: u.createdAt.toISOString(),
      })),
    );
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/users - Create new user (admin only)
export async function POST(req: NextRequest) {
  try {
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

    const { name } = await req.json();

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Generate API key
    const safeName = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const randomPart = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
    const newApiKey = `sk-hackathon-${safeName}-${randomPart}`;

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        apiKey: newApiKey,
        isAdmin: false,
      },
    });

    return NextResponse.json({
      id: user.id,
      name: user.name,
      apiKey: user.apiKey,
      isAdmin: user.isAdmin,
      requests: 0,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
