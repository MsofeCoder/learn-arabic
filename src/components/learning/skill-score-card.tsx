import { Info } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  describeSkillScore,
  progressToNextPoint,
  SCORE_DISCLAIMER,
} from "@/domain/progress/score";

interface SkillScoreCardProps {
  score: number;
  baseline: number;
  progressPoints: number;
}

/**
 * The 0-10 learning score. The disclaimer is part of the component, not an
 * optional extra: this must never read as a proficiency assessment.
 */
export function SkillScoreCard({
  score,
  baseline,
  progressPoints,
}: SkillScoreCardProps) {
  const toNext = progressToNextPoint(baseline, progressPoints);

  return (
    <Card>
      <CardBody>
        <p className="text-[13px] font-semibold tracking-[0.1em] text-ink-500 uppercase">
          Learning score
        </p>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-5xl font-semibold tracking-tight tabular-nums text-ink-900">
            {score.toFixed(1)}
          </span>
          <span className="text-xl text-ink-400">/ 10</span>
        </div>

        <p className="mt-2 text-[15px] text-ink-700">
          {describeSkillScore(score)}
        </p>

        {score < 10 ? (
          <div className="mt-5">
            <Progress
              value={toNext}
              label={`${toNext}% of the way to the next point`}
            />
            <p className="mt-2 text-[13px] text-ink-500">
              {toNext}% towards {(Math.floor(score) + 1).toFixed(1)} — you
              started at {baseline.toFixed(1)}.
            </p>
          </div>
        ) : null}

        <p className="mt-5 flex items-start gap-2 border-t border-line pt-4 text-[12px] leading-relaxed text-ink-400">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          {SCORE_DISCLAIMER}
        </p>
      </CardBody>
    </Card>
  );
}
