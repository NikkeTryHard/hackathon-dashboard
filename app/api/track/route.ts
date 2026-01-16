import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST /api/track - Track a request made through the proxy
export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get("x-api-key");

    if (!apiKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { apiKey },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    const body = await req.json();
    const { model, tokens } = body;

    if (!model) {
      return NextResponse.json({ error: "Model is required" }, { status: 400 });
    }

    // Create request record
    const request = await prisma.request.create({
      data: {
        userId: user.id,
        model: model,
        tokens: tokens || 0,
      },
    });

    return NextResponse.json({
      success: true,
      requestId: request.id,
    });
  } catch (error) {
    console.error("Track request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/track - Get user's own request history
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
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    // Get user's requests (last 100)
    const requests = await prisma.request.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        model: true,
        tokens: true,
        createdAt: true,
      },
    });

    // Get summary stats
    const totalRequests = await prisma.request.count({
      where: { userId: user.id },
    });

    const modelCounts = await prisma.request.groupBy({
      by: ["model"],
      where: { userId: user.id },
      _count: { model: true },
      orderBy: { _count: { model: "desc" } },
    });

    return NextResponse.json({
      totalRequests,
      modelBreakdown: modelCounts.map((m) => ({
        model: m.model,
        count: m._count.model,
      })),
      recentRequests: requests,
    });
  } catch (error) {
    console.error("Get requests error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
