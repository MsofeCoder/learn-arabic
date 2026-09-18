import { z } from "zod";

/**
 * Environment validation.
 *
 * Supabase is optional at build time: when it is not configured the app runs in
 * local mode (see `src/lib/repositories/index.ts`) so the product is fully
 * usable before credentials exist. When the variables ARE present they must be
 * well-formed, which this catches at startup rather than at first request.
 */

const schema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url().optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(20).optional(),
  NEXT_PUBLIC_SITE_URL: z.url().optional(),
});

// Next.js inlines `process.env.NEXT_PUBLIC_*` only for literal member access,
// so these must be written out rather than read dynamically.
const parsed = schema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || undefined,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || undefined,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || undefined,
});

if (!parsed.success) {
  throw new Error(
    `Invalid environment configuration: ${parsed.error.issues
      .map((issue) => `${issue.path.join(".")} ${issue.message}`)
      .join("; ")}`,
  );
}

export const env = parsed.data;

export const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/** True only when both Supabase values are present; drives adapter selection. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export function siteUrl(): string {
  if (env.NEXT_PUBLIC_SITE_URL) return env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
