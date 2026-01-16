"use client";

import { motion } from "framer-motion";
import { Trophy, Zap } from "lucide-react";
import Link from "next/link";

interface LeaderboardEntry {
  rank: number;
  name: string;
  requests: number;
  topModel: string;
}

interface QuickLeaderboardProps {
  entries: LeaderboardEntry[];
}

export function QuickLeaderboard({ entries }: QuickLeaderboardProps) {
  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-yellow-400";
    if (rank === 2) return "text-gray-400";
    if (rank === 3) return "text-amber-600";
    return "text-gray-600";
  };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span className="font-mono text-sm">leaderboard.top</span>
        </div>
        <Link href="/leaderboard" className="text-xs text-neon-purple hover:underline">
          view all →
        </Link>
      </div>

      <div className="space-y-3">
        {entries.slice(0, 5).map((entry, i) => (
          <motion.div key={entry.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-center justify-between p-2 rounded-lg hover:bg-dark-border/50 transition-colors">
            <div className="flex items-center gap-3">
              <span className={`text-lg font-bold ${getRankColor(entry.rank)}`}>#{entry.rank}</span>
              <div>
                <div className="text-sm font-medium">{entry.name}</div>
                <div className="text-xs text-gray-500">{entry.topModel}</div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-neon-green">
              <Zap className="w-3 h-3" />
              <span className="text-sm font-mono">{entry.requests}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
