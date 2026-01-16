import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { apiKey } = await req.json();

    if (!apiKey || typeof apiKey !== "string") {
      return NextResponse.json({ error: "API key required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { apiKey },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      isAdmin: user.isAdmin,
      apiKey: user.apiKey.length > 12 ? user.apiKey.slice(0, 12) + "..." : user.apiKey,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
