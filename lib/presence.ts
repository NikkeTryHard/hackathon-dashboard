"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "./auth-context";
import { PRESENCE_HEARTBEAT_INTERVAL } from "./constants";

export function usePresence() {
  const { user } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const sendHeartbeat = useCallback(async () => {
    if (!user) return;
    try {
      await fetch("/api/presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
    } catch (err) {
      console.error("Heartbeat failed:", err);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const startPolling = () => {
      if (!intervalRef.current) {
        intervalRef.current = setInterval(sendHeartbeat, PRESENCE_HEARTBEAT_INTERVAL);
      }
    };

    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        sendHeartbeat(); // Send immediately when visible
        startPolling();
      }
    };

    // Send immediately on mount
    sendHeartbeat();
    startPolling();

    // Listen for visibility changes
    document.addEventListener("visibilitychange", handleVisibility);

    // Send offline signal on unmount
    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibility);
      // Best effort offline signal
      const blob = new Blob([JSON.stringify({ userId: user.id, offline: true })], { type: "application/json" });
      navigator.sendBeacon?.("/api/presence", blob);
    };
  }, [user, sendHeartbeat]);
}
