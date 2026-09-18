import { describe, expect, it } from "vitest";
import {
  DEFAULT_EASE_FACTOR,
  MAX_EASE_FACTOR,
  MAX_INTERVAL_DAYS,
  MIN_EASE_FACTOR,
  RELEARN_INTERVAL_DAYS,
  describeNextDue,
  initialCardState,
  isDue,
  scheduleReview,
} from "./scheduler";
import type { CardState } from "@/domain/types";

const NOW = new Date("2026-09-18T09:00:00.000Z");
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function state(overrides: Partial<CardState> = {}): CardState {
  return { ...initialCardState(NOW), ...overrides };
}

function daysUntil(dueAt: string): number {
  return (new Date(dueAt).getTime() - NOW.getTime()) / MS_PER_DAY;
}

describe("initialCardState", () => {
  it("starts a new card due immediately with the default ease", () => {
    const card = initialCardState(NOW);
    expect(card).toEqual({
      intervalDays: 0,
      easeFactor: DEFAULT_EASE_FACTOR,
      repetitions: 0,
      dueAt: NOW.toISOString(),
      lastReviewedAt: null,
    });
  });
});

describe("scheduleReview — again", () => {
  it("resets repetitions and reschedules within the session", () => {
    const next = scheduleReview(
      state({ intervalDays: 12, repetitions: 4 }),
      "again",
      NOW,
    );
    expect(next.repetitions).toBe(0);
    expect(next.intervalDays).toBe(RELEARN_INTERVAL_DAYS);
    expect(daysUntil(next.dueAt)).toBeCloseTo(RELEARN_INTERVAL_DAYS, 5);
  });

  it("lowers ease by 0.20 and never below the floor", () => {
    expect(scheduleReview(state(), "again", NOW).easeFactor).toBe(2.3);
    expect(
      scheduleReview(state({ easeFactor: 1.35 }), "again", NOW).easeFactor,
    ).toBe(MIN_EASE_FACTOR);
  });
});

describe("scheduleReview — hard", () => {
  it("grows the interval by 1.2x with a one-day floor", () => {
    expect(
      scheduleReview(state({ intervalDays: 0 }), "hard", NOW).intervalDays,
    ).toBe(1);
    expect(
      scheduleReview(state({ intervalDays: 10 }), "hard", NOW).intervalDays,
    ).toBe(12);
  });

  it("lowers ease by 0.15", () => {
    expect(scheduleReview(state(), "hard", NOW).easeFactor).toBe(2.35);
  });

  it("increments repetitions", () => {
    expect(scheduleReview(state({ repetitions: 2 }), "hard", NOW).repetitions).toBe(
      3,
    );
  });
});

describe("scheduleReview — good", () => {
  it("sends a brand new card to one day", () => {
    expect(scheduleReview(state(), "good", NOW).intervalDays).toBe(1);
  });

  it("uses the 2.2x step while the interval is under six days", () => {
    expect(
      scheduleReview(state({ intervalDays: 5 }), "good", NOW).intervalDays,
    ).toBe(11);
  });

  it("uses the ease factor once past six days", () => {
    expect(
      scheduleReview(
        state({ intervalDays: 10, easeFactor: 2.5 }),
        "good",
        NOW,
      ).intervalDays,
    ).toBe(25);
  });

  it("leaves ease untouched", () => {
    expect(scheduleReview(state({ easeFactor: 2.1 }), "good", NOW).easeFactor).toBe(
      2.1,
    );
  });
});

describe("scheduleReview — easy", () => {
  it("applies the 2.8x step with a two-day floor", () => {
    expect(scheduleReview(state(), "easy", NOW).intervalDays).toBe(2);
    expect(
      scheduleReview(state({ intervalDays: 10 }), "easy", NOW).intervalDays,
    ).toBe(28);
  });

  it("raises ease by 0.15 and never above the ceiling", () => {
    expect(scheduleReview(state(), "easy", NOW).easeFactor).toBe(2.65);
    expect(
      scheduleReview(state({ easeFactor: 2.95 }), "easy", NOW).easeFactor,
    ).toBe(MAX_EASE_FACTOR);
  });
});

describe("interval bounds", () => {
  it("clamps long intervals to the MVP maximum", () => {
    const next = scheduleReview(
      state({ intervalDays: 170, easeFactor: 2.5 }),
      "good",
      NOW,
    );
    expect(next.intervalDays).toBe(MAX_INTERVAL_DAYS);
    expect(daysUntil(next.dueAt)).toBeCloseTo(MAX_INTERVAL_DAYS, 5);
  });

  it("keeps ease within bounds across a long grading run", () => {
    let card = state();
    for (const grade of ["easy", "easy", "easy", "easy", "easy"] as const) {
      card = scheduleReview(card, grade, NOW);
    }
    expect(card.easeFactor).toBeLessThanOrEqual(MAX_EASE_FACTOR);

    for (const grade of ["again", "again", "again", "again"] as const) {
      card = scheduleReview(card, grade, NOW);
    }
    expect(card.easeFactor).toBeGreaterThanOrEqual(MIN_EASE_FACTOR);
  });
});

describe("purity and determinism", () => {
  it("never mutates the input state", () => {
    const before = state({ intervalDays: 4, repetitions: 2 });
    const snapshot = { ...before };
    scheduleReview(before, "good", NOW);
    expect(before).toEqual(snapshot);
  });

  it("produces identical output for identical input", () => {
    const input = state({ intervalDays: 7, easeFactor: 2.4, repetitions: 3 });
    expect(scheduleReview(input, "good", NOW)).toEqual(
      scheduleReview(input, "good", NOW),
    );
  });

  it("stamps the review time on every grade", () => {
    for (const grade of ["again", "hard", "good", "easy"] as const) {
      expect(scheduleReview(state(), grade, NOW).lastReviewedAt).toBe(
        NOW.toISOString(),
      );
    }
  });
});

describe("isDue", () => {
  it("treats a card due exactly now as due", () => {
    expect(isDue(state({ dueAt: NOW.toISOString() }), NOW)).toBe(true);
  });

  it("is false for a future card", () => {
    expect(
      isDue(state({ dueAt: new Date(NOW.getTime() + MS_PER_DAY).toISOString() }), NOW),
    ).toBe(false);
  });
});

describe("describeNextDue", () => {
  it("speaks in plain language, never in ease factors", () => {
    expect(describeNextDue(state({ intervalDays: 0.007 }))).toBe(
      "in a few minutes",
    );
    expect(describeNextDue(state({ intervalDays: 1 }))).toBe("tomorrow");
    expect(describeNextDue(state({ intervalDays: 12 }))).toBe("in 12 days");
    expect(describeNextDue(state({ intervalDays: 30 }))).toBe("in about a month");
    expect(describeNextDue(state({ intervalDays: 120 }))).toBe(
      "in about 4 months",
    );
  });
});
