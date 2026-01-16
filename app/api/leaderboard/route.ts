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

    // Get users with their request counts and most used model
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        requests: {
          select: {
            model: true,
            createdAt: true,
          },
        },
      },
    });

    // Process data for leaderboard
    const leaderboard = users
      .map((u) => {
        // Count models
        const modelCounts: Record<string, number> = {};
        u.requests.forEach((r) => {
          modelCounts[r.model] = (modelCounts[r.model] || 0) + 1;
        });

        // Get top model
        const topModel = Object.entries(modelCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

        // Get unique models used
        const modelsUsed = Object.keys(modelCounts);

        // Get last active
        const lastRequest = u.requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

        const lastActive = lastRequest ? formatTimeAgo(new Date(lastRequest.createdAt)) : "Never";

        return {
          id: u.id,
          name: u.name,
          requests: u.requests.length,
          topModel,
          modelsUsed,
          lastActive,
        };
      })
      .sort((a, b) => b.requests - a.requests)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("Leaderboard error:", error);
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
