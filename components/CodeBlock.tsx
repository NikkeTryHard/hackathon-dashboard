"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { motion } from "framer-motion";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

export function CodeBlock({ code, language = "bash", filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="surface-elevated overflow-hidden">
      {filename && (
        <div className="bg-surface-0 px-4 py-2.5 flex items-center justify-between border-b border-border-dim">
          <span className="text-xs text-text-ghost font-mono">{filename}</span>
          <span className="text-xs text-info">{language}</span>
        </div>
      )}
      <div className="relative">
        <pre className="p-4 overflow-x-auto text-sm">
          <code className="text-text-secondary">{code}</code>
        </pre>
        <button onClick={handleCopy} className="absolute top-3 right-3 p-2 rounded-lg bg-surface-1 border border-border-dim hover:border-gold/30 hover:bg-surface-2 transition-all">
          {copied ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}>
              <Check className="w-4 h-4 text-success" />
            </motion.div>
          ) : (
            <Copy className="w-4 h-4 text-text-ghost" />
          )}
        </button>
      </div>
    </div>
  );
}
