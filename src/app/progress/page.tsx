import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Headphones, Layers, RotateCcw } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { SkillScoreCard } from "@/components/learning/skill-score-card";
import { StatCard } from "@/components/learning/stat-card";
import { Card, CardBody } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { buttonClasses } from "@/components/ui/button";
import { PROGRAM } from "@/data/seed/program";
import { getCurrentUser } from "@/lib/auth/session";
import { getLearnerTimeZone } from "@/lib/time-zone";
import { getProfileForUser, getProgressSummary } from "@/lib/services/learning";
import { SignOutButton } from "@/components/layout/sign-out-button";

export const metadata: Metadata = { title: "Progress" };
export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth");

  const profile = await getProfileForUser(user);
  if (!profile.onboardingComplete) redirect("/onboarding");

  const summary = await getProgressSummary(user, await getLearnerTimeZone());
  const dayPercent = Math.round(
    ((summary.currentProgramDay - 1) / PROGRAM.totalDays) * 100,
  );

  return (
    <AppShell
      active="progress"
      displayName={profile.displayName}
      avatarUrl={profile.avatarUrl}
      skillScore={summary.skillScore}
    >
      <div className="space-y-8">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
            Your progress
          </h1>
          <p className="mt-1 text-[15px] text-ink-600">
            {profile.displayName ?? "Learner"} ·{" "}
            {profile.dailyMinutes} minutes a day
          </p>
        </header>

        <SkillScoreCard
          score={summary.skillScore}
          baseline={summary.baselineScore}
          progressPoints={profile.progressPoints}
        />

        <section aria-labelledby="stats-heading">
          <h2
            id="stats-heading"
            className="text-[13px] font-semibold tracking-[0.1em] text-ink-500 uppercase"
          >
            Your work so far
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              icon={<CheckCircle2 className="size-5" aria-hidden="true" />}
              label="Tasks completed"
              value={summary.tasksCompletedTotal}
              hint={`${summary.tasksCompletedToday} today`}
            />
            <StatCard
              icon={<Layers className="size-5" aria-hidden="true" />}
              label="Words learned"
              value={summary.wordsLearned}
              hint="Cards you have recalled"
            />
            <StatCard
              icon={<RotateCcw className="size-5" aria-hidden="true" />}
              label="Reviews done"
              value={summary.reviewsCompleted}
              hint={
                summary.dueReviewCount > 0
                  ? `${summary.dueReviewCount} due now`
                  : "Nothing due"
              }
            />
            <StatCard
              icon={<Headphones className="size-5" aria-hidden="true" />}
              label="Lessons listened"
              value={summary.listeningCompleted}
              hint="Listening sessions"
            />
          </div>
        </section>

        <section aria-labelledby="program-heading">
          <h2
            id="program-heading"
            className="text-[13px] font-semibold tracking-[0.1em] text-ink-500 uppercase"
          >
            Current program
          </h2>
          <Card className="mt-3">
            <CardBody>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-[17px] font-semibold text-ink-900">
                  {PROGRAM.title}
                </p>
                <p className="text-sm text-ink-500">
                  Day {summary.currentProgramDay} of {PROGRAM.totalDays}
                </p>
              </div>
              <Progress
                className="mt-4"
                value={dayPercent}
                label={`Program is ${dayPercent}% complete`}
              />
              <div className="mt-5">
                <Link href="/today" className={buttonClasses({ size: "md" })}>
                  Go to today&rsquo;s mission
                </Link>
              </div>
            </CardBody>
          </Card>
        </section>

        <section aria-labelledby="account-heading" className="pt-2">
          <h2
            id="account-heading"
            className="text-[13px] font-semibold tracking-[0.1em] text-ink-500 uppercase"
          >
            Account
          </h2>
          <Card className="mt-3">
            <CardBody className="flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate text-[15px] font-medium text-ink-900">
                  {profile.displayName ?? "Learner"}
                </p>
                {profile.email ? (
                  <p className="truncate text-sm text-ink-500">
                    {profile.email}
                  </p>
                ) : null}
              </div>
              <SignOutButton />
            </CardBody>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
