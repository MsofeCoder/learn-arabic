import { Skeleton } from "@/components/ui/skeleton";

/** Shared route-level loading shape: header, hero, then a list of task rows. */
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <span className="sr-only" role="status">
        Loading
      </span>
      <Skeleton className="h-5 w-48" />
      <Skeleton className="mt-2 h-4 w-32" />
      <Skeleton className="mt-8 h-64 w-full rounded-2xl" />
      <div className="mt-8 space-y-2.5">
        <Skeleton className="h-[72px] w-full rounded-xl" />
        <Skeleton className="h-[72px] w-full rounded-xl" />
        <Skeleton className="h-[72px] w-full rounded-xl" />
      </div>
    </div>
  );
}
