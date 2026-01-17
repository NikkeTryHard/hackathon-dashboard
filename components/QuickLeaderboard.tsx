"use client";

import { memo } from "react";
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

function QuickLeaderboardComponent({ entries }: QuickLeaderboardProps) {
  const getRankStyle = (rank: number) => {
    if (rank === 1) return "bg-gold/15 text-gold border-gold/25";
    if (rank === 2) return "bg-surface-2 text-text-secondary border-border";
    if (rank === 3) return "bg-copper/15 text-copper border-copper/25";
    return "bg-surface-1 text-text-ghost border-border-dim";
  };

  return (
    <div className="surface-elevated p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gold/10">
            <Trophy className="w-4 h-4 text-gold" />
          </div>
          <span className="text-sm font-medium text-text-primary">Leaderboard</span>
        </div>
        <Link href="/leaderboard" className="text-xs text-gold/70 hover:text-gold transition-colors font-medium">
          View all →
        </Link>
      </div>

      <div className="space-y-2">
        {entries.slice(0, 5).map((entry) => (
          <div key={entry.name} className="flex items-center justify-between p-3 rounded-lg bg-surface-0 border border-border-dim hover:border-border transition-colors">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border ${getRankStyle(entry.rank)}`}>{entry.rank}</div>
              <div>
                <div className="text-sm font-medium text-text-primary">{entry.name}</div>
                <div className="text-xs text-text-ghost font-mono">{entry.topModel}</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-gold">
              <Zap className="w-3.5 h-3.5" />
              <span className="text-sm font-mono font-medium">{entry.requests.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const QuickLeaderboard = memo(QuickLeaderboardComponent);
