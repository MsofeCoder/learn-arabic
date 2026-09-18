"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { completeLesson, completeTask } from "@/app/actions";

interface CompleteLessonButtonProps {
  lessonId: string;
  taskId: string | null;
  /** Locked until enough of the recording has genuinely been heard. */
  locked?: boolean;
}

/** Marks the listening finished, plus the mission task that sent us here. */
export function CompleteLessonButton({
  lessonId,
  taskId,
  locked = false,
}: CompleteLessonButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setPending(true);
    setError(null);

    const lessonResult = await completeLesson({ lessonId });
    const taskResult = taskId ? await completeTask({ taskId }) : { ok: true };

    if (!lessonResult.ok || !taskResult.ok) {
      setError(lessonResult.error ?? "That did not save. Please try again.");
      setPending(false);
      return;
    }

    router.push("/today");
    router.refresh();
  }

  return (
    <div>
      <Button
        size="lg"
        fullWidth
        onClick={onClick}
        loading={pending}
        disabled={locked}
      >
        <CheckCircle2 className="size-4" aria-hidden="true" />
        Mark listening complete
      </Button>
      {error ? (
        <p
          role="alert"
          className="mt-3 rounded-xl border border-rose-line bg-rose-soft px-4 py-3 text-sm text-rose-ink"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
