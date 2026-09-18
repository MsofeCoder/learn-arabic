import * as React from "react";
import { cn } from "@/lib/utils/cn";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  tone?: "neutral" | "success";
  className?: string;
}

/** Shared shape for every empty, done and unavailable state in the app. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  tone = "neutral",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-2xl border border-line bg-white px-6 py-12 text-center",
        className,
      )}
    >
      <span
        className={cn(
          "mb-4 flex size-12 items-center justify-center rounded-full",
          tone === "success"
            ? "bg-emerald-soft text-brand-deep"
            : "bg-sand-200 text-ink-500",
        )}
      >
        {icon}
      </span>
      <h2 className="text-lg font-semibold text-ink-900">{title}</h2>
      <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-ink-600">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
