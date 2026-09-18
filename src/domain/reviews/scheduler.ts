import type { CardState, ReviewGrade } from "@/domain/types";

/**
 * MVP spaced-repetition scheduler (see docs/spec/08-SRS-ALGORITHM.md).
 *
 * Pure and deterministic: given the same card state, grade and `now`, it always
 * produces the same next state. Kept behind the `ReviewScheduler` interface so a
 * research-backed scheduler (e.g. FSRS) can replace it without touching the UI.
 */

export const MIN_EASE_FACTOR = 1.3;
export const MAX_EASE_FACTOR = 3.0;
export const DEFAULT_EASE_FACTOR = 2.5;
export const MAX_INTERVAL_DAYS = 180;
/** ~10 minutes, expressed in days, used for same-session retries. */
export const RELEARN_INTERVAL_DAYS = 0.007;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export interface ReviewScheduler {
  initialState(now: Date): CardState;
  schedule(state: CardState, grade: ReviewGrade, now: Date): CardState;
}

export function initialCardState(now: Date): CardState {
  return {
    intervalDays: 0,
    easeFactor: DEFAULT_EASE_FACTOR,
    repetitions: 0,
    dueAt: now.toISOString(),
    lastReviewedAt: null,
  };
}

function clampEase(value: number): number {
  return Math.min(MAX_EASE_FACTOR, Math.max(MIN_EASE_FACTOR, round2(value)));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function clampInterval(days: number): number {
  return Math.min(MAX_INTERVAL_DAYS, days);
}

function addDays(now: Date, days: number): string {
  return new Date(now.getTime() + days * MS_PER_DAY).toISOString();
}

/**
 * Applies one graded review to a card and returns the next scheduling state.
 * Never mutates the input.
 */
export function scheduleReview(
  state: CardState,
  grade: ReviewGrade,
  now: Date,
): CardState {
  const previousInterval = state.intervalDays;
  let intervalDays: number;
  let easeFactor = state.easeFactor;
  let repetitions = state.repetitions;

  switch (grade) {
    case "again": {
      repetitions = 0;
      intervalDays = RELEARN_INTERVAL_DAYS;
      easeFactor = clampEase(easeFactor - 0.2);
      break;
    }
    case "hard": {
      repetitions += 1;
      intervalDays = Math.max(1, Math.round(previousInterval * 1.2));
      easeFactor = clampEase(easeFactor - 0.15);
      break;
    }
    case "good": {
      repetitions += 1;
      if (previousInterval < 1) {
        intervalDays = 1;
      } else if (previousInterval < 6) {
        intervalDays = Math.round(previousInterval * 2.2);
      } else {
        intervalDays = Math.round(previousInterval * easeFactor);
      }
      break;
    }
    case "easy": {
      repetitions += 1;
      intervalDays = Math.max(2, Math.round(previousInterval * 2.8));
      easeFactor = clampEase(easeFactor + 0.15);
      break;
    }
  }

  intervalDays = clampInterval(intervalDays);

  return {
    intervalDays,
    easeFactor,
    repetitions,
    dueAt: addDays(now, intervalDays),
    lastReviewedAt: now.toISOString(),
  };
}

export const mvpScheduler: ReviewScheduler = {
  initialState: initialCardState,
  schedule: scheduleReview,
};

/** Learner-facing phrasing for the next due time. Never exposes ease/interval numbers. */
export function describeNextDue(state: CardState): string {
  const days = state.intervalDays;
  if (days < 1) return "in a few minutes";
  if (days < 2) return "tomorrow";
  if (days < 30) return `in ${Math.round(days)} days`;
  const months = Math.round(days / 30);
  return months <= 1 ? "in about a month" : `in about ${months} months`;
}

export function isDue(state: CardState, now: Date): boolean {
  return new Date(state.dueAt).getTime() <= now.getTime();
}
