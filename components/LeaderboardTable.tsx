"use client";

import { memo } from "react";
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

function LeaderboardTableComponent({ entries }: LeaderboardTableProps) {
  const getRankDisplay = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-gold" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-text-secondary" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-copper" />;
    return <span className="text-text-ghost font-mono">#{rank}</span>;
  };

  return (
    <div className="surface-elevated overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border text-left text-[11px] text-text-tertiary uppercase tracking-widest">
            <th className="px-5 py-4 font-medium">Rank</th>
            <th className="px-5 py-4 font-medium">Hacker</th>
            <th className="px-5 py-4 font-medium">Requests</th>
            <th className="px-5 py-4 font-medium">Top Model</th>
            <th className="px-5 py-4 font-medium">Models Used</th>
            <th className="px-5 py-4 font-medium">Last Active</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.name} className={`border-b border-border-dim hover:bg-surface-1/50 transition-colors ${entry.rank === 1 ? "bg-gold/[0.03]" : ""}`}>
              <td className="px-5 py-4">{getRankDisplay(entry.rank)}</td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-surface-2 border border-border flex items-center justify-center text-sm font-bold text-text-secondary">{entry.name[0]}</div>
                  <span className="font-medium text-text-primary">{entry.name}</span>
                </div>
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-1.5 text-gold font-mono">
                  <Zap className="w-4 h-4" />
                  {entry.requests.toLocaleString()}
                </div>
              </td>
              <td className="px-5 py-4">
                <span className="text-sm text-info font-mono">{entry.topModel}</span>
              </td>
              <td className="px-5 py-4">
                <div className="flex gap-1.5">
                  {entry.modelsUsed.slice(0, 3).map((model) => (
                    <span key={model} className="badge text-[10px]">
                      {model.split("-")[0]}
                    </span>
                  ))}
                  {entry.modelsUsed.length > 3 && <span className="text-xs text-text-ghost">+{entry.modelsUsed.length - 3}</span>}
                </div>
              </td>
              <td className="px-5 py-4 text-sm text-text-ghost">{entry.lastActive}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const LeaderboardTable = memo(LeaderboardTableComponent);
