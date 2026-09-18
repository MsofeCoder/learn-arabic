import "server-only";
import { buildTodayMission, resolveCurrentDay } from "@/domain/missions/engine";
import { DEFAULT_TIME_ZONE, dayKey } from "@/domain/time";
import type {
  Mission,
  Profile,
  ProgressSummary,
  ReviewCard,
  VocabularyItem,
} from "@/domain/types";
import {
  contentRepository,
  learningRepository,
  reviewRepository,
} from "@/lib/repositories";
import type { AuthUser } from "@/lib/repositories/types";

/**
 * Application services: the only layer that composes repositories with domain
 * logic. Pages and server actions call these; they never touch repositories or
 * Supabase directly.
 */

export const DEFAULT_REVIEW_LIMIT = 10;
export const MAX_REVIEW_LIMIT = 30;

export async function getProfileForUser(user: AuthUser): Promise<Profile> {
  return learningRepository.ensureProfile(user);
}

export interface TodayView {
  mission: Mission;
  /** The date the mission was generated for; the UI renders this same date. */
  date: Date;
  /** `date` as a calendar day in the learner's time zone. */
  dateKey: string;
  timeZone: string;
  profile: Profile;
  focusPhrases: VocabularyItem[];
  programTitle: string;
  totalDays: number;
}

/** `getTodaysMission(userId, date)` from the API contract, with its view data. */
export async function getTodaysMission(
  user: AuthUser,
  date: Date = new Date(),
  timeZone: string = DEFAULT_TIME_ZONE,
): Promise<TodayView> {
  const [profile, program] = await Promise.all([
    learningRepository.ensureProfile(user),
    contentRepository.getActiveProgram(),
  ]);

  const [days, completions, dueReviewCount] = await Promise.all([
    contentRepository.getProgramDays(program.id),
    learningRepository.getTaskCompletions(user.id, timeZone),
    reviewRepository.countDueCards(user.id),
  ]);

  const completedTaskIds = completions.map((c) => c.taskId);
  const today = dayKey(date, timeZone);
  const dayNumber = resolveCurrentDay(days, completions, today);
  const day =
    days.find((d) => d.dayNumber === dayNumber) ?? days[days.length - 1];

  const mission = buildTodayMission({
    program,
    day,
    state: { profile, currentDayNumber: dayNumber, completedTaskIds, dueReviewCount },
  });

  const focusPhrases = await contentRepository.getVocabularyItems(
    day.focusPhraseIds,
  );

  return {
    mission,
    date,
    dateKey: today,
    timeZone,
    profile,
    focusPhrases,
    programTitle: program.title,
    totalDays: program.totalDays,
  };
}

export async function getReviewQueue(
  user: AuthUser,
  options: { limit?: number; setKey?: string; timeZone?: string } = {},
): Promise<ReviewCard[]> {
  const limit = Math.min(
    MAX_REVIEW_LIMIT,
    Math.max(1, options.limit ?? DEFAULT_REVIEW_LIMIT),
  );
  return reviewRepository.getDueCards(
    user.id,
    limit,
    options.setKey,
    options.timeZone,
  );
}

export async function getProgressSummary(
  user: AuthUser,
  timeZone: string = DEFAULT_TIME_ZONE,
): Promise<ProgressSummary> {
  await learningRepository.ensureProfile(user);
  return learningRepository.getProgressSummary(user.id, timeZone);
}
