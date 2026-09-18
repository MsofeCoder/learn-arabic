import { isSupabaseConfigured } from "@/lib/env";
import { seedContentRepository } from "./content.seed";
import {
  localLearningRepository,
  localReviewRepository,
} from "./learning.local";
import {
  supabaseLearningRepository,
  supabaseReviewRepository,
} from "./learning.supabase";
import type {
  ContentRepository,
  LearningRepository,
  ReviewRepository,
} from "./types";

/**
 * Repository selection, decided once at module load.
 *
 * With Supabase credentials present the app is fully backed by Postgres + RLS.
 * Without them it runs in local mode so the learning loop is testable before
 * infrastructure exists. Nothing above this file knows which adapter is active.
 */

export const contentRepository: ContentRepository = seedContentRepository;

export const learningRepository: LearningRepository = isSupabaseConfigured
  ? supabaseLearningRepository
  : localLearningRepository;

export const reviewRepository: ReviewRepository = isSupabaseConfigured
  ? supabaseReviewRepository
  : localReviewRepository;

export const dataMode: "supabase" | "local" = isSupabaseConfigured
  ? "supabase"
  : "local";

export type {
  ContentRepository,
  LearningRepository,
  ReviewRepository,
} from "./types";
