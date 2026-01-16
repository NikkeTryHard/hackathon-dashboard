"use client";

import { motion } from "framer-motion";
import { Zap, Crown, Medal } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  name: string;
  requests: number;
  topModel: string;
  modelsUsed: string[];
  lastActive: string;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
}

export function LeaderboardTable({ entries }: LeaderboardTableProps) {
  const getRankDisplay = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-gray-500 font-mono">#{rank}</span>;
  };

  return (
    <div className="card overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-dark-border text-left text-xs text-gray-500 uppercase">
            <th className="px-4 py-3">Rank</th>
            <th className="px-4 py-3">Hacker</th>
            <th className="px-4 py-3">Requests</th>
            <th className="px-4 py-3">Top Model</th>
            <th className="px-4 py-3">Models Used</th>
            <th className="px-4 py-3">Last Active</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => (
            <motion.tr key={entry.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={`border-b border-dark-border/50 hover:bg-dark-border/30 transition-colors ${entry.rank === 1 ? "bg-yellow-400/5" : ""}`}>
              <td className="px-4 py-4">{getRankDisplay(entry.rank)}</td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-dark-border flex items-center justify-center text-sm font-bold">{entry.name[0]}</div>
                  <span className="font-medium">{entry.name}</span>
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-1 text-neon-green font-mono">
                  <Zap className="w-4 h-4" />
                  {entry.requests.toLocaleString()}
                </div>
              </td>
              <td className="px-4 py-4">
                <span className="text-sm text-neon-purple">{entry.topModel}</span>
              </td>
              <td className="px-4 py-4">
                <div className="flex gap-1">
                  {entry.modelsUsed.slice(0, 3).map((model) => (
                    <span key={model} className="px-2 py-0.5 text-xs bg-dark-border rounded">
                      {model.split("-")[0]}
                    </span>
                  ))}
                  {entry.modelsUsed.length > 3 && <span className="px-2 py-0.5 text-xs text-gray-500">+{entry.modelsUsed.length - 3}</span>}
                </div>
              </td>
              <td className="px-4 py-4 text-sm text-gray-500">{entry.lastActive}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
