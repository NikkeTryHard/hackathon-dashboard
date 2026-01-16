import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

    // Get total requests
    const totalRequests = await prisma.request.count();

    // Get active users today (users who made requests in last 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeToday = await prisma.request.groupBy({
      by: ["userId"],
      where: {
        createdAt: { gte: oneDayAgo },
      },
    });

    // Get top model
    const modelCounts = await prisma.request.groupBy({
      by: ["model"],
      _count: { model: true },
      orderBy: { _count: { model: "desc" } },
      take: 1,
    });

    const topModel = modelCounts[0]?.model || "No data yet";

    // Get total users
    const totalUsers = await prisma.user.count();

    return NextResponse.json({
      totalRequests,
      activeToday: activeToday.length,
      topModel,
      totalUsers,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
