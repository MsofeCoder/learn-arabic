/**
 * LisanFlow core domain types.
 *
 * These types are storage-agnostic: they describe the learning domain, not the
 * Supabase schema. Repository adapters map between these and persistence.
 */

export type TaskType = "vocabulary" | "listening" | "reading" | "review";

export type ReviewGrade = "again" | "hard" | "good" | "easy";

export const REVIEW_GRADES: readonly ReviewGrade[] = [
  "again",
  "hard",
  "good",
  "easy",
] as const;

export interface Program {
  id: string;
  slug: string;
  title: string;
  description: string;
  isActive: boolean;
  totalDays: number;
}

export interface ProgramDay {
  id: string;
  programId: string;
  dayNumber: number;
  title: string;
  /** Short label shown next to the day number, e.g. "LECTURE LISTENING". */
  label: string;
  objective: string;
  estimatedMinutes: number;
  tasks: Task[];
  /** Vocabulary item ids surfaced in the "notice these phrases today" block. */
  focusPhraseIds: string[];
}

export interface Task {
  id: string;
  programDayId: string;
  taskType: TaskType;
  title: string;
  description: string;
  sortOrder: number;
  estimatedMinutes: number;
  /** Lesson id for listening tasks, topic key for vocabulary tasks. */
  contentRef: string | null;
}

export interface VocabularyItem {
  id: string;
  arabic: string;
  meaningEn: string;
  transliteration: string | null;
  exampleAr: string | null;
  exampleEn: string | null;
  topic: string;
  /** Editorial grouping used by the mission engine and review seeding. */
  category: "lecture-phrase" | "core-vocabulary" | "survival-phrase";
  level: number | null;
  audioUrl: string | null;
}

/** A real audio recording, independent of how it is stored or served. */
export interface Recording {
  id: string;
  series: string;
  part: number;
  title: string;
  titleAr: string;
  speaker: string;
  speakerAr: string;
  durationSeconds: number;
  /** Object path in the audio storage bucket. */
  storageKey: string;
  /** Original filename, for local-mode streaming only. */
  localFile: string;
}

/** The part of a recording a task asks the learner to work on. */
export interface ListeningSegment {
  startSeconds: number;
  endSeconds: number;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  objective: string;
  /** Resolved playable URL, or null when no audio is reachable. */
  audioUrl: string | null;
  recording: Recording | null;
  /** Targeted window within the recording; null means the whole recording. */
  segment: ListeningSegment | null;
  durationSeconds: number | null;
  speaker: string | null;
  topic: string;
  /** Step-by-step instructions for how to listen. */
  guide: string[];
  /**
   * Course-written study sentences. Never a transcript of `recording` — the UI
   * must label them as practice material.
   */
  practicePhrases: LessonTranscriptLine[];
}

export interface LessonTranscriptLine {
  arabic: string;
  english: string;
}

/** Per-user scheduling state for a single vocabulary item. */
export interface CardState {
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  /** ISO-8601 timestamp. */
  dueAt: string;
  /** ISO-8601 timestamp, or null when never reviewed. */
  lastReviewedAt: string | null;
}

export interface UserCard extends CardState {
  id: string;
  vocabularyItemId: string;
}

/** A due card joined with the content it teaches, ready for the review UI. */
export interface ReviewCard {
  cardId: string;
  item: VocabularyItem;
  state: CardState;
}

export interface Profile {
  userId: string;
  displayName: string | null;
  email: string | null;
  avatarUrl: string | null;
  baselineScore: number;
  dailyMinutes: DailyMinutes;
  onboardingComplete: boolean;
  /** Accumulated points from completed tasks and successful reviews. */
  progressPoints: number;
  /** ISO date (yyyy-mm-dd) the learner enrolled in the active program. */
  enrolledOn: string | null;
}

export type DailyMinutes = 10 | 15 | 20 | 30;

export const DAILY_MINUTES_OPTIONS: readonly DailyMinutes[] = [
  10, 15, 20, 30,
] as const;

export interface MissionTask {
  id: string;
  taskType: TaskType;
  title: string;
  description: string;
  estimatedMinutes: number;
  contentRef: string | null;
  completed: boolean;
  /** Route the task CTA navigates to. */
  href: string;
  /** True for the synthetic "clear your review backlog" task. */
  isBacklog?: boolean;
}

export interface Mission {
  program: { id: string; title: string; dayNumber: number };
  dayLabel: string;
  title: string;
  objective: string;
  estimatedMinutes: number;
  tasks: MissionTask[];
  completedCount: number;
  /** 0-100. */
  percentComplete: number;
  dueReviewCount: number;
}

export interface ProgressSummary {
  skillScore: number;
  baselineScore: number;
  tasksCompletedToday: number;
  tasksCompletedTotal: number;
  wordsLearned: number;
  reviewsCompleted: number;
  currentProgramDay: number;
  dueReviewCount: number;
  listeningCompleted: number;
}

/** Everything the mission engine needs about a learner, with no I/O. */
export interface UserLearningState {
  profile: Profile;
  currentDayNumber: number;
  /** Every completed task id, across all days. */
  completedTaskIds: string[];
  dueReviewCount: number;
}
