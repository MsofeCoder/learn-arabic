"use client";

import { Eye, Volume2 } from "lucide-react";
import { ArabicText } from "@/components/learning/arabic-text";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { useArabicSpeech } from "@/components/learning/use-arabic-speech";
import type { VocabularyItem } from "@/domain/types";

interface FlashcardProps {
  item: VocabularyItem;
  revealed: boolean;
  onReveal: () => void;
  className?: string;
}

/**
 * The card surface. Front is Arabic and nothing else that competes with it;
 * the back adds meaning, optional transliteration and an example.
 *
 * Reveal is a real button so it is keyboard- and screen-reader-operable, and
 * the Arabic is never clipped: the card grows rather than scrolling.
 */
export function Flashcard({
  item,
  revealed,
  onReveal,
  className,
}: FlashcardProps) {
  const speech = useArabicSpeech();

  return (
    <article
      className={cn(
        "flex min-h-[300px] flex-col rounded-2xl border border-line bg-white p-6 shadow-card sm:min-h-[360px] sm:p-8",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-[11px] font-semibold tracking-[0.12em] text-ink-400 uppercase">
          {item.category === "lecture-phrase"
            ? "Lecture phrase"
            : item.category === "survival-phrase"
              ? "Classroom phrase"
              : "Vocabulary"}
        </span>
        {speech.supported ? (
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => speech.speak(item.arabic)}
            aria-label={`Hear ${item.meaningEn} in Arabic`}
          >
            <Volume2 className="size-4" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">Hear it</span>
          </Button>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto py-6 text-center">
        <ArabicText size="display" className="max-w-full">
          {item.arabic}
        </ArabicText>

        {revealed ? (
          <div className="mt-6 w-full space-y-4 border-t border-line pt-6">
            <p className="text-xl font-medium text-ink-900 sm:text-2xl">
              {item.meaningEn}
            </p>
            {item.transliteration ? (
              <p className="text-sm text-ink-500 italic">
                {item.transliteration}
              </p>
            ) : null}
            {item.exampleAr ? (
              <div className="rounded-xl bg-sand-100 px-4 py-3.5 text-start">
                <p className="text-[11px] font-semibold tracking-[0.1em] text-ink-400 uppercase">
                  Example
                </p>
                <ArabicText size="sm" className="mt-1.5">
                  {item.exampleAr}
                </ArabicText>
                {item.exampleEn ? (
                  <p className="mt-1 text-sm text-ink-600">{item.exampleEn}</p>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="mt-8">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onReveal}
            >
              <Eye className="size-4" aria-hidden="true" />
              Show meaning
            </Button>
            <p className="mt-3 text-[13px] text-ink-400">
              Recall it first, then reveal.
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
