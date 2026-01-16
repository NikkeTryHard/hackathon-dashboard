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
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: number * 0.1 }} className="relative pl-12">
      <div className={`absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center font-mono text-sm ${completed ? "bg-neon-green/20 text-neon-green border border-neon-green/30" : "bg-dark-card border border-dark-border text-gray-400"}`}>{completed ? <Check className="w-4 h-4" /> : number}</div>

      <div className="absolute left-4 top-8 bottom-0 w-px bg-dark-border" />

      <div className="pb-8">
        <h3 className="font-bold text-lg mb-1">{title}</h3>
        <p className="text-sm text-gray-500 mb-4">{description}</p>
        {children}
      </div>
    </motion.div>
  );
}
