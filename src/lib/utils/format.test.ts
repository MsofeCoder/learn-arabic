import { describe, expect, it } from "vitest";
import { firstName, formatSeconds } from "./format";

describe("formatSeconds", () => {
  it.each([
    [0, "0:00"],
    [9, "0:09"],
    [171, "2:51"],
    [1886, "31:26"],
    [3600, "1:00:00"],
    [5734, "1:35:34"],
    [-1, "0:00"],
    [Number.NaN, "0:00"],
  ])("formats %s as %s", (input, expected) => {
    expect(formatSeconds(input)).toBe(expected);
  });
});

describe("firstName", () => {
  it("takes the first word only", () => {
    expect(firstName("Adam Ibn Mohamad")).toBe("Adam");
    expect(firstName(null)).toBeNull();
    expect(firstName("   ")).toBeNull();
  });
});
