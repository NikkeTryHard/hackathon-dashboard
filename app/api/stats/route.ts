import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateApiKey } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { user: _user, error } = await authenticateApiKey(req, {
      rateLimitType: "read",
    });

    if (error) return error;

    // Get total requests
    const totalRequests = await prisma.request.count();

    // Get active users today
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeToday = await prisma.request.groupBy({
      by: ["userId"],
      where: { createdAt: { gte: oneDayAgo } },
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
    console.error("Stats error:", error instanceof Error ? error.message : "Unknown");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
