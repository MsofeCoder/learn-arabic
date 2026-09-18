import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_TIME_ZONE, isValidTimeZone } from "@/domain/time";

/** Cookie the browser writes with its IANA time zone (see TimeZoneSync). */
export const TIME_ZONE_COOKIE = "lf_tz";

/**
 * The learner's time zone, as reported by their browser. Validated against the
 * runtime's zone database, so a tampered cookie can only ever fall back to UTC.
 */
export async function getLearnerTimeZone(): Promise<string> {
  const value = (await cookies()).get(TIME_ZONE_COOKIE)?.value;
  return value && value.length <= 64 && isValidTimeZone(value)
    ? value
    : DEFAULT_TIME_ZONE;
}
