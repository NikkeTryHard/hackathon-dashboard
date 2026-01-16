"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtext?: string;
  color?: "gold" | "success" | "info" | "default";
  delay?: number;
}

const colorConfig = {
  gold: {
    iconBg: "bg-gold/10",
    iconColor: "text-gold",
    border: "border-gold/10",
  },
  success: {
    iconBg: "bg-success/10",
    iconColor: "text-success",
    border: "border-success/10",
  },
  info: {
    iconBg: "bg-info/10",
    iconColor: "text-info",
    border: "border-info/10",
  },
  default: {
    iconBg: "bg-surface-2",
    iconColor: "text-text-tertiary",
    border: "border-border-dim",
  },
};

export function StatsCard({ icon: Icon, label, value, subtext, color = "gold", delay = 0 }: StatsCardProps) {
  const config = colorConfig[color];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4, ease: [0.23, 1, 0.32, 1] }} className={cn("surface-elevated p-5 hover:border-border-bright transition-colors", config.border)}>
      <div className="flex items-center gap-3 mb-4">
        <div className={cn("p-2 rounded-lg", config.iconBg)}>
          <Icon className={cn("w-4 h-4", config.iconColor)} />
        </div>
        <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-2xl font-semibold text-text-primary tracking-tight">{value}</div>
      {subtext && <div className="text-xs text-text-ghost mt-1.5">{subtext}</div>}
    </motion.div>
  );
}
