"use server";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { TASKS_BY_ID } from "@/data/seed/program";
import { scheduleReview } from "@/domain/reviews/scheduler";
import {
  encodeLocalSession,
  LOCAL_SESSION_COOKIE,
  requireUser,
} from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/env";
import {
  learningRepository,
  reviewRepository,
} from "@/lib/repositories";
import { BACKLOG_TASK_ID } from "@/domain/missions/engine";
import type { ActionResult, SubmitReviewData } from "@/types/actions";

/**
 * Server actions — the mutation boundary.
 *
 * Every action derives the user id from the session (never from the client),
 * validates its input with Zod, and returns a typed result the UI can render.
 */

const FRIENDLY_ERROR =
  "Something went wrong saving that. Your place is safe — please try again.";

async function run<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (error) {
    // Diagnostics stay server-side; the learner sees a calm message.
    console.error("[lisanflow] action failed", error);
    return { ok: false, error: FRIENDLY_ERROR };
  }
}

const onboardingSchema = z.object({
  baselineScore: z.number().int().min(0).max(10),
  dailyMinutes: z.union([
    z.literal(10),
    z.literal(15),
    z.literal(20),
    z.literal(30),
  ]),
});

export async function completeOnboarding(
  input: z.input<typeof onboardingSchema>,
): Promise<ActionResult> {
  const result = await run(async () => {
    const parsed = onboardingSchema.parse(input);
    const user = await requireUser();
    await learningRepository.ensureProfile(user);
    await learningRepository.saveOnboarding(user.id, parsed);
  });
  if (result.ok) revalidatePath("/today");
  return { ok: result.ok, error: result.error };
}

const taskSchema = z.object({ taskId: z.string().min(1).max(120) });

export async function completeTask(
  input: z.input<typeof taskSchema>,
): Promise<ActionResult> {
  const result = await run(async () => {
    const { taskId } = taskSchema.parse(input);
    const user = await requireUser();

    // The backlog block is synthetic: it is cleared by reviewing, not by a write.
    if (taskId === BACKLOG_TASK_ID) return;
    if (!TASKS_BY_ID.has(taskId)) {
      throw new Error(`Unknown task: ${taskId}`);
    }

    await learningRepository.recordTaskCompletion(user.id, taskId);
  });
  if (result.ok) {
    revalidatePath("/today");
    revalidatePath("/progress");
  }
  return { ok: result.ok, error: result.error };
}

const lessonSchema = z.object({ lessonId: z.string().min(1).max(120) });

export async function completeLesson(
  input: z.input<typeof lessonSchema>,
): Promise<ActionResult> {
  const result = await run(async () => {
    const { lessonId } = lessonSchema.parse(input);
    const user = await requireUser();
    await learningRepository.recordLessonCompletion(user.id, lessonId);
  });
  if (result.ok) {
    revalidatePath("/today");
    revalidatePath("/progress");
  }
  return { ok: result.ok, error: result.error };
}

/** Wide enough to cover any queue the UI can present in one session. */
const MAX_LOOKUP = 30;

const reviewSchema = z.object({
  cardId: z.string().min(1).max(120),
  grade: z.enum(["again", "hard", "good", "easy"]),
});

export async function submitReview(
  input: z.input<typeof reviewSchema>,
): Promise<ActionResult<SubmitReviewData>> {
  const result = await run(async () => {
    const { cardId, grade } = reviewSchema.parse(input);
    const user = await requireUser();

    // Re-read the card under the learner's own scope: this both verifies
    // ownership and guarantees the scheduler runs on server-held state.
    const owned = await reviewRepository.getDueCards(
      user.id,
      MAX_LOOKUP,
    );
    const card = owned.find((c) => c.cardId === cardId);
    if (!card) throw new Error("That card is not due for you right now.");

    const now = new Date();
    const next = scheduleReview(card.state, grade, now);
    await reviewRepository.recordReview(user.id, cardId, grade, {
      previous: card.state,
      next,
    });

    return { nextDueAt: next.dueAt, intervalDays: next.intervalDays };
  });

  if (result.ok) revalidatePath("/progress");
  return result;
}

const localSignInSchema = z.object({
  displayName: z.string().trim().min(1).max(60).optional(),
});

/**
 * Local-mode sign-in. Only available when Supabase is not configured; it exists
 * so the learning loop is testable before credentials are provisioned.
 */
export async function signInLocally(
  input: z.input<typeof localSignInSchema>,
): Promise<ActionResult> {
  if (isSupabaseConfigured) {
    return { ok: false, error: "Local sign-in is disabled." };
  }

  const result = await run(async () => {
    const { displayName } = localSignInSchema.parse(input);
    const store = await cookies();
    const existing = store.get(LOCAL_SESSION_COOKIE)?.value;
    const id = existing ? undefined : randomUUID();

    store.set(
      LOCAL_SESSION_COOKIE,
      encodeLocalSession({
        id: id ?? decodeExistingId(existing!),
        name: displayName ?? null,
      }),
      {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      },
    );
  });

  if (!result.ok) return { ok: false, error: result.error };
  redirect("/today");
}

function decodeExistingId(raw: string): string {
  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
    if (typeof parsed?.id === "string") return parsed.id;
  } catch {
    // fall through
  }
  return randomUUID();
}

export async function signOut(): Promise<void> {
  if (isSupabaseConfigured) {
    const { createSupabaseServerClient } = await import("@/lib/supabase/server");
    const supabase = await createSupabaseServerClient();
    await supabase?.auth.signOut();
  } else {
    const store = await cookies();
    store.delete(LOCAL_SESSION_COOKIE);
  }
  redirect("/");
}
