import { describe, expect, it } from "vitest";
import {
  BACKLOG_TASK_ID,
  buildTodayMission,
  nextMissionTask,
  resolveCurrentDay,
  selectTasksForBudget,
} from "./engine";
import { PROGRAM, PROGRAM_DAYS } from "@/data/seed/program";
import type { DailyMinutes, Profile, ProgramDay } from "@/domain/types";

function profile(overrides: Partial<Profile> = {}): Profile {
  return {
    userId: "user-1",
    displayName: "Adam",
    email: null,
    avatarUrl: null,
    baselineScore: 3,
    dailyMinutes: 20,
    onboardingComplete: true,
    progressPoints: 0,
    enrolledOn: "2026-09-18",
    ...overrides,
  };
}

function mission(options: {
  day?: ProgramDay;
  dailyMinutes?: DailyMinutes;
  completedTaskIds?: string[];
  dueReviewCount?: number;
}) {
  const day = options.day ?? PROGRAM_DAYS[0];
  const completedTaskIds = options.completedTaskIds ?? [];
  return buildTodayMission({
    program: PROGRAM,
    day,
    state: {
      profile: profile({ dailyMinutes: options.dailyMinutes ?? 20 }),
      currentDayNumber: day.dayNumber,
      completedTaskIds,
      dueReviewCount: options.dueReviewCount ?? 0,
    },
  });
}

describe("selectTasksForBudget", () => {
  const day1 = PROGRAM_DAYS[0]; // 5 + 7 + 8 + 5 = 25 minutes across 4 tasks

  it.each([10, 15, 20, 30] as const)(
    "produces a usable mission at %i minutes a day",
    (minutes) => {
      const selected = selectTasksForBudget(day1.tasks, minutes);
      expect(selected.length).toBeGreaterThanOrEqual(3);
      expect(selected.length).toBeLessThanOrEqual(5);
    },
  );

  it("fits more of the day into a larger budget", () => {
    const small = selectTasksForBudget(day1.tasks, 10);
    const large = selectTasksForBudget(day1.tasks, 30);
    expect(large.length).toBeGreaterThanOrEqual(small.length);
    expect(large.length).toBe(day1.tasks.length);
  });

  it("always keeps at least one review task and one new-content task", () => {
    for (const minutes of [10, 15, 20, 30] as const) {
      const selected = selectTasksForBudget(day1.tasks, minutes);
      expect(selected.some((t) => t.taskType === "review")).toBe(true);
      expect(selected.some((t) => t.taskType !== "review")).toBe(true);
    }
  });

  it("returns tasks in program order", () => {
    const selected = selectTasksForBudget(day1.tasks, 30);
    const orders = selected.map((t) => t.sortOrder);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });

  it("handles a short day without dropping below its own task count", () => {
    const shortDay = { ...day1, tasks: day1.tasks.slice(0, 2) };
    expect(selectTasksForBudget(shortDay.tasks, 10)).toHaveLength(2);
  });

  it("does not mutate the input array", () => {
    const original = [...day1.tasks];
    selectTasksForBudget(day1.tasks, 10);
    expect(day1.tasks).toEqual(original);
  });
});

describe("resolveCurrentDay", () => {
  const TODAY = "2026-09-18";
  const YESTERDAY = "2026-09-17";

  function done(dayIndex: number, on: string, count?: number) {
    return PROGRAM_DAYS[dayIndex].tasks
      .slice(0, count)
      .map((t) => ({ taskId: t.id, completedOn: on }));
  }

  it("starts a new learner on day 1", () => {
    expect(resolveCurrentDay(PROGRAM_DAYS, [], TODAY)).toBe(1);
  });

  it("stays on a partly finished day", () => {
    expect(resolveCurrentDay(PROGRAM_DAYS, done(0, TODAY, 2), TODAY)).toBe(1);
  });

  it("holds the learner on a day finished today — the next unlocks tomorrow", () => {
    // Regression: the whole program could be completed in one sitting.
    expect(resolveCurrentDay(PROGRAM_DAYS, done(0, TODAY), TODAY)).toBe(1);
  });

  it("opens the next day once the previous was finished on an earlier day", () => {
    expect(resolveCurrentDay(PROGRAM_DAYS, done(0, YESTERDAY), TODAY)).toBe(2);
  });

  it("keeps a learner on a day they already started today", () => {
    const completions = [...done(0, YESTERDAY), ...done(1, TODAY, 1)];
    expect(resolveCurrentDay(PROGRAM_DAYS, completions, TODAY)).toBe(2);
  });

  it("paces a learner who finished two days in one sitting", () => {
    // Day 1 and day 2 both finished today: stay on day 2, day 3 tomorrow.
    const completions = [...done(0, TODAY), ...done(1, TODAY)];
    expect(resolveCurrentDay(PROGRAM_DAYS, completions, TODAY)).toBe(2);
    expect(resolveCurrentDay(PROGRAM_DAYS, completions, "2026-09-19")).toBe(3);
  });

  it("returns the earliest incomplete day rather than skipping ahead", () => {
    // Day 2 finished long ago, day 1 never was: the learner is sent back to day 1.
    expect(resolveCurrentDay(PROGRAM_DAYS, done(1, YESTERDAY), TODAY)).toBe(1);
  });

  it("stays on the final day once the program is complete", () => {
    const everything = PROGRAM_DAYS.flatMap((_, i) => done(i, YESTERDAY));
    expect(resolveCurrentDay(PROGRAM_DAYS, everything, TODAY)).toBe(
      PROGRAM.totalDays,
    );
  });

  it("falls back to day 1 for an empty program", () => {
    expect(resolveCurrentDay([], [], TODAY)).toBe(1);
  });
});

describe("buildTodayMission", () => {
  it("describes the current program day", () => {
    const result = mission({});
    expect(result.program.dayNumber).toBe(1);
    expect(result.program.title).toBe(PROGRAM.title);
    expect(result.title).toBe(PROGRAM_DAYS[0].title);
    expect(result.dayLabel).toBe(PROGRAM_DAYS[0].label);
  });

  it("counts remaining minutes, not total minutes", () => {
    const firstTask = PROGRAM_DAYS[0].tasks[0];
    const fresh = mission({});
    const partial = mission({ completedTaskIds: [firstTask.id] });
    expect(partial.estimatedMinutes).toBe(
      fresh.estimatedMinutes - firstTask.estimatedMinutes,
    );
  });

  it("reports completion as a percentage", () => {
    const day = PROGRAM_DAYS[0];
    const result = mission({
      dailyMinutes: 30,
      completedTaskIds: day.tasks.slice(0, 2).map((t) => t.id),
    });
    expect(result.completedCount).toBe(2);
    expect(result.percentComplete).toBe(50);
  });

  it("reaches 100% and no next action once every task is done", () => {
    const day = PROGRAM_DAYS[0];
    const result = mission({
      dailyMinutes: 30,
      completedTaskIds: day.tasks.map((t) => t.id),
    });
    expect(result.percentComplete).toBe(100);
    expect(result.estimatedMinutes).toBe(0);
    expect(nextMissionTask(result)).toBeNull();
  });

  it("puts a backlog block first when cards are overdue", () => {
    const result = mission({ dueReviewCount: 7 });
    expect(result.tasks[0].id).toBe(BACKLOG_TASK_ID);
    expect(result.tasks[0].isBacklog).toBe(true);
    expect(result.tasks[0].description).toContain("7 cards");
    expect(nextMissionTask(result)?.id).toBe(BACKLOG_TASK_ID);
  });

  it("adds no backlog block when nothing is due", () => {
    const result = mission({ dueReviewCount: 0 });
    expect(result.tasks.some((t) => t.isBacklog)).toBe(false);
  });

  it("says 'card is' for a single due card", () => {
    expect(mission({ dueReviewCount: 1 }).tasks[0].description).toContain(
      "1 card is",
    );
  });

  it("points every task at a route that carries its own id", () => {
    for (const task of mission({}).tasks) {
      expect(task.href).toContain(`task=${task.id}`);
    }
  });

  it("sends listening tasks to their lesson", () => {
    const listening = mission({ dailyMinutes: 30 }).tasks.find(
      (t) => t.taskType === "listening",
    );
    expect(listening?.href).toContain("/listen/lesson-lecture-foundations");
  });

  it("is deterministic for identical input", () => {
    expect(mission({ dueReviewCount: 3 })).toEqual(
      mission({ dueReviewCount: 3 }),
    );
  });

  it("builds a mission for every day of the seeded program", () => {
    for (const day of PROGRAM_DAYS) {
      const result = mission({ day, dailyMinutes: 30 });
      expect(result.tasks.length).toBeGreaterThanOrEqual(3);
      expect(result.objective).toBe(day.objective);
    }
  });
});

describe("nextMissionTask", () => {
  it("returns the first incomplete task", () => {
    const day = PROGRAM_DAYS[0];
    const result = mission({
      dailyMinutes: 30,
      completedTaskIds: [day.tasks[0].id],
    });
    expect(nextMissionTask(result)?.id).toBe(day.tasks[1].id);
  });
});

describe("budget fidelity", () => {
  const day1 = PROGRAM_DAYS[0];

  it("keeps a 20-minute mission inside its budget while still including review", () => {
    const selected = selectTasksForBudget(day1.tasks, 20);
    const total = selected.reduce((sum, t) => sum + t.estimatedMinutes, 0);
    expect(total).toBeLessThanOrEqual(20);
    expect(selected.some((t) => t.taskType === "review")).toBe(true);
  });

  it("keeps the day's listening task whenever it fits the budget", () => {
    for (const day of PROGRAM_DAYS) {
      if (!day.tasks.some((t) => t.taskType === "listening")) continue;
      const selected = selectTasksForBudget(day.tasks, 20);
      expect(selected.some((t) => t.taskType === "listening")).toBe(true);
    }
  });

  it("only exceeds the budget when the 3-task minimum forces it", () => {
    for (const day of PROGRAM_DAYS) {
      for (const minutes of [10, 15, 20, 30] as const) {
        const selected = selectTasksForBudget(day.tasks, minutes);
        const total = selected.reduce((sum, t) => sum + t.estimatedMinutes, 0);
        if (total > minutes) {
          expect(selected).toHaveLength(Math.min(MIN_TASKS_FOR_TEST, day.tasks.length));
        }
      }
    }
  });

  it("never selects the same task twice", () => {
    for (const minutes of [10, 15, 20, 30] as const) {
      const ids = selectTasksForBudget(day1.tasks, minutes).map((t) => t.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});

/** Mirrors MIN_TASKS in the engine; the engine keeps it private on purpose. */
const MIN_TASKS_FOR_TEST = 3;
