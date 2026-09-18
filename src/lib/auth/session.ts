import "server-only";
import { cookies } from "next/headers";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AuthUser } from "@/lib/repositories/types";

/**
 * Identity resolution for server code.
 *
 * Two providers sit behind one function so every caller — pages, server actions,
 * repositories — reads identity the same way:
 *
 *  - Supabase mode (credentials present): the Supabase Auth session
 *    (email + password today; OAuth providers can be added without changes here).
 *  - Local mode (no credentials): a signed-out-able cookie identifying a local
 *    learner, so the full product is usable before Supabase exists.
 *
 * The user id is ALWAYS derived here from the session, never from client input.
 */

export const LOCAL_SESSION_COOKIE = "lf_local_session";

interface LocalSession {
  id: string;
  name: string | null;
}

function parseLocalSession(raw: string | undefined): LocalSession | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(
      Buffer.from(raw, "base64url").toString("utf8"),
    ) as Partial<LocalSession>;
    if (typeof parsed.id !== "string" || parsed.id.length === 0) return null;
    return { id: parsed.id, name: parsed.name ?? null };
  } catch {
    return null;
  }
}

export function encodeLocalSession(session: LocalSession): string {
  return Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return null;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const meta = user.user_metadata ?? {};
    return {
      id: user.id,
      email: user.email ?? null,
      displayName:
        (meta.full_name as string | undefined) ??
        (meta.name as string | undefined) ??
        null,
      avatarUrl: (meta.avatar_url as string | undefined) ?? null,
    };
  }

  const store = await cookies();
  const session = parseLocalSession(store.get(LOCAL_SESSION_COOKIE)?.value);
  if (!session) return null;

  return {
    id: session.id,
    email: null,
    displayName: session.name,
    avatarUrl: null,
  };
}

/** Throws when unauthenticated. Use in server actions that mutate learner data. */
export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("You need to be signed in to do that.");
  return user;
}
