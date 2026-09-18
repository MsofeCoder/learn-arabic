import Link from "next/link";
import { ArrowRight, Check, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Mission, MissionTask } from "@/domain/types";

interface MissionHeroProps {
  mission: Mission;
  next: MissionTask | null;
  totalDays: number;
}

/**
 * The flagship surface. It answers "what should I do today?" above the fold:
 * where you are in the program, what today builds, how long it takes, and one
 * dominant CTA pointing at exactly one next action.
 */
export function MissionHero({ mission, next, totalDays }: MissionHeroProps) {
  const isComplete = next === null;
  const started = mission.completedCount > 0;

  return (
    <section
      aria-labelledby="mission-title"
      className="overflow-hidden rounded-2xl border border-line bg-white shadow-card"
    >
      <div className="border-b border-line bg-emerald-soft/60 px-5 py-4 sm:px-7">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="text-[11px] font-semibold tracking-[0.14em] text-brand-deep">
            TODAY&rsquo;S MISSION
          </span>
          <span aria-hidden="true" className="text-emerald-muted">
            •
          </span>
          <span className="text-[11px] font-semibold tracking-[0.14em] text-ink-600">
            DAY {mission.program.dayNumber} OF {totalDays} · {mission.dayLabel}
          </span>
        </div>
      </div>

      <div className="px-5 py-6 sm:px-7 sm:py-7">
        <h1
          id="mission-title"
          className="text-[26px] leading-tight font-semibold tracking-tight text-ink-900 sm:text-[32px]"
        >
          {mission.title}
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-600 sm:text-base">
          {mission.objective}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {isComplete ? (
            <Badge tone="brand">
              <Check className="size-3.5" aria-hidden="true" />
              Done for today
            </Badge>
          ) : (
            <Badge tone="brand">
              <Clock className="size-3.5" aria-hidden="true" />
              {mission.estimatedMinutes} min left
            </Badge>
          )}
          <Badge tone="muted">
            {mission.completedCount} of {mission.tasks.length} tasks
          </Badge>
          {mission.dueReviewCount > 0 ? (
            <Badge tone="amber">{mission.dueReviewCount} cards due</Badge>
          ) : null}
        </div>

        <div className="mt-5">
          <Progress
            value={mission.percentComplete}
            label={`Today's mission is ${mission.percentComplete}% complete`}
          />
        </div>

        <div className="mt-6">
          {isComplete ? (
            <div className="rounded-xl border border-emerald-muted bg-emerald-soft px-4 py-4">
              <p className="text-[15px] font-medium text-brand-deep">
                Today&rsquo;s mission is complete.
              </p>
              <p className="mt-1 text-sm text-ink-600">
                Come back tomorrow for Day{" "}
                {Math.min(totalDays, mission.program.dayNumber + 1)} — or keep
                going with any cards that fall due.
              </p>
            </div>
          ) : (
            <>
              <Link
                href={next.href}
                className={buttonClasses({
                  size: "lg",
                  fullWidth: true,
                  className: "gap-2 sm:w-auto",
                })}
              >
                {started ? "Continue mission" : "Start mission"}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <p className="mt-3 text-sm text-ink-500">
                Next up: {next.title} · {next.estimatedMinutes} min
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
