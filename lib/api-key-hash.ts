import * as argon2 from "argon2";
import { randomBytes } from "crypto";

// API key format: sk-hackathon-{name}-{random}
// We store: { prefix (first 16 chars for lookup), hash (argon2) }

const PREFIX_LENGTH = 16;

/**
 * Generate a new API key
 */
export function generateApiKey(userName: string): string {
  const safeName = userName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 10);
  const randomPart = randomBytes(24).toString("base64url"); // 192 bits of entropy
  return `sk-hackathon-${safeName}-${randomPart}`;
}

/**
 * Extract the prefix for database lookup
 */
export function getKeyPrefix(apiKey: string): string {
  return apiKey.slice(0, PREFIX_LENGTH);
}

/**
 * Hash an API key for storage
 */
export async function hashApiKey(apiKey: string): Promise<string> {
  return argon2.hash(apiKey, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16, // 64 MB
    timeCost: 3,
    parallelism: 1,
  });
}

/**
 * Verify an API key against a hash
 */
export async function verifyApiKey(apiKey: string, hash: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, apiKey);
  } catch {
    return false;
  }
}

/**
 * Check if a hash needs to be rehashed (e.g., if argon2 params changed)
 */
export function needsRehash(hash: string): boolean {
  return argon2.needsRehash(hash);
}
