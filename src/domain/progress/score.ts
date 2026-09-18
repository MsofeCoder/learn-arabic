import type { ReviewGrade } from "@/domain/types";

/**
 * Learning-score calculation (docs/spec/01-PRD.md §7).
 *
 * Deliberately simple and deliberately slow-moving. This is a progress
 * indicator, never a proficiency assessment — the UI must say so.
 */

export const MAX_SKILL_SCORE = 10;

/**
 * Points needed for each +0.1 of score. Calibrated so a full, honest pass of
 * the 5-day program (~16 tasks and ~150 reviews, roughly 600 points) moves the
 * score by about +1.2. The PRD's suggested `floor(points / 100)` moved a
 * learner from 7 to 10 in a single sitting — not "slow", and not credible.
 */
export const POINTS_PER_TENTH = 50;

export const POINTS_PER_TASK = 20;

const POINTS_PER_GRADE: Record<ReviewGrade, number> = {
  again: 1,
  hard: 3,
  good: 5,
  easy: 4,
};

export function pointsForReview(grade: ReviewGrade): number {
  return POINTS_PER_GRADE[grade];
}

function clampBaseline(baselineScore: number): number {
  return Math.min(MAX_SKILL_SCORE, Math.max(0, baselineScore));
}

/** Tenths earned from progress, as an integer (avoids float drift). */
function earnedTenths(progressPoints: number): number {
  return Math.floor(Math.max(0, progressPoints) / POINTS_PER_TENTH);
}

/** Displayed score, one decimal place, bounded 0-10. */
export function computeSkillScore(
  baselineScore: number,
  progressPoints: number,
): number {
  const tenths =
    Math.round(clampBaseline(baselineScore) * 10) + earnedTenths(progressPoints);
  return Math.min(MAX_SKILL_SCORE * 10, tenths) / 10;
}

/** 0-100 progress from the current score towards the next whole number. */
export function progressToNextPoint(
  baselineScore: number,
  progressPoints: number,
): number {
  const score = computeSkillScore(baselineScore, progressPoints);
  if (score >= MAX_SKILL_SCORE) return 100;
  return Math.round((score - Math.floor(score)) * 100);
}

export function describeSkillScore(score: number): string {
  if (score <= 2) return "Beginner — building first recognition.";
  if (score <= 4) return "Basic — you catch familiar phrases.";
  if (score <= 6) return "Developing — you follow the shape of a lesson.";
  if (score <= 8) return "Strong — you follow most of a lecture live.";
  return "Advanced — you follow lectures comfortably.";
}

export const SCORE_DISCLAIMER =
  "Learning score — a simple progress indicator, not a formal language exam.";
