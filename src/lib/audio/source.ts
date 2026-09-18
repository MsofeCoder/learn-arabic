import "server-only";
import { existsSync } from "node:fs";
import path from "node:path";
import type { Recording } from "@/domain/types";

/**
 * AudioSource — the one place that decides where a recording is played from.
 *
 *  1. `NEXT_PUBLIC_LESSON_AUDIO_BASE` set: a public object store (the Supabase
 *     Storage `lesson-audio` bucket in production) at `<base>/<storageKey>`.
 *  2. Otherwise, if the original file is on this machine: the local streaming
 *     route, which supports HTTP Range so seeking works in long lectures.
 *  3. Otherwise: null, and the lesson renders its no-audio state.
 *
 * A future ingestion pipeline only has to populate storage; no UI changes.
 */

const AUDIO_BASE = process.env.NEXT_PUBLIC_LESSON_AUDIO_BASE?.replace(/\/$/, "");

export const LOCAL_AUDIO_DIR =
  process.env.LISANFLOW_AUDIO_DIR ??
  path.join(process.cwd(), "sample-duroos-audios");

export function localRecordingPath(recording: Recording): string {
  // `localFile` comes from the checked-in manifest, never from the request,
  // so there is no path-traversal surface here.
  return path.join(LOCAL_AUDIO_DIR, recording.localFile);
}

export function resolveRecordingUrl(recording: Recording): string | null {
  if (AUDIO_BASE) {
    const key = recording.storageKey.split("/").map(encodeURIComponent).join("/");
    return `${AUDIO_BASE}/${key}`;
  }
  if (existsSync(localRecordingPath(recording))) {
    return `/api/audio/${recording.id}`;
  }
  return null;
}
