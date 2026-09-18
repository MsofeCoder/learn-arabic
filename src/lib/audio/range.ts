/**
 * HTTP Range parsing for audio streaming. Pure, so seeking behaviour is unit
 * tested without a server. Supports the single-range forms browsers send for
 * media: `bytes=start-`, `bytes=start-end`, and suffix `bytes=-n`.
 */

export interface ByteRange {
  start: number;
  end: number;
}

export type RangeResult =
  | { kind: "full" }
  | { kind: "partial"; range: ByteRange }
  | { kind: "unsatisfiable" };

/** Browsers ask for open-ended ranges; cap each response so memory stays flat. */
export const MAX_CHUNK_BYTES = 1024 * 1024;

export function parseRange(
  header: string | null,
  size: number,
  maxChunk: number = MAX_CHUNK_BYTES,
): RangeResult {
  if (!header) return { kind: "full" };

  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match || (match[1] === "" && match[2] === "")) {
    return { kind: "unsatisfiable" };
  }

  let start: number;
  let end: number;

  if (match[1] === "") {
    // Suffix range: the last N bytes.
    const suffix = Number(match[2]);
    if (suffix === 0) return { kind: "unsatisfiable" };
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] === "" ? size - 1 : Math.min(Number(match[2]), size - 1);
  }

  if (start >= size || start > end) return { kind: "unsatisfiable" };

  end = Math.min(end, start + maxChunk - 1);
  return { kind: "partial", range: { start, end } };
}
