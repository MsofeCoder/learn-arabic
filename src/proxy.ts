import type { NextRequest } from "next/server";
import { updateSupabaseSession } from "@/lib/supabase/session-refresh";

/** Keeps the Supabase auth cookie fresh so server components see a live session. */
export async function proxy(request: NextRequest) {
  return updateSupabaseSession(request);
}

export const config = {
  matcher: [
    // Everything except static assets and image files.
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|manifest.webmanifest|.*\\.(?:png|jpg|jpeg|svg|webp|mp3)$).*)",
  ],
};
