"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Diagnostics go to the console/server logs, never to the learner.
    console.error("[lisanflow] route error", error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-20">
      <EmptyState
        icon={<AlertTriangle className="size-6" aria-hidden="true" />}
        title="Something went wrong"
        description="Your progress is saved. Try that again, and if it keeps happening, reload the page."
        action={<Button onClick={reset}>Try again</Button>}
      />
    </div>
  );
}
