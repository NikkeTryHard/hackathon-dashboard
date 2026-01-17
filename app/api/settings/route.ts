import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAllSettings, setSetting } from "@/lib/settings";

// GET /api/settings - List all settings (authenticated users only)
export async function GET(req: NextRequest) {
  try {
    const apiKey = req.headers.get("x-api-key");

    if (!apiKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { apiKey },
    });

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await getAllSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/settings - Update a setting (admin only)
export async function PUT(req: NextRequest) {
  try {
    const apiKey = req.headers.get("x-api-key");

    if (!apiKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { apiKey },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { key, value } = body;

    if (!key || typeof key !== "string") {
      return NextResponse.json({ error: "Key is required and must be a string" }, { status: 400 });
    }

    if (value === undefined || typeof value !== "string") {
      return NextResponse.json({ error: "Value is required and must be a string" }, { status: 400 });
    }

    const setting = await setSetting(key, value);
    return NextResponse.json(setting);
  } catch (error) {
    console.error("Update setting error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
