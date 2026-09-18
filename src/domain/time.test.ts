import { describe, expect, it } from "vitest";
import { dayKey, isValidTimeZone } from "./time";

describe("dayKey", () => {
  it("uses the learner's time zone, not UTC", () => {
    // 22:30 UTC on the 18th is already 01:30 on the 19th in Dar es Salaam.
    const lateEvening = "2026-09-18T22:30:00.000Z";
    expect(dayKey(lateEvening, "UTC")).toBe("2026-09-18");
    expect(dayKey(lateEvening, "Africa/Dar_es_Salaam")).toBe("2026-09-19");
  });

  it("rolls over at local midnight", () => {
    expect(dayKey("2026-09-18T20:59:00.000Z", "Africa/Dar_es_Salaam")).toBe("2026-09-18");
    expect(dayKey("2026-09-18T21:00:00.000Z", "Africa/Dar_es_Salaam")).toBe("2026-09-19");
  });

  it("leaves a bare date untouched", () => {
    expect(dayKey("2026-09-18", "America/Los_Angeles")).toBe("2026-09-18");
  });

  it("defaults to UTC", () => {
    expect(dayKey("2026-09-18T23:59:59.000Z")).toBe("2026-09-18");
  });
});

describe("isValidTimeZone", () => {
  it("accepts IANA zones and rejects junk", () => {
    expect(isValidTimeZone("Africa/Dar_es_Salaam")).toBe(true);
    expect(isValidTimeZone("Not/AZone")).toBe(false);
    expect(isValidTimeZone("'; drop table")).toBe(false);
  });
});
