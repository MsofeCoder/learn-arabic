import Link from "next/link";
import { CalendarCheck, Layers, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type NavKey = "today" | "review" | "progress";

/** The three primary destinations, shared by the desktop rail and mobile bar.
 * Listening is reached from mission cards rather than a fourth tab. */
export const NAV_DESTINATIONS = [
  { key: "today", href: "/today", label: "Today", Icon: CalendarCheck },
  { key: "review", href: "/review", label: "Review", Icon: Layers },
  { key: "progress", href: "/progress", label: "Progress", Icon: TrendingUp },
] as const;

/**
 * Mobile bottom navigation: 44px+ targets and safe-area padding so it never
 * sits under the home indicator.
 */
export function BottomNav({ active }: { active: NavKey }) {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur-sm sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md">
        {NAV_DESTINATIONS.map(({ key, href, label, Icon }) => {
          const isActive = active === key;
          return (
            <li key={key} className="flex-1">
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-h-[56px] flex-col items-center justify-center gap-1 px-2 py-2",
                  "text-[11px] font-medium transition-colors",
                  isActive ? "text-brand-deep" : "text-ink-500",
                )}
              >
                <Icon
                  className="size-5"
                  aria-hidden="true"
                  strokeWidth={isActive ? 2.4 : 1.8}
                />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
