import { promises as fs } from "node:fs";
import path from "node:path";
import type { Profile, ReviewGrade, UserCard } from "@/domain/types";

/**
 * Local development store used when Supabase credentials are absent.
 *
 * It keeps the whole product runnable end-to-end — including persistence across
 * refreshes — without an external dependency (master prompt §29). State lives in
 * a gitignored JSON file, with an in-memory fallback if the filesystem is
 * read-only. This is never used when Supabase is configured.
 */

export interface LocalReviewEvent {
  cardId: string;
  grade: ReviewGrade;
  reviewedAt: string;
  oldDueAt: string;
  newDueAt: string;
  oldIntervalDays: number;
  newIntervalDays: number;
}

/** A card plus the day it was first shown, for the daily new-card allowance. */
export type LocalCard = UserCard & { introducedOn?: string };

export interface LocalUserRecord {
  profile: Profile;
  completedTaskIds: string[];
  /** taskId -> ISO timestamp of completion (older records: yyyy-mm-dd). */
  completionDates: Record<string, string>;
  completedLessonIds: string[];
  cards: Record<string, LocalCard>;
  reviewEvents: LocalReviewEvent[];
}

interface LocalDatabase {
  users: Record<string, LocalUserRecord>;
}

// Overridable so tests can point the store at a temporary directory.
const DATA_DIR =
  process.env.LISANFLOW_DATA_DIR ?? path.join(process.cwd(), ".lisanflow");
const DATA_FILE = path.join(DATA_DIR, "state.json");

let cache: LocalDatabase | null = null;
let fileWritable = true;
/** Serialises read-modify-write cycles so concurrent server actions cannot clobber each other. */
let queue: Promise<unknown> = Promise.resolve();

async function load(): Promise<LocalDatabase> {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    cache = JSON.parse(raw) as LocalDatabase;
  } catch {
    cache = { users: {} };
  }
  return cache;
}

async function persist(db: LocalDatabase): Promise<void> {
  cache = db;
  if (!fileWritable) return;
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
  } catch {
    // Read-only filesystem (e.g. a serverless runtime): degrade to memory only.
    fileWritable = false;
  }
}

/** Runs `fn` against the store with exclusive access, persisting any mutation. */
export function withStore<T>(
  fn: (db: LocalDatabase) => Promise<T> | T,
  mutates = false,
): Promise<T> {
  const next = queue.then(async () => {
    const db = await load();
    const result = await fn(db);
    if (mutates) await persist(db);
    return result;
  });
  // Keep the chain alive even if one operation rejects.
  queue = next.catch(() => undefined);
  return next;
}

export function emptyRecord(profile: Profile): LocalUserRecord {
  return {
    profile,
    completedTaskIds: [],
    completionDates: {},
    completedLessonIds: [],
    cards: {},
    reviewEvents: [],
  };
}

/** Test-only helper: drops cached state so suites start from a clean store. */
export function __resetLocalStoreCache(): void {
  cache = null;
}
