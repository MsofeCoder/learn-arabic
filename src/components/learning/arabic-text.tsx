import { cn } from "@/lib/utils/cn";

type Size = "sm" | "md" | "lg" | "display";

const SIZES: Record<Size, string> = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl sm:text-4xl",
  display: "text-[2rem] leading-[1.6] sm:text-5xl",
};

interface ArabicTextProps {
  children: string;
  size?: Size;
  className?: string;
  /** Rendered as a block by default; inline for mixed-language rows. */
  as?: "p" | "span" | "div";
}

/**
 * Arabic content. Always carries `dir="rtl"` and `lang="ar"` at the element
 * level so it shapes correctly and reads correctly to a screen reader, even
 * when it sits inside an LTR layout.
 */
export function ArabicText({
  children,
  size = "md",
  className,
  as: Tag = "p",
}: ArabicTextProps) {
  return (
    <Tag
      dir="rtl"
      lang="ar"
      className={cn(
        size === "display" || size === "lg" ? "arabic-display" : "arabic",
        SIZES[size],
        "text-ink-900",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
