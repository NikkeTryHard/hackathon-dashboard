"use client";

import { motion } from "framer-motion";
import { providerConfig, ProviderType } from "@/lib/provider-config";

interface ModelCardProps {
  id: string;
  provider: ProviderType;
  index: number;
}

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
