import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateApiKey } from "@/lib/auth";

const MAX_USERS = 50; // Limit results to prevent memory issues

export async function GET(req: NextRequest) {
  try {
    const { user: _user, error } = await authenticateApiKey(req, {
      rateLimitType: "read",
    });

    if (error) return error;

    // Get users with aggregated request counts (more efficient than loading all requests)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        _count: { select: { requests: true } },
      },
      orderBy: {
        requests: { _count: "desc" },
      },
      take: MAX_USERS,
    });

    // Get additional stats per user in parallel
    const leaderboard = await Promise.all(
      users.map(async (u, index) => {
        // Get top model for this user
        const topModelResult = await prisma.request.groupBy({
          by: ["model"],
          where: { userId: u.id },
          _count: { model: true },
          orderBy: { _count: { model: "desc" } },
          take: 1,
        });

        // Get unique models
        const uniqueModels = await prisma.request.groupBy({
          by: ["model"],
          where: { userId: u.id },
        });

        // Get last request time
        const lastRequest = await prisma.request.findFirst({
          where: { userId: u.id },
          orderBy: { createdAt: "desc" },
          select: { createdAt: true },
        });

        return {
          rank: index + 1,
          id: u.id,
          name: u.name,
          requests: u._count.requests,
          topModel: topModelResult[0]?.model || "N/A",
          modelsUsed: uniqueModels.map((m) => m.model),
          lastActive: lastRequest ? formatTimeAgo(lastRequest.createdAt) : "Never",
        };
      }),
    );

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("Leaderboard error:", error instanceof Error ? error.message : "Unknown");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
