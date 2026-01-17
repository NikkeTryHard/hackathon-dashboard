import { z } from "zod";

// Login schema
export const loginSchema = z.object({
  apiKey: z
    .string()
    .min(1, "API key is required")
    .max(200, "API key too long")
    .regex(/^[\w-]+$/, "Invalid API key format"),
});

// Create user schema
export const createUserSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name too long")
    .regex(/^[\w\s-]+$/, "Name contains invalid characters"),
});

// Track request schema
export const trackRequestSchema = z.object({
  model: z
    .string()
    .min(1, "Model is required")
    .max(100, "Model name too long")
    .regex(/^[\w./-]+$/, "Invalid model name format"),
  tokens: z.number().int().min(0).max(10000000).optional().default(0),
});

// Presence schema
export const presenceSchema = z.object({
  userId: z
    .string()
    .min(1, "User ID is required")
    .max(50, "User ID too long")
    .regex(/^[\w-]+$/, "Invalid user ID format"),
  offline: z.boolean().optional().default(false),
});

// Tunnel action schema
export const tunnelActionSchema = z.object({
  action: z.enum(["restart"]),
});

// Allowed models whitelist (add your models here)
export const ALLOWED_MODELS = ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku", "claude-3.5-sonnet", "claude-3.5-haiku", "gpt-4", "gpt-4-turbo", "gpt-4o", "gpt-3.5-turbo"] as const;

// Validate and parse with helpful error messages
export function validateBody<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const firstError = result.error.issues[0];
  return {
    success: false,
    error: firstError?.message || "Invalid input",
  };
}
