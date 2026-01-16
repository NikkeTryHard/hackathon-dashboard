"use client";

import { useState, useEffect, useCallback } from "react";
import { Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { getRawApiKey } from "@/lib/api-utils";

interface LeaderboardEntry {
  id: string;
  name: string;
  rank: number;
  requests: number;
  topModel: string;
  modelsUsed: string[];
  lastActive: string;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const apiKey = getRawApiKey();
      const res = await fetch("/api/leaderboard", {
        headers: { "x-api-key": apiKey },
      });

      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Get top 3 for podium (with fallbacks for empty data)
  const first = leaderboard[0];
  const second = leaderboard[1];
  const third = leaderboard[2];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

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

      {/* Podium - only show if we have at least 1 user */}
      {leaderboard.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {/* 2nd place */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4, ease: [0.23, 1, 0.32, 1] }} className="surface-elevated p-5 text-center mt-8">
            {second ? (
              <>
                <div className="w-16 h-16 mx-auto rounded-full bg-surface-2 border-2 border-border flex items-center justify-center text-2xl font-bold text-text-secondary mb-3">{second.name[0]}</div>
                <div className="text-text-tertiary text-2xl font-bold mb-1">2nd</div>
                <div className="font-medium text-text-primary">{second.name}</div>
                <div className="text-sm text-gold font-mono mt-1">{second.requests} req</div>
              </>
            ) : (
              <div className="text-text-tertiary py-8">—</div>
            )}
          </motion.div>

          {/* 1st place */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4, ease: [0.23, 1, 0.32, 1] }} className="surface-elevated p-5 text-center border-gold/20 bg-gold/[0.03]">
            {first ? (
              <>
                <div className="w-20 h-20 mx-auto rounded-full bg-gold/15 border-2 border-gold/30 flex items-center justify-center text-3xl font-bold text-gold mb-3">{first.name[0]}</div>
                <div className="text-gold text-3xl font-bold mb-1">1st</div>
                <div className="font-medium text-lg text-text-primary">{first.name}</div>
                <div className="text-sm text-gold font-mono mt-1">{first.requests} req</div>
              </>
            ) : (
              <div className="text-text-tertiary py-8">No users yet</div>
            )}
          </motion.div>

          {/* 3rd place */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4, ease: [0.23, 1, 0.32, 1] }} className="surface-elevated p-5 text-center mt-12">
            {third ? (
              <>
                <div className="w-14 h-14 mx-auto rounded-full bg-copper/15 border-2 border-copper/30 flex items-center justify-center text-xl font-bold text-copper mb-3">{third.name[0]}</div>
                <div className="text-copper text-xl font-bold mb-1">3rd</div>
                <div className="font-medium text-text-primary">{third.name}</div>
                <div className="text-sm text-gold font-mono mt-1">{third.requests} req</div>
              </>
            ) : (
              <div className="text-text-tertiary py-8">—</div>
            )}
          </motion.div>
        </div>
      )}

      <LeaderboardTable entries={leaderboard} />
    </div>
  );
}
