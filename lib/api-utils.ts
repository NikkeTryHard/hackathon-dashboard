/**
 * Safely parse JSON with error handling
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Get raw API key from localStorage for authenticated API calls
 */
export function getRawApiKey(): string {
  if (typeof window === "undefined") return "";

  const rawKey = localStorage.getItem("hackathon-raw-key");
  if (rawKey) return rawKey;

  const stored = localStorage.getItem("hackathon-user");
  if (stored) {
    const parsed = safeJsonParse<{ apiKey?: string }>(stored, {});
    return parsed.apiKey || "";
  }
  return "";
}
