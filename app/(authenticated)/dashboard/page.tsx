"use client";

import { Activity, Zap, Cpu, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { StatsCard } from "@/components/StatsCard";
import { OnlineFriends } from "@/components/OnlineFriends";
import { QuickLeaderboard } from "@/components/QuickLeaderboard";
import { useAuth } from "@/lib/auth-context";

const MOCK_STATS = {
  totalRequests: 1247,
  activeToday: 4,
  topModel: "claude-sonnet-4-5",
  uptime: "99.9%",
};

const MOCK_FRIENDS = [
  { id: "1", name: "Louis", isOnline: true },
  { id: "2", name: "Alice", isOnline: true },
  { id: "3", name: "Bob", isOnline: false, lastSeen: "2h ago" },
  { id: "4", name: "Charlie", isOnline: true },
];

const MOCK_LEADERBOARD = [
  { rank: 1, name: "Alice", requests: 423, topModel: "claude-opus-4" },
  { rank: 2, name: "Louis", requests: 387, topModel: "claude-sonnet-4-5" },
  { rank: 3, name: "Charlie", requests: 284, topModel: "gemini-2.5-pro" },
  { rank: 4, name: "Bob", requests: 153, topModel: "gpt-4o" },
];

export default function DashboardPage() {
  const { user } = useAuth();

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
        <StatsCard icon={Zap} label="Total Requests" value={MOCK_STATS.totalRequests.toLocaleString()} subtext="all time" color="gold" delay={0} />
        <StatsCard icon={Activity} label="Active Today" value={MOCK_STATS.activeToday} subtext="crew members" color="success" delay={0.05} />
        <StatsCard icon={Cpu} label="Top Model" value={MOCK_STATS.topModel} subtext="most used" color="info" delay={0.1} />
        <StatsCard icon={Clock} label="Uptime" value={MOCK_STATS.uptime} subtext="this week" color="success" delay={0.15} />
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OnlineFriends friends={MOCK_FRIENDS} />
        <QuickLeaderboard entries={MOCK_LEADERBOARD} />
      </div>
    </div>
  );
}
