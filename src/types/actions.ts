/** Shared result shape for every server action. Kept out of the "use server"
 * module because those files may only export async functions. */
export interface ActionResult<T = undefined> {
  ok: boolean;
  error?: string;
  data?: T;
}

export interface SubmitReviewData {
  nextDueAt: string;
  intervalDays: number;
}
