import { describe, expect, it } from "vitest";
import { LESSONS, LESSONS_BY_ID } from "./lessons";
import { PROGRAM_DAYS } from "./program";
import { RECORDINGS } from "./recordings";

describe("recording manifest", () => {
  it("lists the twelve supplied recordings with unique ids and storage keys", () => {
    expect(RECORDINGS).toHaveLength(12);
    expect(new Set(RECORDINGS.map((r) => r.id)).size).toBe(12);
    expect(new Set(RECORDINGS.map((r) => r.storageKey)).size).toBe(12);
  });

  it("uses URL-safe ASCII storage keys", () => {
    for (const r of RECORDINGS) {
      expect(r.storageKey).toMatch(/^[a-z0-9/-]+\.mp3$/);
    }
  });

  it("records a positive duration for every file", () => {
    for (const r of RECORDINGS) expect(r.durationSeconds).toBeGreaterThan(0);
  });
});

describe("listening lessons", () => {
  it("resolves every listening task to a lesson with a real recording", () => {
    const listeningRefs = PROGRAM_DAYS.flatMap((day) =>
      day.tasks.filter((t) => t.taskType === "listening").map((t) => t.contentRef),
    );
    expect(listeningRefs.length).toBeGreaterThan(0);
    for (const ref of listeningRefs) {
      const lesson = LESSONS_BY_ID.get(ref ?? "");
      expect(lesson, `missing lesson ${ref}`).toBeDefined();
      expect(lesson?.recording).not.toBeNull();
    }
  });

  it("keeps every targeted window inside its recording", () => {
    for (const lesson of LESSONS) {
      if (!lesson.segment || !lesson.recording) continue;
      expect(lesson.segment.startSeconds).toBeGreaterThanOrEqual(0);
      expect(lesson.segment.endSeconds).toBeGreaterThan(lesson.segment.startSeconds);
      expect(lesson.segment.endSeconds).toBeLessThanOrEqual(
        lesson.recording.durationSeconds,
      );
    }
  });

  it("sizes each program window to its task's minutes", () => {
    for (const day of PROGRAM_DAYS) {
      for (const task of day.tasks.filter((t) => t.taskType === "listening")) {
        const lesson = LESSONS_BY_ID.get(task.contentRef ?? "");
        const seconds = lesson?.segment
          ? lesson.segment.endSeconds - lesson.segment.startSeconds
          : (lesson?.recording?.durationSeconds ?? 0);
        // A window may be shorter than the task (time to relisten), never longer.
        expect(seconds).toBeLessThanOrEqual(task.estimatedMinutes * 60);
      }
    }
  });

  it("exposes every recording as a free-listening lesson", () => {
    for (const r of RECORDINGS) expect(LESSONS_BY_ID.has(r.id)).toBe(true);
  });

  it("ships with no resolved URL: audio is attached at request time", () => {
    for (const lesson of LESSONS) expect(lesson.audioUrl).toBeNull();
  });
});
