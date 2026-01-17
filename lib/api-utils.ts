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
 * Get API key for authenticated API calls
 * Now prompts user to enter key since we don't store it
 */
export function getRawApiKey(): string {
  if (typeof window === "undefined") return "";

  // Check session for temporary key storage during admin operations
  const sessionKey = sessionStorage.getItem("hackathon-temp-key");
  if (sessionKey) return sessionKey;

  // Prompt user to enter their API key for admin operations
  const key = prompt("Enter your API key to perform this action:");
  if (key) {
    // Store temporarily for this session
    sessionStorage.setItem("hackathon-temp-key", key);
    return key;
  }

  return "";
}

/**
 * Clear temporary API key from session
 */
export function clearTempApiKey(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("hackathon-temp-key");
  }
}
