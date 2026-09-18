import { cn } from "@/lib/utils/cn";

/**
 * The LisanFlow mark: a flowing lam glyph in emerald. Simple enough to stay
 * legible at 32px, which is what the PWA icon needs.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <span
        aria-hidden="true"
        className="flex size-8 items-center justify-center rounded-lg bg-brand text-white"
      >
        <span className="arabic-display -mt-0.5 text-lg leading-none">ل</span>
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-ink-900">
        LisanFlow
      </span>
    </span>
  );
}
