"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { providerConfig, ProviderType } from "@/lib/provider-config";
import { cn } from "@/lib/utils";

interface ModelCardProps {
  id: string;
  provider: ProviderType;
  index: number;
}

export function ModelCard({ id, provider, index }: ModelCardProps) {
  const [copied, setCopied] = useState(false);
  const config = providerConfig[provider];
  const Icon = config.icon;

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [id]);

  if (id.includes("*")) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.02, duration: 0.3, ease: [0.23, 1, 0.32, 1] }} className={cn("surface-base p-4 transition-all cursor-default", config.bgColor, config.borderColor, config.hoverBorder)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn("p-1.5 rounded-md bg-surface-0/50 flex-shrink-0", config.iconColor)}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="font-mono text-sm text-text-primary truncate">{id}</span>
        </div>
        <button onClick={handleCopy} className={cn("p-1.5 rounded-md transition-all flex-shrink-0", copied ? "bg-success/20 text-success" : "hover:bg-surface-2 text-text-ghost hover:text-text-secondary")} title="Copy model ID">
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </motion.div>
  );
}
