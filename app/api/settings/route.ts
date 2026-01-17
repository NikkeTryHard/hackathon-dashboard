import { NextRequest, NextResponse } from "next/server";
import { getAllSettings, setSetting } from "@/lib/settings";
import { authenticateApiKey } from "@/lib/auth";
import { z } from "zod";
import { validateBody } from "@/lib/validation";

// Settings schema for validation
const settingsUpdateSchema = z.object({
  key: z.string().min(1, "Key is required").max(100, "Key too long"),
  value: z.string().min(0).max(1000, "Value too long"),
});

// GET /api/settings - List all settings (authenticated users only)
export async function GET(req: NextRequest) {
  try {
    const { error } = await authenticateApiKey(req, {
      rateLimitType: "read",
    });

    if (error) return error;

    const settings = await getAllSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Get settings error:", error instanceof Error ? error.message : "Unknown");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/settings - Update a setting (admin only)
export async function PUT(req: NextRequest) {
  try {
    const { error } = await authenticateApiKey(req, {
      requireAdmin: true,
      rateLimitType: "admin",
    });

    if (error) return error;

    const body = await req.json();
    const validation = validateBody(settingsUpdateSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { key, value } = validation.data;
    const setting = await setSetting(key, value);
    return NextResponse.json(setting);
  } catch (error) {
    console.error("Update setting error:", error instanceof Error ? error.message : "Unknown");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
