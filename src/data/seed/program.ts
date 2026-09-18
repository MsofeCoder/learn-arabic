import type { Program, ProgramDay, Task } from "@/domain/types";

/**
 * The seeded 5-day Dawrah Arabic Preparation program.
 * Source: docs/spec/07-CONTENT-SEED.md.
 *
 * IDs are stable slugs (`day-1`, `day-1-t1`) so completion records survive a
 * later move to Postgres.
 */

export const PROGRAM_SLUG = "dawrah-arabic-prep";

export const PROGRAM: Program = {
  id: PROGRAM_SLUG,
  slug: PROGRAM_SLUG,
  title: "Dawrah Arabic Preparation",
  description:
    "Five focused days building the listening foundation you need for formal Islamic lectures.",
  isActive: true,
  totalDays: 5,
};

interface TaskSeed {
  taskType: Task["taskType"];
  title: string;
  description: string;
  estimatedMinutes: number;
  contentRef: string | null;
}

interface DaySeed {
  dayNumber: number;
  title: string;
  label: string;
  objective: string;
  focusPhraseIds: string[];
  tasks: TaskSeed[];
}

const DAY_SEEDS: DaySeed[] = [
  {
    dayNumber: 1,
    title: "Build your listening foundation",
    label: "LECTURE FOUNDATION",
    objective:
      "Recognise the common lecture transitions and evidence markers that frame almost every talk.",
    focusPhraseIds: [
      "ph-amma-badu",
      "ph-qala-allah",
      "ph-wad-dalil-ala",
      "ph-yani",
      "ph-wal-khulasa",
    ],
    tasks: [
      {
        taskType: "vocabulary",
        title: "Phrase recognition",
        description:
          "Meet the transition and evidence phrases that signal where a lecture is going.",
        estimatedMinutes: 5,
        contentRef: "lecture-phrase",
      },
      {
        taskType: "vocabulary",
        title: "Core Islamic vocabulary",
        description: "The creed and study words that carry the meaning of a lesson.",
        estimatedMinutes: 7,
        contentRef: "core-vocabulary",
      },
      {
        taskType: "listening",
        title: "Focused listening",
        description:
          "A real three-minute talk on the student's adab. Hear it whole, then listen for today's phrases.",
        estimatedMinutes: 8,
        contentRef: "lesson-lecture-foundations",
      },
      {
        taskType: "review",
        title: "Recall review",
        description: "Close the loop on what you met today before it fades.",
        estimatedMinutes: 5,
        contentRef: null,
      },
    ],
  },
  {
    dayNumber: 2,
    title: "Hear the shape of a lesson",
    label: "LISTENING STRUCTURE",
    objective:
      "Identify the topic, the evidence, the explanation, and the conclusion as they pass.",
    focusPhraseIds: [
      "ph-qala-ulama",
      "ph-wa-mana-dhalik",
      "ph-maqsud-bidhalik",
      "ph-was-sahih",
      "ph-wa-lihadha",
    ],
    tasks: [
      {
        taskType: "listening",
        title: "Listening pass",
        description:
          "The first ten minutes of a real sharḥ. One pass, no translating — mark where each section begins.",
        estimatedMinutes: 10,
        contentRef: "lesson-structure-of-a-dars",
      },
      {
        taskType: "vocabulary",
        title: "Phrase spotting",
        description: "The signposts a speaker uses when moving between sections.",
        estimatedMinutes: 5,
        contentRef: "lecture-phrase",
      },
      {
        taskType: "review",
        title: "Vocabulary review",
        description: "Retrieve yesterday's words before they slip.",
        estimatedMinutes: 7,
        contentRef: null,
      },
    ],
  },
  {
    dayNumber: 3,
    title: "Unlock the connectors",
    label: "GRAMMAR UNLOCKERS",
    objective:
      "Recognise negation, contrast, and connective structures that change a sentence's meaning.",
    focusPhraseIds: [
      "ph-laysa",
      "ph-lakin",
      "ph-bal",
      "ph-innama",
      "ph-wa-alayhi",
    ],
    tasks: [
      {
        taskType: "vocabulary",
        title: "Connector drill",
        description:
          "Negation, contrast, and correction — small words that flip a sentence.",
        estimatedMinutes: 7,
        contentRef: "lecture-phrase",
      },
      {
        taskType: "listening",
        title: "Listening with structure notes",
        description:
          "The same ten minutes again, this time noting each connector as it arrives.",
        estimatedMinutes: 10,
        contentRef: "lesson-structure-of-a-dars",
      },
      {
        taskType: "review",
        title: "Flashcard review",
        description: "A full retrieval pass over everything currently due.",
        estimatedMinutes: 8,
        contentRef: null,
      },
    ],
  },
  {
    dayNumber: 4,
    title: "Creed vocabulary at speaking pace",
    label: "ISLAMIC ARABIC",
    objective:
      "Recognise creed and hadith vocabulary inside continuous speech, not just on a card.",
    focusPhraseIds: [
      "vo-tawheed",
      "vo-iman",
      "vo-sunnah",
      "vo-isnad",
      "vo-manhaj",
    ],
    tasks: [
      {
        taskType: "vocabulary",
        title: "Aqeedah vocabulary",
        description: "The creed terms that anchor a lecture's argument.",
        estimatedMinutes: 10,
        contentRef: "core-vocabulary",
      },
      {
        taskType: "listening",
        title: "Listening",
        description: "Ten minutes of a real lesson — catch today's vocabulary at speaking pace.",
        estimatedMinutes: 10,
        contentRef: "lesson-aqeedah-in-speech",
      },
      {
        taskType: "review",
        title: "Retrieval review",
        description: "Retrieve under mild pressure — this is where retention is built.",
        estimatedMinutes: 7,
        contentRef: null,
      },
    ],
  },
  {
    dayNumber: 5,
    title: "Sit a full mock Dawrah",
    label: "MOCK LECTURE",
    objective:
      "Capture meaning across a lecture-length passage without translating every word.",
    focusPhraseIds: [
      "sv-lam-afham",
      "sv-hal-tuid",
      "sv-indi-sual",
      "sv-jazak-allah",
      "sv-jitu",
    ],
    tasks: [
      {
        taskType: "listening",
        title: "Lecture simulation",
        description:
          "Twenty unbroken minutes of a real lesson. Aim for the main point plus three phrases you recognised.",
        estimatedMinutes: 20,
        contentRef: "lesson-mock-dawrah",
      },
      {
        taskType: "vocabulary",
        title: "Classroom survival phrases",
        description:
          "What to say when you miss something — the phrases that keep you in the room.",
        estimatedMinutes: 6,
        contentRef: "survival-phrase",
      },
      {
        taskType: "review",
        title: "Recall and review",
        description: "The last retrieval pass of the program.",
        estimatedMinutes: 8,
        contentRef: null,
      },
    ],
  },
];

export const PROGRAM_DAYS: ProgramDay[] = DAY_SEEDS.map((day) => {
  const programDayId = `day-${day.dayNumber}`;
  const tasks: Task[] = day.tasks.map((task, index) => ({
    id: `${programDayId}-t${index + 1}`,
    programDayId,
    taskType: task.taskType,
    title: task.title,
    description: task.description,
    sortOrder: index,
    estimatedMinutes: task.estimatedMinutes,
    contentRef: task.contentRef,
  }));

  return {
    id: programDayId,
    programId: PROGRAM.id,
    dayNumber: day.dayNumber,
    title: day.title,
    label: day.label,
    objective: day.objective,
    estimatedMinutes: tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0),
    tasks,
    focusPhraseIds: day.focusPhraseIds,
  };
});

export const PROGRAM_DAYS_BY_NUMBER: ReadonlyMap<number, ProgramDay> = new Map(
  PROGRAM_DAYS.map((day) => [day.dayNumber, day]),
);

export const ALL_TASKS: Task[] = PROGRAM_DAYS.flatMap((day) => day.tasks);

export const TASKS_BY_ID: ReadonlyMap<string, Task> = new Map(
  ALL_TASKS.map((task) => [task.id, task]),
);
