"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { completeOnboarding } from "@/app/actions";
import { DAILY_MINUTES_OPTIONS, type DailyMinutes } from "@/domain/types";
import { cn } from "@/lib/utils/cn";

/** One question per step, no advanced settings exposed. */
const SKILL_BANDS = [
  { value: 1, label: "Beginner", hint: "Letters and a few words" },
  { value: 3, label: "Basic", hint: "I catch familiar words" },
  { value: 5, label: "Developing", hint: "I follow simple speech" },
  { value: 7, label: "Strong", hint: "I follow most lectures" },
  { value: 9, label: "Advanced", hint: "I follow comfortably" },
] as const;

const MINUTE_HINTS: Record<DailyMinutes, string> = {
  10: "A focused short session",
  15: "A steady daily habit",
  20: "The recommended pace",
  30: "Serious preparation",
};

const TOTAL_STEPS = 3;

export function OnboardingFlow({ programTitle }: { programTitle: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [baselineScore, setBaselineScore] = useState<number | null>(null);
  const [dailyMinutes, setDailyMinutes] = useState<DailyMinutes | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function finish() {
    if (baselineScore === null || dailyMinutes === null) return;
    setPending(true);
    setError(null);

    const result = await completeOnboarding({ baselineScore, dailyMinutes });
    if (!result.ok) {
      setError(result.error ?? "We could not save that. Please try again.");
      setPending(false);
      return;
    }

    router.push("/today");
    router.refresh();
  }

  return (
    <div className="w-full max-w-lg">
      <h1 className="sr-only">Set up LisanFlow</h1>
      <Progress
        value={((step + 1) / TOTAL_STEPS) * 100}
        label={`Step ${step + 1} of ${TOTAL_STEPS}`}
      />
      <p className="mt-2 text-[13px] text-ink-500">
        Step {step + 1} of {TOTAL_STEPS}
      </p>

      <div className="mt-6 rounded-2xl border border-line bg-white p-6 shadow-card sm:p-8">
        {step === 0 ? (
          <fieldset>
            <legend className="text-xl font-semibold tracking-tight text-ink-900">
              How comfortable are you with Arabic today?
            </legend>
            <p className="mt-2 text-[15px] text-ink-600">
              This only sets your starting point. Nothing is locked in.
            </p>

            <div className="mt-6 space-y-2.5">
              {SKILL_BANDS.map((band) => (
                <button
                  key={band.value}
                  type="button"
                  onClick={() => {
                    setBaselineScore(band.value);
                    setStep(1);
                  }}
                  aria-pressed={baselineScore === band.value}
                  className={cn(
                    "flex min-h-[64px] w-full items-center gap-4 rounded-xl border px-4 py-3 text-start transition-colors",
                    baselineScore === band.value
                      ? "border-brand bg-emerald-soft"
                      : "border-line hover:border-line-strong hover:bg-sand-50",
                  )}
                >
                  <span className="flex-1">
                    <span className="block text-[15px] font-medium text-ink-900">
                      {band.label}
                    </span>
                    <span className="block text-[13px] text-ink-500">
                      {band.hint}
                    </span>
                  </span>
                  <span className="text-sm font-semibold tabular-nums text-ink-400">
                    {band.value}/10
                  </span>
                </button>
              ))}
            </div>
          </fieldset>
        ) : null}

        {step === 1 ? (
          <fieldset>
            <legend className="text-xl font-semibold tracking-tight text-ink-900">
              How many minutes can you give Arabic each day?
            </legend>
            <p className="mt-2 text-[15px] text-ink-600">
              Your daily mission is sized to fit this.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-2.5">
              {DAILY_MINUTES_OPTIONS.map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  onClick={() => {
                    setDailyMinutes(minutes);
                    setStep(2);
                  }}
                  aria-pressed={dailyMinutes === minutes}
                  className={cn(
                    "min-h-[88px] rounded-xl border px-4 py-4 text-start transition-colors",
                    dailyMinutes === minutes
                      ? "border-brand bg-emerald-soft"
                      : "border-line hover:border-line-strong hover:bg-sand-50",
                  )}
                >
                  <span className="block text-xl font-semibold text-ink-900">
                    {minutes === 30 ? "30+" : minutes} min
                  </span>
                  <span className="mt-1 block text-[13px] leading-snug text-ink-500">
                    {MINUTE_HINTS[minutes]}
                  </span>
                </button>
              ))}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="mt-5"
              onClick={() => setStep(0)}
            >
              Back
            </Button>
          </fieldset>
        ) : null}

        {step === 2 ? (
          <div>
            <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-soft text-brand-deep">
              <Sparkles className="size-5" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-xl font-semibold tracking-tight text-ink-900">
              Your first program is ready
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-600">
              <span className="font-medium text-ink-900">{programTitle}</span> —
              five days of lecture phrases, core vocabulary and targeted
              listening, sized to {dailyMinutes} minutes a day.
            </p>

            <ul className="mt-5 space-y-2 border-t border-line pt-5">
              {[
                "A single mission each day, never a course catalogue",
                "Cards return exactly when you are about to forget them",
                "Listening built from the phrases you just learned",
              ].map((line) => (
                <li
                  key={line}
                  className="flex items-start gap-2.5 text-[15px] text-ink-700"
                >
                  <Check
                    className="mt-1 size-4 shrink-0 text-brand"
                    aria-hidden="true"
                  />
                  {line}
                </li>
              ))}
            </ul>

            {error ? (
              <p
                role="alert"
                className="mt-5 rounded-xl border border-rose-line bg-rose-soft px-4 py-3 text-sm text-rose-ink"
              >
                {error}
              </p>
            ) : null}

            <Button
              size="lg"
              fullWidth
              className="mt-6"
              onClick={finish}
              loading={pending}
            >
              Start Day 1
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => setStep(1)}
              disabled={pending}
            >
              Back
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
