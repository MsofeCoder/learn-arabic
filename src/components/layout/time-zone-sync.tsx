"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const COOKIE = "lf_tz";

/**
 * Reports the browser's time zone to the server so "today" — program pacing,
 * the daily new-card allowance — follows the learner's own midnight. Refreshes
 * once if the server rendered with a different (or no) zone. Renders nothing.
 */
export function TimeZoneSync() {
  const router = useRouter();

  useEffect(() => {
    let zone: string;
    try {
      zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return;
    }
    if (!zone) return;

    const current = document.cookie
      .split("; ")
      .find((part) => part.startsWith(`${COOKIE}=`))
      ?.slice(COOKIE.length + 1);
    if (current && decodeURIComponent(current) === zone) return;

    document.cookie = `${COOKIE}=${encodeURIComponent(zone)}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }, [router]);

  return null;
}
