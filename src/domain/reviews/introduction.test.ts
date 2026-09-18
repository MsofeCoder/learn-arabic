import { describe, expect, it } from "vitest";
import { NEW_CARDS_PER_SET_PER_DAY, newCardAllowance } from "./introduction";

describe("newCardAllowance", () => {
  it("gives a full batch on the first visit of the day", () => {
    expect(newCardAllowance(0)).toBe(NEW_CARDS_PER_SET_PER_DAY);
  });

  it("does not refill as cards are graded — only introductions count", () => {
    // Ten introduced and all ten graded: nothing is due, yet nothing new is owed.
    expect(newCardAllowance(10)).toBe(0);
  });

  it("tops up a partially used allowance", () => {
    expect(newCardAllowance(4)).toBe(6);
  });

  it("never goes negative", () => {
    expect(newCardAllowance(25)).toBe(0);
    expect(newCardAllowance(-3)).toBe(NEW_CARDS_PER_SET_PER_DAY);
  });
});
