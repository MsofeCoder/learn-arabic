import { describe, expect, it } from "vitest";
import {
  MAX_SKILL_SCORE,
  POINTS_PER_TENTH,
  computeSkillScore,
  describeSkillScore,
  pointsForReview,
  progressToNextPoint,
} from "./score";

describe("computeSkillScore", () => {
  it("starts at the learner's declared baseline", () => {
    expect(computeSkillScore(3, 0)).toBe(3);
  });

  it("adds a tenth per step of progress, slowly", () => {
    expect(computeSkillScore(3, POINTS_PER_TENTH - 1)).toBe(3);
    expect(computeSkillScore(3, POINTS_PER_TENTH)).toBe(3.1);
    expect(computeSkillScore(3, POINTS_PER_TENTH * 7)).toBe(3.7);
  });

  it("moves about one point across a full honest program, not three in a sitting", () => {
    // Regression: 330 points took a learner from 7.0 to 10.0 in an hour.
    expect(computeSkillScore(7, 330)).toBe(7.6);
    expect(computeSkillScore(3, 600)).toBe(4.2);
  });

  it("never exceeds the maximum", () => {
    expect(computeSkillScore(9, POINTS_PER_TENTH * 500)).toBe(MAX_SKILL_SCORE);
    expect(computeSkillScore(12, 0)).toBe(MAX_SKILL_SCORE);
  });

  it("treats negative input as zero rather than throwing", () => {
    expect(computeSkillScore(-4, -100)).toBe(0);
  });

  it("has no floating-point drift", () => {
    expect(computeSkillScore(0.3, POINTS_PER_TENTH * 3)).toBe(0.6);
  });
});

describe("pointsForReview", () => {
  it("rewards successful recall most and a lapse least", () => {
    expect(pointsForReview("again")).toBeLessThan(pointsForReview("hard"));
    expect(pointsForReview("hard")).toBeLessThan(pointsForReview("good"));
    expect(pointsForReview("again")).toBeGreaterThan(0);
  });

  it("does not reward guessing easy over honest recall", () => {
    expect(pointsForReview("easy")).toBeLessThanOrEqual(pointsForReview("good"));
  });
});

describe("progressToNextPoint", () => {
  it("reports the share of the way to the next whole number", () => {
    expect(progressToNextPoint(3, 0)).toBe(0);
    expect(progressToNextPoint(3, POINTS_PER_TENTH * 5)).toBe(50);
    expect(progressToNextPoint(3, POINTS_PER_TENTH * 10)).toBe(0);
    expect(progressToNextPoint(10, 0)).toBe(100);
  });
});

describe("describeSkillScore", () => {
  it("gives a plain-language band for every score", () => {
    for (let score = 0; score <= 10; score += 1) {
      expect(describeSkillScore(score).length).toBeGreaterThan(0);
    }
    expect(describeSkillScore(1)).toContain("Beginner");
    expect(describeSkillScore(10)).toContain("Advanced");
  });
});
