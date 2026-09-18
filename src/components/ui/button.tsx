import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * The single button primitive. Every variant carries default / hover / focus /
 * active / disabled / loading states, and every size clears a 44px touch target
 * except `sm`, which is only used inside already-tappable rows.
 */

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-brand text-white shadow-[0_1px_2px_rgb(5_150_105_/_0.4)] hover:bg-brand-strong active:bg-brand-deep disabled:bg-ink-400",
  secondary:
    "bg-white text-ink-900 border border-line-strong hover:bg-sand-100 active:bg-sand-200",
  outline:
    "bg-transparent text-brand-deep border border-emerald-muted hover:bg-emerald-soft active:bg-emerald-soft",
  ghost: "bg-transparent text-ink-600 hover:bg-sand-200 active:bg-line",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3 text-sm gap-1.5 rounded-lg",
  md: "h-11 px-4 text-[15px] gap-2 rounded-xl",
  lg: "h-13 min-h-[52px] px-6 text-base gap-2 rounded-xl",
};

/** Shared class computation, so links can be styled as buttons without nesting
 * an anchor inside a <button>. */
export function buttonClasses(
  options: {
    variant?: Variant;
    size?: Size;
    fullWidth?: boolean;
    className?: string;
  } = {},
): string {
  const { variant = "primary", size = "md", fullWidth, className } = options;
  return cn(
    "inline-flex items-center justify-center font-medium",
    "transition-colors duration-150",
    "disabled:cursor-not-allowed disabled:opacity-60",
    VARIANTS[variant],
    SIZES[size],
    fullWidth && "w-full",
    className,
  );
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={buttonClasses({ variant, size, fullWidth, className })}
        {...props}
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : null}
        {children}
      </button>
    );
  },
);
