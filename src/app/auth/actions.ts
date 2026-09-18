"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { authErrorMessage } from "@/lib/auth/password-errors";
import { siteUrl } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/actions";

/**
 * Email + password authentication through Supabase Auth.
 *
 * Runs on the server so the session cookie is written by the SSR client, and
 * so passwords are validated here rather than trusted from the browser. Raw
 * Supabase error text is never returned — only mapped, learner-facing copy.
 */

const MIN_PASSWORD_LENGTH = 8;

/**
 * The origin the learner is actually using, so the confirmation link returns to
 * the same host and port. Server actions always carry an Origin header; the
 * configured site URL is only a fallback.
 */
async function requestOrigin(): Promise<string> {
  const origin = (await headers()).get("origin");
  return origin && /^https?:\/\/[^/]+$/.test(origin) ? origin : siteUrl();
}

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(1).max(128),
});

const signUpSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH)
    .max(128)
    .regex(/[A-Za-z]/)
    .regex(/\d/),
  displayName: z.string().trim().min(1).max(60),
});

export interface SignUpData {
  /** True when the account exists but must be confirmed from the inbox. */
  needsConfirmation: boolean;
}

export async function signInWithPassword(
  input: z.input<typeof credentialsSchema>,
): Promise<ActionResult> {
  const parsed = credentialsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please enter your email and password." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Sign-in is not configured." };

  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { ok: false, error: authErrorMessage(error.code) };
  }

  redirect("/today");
}

export async function signUpWithPassword(
  input: z.input<typeof signUpSchema>,
): Promise<ActionResult<SignUpData>> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    return {
      ok: false,
      error:
        field === "password"
          ? `Please choose a password of at least ${MIN_PASSWORD_LENGTH} characters with both letters and numbers.`
          : field === "displayName"
            ? "Please tell us your name."
            : "That email address does not look right.",
    };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Sign-up is not configured." };

  const { email, password, displayName } = parsed.data;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Read by the handle_new_user trigger to seed the profile's name.
      data: { full_name: displayName },
      emailRedirectTo: `${await requestOrigin()}/auth/callback`,
    },
  });

  if (error) {
    return { ok: false, error: authErrorMessage(error.code) };
  }

  // With email confirmation on there is no session yet. (Supabase also returns
  // no session for an already-registered email, deliberately, so the reply is
  // the same either way and reveals nothing.)
  if (!data.session) {
    return { ok: true, data: { needsConfirmation: true } };
  }

  redirect("/today");
}
