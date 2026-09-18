import type { Lesson, LessonTranscriptLine, Recording } from "@/domain/types";
import { RECORDINGS, RECORDINGS_BY_ID } from "./recordings";

/**
 * Listening lessons.
 *
 * Program lessons pair a real recording with a targeted segment, a listening
 * guide, and course-written practice sentences. The practice sentences are NOT
 * a transcript of the recording and are always labelled as study material.
 *
 * Every recording is also exposed as a free-listening lesson so the full series
 * is reachable without a separate library screen.
 *
 * `audioUrl` is left null here; the content repository resolves it through the
 * audio source (Supabase Storage or local streaming) at request time.
 */

const MINUTE = 60;

function recording(id: string): Recording {
  const found = RECORDINGS_BY_ID.get(id);
  if (!found) throw new Error(`Unknown recording in lesson seed: ${id}`);
  return found;
}

const FOUNDATION_PHRASES: LessonTranscriptLine[] = [
  { arabic: "الحمد لله رب العالمين، أما بعد", english: "All praise is for Allah, Lord of the worlds. To proceed:" },
  { arabic: "قال الله تعالى في كتابه", english: "Allah Most High said in His Book:" },
  { arabic: "قال رسول الله ﷺ", english: "The Messenger of Allah (peace be upon him) said:" },
  { arabic: "والدليل على ذلك من السنة", english: "And the evidence for that is from the Sunnah." },
  { arabic: "يعني أن الطالب يحترم شيخه", english: "Meaning that the student respects his teacher." },
  { arabic: "والخلاصة أن الأدب قبل العلم", english: "In summary, etiquette comes before knowledge." },
];

const STRUCTURE_PHRASES: LessonTranscriptLine[] = [
  { arabic: "المسألة الأولى في هذا الباب", english: "The first issue in this chapter:" },
  { arabic: "قال المؤلف رحمه الله", english: "The author, may Allah have mercy on him, said:" },
  { arabic: "قال العلماء في هذه المسألة", english: "The scholars spoke on this issue." },
  { arabic: "والمراد بهذا الكلام", english: "What is meant by this statement is..." },
  { arabic: "ولهذا قال الإمام", english: "And for this reason the Imam said:" },
  { arabic: "والصحيح من أقوال أهل العلم", english: "The correct view among the people of knowledge is..." },
];

const VOCABULARY_PHRASES: LessonTranscriptLine[] = [
  { arabic: "الإخلاص شرط في قبول العبادة", english: "Sincerity is a condition for worship to be accepted." },
  { arabic: "حملة القرآن هم أهل الله", english: "The bearers of the Qurʾān are the people of Allah." },
  { arabic: "ومن اتبع السنة نجا", english: "Whoever follows the Sunnah is saved." },
  { arabic: "هذا الحديث صحيح الإسناد", english: "This hadith has an authentic chain." },
  { arabic: "لا شك أن هذا هو الحق", english: "There is no doubt that this is the truth." },
];

const MOCK_PHRASES: LessonTranscriptLine[] = [
  { arabic: "إن الحمد لله نحمده ونستعينه", english: "Indeed all praise is for Allah; we praise Him and seek His help." },
  { arabic: "وموضوعنا اليوم في هذه المسألة", english: "Our topic today is on this issue." },
  { arabic: "وبعبارة أخرى، العلم قبل القول والعمل", english: "In other words: knowledge comes before speech and action." },
  { arabic: "والخلاصة، نسأل الله العلم النافع", english: "In summary, we ask Allah for beneficial knowledge." },
];

type LessonSeed = Omit<Lesson, "audioUrl" | "durationSeconds" | "speaker">;

const PROGRAM_LESSONS: LessonSeed[] = [
  {
    id: "lesson-lecture-foundations",
    title: "Etiquette of the Student — a Complete Short Lesson",
    description:
      "A short, complete talk on how a student honours his teacher. Short enough to hear twice in one sitting.",
    objective:
      "Hear a whole lesson from opening to close, and catch the formulas that frame it.",
    recording: recording("rec-adab-student-01"),
    segment: null,
    topic: "lecture-navigation",
    guide: [
      "First pass: just listen. Do not pause, do not translate.",
      "Note how the shaykh opens — praise of Allah, then أما بعد or a direct start.",
      "Second pass: count every time you hear قال — each one introduces a quotation or evidence.",
      "Finish by saying in one English sentence what the lesson was about.",
    ],
    practicePhrases: FOUNDATION_PHRASES,
  },
  {
    id: "lesson-structure-of-a-dars",
    title: "Opening a Sharḥ — the First Ten Minutes",
    description:
      "The opening of a book explanation. Listen for how a teacher introduces a text, its author, and its purpose.",
    objective:
      "Mark each moment the shaykh moves between topic, evidence, explanation and conclusion.",
    recording: recording("rec-tibyan-01"),
    segment: { startSeconds: 0, endSeconds: 10 * MINUTE },
    topic: "listening-structure",
    guide: [
      "Listen once through the target window without stopping.",
      "Each time the shaykh reads from the book, then explains it, note the switch.",
      "Listen for the author being named and praised — a fixed part of every sharḥ.",
      "Write down three words you recognised, even if the sentence around them was unclear.",
    ],
    practicePhrases: STRUCTURE_PHRASES,
  },
  {
    id: "lesson-aqeedah-in-speech",
    title: "Islamic Vocabulary at Speaking Pace",
    description:
      "The vocabulary you drilled on cards, now arriving inside connected speech at a real teacher's pace.",
    objective:
      "Recognise core Islamic vocabulary when it arrives inside a sentence rather than on a card.",
    recording: recording("rec-tibyan-02"),
    segment: { startSeconds: 0, endSeconds: 10 * MINUTE },
    topic: "islamic-vocabulary",
    guide: [
      "Before playing, reread today's vocabulary cards for one minute.",
      "Listen for any of them: الإخلاص، السنة، الحديث، العلماء، القرآن.",
      "Tap pause the moment you catch one, say it aloud, then continue.",
      "Do not worry about the words between them — recognition comes first.",
    ],
    practicePhrases: VOCABULARY_PHRASES,
  },
  {
    id: "lesson-mock-dawrah",
    title: "Mock Dawrah — Twenty Minutes Unbroken",
    description:
      "A full-length stretch of a real lesson. This is what a Dawrah session will feel like.",
    objective:
      "Stay with a real lesson for twenty minutes and come away with its main point plus three phrases you recognised.",
    recording: recording("rec-tibyan-03"),
    segment: { startSeconds: 0, endSeconds: 20 * MINUTE },
    topic: "dawrah-simulation",
    guide: [
      "Sit as you would in the Dawrah: no pausing, no rewinding.",
      "When you lose the thread, wait for the next قال or أما — those are re-entry points.",
      "Afterwards, write the main point in one sentence and three phrases you caught.",
    ],
    practicePhrases: MOCK_PHRASES,
  },
];

const FREE_LISTENING_GUIDE = [
  "Choose a ten-minute window and listen without pausing.",
  "Listen for the phrases from your cards: أما بعد، قال، يعني، والدليل.",
  "Return to the same window tomorrow — the second hearing is where it clicks.",
];

const SERIES_LESSONS: LessonSeed[] = RECORDINGS.map((rec) => ({
  id: rec.id,
  title: rec.title,
  description:
    rec.series === "adab"
      ? "A short standalone lesson on the student's conduct with his teacher."
      : `Part ${rec.part} of the full explanation of an-Nawawī's at-Tibyān.`,
  objective:
    "Free listening: stay with the lesson and notice what you now recognise.",
  recording: rec,
  segment: null,
  topic: rec.series,
  guide: FREE_LISTENING_GUIDE,
  practicePhrases: [],
}));

export const LESSONS: Lesson[] = [...PROGRAM_LESSONS, ...SERIES_LESSONS].map(
  (seed) => ({
    ...seed,
    audioUrl: null,
    durationSeconds: seed.recording?.durationSeconds ?? null,
    speaker: seed.recording?.speaker ?? null,
  }),
);

export const LESSONS_BY_ID: ReadonlyMap<string, Lesson> = new Map(
  LESSONS.map((lesson) => [lesson.id, lesson]),
);
