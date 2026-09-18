import { describe, expect, it } from "vitest";
import {
  FREE_LISTENING_TARGET_SECONDS,
  creditedSeconds,
  listeningTargetSeconds,
  requiredListeningSeconds,
} from "./listening";

const WINDOW = { startSeconds: 0, endSeconds: 600 };

describe("listeningTargetSeconds", () => {
  it("uses the task window when there is one", () => {
    expect(listeningTargetSeconds(WINDOW, 1886)).toBe(600);
  });

  it("uses the whole recording when it is short", () => {
    expect(listeningTargetSeconds(null, 171)).toBe(171);
  });

  it("caps free listening of a long lecture at ten minutes", () => {
    expect(listeningTargetSeconds(null, 5734)).toBe(FREE_LISTENING_TARGET_SECONDS);
  });
});

describe("requiredListeningSeconds", () => {
  it("asks for 80% of the target", () => {
    expect(requiredListeningSeconds(600)).toBe(480);
    expect(requiredListeningSeconds(171)).toBe(137);
  });
});

describe("creditedSeconds", () => {
  it("credits normal forward playback", () => {
    expect(creditedSeconds(10, 10.25, WINDOW)).toBeCloseTo(0.25);
  });

  it("credits faster playback speeds", () => {
    expect(creditedSeconds(10, 10.3125, WINDOW)).toBeCloseTo(0.3125);
  });

  it("credits nothing for a forward seek", () => {
    // Regression: the task could be completed without listening at all.
    expect(creditedSeconds(10, 590, WINDOW)).toBe(0);
  });

  it("credits nothing for pauses or rewinds", () => {
    expect(creditedSeconds(10, 10, WINDOW)).toBe(0);
    expect(creditedSeconds(10, 4, WINDOW)).toBe(0);
  });

  it("only counts time inside the target window", () => {
    expect(creditedSeconds(599.8, 600.3, WINDOW)).toBeCloseTo(0.2);
    expect(creditedSeconds(700, 700.25, WINDOW)).toBe(0);
    expect(
      creditedSeconds(119.9, 120.2, { startSeconds: 120, endSeconds: 300 }),
    ).toBeCloseTo(0.2);
  });

  it("counts everything when there is no window", () => {
    expect(creditedSeconds(3000, 3000.25, null)).toBeCloseTo(0.25);
  });

  it("ignores non-numeric input", () => {
    expect(creditedSeconds(Number.NaN, 5, WINDOW)).toBe(0);
  });
});
