import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateApiKey } from "@/lib/auth";
import { trackRequestSchema, validateBody } from "@/lib/validation";

// POST /api/track - Track a request made through the proxy
export async function POST(req: NextRequest) {
  try {
    const { user, error } = await authenticateApiKey(req, {
      rateLimitType: "api",
    });

    if (error) return error;

    const body = await req.json();
    const validation = validateBody(trackRequestSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { model, tokens } = validation.data;

    const request = await prisma.request.create({
      data: {
        userId: user!.id,
        model,
        tokens,
      },
    });

    return NextResponse.json({
      success: true,
      requestId: request.id,
    });
  } catch (error) {
    console.error("Track request error:", error instanceof Error ? error.message : "Unknown");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/track - Get user's own request history
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await authenticateApiKey(req, {
      rateLimitType: "read",
    });

    if (error) return error;

    // Get user's requests (last 100)
    const requests = await prisma.request.findMany({
      where: { userId: user!.id },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        model: true,
        tokens: true,
        createdAt: true,
      },
    });

    const totalRequests = await prisma.request.count({
      where: { userId: user!.id },
    });

    const modelCounts = await prisma.request.groupBy({
      by: ["model"],
      where: { userId: user!.id },
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
    console.error("Get requests error:", error instanceof Error ? error.message : "Unknown");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
