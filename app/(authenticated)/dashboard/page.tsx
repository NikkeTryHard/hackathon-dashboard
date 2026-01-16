"use client";

import { useState, useEffect, useCallback } from "react";
import { Activity, Zap, Cpu, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { StatsCard } from "@/components/StatsCard";
import { OnlineFriends } from "@/components/OnlineFriends";
import { QuickLeaderboard } from "@/components/QuickLeaderboard";
import { useAuth } from "@/lib/auth-context";

interface Stats {
  totalRequests: number;
  activeToday: number;
  topModel: string;
  totalUsers: number;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  rank: number;
  requests: number;
  topModel: string;
  lastActive: string;
}

// Get raw API key from localStorage
const getRawApiKey = () => {
  if (typeof window === "undefined") return "";
  const rawKey = localStorage.getItem("hackathon-raw-key");
  if (rawKey) return rawKey;

  const stored = localStorage.getItem("hackathon-user");
  if (stored) {
    const parsed = JSON.parse(stored);
    return parsed.apiKey || "";
  }
  return "";
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const apiKey = getRawApiKey();
      const headers = { "x-api-key": apiKey };

      const [statsRes, leaderboardRes] = await Promise.all([fetch("/api/stats", { headers }), fetch("/api/leaderboard", { headers })]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (leaderboardRes.ok) {
        const leaderboardData = await leaderboardRes.json();
        setLeaderboard(leaderboardData.slice(0, 4)); // Top 4 for quick view
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Transform leaderboard for OnlineFriends component (show recent activity as "online")
  const friends = leaderboard.map((entry) => ({
    id: entry.id,
    name: entry.name,
    isOnline: entry.lastActive === "just now" || entry.lastActive.includes("min"),
    lastSeen: entry.lastActive === "Never" ? undefined : entry.lastActive,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }} className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          <span className="text-text-ghost">~/</span>
          <span className="text-gold">dashboard</span>
        </h1>
        <p className="text-sm text-text-tertiary">
          Welcome back, <span className="text-text-secondary font-medium">{user?.name}</span>. Here&apos;s what&apos;s happening.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={Zap} label="Total Requests" value={isLoading ? "..." : (stats?.totalRequests ?? 0).toLocaleString()} subtext="all time" color="gold" delay={0} />
        <StatsCard icon={Activity} label="Active Today" value={isLoading ? "..." : (stats?.activeToday ?? 0)} subtext="crew members" color="success" delay={0.05} />
        <StatsCard icon={Cpu} label="Top Model" value={isLoading ? "..." : (stats?.topModel ?? "No data")} subtext="most used" color="info" delay={0.1} />
        <StatsCard icon={Clock} label="Total Users" value={isLoading ? "..." : (stats?.totalUsers ?? 0)} subtext="registered" color="success" delay={0.15} />
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OnlineFriends friends={friends} />
        <QuickLeaderboard entries={leaderboard} />
      </div>
    </div>
  );
}
