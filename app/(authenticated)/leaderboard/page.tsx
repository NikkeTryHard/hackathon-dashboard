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
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <h1 className="text-2xl font-bold">
            <span className="text-gray-500">~/</span>
            <span className="neon-green">leaderboard</span>
          </h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">Who&apos;s grinding the hardest? Updated in real-time.</p>
      </motion.div>

      {/* Podium for top 3 */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {/* 2nd place */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-4 text-center mt-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-gray-400/20 flex items-center justify-center text-2xl font-bold mb-2">{MOCK_LEADERBOARD[1]?.name[0]}</div>
          <div className="text-gray-400 text-2xl font-bold">2nd</div>
          <div className="font-medium">{MOCK_LEADERBOARD[1]?.name}</div>
          <div className="text-sm text-neon-green font-mono">{MOCK_LEADERBOARD[1]?.requests} req</div>
        </motion.div>

        {/* 1st place */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-4 text-center border-yellow-400/30 bg-yellow-400/5">
          <div className="w-20 h-20 mx-auto rounded-full bg-yellow-400/20 flex items-center justify-center text-3xl font-bold mb-2">{MOCK_LEADERBOARD[0]?.name[0]}</div>
          <div className="text-yellow-400 text-3xl font-bold">1st</div>
          <div className="font-medium text-lg">{MOCK_LEADERBOARD[0]?.name}</div>
          <div className="text-sm text-neon-green font-mono">{MOCK_LEADERBOARD[0]?.requests} req</div>
        </motion.div>

        {/* 3rd place */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-4 text-center mt-12">
          <div className="w-14 h-14 mx-auto rounded-full bg-amber-600/20 flex items-center justify-center text-xl font-bold mb-2">{MOCK_LEADERBOARD[2]?.name[0]}</div>
          <div className="text-amber-600 text-xl font-bold">3rd</div>
          <div className="font-medium">{MOCK_LEADERBOARD[2]?.name}</div>
          <div className="text-sm text-neon-green font-mono">{MOCK_LEADERBOARD[2]?.requests} req</div>
        </motion.div>
      </div>

      <LeaderboardTable entries={MOCK_LEADERBOARD} />
    </div>
  );
}
