"use client";

import { useEffect, useRef, useState } from "react";
import {
  AudioLines,
  CheckCircle2,
  Pause,
  Play,
  RotateCcw,
  Rewind,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { creditedSeconds } from "@/domain/listening";
import type { ListeningSegment } from "@/domain/types";
import { formatSeconds } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

const SPEEDS = [0.75, 1, 1.25] as const;
const SKIP_BACK_SECONDS = 10;

interface AudioPlayerProps {
  src: string;
  title: string;
  /** Falls back to the seeded duration until metadata loads. */
  fallbackDuration: number | null;
  /** The window this task targets. Playback starts here and pauses once at its end. */
  segment: ListeningSegment | null;
  /** Called with seconds of genuine playback to credit (see domain/listening). */
  onListen?: (seconds: number) => void;
}

/**
 * Listening controls for a single audio source.
 *
 * Deliberately thin: it wraps the platform `<audio>` element rather than a
 * media library, so a future ingestion pipeline only has to supply a URL.
 * Layout uses logical properties so it stays usable beside RTL content.
 */
export function AudioPlayer({
  src,
  title,
  fallbackDuration,
  segment,
  onListen,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const positionedRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(segment?.startSeconds ?? 0);
  const [duration, setDuration] = useState(fallbackDuration ?? 0);
  const [speed, setSpeed] = useState<number>(1);
  const [error, setError] = useState(false);
  const [segmentDone, setSegmentDone] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.playbackRate = speed;
  }, [speed]);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      void audio.play().catch(() => setError(true));
    }
  }

  function seek(value: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setCurrent(value);
  }

  function onTimeUpdate(time: number) {
    setCurrent(time);
    const previous = lastTimeRef.current;
    lastTimeRef.current = time;
    if (onListen && previous !== null && !audioRef.current?.paused) {
      const credit = creditedSeconds(previous, time, segment);
      if (credit > 0) onListen(credit);
    }
    if (segment && !segmentDone && time >= segment.endSeconds) {
      audioRef.current?.pause();
      setSegmentDone(true);
    }
  }

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-amber-line bg-amber-soft px-4 py-3 text-sm text-amber-ink"
      >
        This recording could not be played right now. Check your connection
        and reload — the listening guide below still works without it.
      </div>
    );
  }

  const total = Math.max(duration, 1);
  const segStart = segment ? (segment.startSeconds / total) * 100 : 0;
  const segWidth = segment
    ? ((Math.min(segment.endSeconds, total) - segment.startSeconds) / total) *
      100
    : 0;

  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onError={() => setError(true)}
        onTimeUpdate={(event) => onTimeUpdate(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => {
          const audio = event.currentTarget;
          if (Number.isFinite(audio.duration)) setDuration(audio.duration);
          if (segment && !positionedRef.current) {
            positionedRef.current = true;
            audio.currentTime = segment.startSeconds;
          }
        }}
      />

      <div className="flex items-center gap-4">
        <Button
          type="button"
          size="lg"
          onClick={toggle}
          aria-label={playing ? `Pause ${title}` : `Play ${title}`}
          className="size-14 shrink-0 rounded-full p-0"
        >
          {playing ? (
            <Pause className="size-6" aria-hidden="true" />
          ) : (
            <Play className="size-6 translate-x-0.5" aria-hidden="true" />
          )}
        </Button>

        <div className="min-w-0 flex-1">
          <div className="relative">
            {segment ? (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-emerald-muted/70"
                style={{ insetInlineStart: `${segStart}%`, width: `${segWidth}%` }}
              />
            ) : null}
            <input
              type="range"
              min={0}
              max={total}
              step={1}
              value={Math.min(current, total)}
              onChange={(event) => seek(Number(event.target.value))}
              aria-label={`Seek within ${title}`}
              aria-valuetext={`${formatSeconds(current)} of ${formatSeconds(duration)}`}
              className="relative h-2 w-full cursor-pointer appearance-none rounded-full bg-sand-200/60 accent-[var(--color-brand)]"
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs tabular-nums text-ink-500">
            <span>{formatSeconds(current)}</span>
            <span>{formatSeconds(Math.max(0, duration - current))} left</span>
          </div>
        </div>
      </div>

      {segment ? (
        <p className="mt-3 text-[13px] text-ink-600">
          <span className="font-medium text-brand-deep">Today&rsquo;s window:</span>{" "}
          {formatSeconds(segment.startSeconds)}–{formatSeconds(segment.endSeconds)}
          <span className="text-ink-400"> of {formatSeconds(duration)}</span>
        </p>
      ) : null}

      {segmentDone ? (
        <p
          role="status"
          className="mt-3 flex items-start gap-2 rounded-xl border border-emerald-muted bg-emerald-soft px-3.5 py-2.5 text-[13px] text-brand-deep"
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Target window complete. Press play to keep listening, or mark the
          task done below.
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
        <span className="text-xs font-medium text-ink-500">Speed</span>
        <div role="group" aria-label="Playback speed" className="flex gap-1.5">
          {SPEEDS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setSpeed(value)}
              aria-pressed={speed === value}
              className={cn(
                "min-h-[36px] rounded-lg px-3 text-sm font-medium transition-colors",
                speed === value
                  ? "bg-emerald-soft text-brand-deep"
                  : "text-ink-500 hover:bg-sand-100",
              )}
            >
              {value}×
            </button>
          ))}
        </div>

        <div className="ms-auto flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => seek(Math.max(0, current - SKIP_BACK_SECONDS))}
            aria-label={`Back ${SKIP_BACK_SECONDS} seconds`}
          >
            <Rewind className="size-4" aria-hidden="true" />
            10s
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setSegmentDone(false);
              seek(segment?.startSeconds ?? 0);
            }}
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Restart
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Shown when a lesson has no reachable audio source. */
export function AudioUnavailable() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-line bg-white p-5 shadow-card">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-sand-200 text-ink-500">
        <AudioLines className="size-5" aria-hidden="true" />
      </span>
      <div>
        <p className="text-[15px] font-medium text-ink-900">
          This recording is not available right now
        </p>
        <p className="mt-1 text-sm leading-relaxed text-ink-600">
          Work through the practice sentences below instead — read each one
          aloud, then cover the English and read it again.
        </p>
      </div>
    </div>
  );
}
