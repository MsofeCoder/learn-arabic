import type { TaskCompletion } from "@/domain/missions/engine";
import type {
  CardState,
  Lesson,
  Profile,
  Program,
  ProgramDay,
  ProgressSummary,
  ReviewCard,
  ReviewGrade,
  VocabularyItem,
} from "@/domain/types";

/**
 * Stable domain interfaces (docs/spec/04-ARCHITECTURE.md §6).
 *
 * The UI depends only on these. Swapping JSON seed content for Postgres, or the
 * MVP scheduler for FSRS, must not require touching a component.
 */

export interface ContentRepository {
  getActiveProgram(): Promise<Program>;
  getProgramDay(programId: string, dayNumber: number): Promise<ProgramDay | null>;
  getProgramDays(programId: string): Promise<ProgramDay[]>;
  getVocabularyItems(ids: string[]): Promise<VocabularyItem[]>;
  getVocabularySet(setKey: string): Promise<VocabularyItem[]>;
  getLesson(id: string): Promise<Lesson | null>;
  getLessons(): Promise<Lesson[]>;
}

export interface OnboardingInput {
  baselineScore: number;
  dailyMinutes: number;
  displayName?: string | null;
}

export interface LearningRepository {
  getProfile(userId: string): Promise<Profile | null>;
  ensureProfile(user: AuthUser): Promise<Profile>;
  saveOnboarding(userId: string, input: OnboardingInput): Promise<void>;
  /** `completedOn` is the calendar day in `timeZone`. */
  getTaskCompletions(userId: string, timeZone: string): Promise<TaskCompletion[]>;
  recordTaskCompletion(userId: string, taskId: string): Promise<void>;
  recordLessonCompletion(userId: string, lessonId: string): Promise<void>;
  getProgressSummary(userId: string, timeZone: string): Promise<ProgressSummary>;
}

export interface ReviewResult {
  previous: CardState;
  next: CardState;
}

export interface ReviewRepository {
  /** Due cards ordered by `dueAt` ascending. `setKey` narrows to one vocabulary set. */
  getDueCards(
    userId: string,
    limit: number,
    setKey?: string,
    /** Day boundary for the daily new-card allowance. */
    timeZone?: string,
  ): Promise<ReviewCard[]>;
  countDueCards(userId: string): Promise<number>;
  recordReview(
    userId: string,
    cardId: string,
    grade: ReviewGrade,
    result: ReviewResult,
  ): Promise<void>;
}

export interface AuthUser {
  id: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface AuthProvider {
  getUser(): Promise<AuthUser | null>;
  signOut(): Promise<void>;
}

/**
 * Reserved for a future release. Declared here so the seam exists; there is no
 * implementation in the MVP and nothing in the UI calls it.
 */
export interface AIAssistant {
  explain(input: { arabic: string; context?: string }): Promise<string>;
}
