/**
 * How many brand-new cards a learner may meet from one vocabulary set.
 *
 * The allowance is counted from cards *introduced today*, not from cards
 * currently due. A due-based rule refills the queue every time a card is
 * graded (grading makes it not-due), so a "5 minute" task would never end —
 * and because server actions re-render the page after every grade, it did not.
 * Counting introductions per calendar day is idempotent under any number of
 * renders, reloads or revisits.
 */

export const NEW_CARDS_PER_SET_PER_DAY = 10;

export function newCardAllowance(
  introducedTodayInSet: number,
  cap: number = NEW_CARDS_PER_SET_PER_DAY,
): number {
  return Math.max(0, cap - Math.max(0, introducedTodayInSet));
}
