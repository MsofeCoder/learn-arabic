/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils/cn";

interface AvatarProps {
  name: string | null;
  src?: string | null;
  className?: string;
}

/** Initial-based avatar, upgrading to the OAuth photo when one exists. */
export function Avatar({ name, src, className }: AvatarProps) {
  const initial = (name?.trim()[0] ?? "L").toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt=""
        width={36}
        height={36}
        className={cn("size-9 rounded-full object-cover", className)}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-9 items-center justify-center rounded-full",
        "bg-emerald-soft text-sm font-semibold text-brand-deep",
        className,
      )}
    >
      {initial}
    </span>
  );
}
