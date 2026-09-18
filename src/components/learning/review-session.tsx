"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, PartyPopper } from "lucide-react";
import { Flashcard } from "@/components/learning/flashcard";
import { ReviewRatingBar } from "@/components/learning/review-rating-bar";
import { Button, buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { completeTask, submitReview } from "@/app/actions";
import type { ReviewCard, ReviewGrade } from "@/domain/types";

interface ReviewSessionProps {
  cards: ReviewCard[];
  /** Mission task to mark complete once the queue is cleared, if any. */
  taskId: string | null;
  setLabel: string | null;
}

/**
 * The review loop. All scheduling happens on the server — this component only
 * tracks which card is on screen and whether it is revealed, so the algorithm
 * can be replaced without touching the UI.
 */
export function ReviewSession({ cards, taskId, setLabel }: ReviewSessionProps) {
  const router = useRouter();
  // Snapshot the queue for the whole session. Grading runs a server action,
  // which re-renders this page with fresh props; the learner's queue must not
  // shift under them mid-session.
  const [queue] = useState(cards);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewed, setReviewed] = useState(0);
  const [pending, startTransition] = useTransition();
  const [finishing, setFinishing] = useState(false);

  const card = queue[index] ?? null;
  const done = card === null;

  const grade = useCallback(
    (value: ReviewGrade) => {
      if (!card || pending) return;
      setError(null);

      startTransition(async () => {
        const result = await submitReview({ cardId: card.cardId, grade: value });
        if (!result.ok) {
          setError(result.error ?? "That review did not save.");
          return;
        }
        setReviewed((count) => count + 1);
        setRevealed(false);
        setIndex((current) => current + 1);
      });
    },
    [card, pending],
  );

  // Keyboard review: space/enter reveals, 1-4 grade. Buttons remain the
  // primary affordance; this is an accelerator, not the only route.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      if (!card) return;

      if (!revealed && (event.key === " " || event.key === "Enter")) {
        event.preventDefault();
        setRevealed(true);
        return;
      }
      if (!revealed) return;

      const map: Record<string, ReviewGrade> = {
        "1": "again",
        "2": "hard",
        "3": "good",
        "4": "easy",
      };
      const next = map[event.key];
      if (next) {
        event.preventDefault();
        grade(next);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [card, revealed, grade]);

  async function finish() {
    setFinishing(true);
    if (taskId) await completeTask({ taskId });
    router.push("/today");
    router.refresh();
  }

  if (done) {
    return (
      <div className="space-y-6">
        <h1 className="sr-only">Review complete</h1>
        <EmptyState
          tone="success"
          icon={<PartyPopper className="size-6" aria-hidden="true" />}
          title={
            reviewed > 0
              ? `${reviewed} ${reviewed === 1 ? "card" : "cards"} reviewed`
              : taskId
                ? "You are fully caught up"
                : "Nothing due right now"
          }
          description={
            reviewed > 0
              ? "That is this set cleared. Each card comes back exactly when you are about to forget it."
              : taskId
                ? "Every card you have met is already scheduled for later — reviewing it now would only weaken the schedule. That completes this review."
                : "You are ahead of your schedule. Start a vocabulary task from today's mission to meet new cards."
          }
          action={
            <Button size="lg" onClick={finish} loading={finishing}>
              <CheckCircle2 className="size-4" aria-hidden="true" />
              {taskId ? "Mark task complete" : "Back to today"}
            </Button>
          }
        />
      </div>
    );
  }

  const total = queue.length;
  const position = index + 1;

  return (
    // The card owns the viewport on a phone: header, card, then controls
    // pinned near the thumb rather than floating in the middle of the screen.
    <div className="flex min-h-[calc(100dvh-12.5rem)] flex-col gap-5 sm:min-h-0">
      <div>
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="text-[13px] font-semibold tracking-[0.1em] text-ink-500 uppercase">
            {setLabel ?? "Review"}
          </h1>
          <p className="text-sm text-ink-500" aria-live="polite">
            {position} of {total}
          </p>
        </div>
        <Progress
          className="mt-2"
          value={(index / total) * 100}
          label={`Card ${position} of ${total}`}
        />
      </div>

      <Flashcard
        key={card.cardId}
        className="flex-1"
        item={card.item}
        revealed={revealed}
        onReveal={() => setRevealed(true)}
      />

      {error ? (
        <p
          role="alert"
          className="rounded-xl border border-rose-line bg-rose-soft px-4 py-3 text-sm text-rose-ink"
        >
          {error}
        </p>
      ) : null}

      {revealed ? (
        <ReviewRatingBar onGrade={grade} disabled={pending} />
      ) : (
        <p className="text-center text-[13px] text-ink-400">
          Press space to reveal
        </p>
      )}

      <div className="flex justify-center">
        <Link
          href="/today"
          className={buttonClasses({ variant: "ghost", size: "sm" })}
        >
          Finish later
        </Link>
      </div>
    </div>
  );
}
