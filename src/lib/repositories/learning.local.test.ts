import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Integration coverage for the local adapter: card introduction, review
 * persistence and progress accounting. The Supabase adapter implements the same
 * `ReviewRepository` / `LearningRepository` contract, so these are the
 * behaviours both adapters must uphold.
 */

const DATA_DIR = path.join(os.tmpdir(), `lisanflow-test-${process.pid}`);
process.env.LISANFLOW_DATA_DIR = DATA_DIR;

const { localLearningRepository, localReviewRepository } = await import(
  "./learning.local"
);
const { __resetLocalStoreCache } = await import("./local-store");
const { scheduleReview } = await import("@/domain/reviews/scheduler");

const USER = {
  id: "test-user",
  email: "learner@example.com",
  displayName: "Adam Ibn Mohamad",
  avatarUrl: null,
};

async function reset() {
  await fs.rm(DATA_DIR, { recursive: true, force: true });
  __resetLocalStoreCache();
  await localLearningRepository.ensureProfile(USER);
}

beforeAll(reset);
beforeEach(reset);
afterAll(async () => {
  await fs.rm(DATA_DIR, { recursive: true, force: true });
});

describe("profiles", () => {
  it("creates a profile that has not yet onboarded", async () => {
    const profile = await localLearningRepository.getProfile(USER.id);
    expect(profile?.onboardingComplete).toBe(false);
    expect(profile?.displayName).toBe(USER.displayName);
  });

  it("saves onboarding answers and stamps the enrolment date", async () => {
    await localLearningRepository.saveOnboarding(USER.id, {
      baselineScore: 3,
      dailyMinutes: 20,
    });
    const profile = await localLearningRepository.getProfile(USER.id);
    expect(profile?.onboardingComplete).toBe(true);
    expect(profile?.baselineScore).toBe(3);
    expect(profile?.dailyMinutes).toBe(20);
    expect(profile?.enrolledOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("refreshes identity without resetting learning state", async () => {
    await localLearningRepository.saveOnboarding(USER.id, {
      baselineScore: 5,
      dailyMinutes: 30,
    });
    await localLearningRepository.ensureProfile({
      ...USER,
      displayName: "Abuu Maryam",
    });
    const profile = await localLearningRepository.getProfile(USER.id);
    expect(profile?.displayName).toBe("Abuu Maryam");
    expect(profile?.baselineScore).toBe(5);
    expect(profile?.onboardingComplete).toBe(true);
  });
});

describe("card introduction", () => {
  it("introduces a bounded batch when a set is first opened", async () => {
    const cards = await localReviewRepository.getDueCards(
      USER.id,
      30,
      "lecture-phrase",
    );
    expect(cards).toHaveLength(10);
  });

  it("is idempotent: reopening the set does not stack more cards on", async () => {
    await localReviewRepository.getDueCards(USER.id, 30, "lecture-phrase");
    await localReviewRepository.getDueCards(USER.id, 30, "lecture-phrase");
    await localReviewRepository.getDueCards(USER.id, 30, "lecture-phrase");
    expect(await localReviewRepository.countDueCards(USER.id)).toBe(10);
  });

  it("does not refill the same day after the batch is graded", async () => {
    // Regression: a due-based rule refilled the queue after every grade, so a
    // 5-minute task ran through the whole 30-card set in one sitting.
    const first = await localReviewRepository.getDueCards(
      USER.id,
      30,
      "lecture-phrase",
    );
    const now = new Date();
    for (const card of first) {
      await localReviewRepository.recordReview(USER.id, card.cardId, "good", {
        previous: card.state,
        next: scheduleReview(card.state, "good", now),
      });
      // Every grade re-renders the page, which asks for the set again.
      await localReviewRepository.getDueCards(USER.id, 30, "lecture-phrase");
    }

    expect(
      await localReviewRepository.getDueCards(USER.id, 30, "lecture-phrase"),
    ).toHaveLength(0);
    const summary = await localLearningRepository.getProgressSummary(USER.id, "UTC");
    expect(summary.reviewsCompleted).toBe(10);
  });

  it("introduces the next batch on the following day", async () => {
    const first = await localReviewRepository.getDueCards(
      USER.id,
      30,
      "lecture-phrase",
    );
    const now = new Date();
    for (const card of first) {
      await localReviewRepository.recordReview(USER.id, card.cardId, "good", {
        previous: card.state,
        next: scheduleReview(card.state, "good", now),
      });
    }

    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(now.getTime() + 36 * 60 * 60 * 1000));
    try {
      const next = await localReviewRepository.getDueCards(
        USER.id,
        30,
        "lecture-phrase",
      );
      const fresh = next.filter(
        (card) => !first.some((old) => old.cardId === card.cardId),
      );
      // Ten new cards, plus yesterday's ten coming back for review.
      expect(fresh).toHaveLength(10);
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not introduce cards when no set is requested", async () => {
    expect(await localReviewRepository.getDueCards(USER.id, 30)).toHaveLength(0);
  });

  it("returns cards joined to their vocabulary content", async () => {
    const [card] = await localReviewRepository.getDueCards(
      USER.id,
      1,
      "lecture-phrase",
    );
    expect(card.item.arabic.length).toBeGreaterThan(0);
    expect(card.item.meaningEn.length).toBeGreaterThan(0);
  });
});

describe("review persistence", () => {
  it("advances the card and records the event", async () => {
    const [card] = await localReviewRepository.getDueCards(
      USER.id,
      1,
      "lecture-phrase",
    );
    const now = new Date();
    const next = scheduleReview(card.state, "good", now);

    await localReviewRepository.recordReview(USER.id, card.cardId, "good", {
      previous: card.state,
      next,
    });

    const summary = await localLearningRepository.getProgressSummary(USER.id, "UTC");
    expect(summary.reviewsCompleted).toBe(1);
    expect(summary.wordsLearned).toBe(1);
    expect(summary.dueReviewCount).toBe(9);
  });

  it("rejects a card that does not belong to the learner", async () => {
    await localReviewRepository.getDueCards(USER.id, 1, "lecture-phrase");
    const now = new Date();
    await expect(
      localReviewRepository.recordReview(USER.id, "not-my-card", "good", {
        previous: {
          intervalDays: 0,
          easeFactor: 2.5,
          repetitions: 0,
          dueAt: now.toISOString(),
          lastReviewedAt: null,
        },
        next: {
          intervalDays: 1,
          easeFactor: 2.5,
          repetitions: 1,
          dueAt: now.toISOString(),
          lastReviewedAt: now.toISOString(),
        },
      }),
    ).rejects.toThrow();
  });

  it("survives a store restart", async () => {
    const [card] = await localReviewRepository.getDueCards(
      USER.id,
      1,
      "lecture-phrase",
    );
    await localReviewRepository.recordReview(USER.id, card.cardId, "easy", {
      previous: card.state,
      next: scheduleReview(card.state, "easy", new Date()),
    });

    // Drop the in-memory cache: state must come back from disk.
    __resetLocalStoreCache();

    const summary = await localLearningRepository.getProgressSummary(USER.id, "UTC");
    expect(summary.reviewsCompleted).toBe(1);
  });
});

describe("task and lesson progress", () => {
  it("records a task once and awards points once", async () => {
    await localLearningRepository.recordTaskCompletion(USER.id, "day-1-t1");
    await localLearningRepository.recordTaskCompletion(USER.id, "day-1-t1");

    const completed = await localLearningRepository.getTaskCompletions(USER.id, "UTC");
    expect(completed.map((c) => c.taskId)).toEqual(["day-1-t1"]);
    expect(completed[0].completedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    const profile = await localLearningRepository.getProfile(USER.id);
    expect(profile?.progressPoints).toBe(20);
  });

  it("paces the program day as tasks complete", async () => {
    const before = await localLearningRepository.getProgressSummary(USER.id, "UTC");
    expect(before.currentProgramDay).toBe(1);

    for (const id of ["day-1-t1", "day-1-t2", "day-1-t3", "day-1-t4"]) {
      await localLearningRepository.recordTaskCompletion(USER.id, id);
    }

    // Finished today, so the learner stays on day 1 until tomorrow.
    const after = await localLearningRepository.getProgressSummary(USER.id, "UTC");
    expect(after.currentProgramDay).toBe(1);
    expect(after.tasksCompletedTotal).toBe(4);
    expect(after.tasksCompletedToday).toBe(4);
  });

  it("records a listening completion once", async () => {
    await localLearningRepository.recordLessonCompletion(
      USER.id,
      "lesson-lecture-foundations",
    );
    await localLearningRepository.recordLessonCompletion(
      USER.id,
      "lesson-lecture-foundations",
    );
    const summary = await localLearningRepository.getProgressSummary(USER.id, "UTC");
    expect(summary.listeningCompleted).toBe(1);
  });

  it("raises the skill score only after enough work", async () => {
    await localLearningRepository.saveOnboarding(USER.id, {
      baselineScore: 3,
      dailyMinutes: 20,
    });
    expect(
      (await localLearningRepository.getProgressSummary(USER.id, "UTC")).skillScore,
    ).toBe(3);

    for (const day of [1, 2, 3, 4, 5]) {
      for (const n of [1, 2, 3]) {
        await localLearningRepository.recordTaskCompletion(
          USER.id,
          `day-${day}-t${n}`,
        );
      }
    }

    // 15 tasks x 20 points = 300 points = +0.6: the score moves slowly.
    const summary = await localLearningRepository.getProgressSummary(USER.id, "UTC");
    expect(summary.skillScore).toBe(3.6);
  });
});
