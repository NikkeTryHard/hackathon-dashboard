"use client";

import { usePresence } from "@/lib/presence";

export function PresenceProvider({ children }: { children: React.ReactNode }) {
  usePresence();
  return <>{children}</>;
}
