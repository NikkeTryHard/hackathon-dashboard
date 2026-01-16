"use client";

import { Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { LeaderboardTable } from "@/components/LeaderboardTable";

const MOCK_LEADERBOARD = [
  { rank: 1, name: "Alice", requests: 423, topModel: "claude-opus-4", modelsUsed: ["claude", "gemini", "gpt"], lastActive: "2 min ago" },
  { rank: 2, name: "Louis", requests: 387, topModel: "claude-sonnet-4-5", modelsUsed: ["claude", "gemini"], lastActive: "5 min ago" },
  { rank: 3, name: "Charlie", requests: 284, topModel: "gemini-2.5-pro", modelsUsed: ["gemini", "claude", "gpt"], lastActive: "1h ago" },
  { rank: 4, name: "Bob", requests: 153, topModel: "gpt-4o", modelsUsed: ["gpt", "claude"], lastActive: "3h ago" },
];

export default function LeaderboardPage() {
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }} className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gold/10 border border-gold/20">
            <Trophy className="w-5 h-5 text-gold" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            <span className="text-text-ghost">~/</span>
            <span className="text-gold">leaderboard</span>
          </h1>
        </div>
        <p className="text-sm text-text-tertiary">Who&apos;s grinding the hardest? Updated in real-time.</p>
      </motion.div>

      {/* Podium */}
      <div className="grid grid-cols-3 gap-4">
        {/* 2nd place */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4, ease: [0.23, 1, 0.32, 1] }} className="surface-elevated p-5 text-center mt-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-surface-2 border-2 border-border flex items-center justify-center text-2xl font-bold text-text-secondary mb-3">{MOCK_LEADERBOARD[1]?.name[0]}</div>
          <div className="text-text-tertiary text-2xl font-bold mb-1">2nd</div>
          <div className="font-medium text-text-primary">{MOCK_LEADERBOARD[1]?.name}</div>
          <div className="text-sm text-gold font-mono mt-1">{MOCK_LEADERBOARD[1]?.requests} req</div>
        </motion.div>

        {/* 1st place */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4, ease: [0.23, 1, 0.32, 1] }} className="surface-elevated p-5 text-center border-gold/20 bg-gold/[0.03]">
          <div className="w-20 h-20 mx-auto rounded-full bg-gold/15 border-2 border-gold/30 flex items-center justify-center text-3xl font-bold text-gold mb-3">{MOCK_LEADERBOARD[0]?.name[0]}</div>
          <div className="text-gold text-3xl font-bold mb-1">1st</div>
          <div className="font-medium text-lg text-text-primary">{MOCK_LEADERBOARD[0]?.name}</div>
          <div className="text-sm text-gold font-mono mt-1">{MOCK_LEADERBOARD[0]?.requests} req</div>
        </motion.div>

        {/* 3rd place */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4, ease: [0.23, 1, 0.32, 1] }} className="surface-elevated p-5 text-center mt-12">
          <div className="w-14 h-14 mx-auto rounded-full bg-copper/15 border-2 border-copper/30 flex items-center justify-center text-xl font-bold text-copper mb-3">{MOCK_LEADERBOARD[2]?.name[0]}</div>
          <div className="text-copper text-xl font-bold mb-1">3rd</div>
          <div className="font-medium text-text-primary">{MOCK_LEADERBOARD[2]?.name}</div>
          <div className="text-sm text-gold font-mono mt-1">{MOCK_LEADERBOARD[2]?.requests} req</div>
        </motion.div>
      </div>

      <LeaderboardTable entries={MOCK_LEADERBOARD} />
    </div>
  );
}
