"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Radio, RefreshCw, Copy, Check, AlertCircle } from "lucide-react";

interface TunnelStatusData {
  running: boolean;
  url: string | null;
}

export function TunnelStatus() {
  const [status, setStatus] = useState<TunnelStatusData | null>(null);
  const [copied, setCopied] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/tunnel");
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error("Failed to fetch tunnel status:", err);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = async () => {
    if (status?.url) {
      await navigator.clipboard.writeText(status.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRestart = async () => {
    setIsRestarting(true);
    try {
      await fetch("/api/tunnel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restart" }),
      });
      setTimeout(fetchStatus, 3000);
    } catch (err) {
      console.error("Failed to restart tunnel:", err);
    } finally {
      setTimeout(() => setIsRestarting(false), 5000);
    }
  };

  if (!status) {
    return (
      <div className="card p-4 animate-pulse">
        <div className="h-4 bg-dark-border rounded w-1/3 mb-2" />
        <div className="h-8 bg-dark-border rounded w-full" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`card p-4 border ${status.running ? "border-neon-green/30 bg-neon-green/5" : "border-yellow-500/30 bg-yellow-500/5"}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Radio className={`w-4 h-4 ${status.running ? "text-neon-green" : "text-yellow-500"}`} />
          <span className="font-mono text-sm">{status.running ? "API Tunnel Active" : "Tunnel Connecting..."}</span>
        </div>
        <button onClick={handleRestart} disabled={isRestarting} className="p-1.5 rounded hover:bg-dark-border transition-colors disabled:opacity-50" title="Restart tunnel">
          <RefreshCw className={`w-4 h-4 text-gray-500 ${isRestarting ? "animate-spin" : ""}`} />
        </button>
      </div>

      {status.url ? (
        <div className="flex items-center gap-2 p-2 bg-dark-bg rounded-lg font-mono text-sm">
          <code className="flex-1 text-neon-green truncate">{status.url}</code>
          <button onClick={handleCopy} className="p-1.5 rounded hover:bg-dark-border transition-colors flex-shrink-0">
            {copied ? <Check className="w-4 h-4 text-neon-green" /> : <Copy className="w-4 h-4 text-gray-500" />}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-yellow-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>Waiting for tunnel URL...</span>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-2">Use this URL in your Claude Code config for API access</p>
    </motion.div>
  );
}
