/** Small shared formatters. Kept here so no magic strings live in components. */

/** `m:ss`, or `h:mm:ss` once a recording passes the hour. */
export function formatSeconds(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "0:00";
  const whole = Math.floor(totalSeconds);
  const seconds = (whole % 60).toString().padStart(2, "0");
  const minutes = Math.floor(whole / 60) % 60;
  const hours = Math.floor(whole / 3600);
  return hours > 0
    ? `${hours}:${minutes.toString().padStart(2, "0")}:${seconds}`
    : `${minutes}:${seconds}`;
}

export function formatMinutes(minutes: number): string {
  return `${minutes} min`;
}

export function formatLongDate(date: Date, timeZone?: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

/** First name only, so greetings stay warm rather than formal. */
export function firstName(displayName: string | null): string | null {
  if (!displayName) return null;
  const [first] = displayName.trim().split(/\s+/);
  return first || null;
}
