import * as React from "react";
import { cn } from "@/lib/utils/cn";

type Tone = "neutral" | "brand" | "amber" | "muted";

const TONES: Record<Tone, string> = {
  neutral: "bg-sand-200 text-ink-700",
  brand: "bg-emerald-soft text-brand-deep",
  amber: "bg-amber-soft text-amber-ink border border-amber-line",
  muted: "bg-transparent text-ink-500 border border-line-strong",
};

export function Badge({
  className,
  tone = "neutral",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1",
        "text-xs font-medium whitespace-nowrap",
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
}
