import { cn } from "@/lib/utils/cn";

interface ProgressProps {
  /** 0-100. */
  value: number;
  label: string;
  className?: string;
  tone?: "brand" | "neutral";
}

/** Slim progress bar. Always labelled, never colour-only. */
export function Progress({
  value,
  label,
  className,
  tone = "brand",
}: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(value)));
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-sand-200",
        className,
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-300",
          tone === "brand" ? "bg-brand" : "bg-ink-400",
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
