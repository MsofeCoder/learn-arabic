import { LESSONS, LESSONS_BY_ID } from "@/data/seed/lessons";
import { PROGRAM, PROGRAM_DAYS, PROGRAM_DAYS_BY_NUMBER } from "@/data/seed/program";
import {
  VOCABULARY_BY_ID,
  VOCABULARY_ITEMS,
  vocabularyByCategory,
} from "@/data/seed/vocabulary";
import type { Lesson, Program, ProgramDay, VocabularyItem } from "@/domain/types";
import { resolveRecordingUrl } from "@/lib/audio/source";
import type { ContentRepository } from "./types";

/** Attaches a playable URL at request time, so storage can change without a rebuild of content. */
function withAudio(lesson: Lesson): Lesson {
  return {
    ...lesson,
    audioUrl: lesson.recording ? resolveRecordingUrl(lesson.recording) : null,
  };
}

/**
 * Seed-backed content repository. Content is global and static in the MVP, so
 * this reads from checked-in TypeScript rather than the database. Replacing it
 * with a Postgres adapter is a one-file change.
 */
export const seedContentRepository: ContentRepository = {
  async getActiveProgram(): Promise<Program> {
    return PROGRAM;
  },

  async getProgramDay(
    programId: string,
    dayNumber: number,
  ): Promise<ProgramDay | null> {
    if (programId !== PROGRAM.id) return null;
    return PROGRAM_DAYS_BY_NUMBER.get(dayNumber) ?? null;
  },

  async getProgramDays(programId: string): Promise<ProgramDay[]> {
    return programId === PROGRAM.id ? PROGRAM_DAYS : [];
  },

  async getVocabularyItems(ids: string[]): Promise<VocabularyItem[]> {
    return ids
      .map((id) => VOCABULARY_BY_ID.get(id))
      .filter((item): item is VocabularyItem => Boolean(item));
  },

  async getVocabularySet(setKey: string): Promise<VocabularyItem[]> {
    const byCategory = vocabularyByCategory(
      setKey as VocabularyItem["category"],
    );
    if (byCategory.length > 0) return byCategory;
    return VOCABULARY_ITEMS.filter((item) => item.topic === setKey);
  },

  async getLesson(id: string): Promise<Lesson | null> {
    const lesson = LESSONS_BY_ID.get(id);
    return lesson ? withAudio(lesson) : null;
  },

  async getLessons(): Promise<Lesson[]> {
    return LESSONS.map(withAudio);
  },
};
