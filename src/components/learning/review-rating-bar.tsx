"use client";

import type { ReviewGrade } from "@/domain/types";
import { cn } from "@/lib/utils/cn";

interface RatingOption {
  grade: ReviewGrade;
  label: string;
  hint: string;
  shortcut: string;
  className: string;
}

/**
 * Wording is about recall, never about intervals or ease factors — the learner
 * should never see the algorithm.
 */
const OPTIONS: RatingOption[] = [
  {
    grade: "again",
    label: "Again",
    hint: "Forgot",
    shortcut: "1",
    className: "border-rose-line bg-rose-soft text-rose-ink hover:bg-rose-100",
  },
  {
    grade: "hard",
    label: "Hard",
    hint: "Struggled",
    shortcut: "2",
    className: "border-amber-line bg-amber-soft text-amber-ink hover:bg-amber-100",
  },
  {
    grade: "good",
    label: "Good",
    hint: "Recalled",
    shortcut: "3",
    className:
      "border-emerald-muted bg-emerald-soft text-brand-deep hover:bg-emerald-100",
  },
  {
    grade: "easy",
    label: "Easy",
    hint: "Instantly",
    shortcut: "4",
    className: "border-line-strong bg-white text-ink-700 hover:bg-sand-100",
  },
];

interface ReviewRatingBarProps {
  onGrade: (grade: ReviewGrade) => void;
  disabled: boolean;
}

export function ReviewRatingBar({ onGrade, disabled }: ReviewRatingBarProps) {
  return (
    <div role="group" aria-label="How well did you recall this?">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {OPTIONS.map((option) => (
          <button
            key={option.grade}
            type="button"
            disabled={disabled}
            onClick={() => onGrade(option.grade)}
            aria-keyshortcuts={option.shortcut}
            className={cn(
              "flex min-h-[60px] flex-col items-center justify-center rounded-xl border px-3 py-2",
              "font-medium transition-colors duration-150",
              "disabled:cursor-not-allowed disabled:opacity-50",
              option.className,
            )}
          >
            <span className="text-[15px]">{option.label}</span>
            <span className="text-[11px] opacity-70">{option.hint}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
