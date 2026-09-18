import { PROGRAM_DAYS } from "@/data/seed/program";
import { VOCABULARY_BY_ID } from "@/data/seed/vocabulary";
import { resolveCurrentDay } from "@/domain/missions/engine";
import {
  computeSkillScore,
  POINTS_PER_TASK,
  pointsForReview,
} from "@/domain/progress/score";
import { newCardAllowance } from "@/domain/reviews/introduction";
import { DEFAULT_TIME_ZONE, dayKey } from "@/domain/time";
import { initialCardState } from "@/domain/reviews/scheduler";
import type {
  DailyMinutes,
  Profile,
  ProgressSummary,
  ReviewCard,
  ReviewGrade,
} from "@/domain/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { seedContentRepository } from "./content.seed";
import type {
  AuthUser,
  LearningRepository,
  ReviewRepository,
  ReviewResult,
} from "./types";

/**
 * Supabase-backed learner state.
 *
 * Content stays in checked-in seed data (see content.seed.ts); only user-scoped
 * rows live in Postgres, referenced by the seed's stable slugs. Every table read
 * here is protected by RLS (`auth.uid() = user_id`) — route guards alone are
 * never the authority. Progress points are awarded by database triggers from
 * the `points` recorded on each activity row; no client call can set them.
 * See supabase/migrations/0001_init.sql.
 */

/** Postgres SQLSTATE for a unique-constraint violation. */
const UNIQUE_VIOLATION = "23505";

interface ProfileRow {
  id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  baseline_score: number;
  daily_minutes: number;
  onboarding_complete: boolean;
  progress_points: number;
  enrolled_on: string | null;
}

interface CardRow {
  id: string;
  vocabulary_ref: string;
  due_at: string;
  interval_days: number;
  ease_factor: number;
  repetitions: number;
  last_reviewed_at: string | null;
}

/**
 * PostgREST errors are plain objects, which surface as an unreadable
 * `{code, details, ...}` blob. Wrap them so logs carry code and message.
 */
function dbError(error: { code?: string; message?: string }): Error {
  return new Error(`[supabase ${error.code ?? "?"}] ${error.message ?? "query failed"}`, {
    cause: error,
  });
}

async function client() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase;
}

function toProfile(row: ProfileRow): Profile {
  return {
    userId: row.id,
    displayName: row.display_name,
    email: row.email,
    avatarUrl: row.avatar_url,
    baselineScore: Number(row.baseline_score),
    dailyMinutes: row.daily_minutes as DailyMinutes,
    onboardingComplete: row.onboarding_complete,
    progressPoints: row.progress_points,
    enrolledOn: row.enrolled_on,
  };
}

function toReviewCard(row: CardRow): ReviewCard | null {
  const item = VOCABULARY_BY_ID.get(row.vocabulary_ref);
  if (!item) return null;
  return {
    cardId: row.id,
    item,
    state: {
      // PostgREST can return numeric columns as strings; normalise.
      intervalDays: Number(row.interval_days),
      easeFactor: Number(row.ease_factor),
      repetitions: row.repetitions,
      dueAt: row.due_at,
      lastReviewedAt: row.last_reviewed_at,
    },
  };
}

export const supabaseLearningRepository: LearningRepository = {
  async getProfile(userId) {
    const supabase = await client();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw dbError(error);
    return data ? toProfile(data as ProfileRow) : null;
  },

  /**
   * Read-first, never upsert. The sign-up trigger normally creates the row; an
   * upsert would also write `id` on conflict, which the column grants in
   * 0001_init.sql deliberately forbid (Postgres 42501). Identity fields are
   * refreshed only when they changed, and never overwritten with null.
   */
  async ensureProfile(user: AuthUser) {
    const supabase = await client();
    const { data: existing, error: readError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    if (readError) throw dbError(readError);

    if (existing) {
      const row = existing as ProfileRow;
      const changes: Partial<ProfileRow> = {};
      if (user.displayName && user.displayName !== row.display_name) {
        changes.display_name = user.displayName;
      }
      if (user.email && user.email !== row.email) changes.email = user.email;
      if (user.avatarUrl && user.avatarUrl !== row.avatar_url) {
        changes.avatar_url = user.avatarUrl;
      }
      if (Object.keys(changes).length === 0) return toProfile(row);

      const { data, error } = await supabase
        .from("profiles")
        .update(changes)
        .eq("id", user.id)
        .select("*")
        .single();
      if (error) throw dbError(error);
      return toProfile(data as ProfileRow);
    }

    // Fallback for accounts created before the trigger existed.
    const { error: insertError } = await supabase.from("profiles").insert({
      id: user.id,
      display_name: user.displayName,
      email: user.email,
      avatar_url: user.avatarUrl,
    });
    if (insertError && insertError.code !== UNIQUE_VIOLATION) throw dbError(insertError);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (error) throw dbError(error);
    return toProfile(data as ProfileRow);
  },

  async saveOnboarding(userId, input) {
    const supabase = await client();
    const { error } = await supabase
      .from("profiles")
      .update({
        baseline_score: input.baselineScore,
        daily_minutes: input.dailyMinutes,
        onboarding_complete: true,
        enrolled_on: new Date().toISOString().slice(0, 10),
        ...(input.displayName ? { display_name: input.displayName } : {}),
      })
      .eq("id", userId);
    if (error) throw dbError(error);
  },

  async getTaskCompletions(userId, timeZone) {
    const supabase = await client();
    const { data, error } = await supabase
      .from("user_task_progress")
      .select("task_ref, completed_at")
      .eq("user_id", userId)
      .eq("status", "completed");
    if (error) throw dbError(error);
    return ((data ?? []) as { task_ref: string; completed_at: string | null }[]).map(
      (row) => ({
        taskId: row.task_ref,
        completedOn: row.completed_at
          ? dayKey(row.completed_at, timeZone)
          : "1970-01-01",
      }),
    );
  },

  async recordTaskCompletion(userId, taskId) {
    const supabase = await client();
    // Completion rows are insert-only (see 0001_init.sql); the database awards
    // the points by trigger. A unique violation means it is already recorded.
    const { error } = await supabase.from("user_task_progress").insert({
      user_id: userId,
      task_ref: taskId,
      status: "completed",
      completed_at: new Date().toISOString(),
      points: POINTS_PER_TASK,
    });
    if (error && error.code !== UNIQUE_VIOLATION) throw dbError(error);
  },

  async recordLessonCompletion(userId, lessonId) {
    const supabase = await client();
    const { error } = await supabase.from("user_lesson_progress").upsert(
      {
        user_id: userId,
        lesson_ref: lessonId,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,lesson_ref" },
    );
    if (error) throw dbError(error);
  },

  async getProgressSummary(userId, timeZone): Promise<ProgressSummary> {
    const supabase = await client();
    const now = new Date();
    const today = dayKey(now, timeZone);

    const [profileRes, tasksRes, cardsRes, reviewsRes, lessonsRes] =
      await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        supabase
          .from("user_task_progress")
          .select("task_ref, completed_at")
          .eq("user_id", userId)
          .eq("status", "completed"),
        supabase
          .from("user_cards")
          .select("due_at, repetitions")
          .eq("user_id", userId),
        supabase
          .from("review_events")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId),
        supabase
          .from("user_lesson_progress")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId),
      ]);

    const profile = profileRes.data
      ? toProfile(profileRes.data as ProfileRow)
      : null;
    const tasks = (tasksRes.data ?? []) as {
      task_ref: string;
      completed_at: string | null;
    }[];
    const cards = (cardsRes.data ?? []) as {
      due_at: string;
      repetitions: number;
    }[];

    return {
      skillScore: computeSkillScore(
        profile?.baselineScore ?? 0,
        profile?.progressPoints ?? 0,
      ),
      baselineScore: profile?.baselineScore ?? 0,
      tasksCompletedToday: tasks.filter(
        (t) => t.completed_at && dayKey(t.completed_at, timeZone) === today,
      ).length,
      tasksCompletedTotal: tasks.length,
      wordsLearned: cards.filter((c) => c.repetitions > 0).length,
      reviewsCompleted: reviewsRes.count ?? 0,
      currentProgramDay: resolveCurrentDay(
        PROGRAM_DAYS,
        tasks.map((t) => ({
          taskId: t.task_ref,
          completedOn: t.completed_at
            ? dayKey(t.completed_at, timeZone)
            : "1970-01-01",
        })),
        today,
      ),
      dueReviewCount: cards.filter(
        (c) => new Date(c.due_at).getTime() <= now.getTime(),
      ).length,
      listeningCompleted: lessonsRes.count ?? 0,
    };
  },
};

export const supabaseReviewRepository: ReviewRepository = {
  async getDueCards(userId, limit, setKey, timeZone = DEFAULT_TIME_ZONE) {
    const supabase = await client();
    const now = new Date();

    if (setKey) {
      const items = await seedContentRepository.getVocabularySet(setKey);
      const { data: existing, error } = await supabase
        .from("user_cards")
        .select("vocabulary_ref, created_at")
        .eq("user_id", userId)
        .in(
          "vocabulary_ref",
          items.map((item) => item.id),
        );
      if (error) throw dbError(error);

      const rows = (existing ?? []) as {
        vocabulary_ref: string;
        created_at: string;
      }[];
      const known = new Set(rows.map((row) => row.vocabulary_ref));

      // Daily allowance per set, counted from introductions (created_at), so
      // grading and re-rendering can never refill the queue mid-session.
      const today = dayKey(now, timeZone);
      const budget = newCardAllowance(
        rows.filter((row) => dayKey(row.created_at, timeZone) === today).length,
      );

      const fresh = items
        .filter((item) => !known.has(item.id))
        .slice(0, budget);

      if (fresh.length > 0) {
        const base = initialCardState(now);
        const { error: insertError } = await supabase.from("user_cards").insert(
          fresh.map((item) => ({
            user_id: userId,
            vocabulary_ref: item.id,
            due_at: base.dueAt,
            interval_days: base.intervalDays,
            ease_factor: base.easeFactor,
            repetitions: base.repetitions,
          })),
        );
        if (insertError) throw dbError(insertError);
      }

      const { data, error: dueError } = await supabase
        .from("user_cards")
        .select("*")
        .eq("user_id", userId)
        .in(
          "vocabulary_ref",
          items.map((item) => item.id),
        )
        .lte("due_at", now.toISOString())
        .order("due_at", { ascending: true })
        .limit(limit);
      if (dueError) throw dbError(dueError);
      return ((data ?? []) as CardRow[])
        .map(toReviewCard)
        .filter((card): card is ReviewCard => card !== null);
    }

    const { data, error } = await supabase
      .from("user_cards")
      .select("*")
      .eq("user_id", userId)
      .lte("due_at", now.toISOString())
      .order("due_at", { ascending: true })
      .limit(limit);
    if (error) throw dbError(error);
    return ((data ?? []) as CardRow[])
      .map(toReviewCard)
      .filter((card): card is ReviewCard => card !== null);
  },

  async countDueCards(userId) {
    const supabase = await client();
    const { count, error } = await supabase
      .from("user_cards")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .lte("due_at", new Date().toISOString());
    if (error) throw dbError(error);
    return count ?? 0;
  },

  async recordReview(
    userId: string,
    cardId: string,
    grade: ReviewGrade,
    result: ReviewResult,
  ) {
    const supabase = await client();
    const now = new Date().toISOString();

    // Ownership is enforced by RLS; the explicit user_id filter keeps the
    // intent obvious and fails closed if a policy is ever relaxed.
    const { error: updateError } = await supabase
      .from("user_cards")
      .update({
        due_at: result.next.dueAt,
        interval_days: result.next.intervalDays,
        ease_factor: result.next.easeFactor,
        repetitions: result.next.repetitions,
        last_reviewed_at: now,
      })
      .eq("id", cardId)
      .eq("user_id", userId);
    if (updateError) throw dbError(updateError);

    const { error: eventError } = await supabase.from("review_events").insert({
      user_id: userId,
      user_card_id: cardId,
      grade,
      reviewed_at: now,
      old_due_at: result.previous.dueAt,
      new_due_at: result.next.dueAt,
      old_interval_days: result.previous.intervalDays,
      new_interval_days: result.next.intervalDays,
      // The rule lives in score.ts; a trigger adds it to the profile.
      points: pointsForReview(grade),
    });
    if (eventError) throw dbError(eventError);
  },
};
