"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "./auth-context";

const HEARTBEAT_INTERVAL = 30000; // 30 seconds

export function usePresence() {
  const { user } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) return;

    const sendHeartbeat = async () => {
      try {
        await fetch("/api/presence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        });
      } catch (err) {
        console.error("Heartbeat failed:", err);
      }
    };

    // Send immediately on mount
    sendHeartbeat();

    // Then every 30 seconds
    intervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

    // Send offline signal on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Best effort offline signal
      const blob = new Blob([JSON.stringify({ userId: user.id, offline: true })], { type: "application/json" });
      navigator.sendBeacon?.("/api/presence", blob);
    };
  }, [user]);
}
