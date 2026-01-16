"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Eye, EyeOff, Trash2 } from "lucide-react";

interface UserKeyCardProps {
  user: {
    id: string;
    name: string;
    apiKey: string;
    requests: number;
    createdAt: string;
  };
  onDelete?: (id: string) => void;
}

export function UserKeyCard({ user, onDelete }: UserKeyCardProps) {
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(user.apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const maskedKey = user.apiKey.slice(0, 12) + "..." + user.apiKey.slice(-4);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-4 border border-dark-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-neon-purple/20 flex items-center justify-center text-lg font-bold text-neon-purple">{user.name[0]}</div>
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-xs text-gray-500">
              {user.requests} requests · Created {user.createdAt}
            </div>
          </div>
        </div>
        {onDelete && (
          <button onClick={() => onDelete(user.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 p-2 bg-dark-bg rounded-lg font-mono text-sm">
        <span className="flex-1 truncate">{showKey ? user.apiKey : maskedKey}</span>
        <button onClick={() => setShowKey(!showKey)} className="p-1.5 rounded hover:bg-dark-border transition-colors">
          {showKey ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
        </button>
        <button onClick={handleCopy} className="p-1.5 rounded hover:bg-dark-border transition-colors">
          {copied ? <Check className="w-4 h-4 text-neon-green" /> : <Copy className="w-4 h-4 text-gray-500" />}
        </button>
      </div>
    </motion.div>
  );
}
