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
    color: "neon-purple",
    bgColor: "bg-neon-purple/10",
    borderColor: "border-neon-purple/30",
    icon: Brain,
  },
  gemini: {
    color: "neon-cyan",
    bgColor: "bg-neon-cyan/10",
    borderColor: "border-neon-cyan/30",
    icon: Sparkles,
  },
  gpt: {
    color: "neon-green",
    bgColor: "bg-neon-green/10",
    borderColor: "border-neon-green/30",
    icon: Zap,
  },
  other: {
    color: "gray-400",
    bgColor: "bg-gray-400/10",
    borderColor: "border-gray-400/30",
    icon: Cpu,
  },
};

export function ModelCard({ id, provider, index }: ModelCardProps) {
  const config = providerConfig[provider];
  const Icon = config.icon;

  if (id.includes("*")) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.02 }} className={`card p-3 border ${config.borderColor} ${config.bgColor} hover:scale-[1.02] transition-transform cursor-default`}>
      <div className="flex items-center gap-3">
        <Icon className={`w-4 h-4 text-${config.color}`} />
        <span className="font-mono text-sm truncate">{id}</span>
      </div>
    </motion.div>
  );
}
