import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Logo } from "@/components/layout/logo";
import {
  BottomNav,
  NAV_DESTINATIONS,
  type NavKey,
} from "@/components/layout/bottom-nav";
import { formatLongDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

interface AppShellProps {
  active: NavKey;
  displayName: string | null;
  avatarUrl: string | null;
  skillScore: number;
  children: React.ReactNode;
  /** Wider pages (the flashcard surface) suppress the default max-width. */
  width?: "default" | "narrow";
}

/**
 * The authenticated shell: a quiet header, a desktop rail of links, and a
 * mobile bottom navigation of exactly three destinations. Listening is reached
 * from mission cards rather than a fourth persistent tab.
 */
export function AppShell({
  active,
  displayName,
  avatarUrl,
  skillScore,
  children,
  width = "default",
}: AppShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-sand-100">
      <header className="sticky top-0 z-30 border-b border-line bg-sand-100/85 backdrop-blur-sm">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center gap-4 px-4 sm:px-6">
          <Link
            href="/today"
            className="rounded-lg"
            aria-label="LisanFlow home"
          >
            <Logo />
          </Link>

          <nav
            aria-label="Primary"
            className="ms-6 hidden items-center gap-1 sm:flex"
          >
            {NAV_DESTINATIONS.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                aria-current={active === item.key ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active === item.key
                    ? "bg-white text-ink-900 shadow-card"
                    : "text-ink-500 hover:bg-white/70 hover:text-ink-700",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ms-auto flex items-center gap-3">
            <span
              className="hidden text-xs font-medium text-ink-500 sm:inline"
              title="Learning score — a simple progress indicator, not a formal language exam."
            >
              {skillScore.toFixed(1)} / 10
            </span>
            <Link
              href="/progress"
              aria-label="Your progress and account"
              className="rounded-full"
            >
              <Avatar name={displayName} src={avatarUrl} />
            </Link>
          </div>
        </div>
      </header>

      <main
        className={cn(
          "mx-auto w-full flex-1 px-4 pt-6 pb-28 sm:px-6 sm:pb-12",
          width === "narrow" ? "max-w-2xl" : "max-w-5xl",
        )}
      >
        {children}
      </main>

      <BottomNav active={active} />
    </div>
  );
}

export function TodayDateLine({
  date,
  dateKey,
  timeZone,
}: {
  date: Date;
  /** yyyy-mm-dd in the learner's zone, so the machine-readable date matches. */
  dateKey: string;
  timeZone: string;
}) {
  return (
    <p className="text-sm text-ink-500">
      <time dateTime={dateKey}>
        {formatLongDate(date, timeZone)}
      </time>
    </p>
  );
}
