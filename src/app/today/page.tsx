import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { AppShell, TodayDateLine } from "@/components/layout/app-shell";
import { DailyFocus } from "@/components/learning/daily-focus";
import { MissionHero } from "@/components/learning/mission-hero";
import { MissionTaskCard } from "@/components/learning/mission-task-card";
import { nextMissionTask } from "@/domain/missions/engine";
import { computeSkillScore } from "@/domain/progress/score";
import { getCurrentUser } from "@/lib/auth/session";
import { getLearnerTimeZone } from "@/lib/time-zone";
import { getTodaysMission } from "@/lib/services/learning";
import { firstName } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Today" };

/** Learner state changes on every action, so this page is always fresh. */
export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth");

  const view = await getTodaysMission(user, new Date(), await getLearnerTimeZone());
  if (!view.profile.onboardingComplete) redirect("/onboarding");

  const { mission, profile, focusPhrases, totalDays, date, dateKey, timeZone } =
    view;
  const next = nextMissionTask(mission);
  const name = firstName(profile.displayName);

  return (
    <AppShell
      active="today"
      displayName={profile.displayName}
      avatarUrl={profile.avatarUrl}
      skillScore={computeSkillScore(
        profile.baselineScore,
        profile.progressPoints,
      )}
    >
      <div className="space-y-8">
        <header>
          {/* Not a heading: the mission title below is this page's h1. */}
          <p className="text-xl font-semibold tracking-tight text-ink-900">
            {name ? `As-salāmu ʿalaykum, ${name}` : "As-salāmu ʿalaykum"}
          </p>
          <TodayDateLine date={date} dateKey={dateKey} timeZone={timeZone} />
        </header>

        <MissionHero mission={mission} next={next} totalDays={totalDays} />

        <section aria-labelledby="tasks-heading">
          <h2
            id="tasks-heading"
            className="text-[13px] font-semibold tracking-[0.1em] text-ink-500 uppercase"
          >
            Your tasks
          </h2>
          <ul className="mt-3 space-y-2.5">
            {mission.tasks.map((task) => (
              <MissionTaskCard
                key={task.id}
                task={task}
                isNext={next?.id === task.id}
              />
            ))}
          </ul>
        </section>

        <DailyFocus items={focusPhrases} />
      </div>
    </AppShell>
  );
}
