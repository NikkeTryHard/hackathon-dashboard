"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface SetupStepProps {
  number: number;
  title: string;
  description: string;
  children: React.ReactNode;
  completed?: boolean;
}

export function SetupStep({ number, title, description, children, completed }: SetupStepProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: number * 0.1, duration: 0.4, ease: [0.23, 1, 0.32, 1] }} className="relative pl-14">
      {/* Step number */}
      <div className={`absolute left-0 top-0 w-9 h-9 rounded-lg flex items-center justify-center font-mono text-sm ${completed ? "bg-success/15 text-success border border-success/30" : "bg-surface-1 border border-border text-text-tertiary"}`}>{completed ? <Check className="w-4 h-4" /> : number}</div>

      {/* Connector line */}
      <div className="absolute left-[18px] top-10 bottom-0 w-px bg-border-dim" />

      <div className="pb-8">
        <h3 className="font-semibold text-lg text-text-primary mb-1">{title}</h3>
        <p className="text-sm text-text-tertiary mb-4">{description}</p>
        {children}
      </div>
    </motion.div>
  );
}
