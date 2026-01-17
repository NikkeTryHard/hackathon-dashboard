import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateApiKey } from "@/lib/auth";
import { createUserSchema, validateBody } from "@/lib/validation";
import { generateApiKey, getKeyPrefix, hashApiKey } from "@/lib/api-key-hash";

// GET /api/users - List all users (admin only)
export async function GET(req: NextRequest) {
  try {
    const { user: _user, error } = await authenticateApiKey(req, {
      requireAdmin: true,
      rateLimitType: "admin",
    });

    if (error) return error;

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        apiKeyPrefix: true,
        isAdmin: true,
        createdAt: true,
        _count: { select: { requests: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      users.map((u) => ({
        id: u.id,
        name: u.name,
        apiKey: u.apiKeyPrefix + "...", // Only show prefix
        isAdmin: u.isAdmin,
        requests: u._count.requests,
        createdAt: u.createdAt.toISOString(),
      })),
    );
  } catch (error) {
    console.error("Get users error:", error instanceof Error ? error.message : "Unknown");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/users - Create new user (admin only)
export async function POST(req: NextRequest) {
  try {
    const { user: _user, error } = await authenticateApiKey(req, {
      requireAdmin: true,
      rateLimitType: "admin",
    });

    if (error) return error;

    const body = await req.json();
    const validation = validateBody(createUserSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { name } = validation.data;

    // Generate secure API key
    const newApiKey = generateApiKey(name);
    const prefix = getKeyPrefix(newApiKey);
    const hash = await hashApiKey(newApiKey);

    // Check for prefix collision (extremely unlikely but handle it)
    const existing = await prisma.user.findUnique({
      where: { apiKeyPrefix: prefix },
    });

    if (existing) {
      return NextResponse.json({ error: "Key generation collision, please try again" }, { status: 409 });
    }

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        apiKeyPrefix: prefix,
        apiKeyHash: hash,
        isAdmin: false,
      },
    });

    // Return full API key ONCE - it cannot be recovered after this
    return NextResponse.json({
      id: newUser.id,
      name: newUser.name,
      apiKey: newApiKey, // Full key - show once!
      isAdmin: newUser.isAdmin,
      requests: 0,
      createdAt: newUser.createdAt.toISOString(),
      warning: "Save this API key now. It cannot be recovered.",
    });
  } catch (error) {
    console.error("Create user error:", error instanceof Error ? error.message : "Unknown");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
