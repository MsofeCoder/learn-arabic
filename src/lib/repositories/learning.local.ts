import { PROGRAM_DAYS } from "@/data/seed/program";
import { VOCABULARY_BY_ID } from "@/data/seed/vocabulary";
import { resolveCurrentDay } from "@/domain/missions/engine";
import { computeSkillScore, POINTS_PER_TASK, pointsForReview } from "@/domain/progress/score";
import { newCardAllowance } from "@/domain/reviews/introduction";
import { DEFAULT_TIME_ZONE, dayKey } from "@/domain/time";
import { initialCardState, scheduleReview } from "@/domain/reviews/scheduler";
import type {
  DailyMinutes,
  Profile,
  ProgressSummary,
  ReviewCard,
  ReviewGrade,
  UserCard,
} from "@/domain/types";
import { seedContentRepository } from "./content.seed";
import { emptyRecord, withStore, type LocalUserRecord } from "./local-store";
import type {
  AuthUser,
  LearningRepository,
  OnboardingInput,
  ReviewRepository,
  ReviewResult,
} from "./types";

function newProfile(user: AuthUser): Profile {
  return {
    userId: user.id,
    displayName: user.displayName,
    email: user.email,
    avatarUrl: user.avatarUrl,
    baselineScore: 0,
    dailyMinutes: 20,
    onboardingComplete: false,
    progressPoints: 0,
    enrolledOn: null,
  };
}

function todayIso(now: Date): string {
  return now.toISOString().slice(0, 10);
}

/** Records written before dates were tracked count as long finished. */
function completedOnFor(
  record: LocalUserRecord,
  taskId: string,
  timeZone: string,
): string {
  const stamp = record.completionDates?.[taskId];
  return stamp ? dayKey(stamp, timeZone) : "1970-01-01";
}

function requireRecord(
  db: { users: Record<string, LocalUserRecord> },
  userId: string,
): LocalUserRecord {
  const record = db.users[userId];
  if (!record) throw new Error(`Unknown local user: ${userId}`);
  return record;
}

export const localLearningRepository: LearningRepository = {
  async getProfile(userId) {
    return withStore((db) => db.users[userId]?.profile ?? null);
  },

  async ensureProfile(user) {
    return withStore((db) => {
      const existing = db.users[user.id];
      if (existing) {
        // Keep identity fields fresh without touching learning state.
        existing.profile.displayName =
          user.displayName ?? existing.profile.displayName;
        existing.profile.email = user.email ?? existing.profile.email;
        existing.profile.avatarUrl =
          user.avatarUrl ?? existing.profile.avatarUrl;
        return existing.profile;
      }
      const record = emptyRecord(newProfile(user));
      db.users[user.id] = record;
      return record.profile;
    }, true);
  },

  async saveOnboarding(userId, input: OnboardingInput) {
    await withStore((db) => {
      const record = requireRecord(db, userId);
      record.profile.baselineScore = input.baselineScore;
      record.profile.dailyMinutes = input.dailyMinutes as DailyMinutes;
      record.profile.onboardingComplete = true;
      record.profile.enrolledOn ??= todayIso(new Date());
      if (input.displayName) record.profile.displayName = input.displayName;
    }, true);
  },

  async getTaskCompletions(userId, timeZone) {
    return withStore((db) => {
      const record = db.users[userId];
      if (!record) return [];
      return record.completedTaskIds.map((taskId) => ({
        taskId,
        completedOn: completedOnFor(record, taskId, timeZone),
      }));
    });
  },

  async recordTaskCompletion(userId, taskId) {
    await withStore((db) => {
      const record = requireRecord(db, userId);
      if (record.completedTaskIds.includes(taskId)) return;
      record.completedTaskIds.push(taskId);
      // Full timestamp, so "today" can be judged in any time zone later.
      record.completionDates[taskId] = new Date().toISOString();
      record.profile.progressPoints += POINTS_PER_TASK;
    }, true);
  },

  async recordLessonCompletion(userId, lessonId) {
    await withStore((db) => {
      const record = requireRecord(db, userId);
      if (!record.completedLessonIds.includes(lessonId)) {
        record.completedLessonIds.push(lessonId);
      }
    }, true);
  },

  async getProgressSummary(userId, timeZone): Promise<ProgressSummary> {
    const now = new Date();
    return withStore((db) => {
      const record = db.users[userId];
      if (!record) {
        return {
          skillScore: 0,
          baselineScore: 0,
          tasksCompletedToday: 0,
          tasksCompletedTotal: 0,
          wordsLearned: 0,
          reviewsCompleted: 0,
          currentProgramDay: 1,
          dueReviewCount: 0,
          listeningCompleted: 0,
        };
      }

      const cards = Object.values(record.cards);
      const today = dayKey(now, timeZone);

      return {
        skillScore: computeSkillScore(
          record.profile.baselineScore,
          record.profile.progressPoints,
        ),
        baselineScore: record.profile.baselineScore,
        tasksCompletedToday: Object.values(record.completionDates ?? {}).filter(
          (stamp) => dayKey(stamp, timeZone) === today,
        ).length,
        tasksCompletedTotal: record.completedTaskIds.length,
        wordsLearned: cards.filter((card) => card.repetitions > 0).length,
        reviewsCompleted: record.reviewEvents.length,
        currentProgramDay: resolveCurrentDay(
          PROGRAM_DAYS,
          record.completedTaskIds.map((taskId) => ({
            taskId,
            completedOn: completedOnFor(record, taskId, timeZone),
          })),
          today,
        ),
        dueReviewCount: cards.filter(
          (card) => new Date(card.dueAt).getTime() <= now.getTime(),
        ).length,
        listeningCompleted: record.completedLessonIds.length,
      } satisfies ProgressSummary;
    });
  },
};

function toReviewCard(card: UserCard): ReviewCard | null {
  const item = VOCABULARY_BY_ID.get(card.vocabularyItemId);
  if (!item) return null;
  return {
    cardId: card.id,
    item,
    state: {
      intervalDays: card.intervalDays,
      easeFactor: card.easeFactor,
      repetitions: card.repetitions,
      dueAt: card.dueAt,
      lastReviewedAt: card.lastReviewedAt,
    },
  };
}

export const localReviewRepository: ReviewRepository = {
  async getDueCards(userId, limit, setKey, timeZone = DEFAULT_TIME_ZONE) {
    const now = new Date();
    const setItems = setKey
      ? await seedContentRepository.getVocabularySet(setKey)
      : [];

    return withStore((db) => {
      const record = requireRecord(db, userId);

      // Opening a vocabulary set introduces new cards up to the daily
      // allowance for that set (see domain/reviews/introduction.ts).
      if (setKey) {
        const today = dayKey(now, timeZone);
        const introducedToday = setItems.filter(
          (item) => record.cards[item.id]?.introducedOn === today,
        ).length;

        let budget = newCardAllowance(introducedToday);
        for (const item of setItems) {
          if (budget === 0) break;
          if (record.cards[item.id]) continue;
          record.cards[item.id] = {
            id: item.id,
            vocabularyItemId: item.id,
            introducedOn: today,
            ...initialCardState(now),
          };
          budget -= 1;
        }
      }

      const pool = setKey
        ? setItems
            .map((item) => record.cards[item.id])
            .filter((card): card is UserCard => Boolean(card))
        : Object.values(record.cards);

      return pool
        .filter((card) => new Date(card.dueAt).getTime() <= now.getTime())
        .sort(
          (a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime(),
        )
        .slice(0, limit)
        .map(toReviewCard)
        .filter((card): card is ReviewCard => card !== null);
    }, Boolean(setKey));
  },

  async countDueCards(userId) {
    const now = new Date();
    return withStore((db) => {
      const record = db.users[userId];
      if (!record) return 0;
      return Object.values(record.cards).filter(
        (card) => new Date(card.dueAt).getTime() <= now.getTime(),
      ).length;
    });
  },

  async recordReview(
    userId: string,
    cardId: string,
    grade: ReviewGrade,
    result: ReviewResult,
  ) {
    const now = new Date();
    await withStore((db) => {
      const record = requireRecord(db, userId);
      const card = record.cards[cardId];
      if (!card) throw new Error("Card not found for this learner.");

      Object.assign(card, result.next);
      record.reviewEvents.push({
        cardId,
        grade,
        reviewedAt: now.toISOString(),
        oldDueAt: result.previous.dueAt,
        newDueAt: result.next.dueAt,
        oldIntervalDays: result.previous.intervalDays,
        newIntervalDays: result.next.intervalDays,
      });
      record.profile.progressPoints += pointsForReview(grade);
    }, true);
  },
};

/** Exposed for the review action so grading stays a single store round-trip. */
export function localScheduleFromState(
  card: ReviewCard,
  grade: ReviewGrade,
  now: Date,
): ReviewResult {
  return { previous: card.state, next: scheduleReview(card.state, grade, now) };
}
