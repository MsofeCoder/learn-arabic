import type { Recording } from "@/domain/types";

/**
 * Real lecture recordings supplied for the Dawrah program.
 *
 * `storageKey` is the object path inside the `lesson-audio` Supabase Storage
 * bucket; `localFile` is the original filename in `sample-duroos-audios/`, used
 * only for local-mode streaming. Durations come from each file's Xing header
 * (frame count), not from bitrate estimates — the files are VBR.
 *
 * Nothing in this app transcribes these recordings. Study sentences shown next
 * to them are course material and are labelled as such.
 */

const SPEAKER = "Shaykh Munīr as-Saʿdī";
const SPEAKER_AR = "الشيخ منير السعدي";

const TIBYAN_TITLE = "Explanation of at-Tibyān fī Ādāb Ḥamalat al-Qurʾān";
const TIBYAN_TITLE_AR = "شرح التبيان في آداب حملة القرآن للنووي";

/** [part, localFile, durationSeconds] */
const TIBYAN_PARTS: [number, string, number][] = [
  [1, "01 - ٠١ - شرح التبيان في آداب حملة القرآن للنووي - الشيخ ｜ منير السعدي.mp3", 1886],
  [2, "02 - ٠٢ - شرح التبيان في آداب حملة القرآن للنووي - الشيخ ｜ منير السعدي.mp3", 2480],
  [3, "03 - ٠٣ - شرح التبيان في آداب حملة القرآن للنووي - الشيخ ｜ منير السعدي.mp3", 2440],
  [4, "04 - ٠٤ - شرح التبيان في آداب حملة القرآن للنووي - الشيخ ｜ منير السعدي.mp3", 2302],
  [5, "05 - ٠٥ - شرح التبيان في آداب حملة القرآن للنووي - الشيخ ｜ منير السعدي.mp3", 2680],
  [6, "06 - ٠٦ - شرح التبيان في آداب حملة القرآن للنووي - الشيخ ｜ منير السعدي.mp3", 2427],
  [7, "07 - ٠٧ - شرح التبيان في آداب حملة القرآن للنووي - الشيخ ｜ منير السعدي.mp3", 5734],
  [8, "08 - ٠٨ - شرح التبيان في آداب حملة القرآن للنووي - الشيخ ｜ منير السعدي.mp3", 3008],
  [9, "09 - ٩ - شرح التبيان في آداب حملة القرآن للنووي - الشيخ ｜ منير السعدي.mp3", 2282],
  [10, "10 - ١٠ - التبيان في آداب حملة القرآن ｜ الشيخ منير السعدي.mp3", 2755],
  [11, "11 - ١١ - التبيان في آداب حملة القرآن ｜ الشيخ منير السعدي.mp3", 2991],
];

/** Arabic-Indic digits, so part numbers sit naturally inside RTL titles. */
function arabicDigits(n: number): string {
  return n.toString().replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

export const TIBYAN_SERIES = "tibyan";

export const RECORDINGS: Recording[] = [
  {
    id: "rec-adab-student-01",
    series: "adab",
    part: 1,
    title: "Respect and Etiquette of the Student with the Teacher (1)",
    titleAr: "احترام وأدب الطالب مع معلمه وشيخه ١",
    speaker: SPEAKER,
    speakerAr: SPEAKER_AR,
    durationSeconds: 171,
    storageKey: "adab/student-teacher-01.mp3",
    localFile:
      "12 - 🔸 احترام وأدب الطالب مع معلمه وشيخه [ ١ ] - الشيخ ｜ منير السعدي.mp3",
  },
  ...TIBYAN_PARTS.map(
    ([part, localFile, durationSeconds]): Recording => ({
      id: `rec-tibyan-${pad(part)}`,
      series: TIBYAN_SERIES,
      part,
      title: `${TIBYAN_TITLE} — Part ${part}`,
      titleAr: `${TIBYAN_TITLE_AR} — الدرس ${arabicDigits(part)}`,
      speaker: SPEAKER,
      speakerAr: SPEAKER_AR,
      durationSeconds,
      storageKey: `tibyan/tibyan-${pad(part)}.mp3`,
      localFile,
    }),
  ),
];

export const RECORDINGS_BY_ID: ReadonlyMap<string, Recording> = new Map(
  RECORDINGS.map((recording) => [recording.id, recording]),
);
