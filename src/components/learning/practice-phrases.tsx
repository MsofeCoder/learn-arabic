"use client";

import { useState } from "react";
import { ChevronDown, Volume2 } from "lucide-react";
import { ArabicText } from "@/components/learning/arabic-text";
import { useArabicSpeech } from "@/components/learning/use-arabic-speech";
import type { LessonTranscriptLine } from "@/domain/types";
import { cn } from "@/lib/utils/cn";

interface PracticePhrasesProps {
  lines: LessonTranscriptLine[];
  /** Open by default when there is no audio — the sentences are the lesson then. */
  defaultOpen?: boolean;
}

/**
 * Course-written study sentences for a listening lesson. These are deliberately
 * labelled as practice material: they are not a transcript of the recording and
 * must never be presented as one.
 */
export function PracticePhrases({
  lines,
  defaultOpen = false,
}: PracticePhrasesProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [showEnglish, setShowEnglish] = useState(true);
  const speech = useArabicSpeech();

  if (lines.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
      <h2>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="practice-panel"
          className="flex min-h-[56px] w-full items-center justify-between gap-3 px-5 py-4 text-start"
        >
          <span>
            <span className="block text-[15px] font-semibold text-ink-900">
              Practice sentences
              <span className="ms-2 text-[13px] font-normal text-ink-500">
                {lines.length}
              </span>
            </span>
            <span className="mt-0.5 block text-[12px] font-normal text-ink-400">
              Written for this course to prepare your ear — not a transcript of
              the recording.
            </span>
          </span>
          <ChevronDown
            className={cn(
              "size-5 shrink-0 text-ink-500 transition-transform duration-200",
              open && "rotate-180",
            )}
            aria-hidden="true"
          />
        </button>
      </h2>

      {open ? (
        <div id="practice-panel" className="border-t border-line">
          <div className="flex items-center justify-end px-5 py-3">
            <label className="flex cursor-pointer items-center gap-2 text-[13px] text-ink-600">
              <input
                type="checkbox"
                checked={showEnglish}
                onChange={(event) => setShowEnglish(event.target.checked)}
                className="size-4 accent-[var(--color-brand)]"
              />
              Show English
            </label>
          </div>

          <ol className="divide-y divide-line border-t border-line">
            {lines.map((line, index) => (
              <li key={index} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <ArabicText size="sm" className="flex-1">
                    {line.arabic}
                  </ArabicText>
                  {speech.supported ? (
                    <button
                      type="button"
                      onClick={() => speech.speak(line.arabic)}
                      aria-label={`Hear sentence ${index + 1} in Arabic`}
                      className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-sand-100 hover:text-ink-600"
                    >
                      <Volume2 className="size-4" aria-hidden="true" />
                    </button>
                  ) : null}
                </div>
                {showEnglish ? (
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-600">
                    {line.english}
                  </p>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  );
}
