"use client";

import { useSyncExternalStore } from "react";
import { Headphones } from "lucide-react";
import {
  AudioPlayer,
  AudioUnavailable,
} from "@/components/learning/audio-player";
import { CompleteLessonButton } from "@/components/learning/complete-lesson-button";
import { Progress } from "@/components/ui/progress";
import {
  listeningTargetSeconds,
  requiredListeningSeconds,
} from "@/domain/listening";
import type { ListeningSegment } from "@/domain/types";
import { formatSeconds } from "@/lib/utils/format";

interface ListeningSessionProps {
  lessonId: string;
  taskId: string | null;
  title: string;
  audioUrl: string | null;
  durationSeconds: number | null;
  segment: ListeningSegment | null;
  /** Guide and practice material, rendered between the player and the button. */
  children: React.ReactNode;
}

function storageKey(lessonId: string, taskId: string | null): string {
  // Per task, not per lesson: day 2 and day 3 reuse the same recording, and
  // day 2's listening must not pre-unlock day 3.
  return `lf-listened:${lessonId}:${taskId ?? "free"}`;
}

function readSaved(key: string): number {
  try {
    const value = Number(window.localStorage.getItem(key));
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

/**
 * localStorage is the single source of truth for listened time, exposed to
 * React through useSyncExternalStore. Storage-blocked browsers fall back to an
 * in-memory value, so the gate still works — it just won't survive a reload.
 */
const memory = new Map<string, number>();
const listeners = new Set<() => void>();

function readListened(key: string): number {
  return Math.max(memory.get(key) ?? 0, readSaved(key));
}

function addListened(key: string, seconds: number, cap: number): void {
  const next = Math.min(cap, readListened(key) + seconds);
  memory.set(key, next);
  try {
    // Full precision: rounding each write would bias the total upwards,
    // because reads take the larger of the stored and in-memory values.
    window.localStorage.setItem(key, String(next));
  } catch {
    // Storage blocked (private mode): the in-memory value still counts.
  }
  listeners.forEach((notify) => notify());
}

function subscribe(notify: () => void): () => void {
  listeners.add(notify);
  return () => listeners.delete(notify);
}

/**
 * A listening task: the player, the learner's accumulated listening, and a
 * completion button that unlocks only after most of the target has genuinely
 * been heard. Listened time survives a reload on this device.
 *
 * With no reachable audio the task falls back to transcript study and the
 * button is never locked — there is nothing to listen to.
 */
export function ListeningSession({
  lessonId,
  taskId,
  title,
  audioUrl,
  durationSeconds,
  segment,
  children,
}: ListeningSessionProps) {
  const key = storageKey(lessonId, taskId);
  const target = listeningTargetSeconds(segment, durationSeconds);
  const required = requiredListeningSeconds(target);

  // Server snapshot is 0: storage only exists in the browser.
  const listened = useSyncExternalStore(
    subscribe,
    () => readListened(key),
    () => 0,
  );

  const onListen = (seconds: number) => addListened(key, seconds, target);

  const hasAudio = Boolean(audioUrl);
  const unlocked = !hasAudio || listened >= required;
  const percent = Math.round((Math.min(listened, required) / required) * 100);

  return (
    <>
      {audioUrl ? (
        <AudioPlayer
          src={audioUrl}
          title={title}
          fallbackDuration={durationSeconds}
          segment={segment}
          onListen={onListen}
        />
      ) : (
        <AudioUnavailable />
      )}

      {children}

      <div className="space-y-3">
        {hasAudio && !unlocked ? (
          <div className="rounded-xl border border-line bg-white px-4 py-3.5">
            <p className="flex items-center gap-2 text-sm text-ink-700">
              <Headphones
                className="size-4 shrink-0 text-ink-500"
                aria-hidden="true"
              />
              <span>
                Listen to{" "}
                <strong className="font-semibold">
                  {formatSeconds(required)}
                </strong>{" "}
                {segment ? "of today’s window" : "of this recording"} to finish
                —{" "}
                <span className="tabular-nums">{formatSeconds(listened)}</span>{" "}
                so far.
              </span>
            </p>
            <Progress
              className="mt-2.5"
              value={percent}
              label={`Listened ${formatSeconds(listened)} of ${formatSeconds(required)} needed`}
            />
          </div>
        ) : null}

        <CompleteLessonButton
          lessonId={lessonId}
          taskId={taskId}
          locked={!unlocked}
        />
      </div>
    </>
  );
}
