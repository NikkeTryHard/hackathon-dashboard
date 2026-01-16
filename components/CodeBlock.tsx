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
    <div className="card overflow-hidden">
      {filename && (
        <div className="bg-dark-border px-4 py-2 flex items-center justify-between">
          <span className="text-xs text-gray-500 font-mono">{filename}</span>
          <span className="text-xs text-neon-purple">{language}</span>
        </div>
      )}
      <div className="relative">
        <pre className="p-4 overflow-x-auto text-sm">
          <code className="text-gray-300">{code}</code>
        </pre>
        <button onClick={handleCopy} className="absolute top-2 right-2 p-2 rounded-lg bg-dark-border hover:bg-dark-border/80 transition-colors">
          {copied ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <Check className="w-4 h-4 text-neon-green" />
            </motion.div>
          ) : (
            <Copy className="w-4 h-4 text-gray-500" />
          )}
        </button>
      </div>
    </div>
  );
}
