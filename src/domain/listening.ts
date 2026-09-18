import type { ListeningSegment } from "@/domain/types";

/**
 * When a listening task counts as done.
 *
 * Completion requires real playback of most of the target window, so "Mark
 * listening complete" cannot be pressed on arrival. Only continuous forward
 * playback accrues time: seeking or scrubbing forward earns nothing, and only
 * time inside the target window counts.
 */

/** Share of the target the learner must actually hear. */
export const LISTEN_COMPLETION_RATIO = 0.8;

/** Free listening (no task window) asks for ten minutes, or the whole talk if shorter. */
export const FREE_LISTENING_TARGET_SECONDS = 10 * 60;

/**
 * Largest gap between two playback updates that still counts as continuous
 * listening. Browsers report progress about 4 times a second, and at 1.25×
 * speed that is well under a second of media; anything larger is a seek.
 */
export const MAX_CONTINUOUS_STEP_SECONDS = 1.5;

/** Seconds of audio the task is about. */
export function listeningTargetSeconds(
  segment: ListeningSegment | null,
  recordingSeconds: number | null,
): number {
  if (segment) return segment.endSeconds - segment.startSeconds;
  const whole = recordingSeconds ?? FREE_LISTENING_TARGET_SECONDS;
  return Math.min(whole, FREE_LISTENING_TARGET_SECONDS);
}

export function requiredListeningSeconds(targetSeconds: number): number {
  return Math.ceil(targetSeconds * LISTEN_COMPLETION_RATIO);
}

/**
 * Seconds to credit for one playback update, moving the playhead from
 * `previous` to `current`. Zero for seeks, pauses and rewinds; clipped to the
 * target window when there is one.
 */
export function creditedSeconds(
  previous: number,
  current: number,
  segment: ListeningSegment | null,
): number {
  const step = current - previous;
  if (!(step > 0) || step > MAX_CONTINUOUS_STEP_SECONDS) return 0;
  if (!segment) return step;

  const from = Math.max(previous, segment.startSeconds);
  const to = Math.min(current, segment.endSeconds);
  return Math.max(0, to - from);
}
