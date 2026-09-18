import { describe, expect, it } from "vitest";
import { MAX_CHUNK_BYTES, parseRange } from "./range";

const SIZE = 10_000_000;

describe("parseRange", () => {
  it("serves the whole file when no range is requested", () => {
    expect(parseRange(null, SIZE)).toEqual({ kind: "full" });
  });

  it("caps an open-ended range to one chunk", () => {
    expect(parseRange("bytes=0-", SIZE)).toEqual({
      kind: "partial",
      range: { start: 0, end: MAX_CHUNK_BYTES - 1 },
    });
  });

  it("honours an explicit range inside the chunk limit", () => {
    expect(parseRange("bytes=100-199", SIZE)).toEqual({
      kind: "partial",
      range: { start: 100, end: 199 },
    });
  });

  it("supports a seek into the middle of a long lecture", () => {
    const result = parseRange("bytes=5000000-", SIZE);
    expect(result).toEqual({
      kind: "partial",
      range: { start: 5_000_000, end: 5_000_000 + MAX_CHUNK_BYTES - 1 },
    });
  });

  it("clamps the end to the file size", () => {
    expect(parseRange(`bytes=${SIZE - 10}-${SIZE + 500}`, SIZE)).toEqual({
      kind: "partial",
      range: { start: SIZE - 10, end: SIZE - 1 },
    });
  });

  it("supports suffix ranges", () => {
    expect(parseRange("bytes=-500", SIZE)).toEqual({
      kind: "partial",
      range: { start: SIZE - 500, end: SIZE - 1 },
    });
  });

  it.each(["bytes=-", "bytes=abc-", "items=0-10", `bytes=${SIZE}-`, "bytes=50-10", "bytes=-0"])(
    "rejects %s as unsatisfiable",
    (header) => {
      expect(parseRange(header, SIZE)).toEqual({ kind: "unsatisfiable" });
    },
  );
});
