"use client";

import { motion } from "framer-motion";
import { Cpu, Sparkles, Zap, Brain } from "lucide-react";

interface ModelCardProps {
  id: string;
  provider: "claude" | "gemini" | "gpt" | "other";
  index: number;
}

const providerConfig = {
  claude: {
    bgColor: "bg-info/5",
    borderColor: "border-info/15",
    hoverBorder: "hover:border-info/30",
    iconColor: "text-info",
    icon: Brain,
  },
  gemini: {
    bgColor: "bg-gold/5",
    borderColor: "border-gold/15",
    hoverBorder: "hover:border-gold/30",
    iconColor: "text-gold",
    icon: Sparkles,
  },
  gpt: {
    bgColor: "bg-success/5",
    borderColor: "border-success/15",
    hoverBorder: "hover:border-success/30",
    iconColor: "text-success",
    icon: Zap,
  },
  other: {
    bgColor: "bg-surface-1",
    borderColor: "border-border-dim",
    hoverBorder: "hover:border-border",
    iconColor: "text-text-ghost",
    icon: Cpu,
  },
};

export function ModelCard({ id, provider, index }: ModelCardProps) {
  const config = providerConfig[provider];
  const Icon = config.icon;

  if (id.includes("*")) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.02, duration: 0.3, ease: [0.23, 1, 0.32, 1] }} className={`surface-base p-4 ${config.bgColor} ${config.borderColor} ${config.hoverBorder} transition-all cursor-default`}>
      <div className="flex items-center gap-3">
        <div className={`p-1.5 rounded-md bg-surface-0/50 ${config.iconColor}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="font-mono text-sm text-text-primary truncate">{id}</span>
      </div>
    </motion.div>
  );
}
