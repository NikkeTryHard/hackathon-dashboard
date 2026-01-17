import { LRUCache } from "lru-cache";

interface PresenceEntry {
  lastSeen: number;
  online: boolean;
}

// Bounded to 1000 entries max, auto-evicts least recently used
const presenceCache = new LRUCache<string, PresenceEntry>({
  max: 1000,
  ttl: 5 * 60 * 1000, // 5 minute TTL
});

const STALE_THRESHOLD_MS = 60_000; // 60 seconds

export function setPresence(userId: string, online: boolean): void {
  presenceCache.set(userId, {
    lastSeen: Date.now(),
    online,
  });
}

export function getPresence(userId: string): boolean {
  const entry = presenceCache.get(userId);
  if (!entry) return false;

  const isStale = Date.now() - entry.lastSeen > STALE_THRESHOLD_MS;
  return entry.online && !isStale;
}

export function getAllPresence(): Record<string, boolean> {
  const now = Date.now();
  const result: Record<string, boolean> = {};

  for (const [key, value] of presenceCache.entries()) {
    const isOnline = value.online && now - value.lastSeen < STALE_THRESHOLD_MS;
    result[key] = isOnline;
  }

  return result;
}

export function getPresenceStats(): { total: number; online: number } {
  const all = getAllPresence();
  const online = Object.values(all).filter(Boolean).length;
  return { total: Object.keys(all).length, online };
}
