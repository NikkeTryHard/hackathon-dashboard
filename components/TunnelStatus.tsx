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
      <div className="surface-elevated p-5 animate-pulse">
        <div className="h-4 bg-surface-1 rounded w-1/3 mb-3" />
        <div className="h-10 bg-surface-1 rounded w-full" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }} className={`surface-elevated p-5 ${status.running ? "border-success/20 bg-success/[0.02]" : "border-warning/20 bg-warning/[0.02]"}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <Radio className={`w-4 h-4 ${status.running ? "text-success" : "text-warning"}`} />
          <span className="font-mono text-sm text-text-primary">{status.running ? "API Tunnel Active" : "Tunnel Connecting..."}</span>
        </div>
        <button onClick={handleRestart} disabled={isRestarting} className="p-2 rounded-lg hover:bg-surface-1 transition-colors disabled:opacity-50" title="Restart tunnel">
          <RefreshCw className={`w-4 h-4 text-text-ghost ${isRestarting ? "animate-spin" : ""}`} />
        </button>
      </div>

      {status.url ? (
        <div className="flex items-center gap-2 p-3 bg-surface-0 rounded-lg border border-border-dim font-mono text-sm">
          <code className="flex-1 text-gold truncate">{status.url}</code>
          <button onClick={handleCopy} className="p-2 rounded-lg hover:bg-surface-1 transition-colors flex-shrink-0">
            {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4 text-text-ghost" />}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-warning text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>Waiting for tunnel URL...</span>
        </div>
      )}

      <p className="text-xs text-text-ghost mt-3">Use this URL in your Claude Code config for API access</p>
    </motion.div>
  );
}
