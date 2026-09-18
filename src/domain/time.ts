/**
 * Calendar-day handling. A learner's "day" — for pacing the program and for
 * the daily new-card allowance — follows their own time zone, not UTC.
 * Pure: the time zone is always passed in, never read from global state.
 */

export const DEFAULT_TIME_ZONE = "UTC";

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

/**
 * The calendar day (yyyy-mm-dd) on which `date` falls in `timeZone`.
 * A value that is already a bare date is returned unchanged — it was recorded
 * as a day, and shifting it through a time zone would move it.
 */
export function dayKey(
  date: Date | string,
  timeZone: string = DEFAULT_TIME_ZONE,
): string {
  if (typeof date === "string" && DATE_ONLY.test(date)) return date;
  // en-CA formats as yyyy-mm-dd.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
}
