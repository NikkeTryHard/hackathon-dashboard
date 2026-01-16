"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtext?: string;
  color?: "green" | "purple" | "cyan";
}

export function StatsCard({ icon: Icon, label, value, subtext, color = "green" }: StatsCardProps) {
  const colorClasses = {
    green: "text-neon-green border-neon-green/30 bg-neon-green/5",
    purple: "text-neon-purple border-neon-purple/30 bg-neon-purple/5",
    cyan: "text-neon-cyan border-neon-cyan/30 bg-neon-cyan/5",
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={cn("card p-4 border", colorClasses[color])}>
      <div className="flex items-center gap-3 mb-2">
        <Icon className="w-5 h-5" />
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <div className="text-3xl font-bold">{value}</div>
      {subtext && <div className="text-xs text-gray-500 mt-1">{subtext}</div>}
    </motion.div>
  );
}
