import { ArabicText } from "@/components/learning/arabic-text";
import type { VocabularyItem } from "@/domain/types";

/**
 * "Notice these phrases today" — a short priming block, deliberately not a
 * second vocabulary wall. Arabic gets the space it needs to read as content.
 */
export function DailyFocus({ items }: { items: VocabularyItem[] }) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="daily-focus-heading">
      <h2
        id="daily-focus-heading"
        className="text-[13px] font-semibold tracking-[0.1em] text-ink-500 uppercase"
      >
        Listen out for these today
      </h2>

      <ul className="mt-3 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-4 py-3.5 sm:px-5"
          >
            <ArabicText as="span" size="sm" className="font-semibold">
              {item.arabic}
            </ArabicText>
            <span className="flex flex-col items-start text-end sm:items-end">
              <span className="text-[15px] text-ink-700">{item.meaningEn}</span>
              {item.transliteration ? (
                <span className="text-[12px] text-ink-400 italic">
                  {item.transliteration}
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
