"use client";

import { useState, memo, useCallback } from "react";
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

function UserKeyCardComponent({ user, onDelete }: UserKeyCardProps) {
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(user.apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [user.apiKey]);

  const maskedKey = user.apiKey.slice(0, 12) + "..." + user.apiKey.slice(-4);

  return (
    <div className="surface-base p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-info/15 border border-info/20 flex items-center justify-center text-lg font-bold text-info">{user.name[0]}</div>
          <div>
            <div className="font-medium text-text-primary">{user.name}</div>
            <div className="text-xs text-text-ghost">
              {user.requests} requests · Created {user.createdAt}
            </div>
          </div>
        </div>
        {onDelete && (
          <button onClick={() => onDelete(user.id)} className="p-2 rounded-lg hover:bg-error/10 text-text-ghost hover:text-error transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 p-3 bg-surface-0 rounded-lg border border-border-dim font-mono text-sm">
        <span className="flex-1 truncate text-text-secondary">{showKey ? user.apiKey : maskedKey}</span>
        <button onClick={() => setShowKey(!showKey)} className="p-1.5 rounded-lg hover:bg-surface-1 transition-colors">
          {showKey ? <EyeOff className="w-4 h-4 text-text-ghost" /> : <Eye className="w-4 h-4 text-text-ghost" />}
        </button>
        <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-surface-1 transition-colors">
          {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4 text-text-ghost" />}
        </button>
      </div>
    </div>
  );
}

export const UserKeyCard = memo(UserKeyCardComponent);
