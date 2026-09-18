import type { VocabularyItem } from "@/domain/types";

/**
 * Curated seed vocabulary for the Dawrah Arabic Preparation program.
 *
 * Source: docs/spec/07-CONTENT-SEED.md. This is curated teaching content, not a
 * transcript of any lecture, and must never be presented as one.
 *
 * IDs are stable slugs so review state stays referentially safe if this content
 * later moves into Postgres.
 */

type PhraseSeed = [id: string, arabic: string, meaningEn: string, topic: string];

const LECTURE_PHRASES: PhraseSeed[] = [
  ["ph-amma-badu", "أما بعد", "to proceed / thereafter", "transition"],
  ["ph-qala-allah", "قال الله تعالى", "Allah Most High said", "evidence"],
  ["ph-qala-rasul", "قال رسول الله ﷺ", "The Messenger of Allah said", "evidence"],
  ["ph-qala-ulama", "قال العلماء", "the scholars said", "attribution"],
  ["ph-wad-dalil", "والدليل", "and the evidence", "evidence"],
  ["ph-wad-dalil-ala", "والدليل على ذلك", "the evidence for that", "evidence"],
  ["ph-wa-min-dhalik", "ومن ذلك", "and from that", "transition"],
  ["ph-wa-mana-dhalik", "ومعنى ذلك", "and the meaning of that", "explanation"],
  ["ph-maqsud", "المقصود", "what is intended", "explanation"],
  ["ph-maqsud-bidhalik", "المقصود بذلك", "what is intended by that", "explanation"],
  ["ph-yani", "يعني", "meaning", "explanation"],
  ["ph-ay", "أي", "i.e. / meaning", "explanation"],
  ["ph-wa-lihadha", "ولهذا", "therefore / for this reason", "transition"],
  ["ph-wa-lidhalik", "ولذلك", "therefore", "transition"],
  ["ph-wa-alayhi", "وعليه", "accordingly", "transition"],
  ["ph-amma", "أما", "as for", "contrast"],
  ["ph-lakin", "لكن", "but / however", "contrast"],
  ["ph-bal", "بل", "rather", "correction"],
  ["ph-innama", "إنما", "only / merely", "emphasis"],
  ["ph-laysa", "ليس", "is not", "negation"],
  ["ph-la-shakk", "لا شك", "no doubt", "emphasis"],
  ["ph-la-siyyama", "لا سيما", "especially", "emphasis"],
  ["ph-min-jiha", "من جهة", "from the aspect of", "framing"],
  ["ph-fil-haqiqa", "في الحقيقة", "in reality", "emphasis"],
  ["ph-bi-ibara-ukhra", "بعبارة أخرى", "in other words", "explanation"],
  ["ph-wal-khulasa", "والخلاصة", "in summary", "conclusion"],
  ["ph-was-sahih", "والصحيح", "the correct view", "conclusion"],
  ["ph-war-rajih", "والراجح", "the preponderant view", "conclusion"],
  ["ph-wal-murad", "والمراد", "what is meant", "explanation"],
  ["ph-wa-min-huna", "ومن هنا", "from here / hence", "transition"],
];

const CORE_VOCABULARY: PhraseSeed[] = [
  ["vo-aqeedah", "العقيدة", "creed", "aqeedah"],
  ["vo-tawheed", "التوحيد", "monotheism", "aqeedah"],
  ["vo-iman", "الإيمان", "faith", "aqeedah"],
  ["vo-sunnah", "السنة", "Sunnah", "aqeedah"],
  ["vo-salaf", "السلف", "the Salaf", "aqeedah"],
  ["vo-bidah", "البدعة", "innovation", "aqeedah"],
  ["vo-ibadah", "العبادة", "worship", "worship"],
  ["vo-ikhlas", "الإخلاص", "sincerity", "worship"],
  ["vo-shirk", "الشرك", "shirk", "aqeedah"],
  ["vo-taah", "الطاعة", "obedience", "ethics"],
  ["vo-ittiba", "الاتباع", "following", "methodology"],
  ["vo-dalil", "الدليل", "evidence", "methodology"],
  ["vo-hujjah", "الحجة", "proof", "methodology"],
  ["vo-hadith", "الحديث", "hadith", "hadith"],
  ["vo-riwayah", "الرواية", "narration", "hadith"],
  ["vo-isnad", "الإسناد", "chain of transmission", "hadith"],
  ["vo-matn", "المتن", "hadith text", "hadith"],
  ["vo-sahih", "الصحيح", "authentic / correct", "hadith"],
  ["vo-daif", "الضعيف", "weak", "hadith"],
  ["vo-ulama", "العلماء", "scholars", "scholarship"],
  ["vo-masalah", "المسألة", "issue / question", "study"],
  ["vo-qawl", "القول", "statement / view", "study"],
  ["vo-jawab", "الجواب", "answer", "study"],
  ["vo-sual", "السؤال", "question", "study"],
  ["vo-hukm", "الحكم", "ruling / judgment", "fiqh"],
  ["vo-sharh", "الشرح", "explanation", "study"],
  ["vo-bab", "الباب", "chapter", "books"],
  ["vo-fasl", "الفصل", "section", "books"],
  ["vo-muallif", "المؤلف", "author", "books"],
  ["vo-rahmah", "الرحمة", "mercy", "general"],
  ["vo-wahy", "الوحي", "revelation", "aqeedah"],
  ["vo-rasul", "الرسول", "messenger", "aqeedah"],
  ["vo-sahabah", "الصحابة", "Companions", "history"],
  ["vo-tabiun", "التابعون", "Followers", "history"],
  ["vo-qadar", "القدر", "divine decree", "aqeedah"],
  ["vo-shafaah", "الشفاعة", "intercession", "aqeedah"],
  ["vo-yawm-akhir", "اليوم الآخر", "Last Day", "aqeedah"],
  ["vo-bath", "البعث", "resurrection", "aqeedah"],
  ["vo-hisab", "الحساب", "reckoning", "aqeedah"],
  ["vo-jannah", "الجنة", "Paradise", "aqeedah"],
  ["vo-nar", "النار", "Hellfire", "aqeedah"],
  ["vo-haqq", "الحق", "truth", "general"],
  ["vo-batil", "الباطل", "falsehood", "general"],
  ["vo-itiqad", "الاعتقاد", "belief", "aqeedah"],
  ["vo-manhaj", "المنهج", "methodology", "methodology"],
  ["vo-athar", "الآثار", "reports / traditions", "hadith"],
];

const SURVIVAL_PHRASES: PhraseSeed[] = [
  ["sv-lam-afham", "لم أفهم", "I did not understand", "classroom"],
  ["sv-lam-afham-jayyidan", "لم أفهم جيدًا", "I did not understand well", "classroom"],
  ["sv-hal-tuid", "هل يمكنك أن تعيد؟", "Can you repeat?", "classroom"],
  ["sv-aid-al-kalam", "من فضلك، أعد الكلام", "Please repeat what you said", "classroom"],
  ["sv-takallam-bibut", "تكلم ببطء من فضلك", "Please speak slowly", "classroom"],
  ["sv-ma-mana-kalimah", "ما معنى هذه الكلمة؟", "What does this word mean?", "classroom"],
  ["sv-ma-mana-hadha", "ما معنى هذا؟", "What does this mean?", "classroom"],
  ["sv-indi-sual", "عندي سؤال", "I have a question", "classroom"],
  ["sv-hal-as-al", "هل يمكن أن أسأل؟", "May I ask?", "classroom"],
  ["sv-jazak-allah", "جزاك الله خيرًا", "May Allah reward you with good", "courtesy"],
  ["sv-barak-allah", "بارك الله فيك", "May Allah bless you", "courtesy"],
  ["sv-ahsan-allah", "أحسن الله إليك", "May Allah do good to you", "courtesy"],
  ["sv-ismi", "اسمي آدم ابن محمد", "My name is Adam ibn Muhammad", "introductions"],
  ["sv-kunyati", "كنيتي أبو مريم", "My kunyah is Abu Maryam", "introductions"],
  ["sv-ana-min", "أنا من تنزانيا", "I am from Tanzania", "introductions"],
  ["sv-jitu", "جئت لطلب العلم", "I came to seek knowledge", "introductions"],
];

/** Transliteration is optional support, not a default — only high-value items carry it. */
const TRANSLITERATIONS: Record<string, string> = {
  "ph-amma-badu": "ammā baʿd",
  "ph-qala-allah": "qāla-llāhu taʿālā",
  "ph-qala-rasul": "qāla rasūlu-llāh",
  "ph-wad-dalil-ala": "wa-d-dalīlu ʿalā dhālik",
  "ph-maqsud-bidhalik": "al-maqṣūdu bi-dhālik",
  "ph-wal-khulasa": "wa-l-khulāṣah",
  "ph-innama": "innamā",
  "vo-aqeedah": "al-ʿaqīdah",
  "vo-tawheed": "at-tawḥīd",
  "vo-sunnah": "as-sunnah",
  "vo-salaf": "as-salaf",
  "vo-bidah": "al-bidʿah",
  "vo-ikhlas": "al-ikhlāṣ",
  "vo-isnad": "al-isnād",
  "vo-manhaj": "al-manhaj",
  "sv-jazak-allah": "jazāka-llāhu khayran",
  "sv-barak-allah": "bāraka-llāhu fīk",
  "sv-ma-mana-hadha": "mā maʿnā hādhā?",
};

/** Example sentence seeds from the content spec, attached to related items. */
const EXAMPLES: Record<string, { ar: string; en: string }> = {
  "vo-masalah": {
    ar: "هذه مسائل في العقيدة.",
    en: "These are issues within creed.",
  },
  "ph-wad-dalil-ala": {
    ar: "والدليل على ذلك من السنة.",
    en: "And the evidence for that is from the Sunnah.",
  },
  "ph-qala-ulama": {
    ar: "قال العلماء في هذه المسألة.",
    en: "The scholars spoke on this issue.",
  },
  "ph-maqsud-bidhalik": {
    ar: "المقصود بذلك أن...",
    en: "What is intended by that is that...",
  },
  "vo-sunnah": {
    ar: "ومن أصول أهل السنة...",
    en: "And from the foundations of Ahl as-Sunnah...",
  },
  "ph-wa-lihadha": {
    ar: "ولهذا قال الإمام...",
    en: "And for this reason the Imam said...",
  },
};

function build(
  seeds: PhraseSeed[],
  category: VocabularyItem["category"],
  level: number,
): VocabularyItem[] {
  return seeds.map(([id, arabic, meaningEn, topic]) => ({
    id,
    arabic,
    meaningEn,
    transliteration: TRANSLITERATIONS[id] ?? null,
    exampleAr: EXAMPLES[id]?.ar ?? null,
    exampleEn: EXAMPLES[id]?.en ?? null,
    topic,
    category,
    level,
    audioUrl: null,
  }));
}

export const VOCABULARY_ITEMS: VocabularyItem[] = [
  ...build(LECTURE_PHRASES, "lecture-phrase", 1),
  ...build(CORE_VOCABULARY, "core-vocabulary", 2),
  ...build(SURVIVAL_PHRASES, "survival-phrase", 1),
];

export const VOCABULARY_BY_ID: ReadonlyMap<string, VocabularyItem> = new Map(
  VOCABULARY_ITEMS.map((item) => [item.id, item]),
);

export function vocabularyByTopic(topic: string): VocabularyItem[] {
  return VOCABULARY_ITEMS.filter((item) => item.topic === topic);
}

export function vocabularyByCategory(
  category: VocabularyItem["category"],
): VocabularyItem[] {
  return VOCABULARY_ITEMS.filter((item) => item.category === category);
}
