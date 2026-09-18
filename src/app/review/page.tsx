import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Layers } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ReviewSession } from "@/components/learning/review-session";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonClasses } from "@/components/ui/button";
import { computeSkillScore } from "@/domain/progress/score";
import { getCurrentUser } from "@/lib/auth/session";
import { getLearnerTimeZone } from "@/lib/time-zone";
import { getProfileForUser, getReviewQueue } from "@/lib/services/learning";

export const metadata: Metadata = { title: "Review" };
export const dynamic = "force-dynamic";

const SET_LABELS: Record<string, string> = {
  "lecture-phrase": "Lecture phrases",
  "core-vocabulary": "Core vocabulary",
  "survival-phrase": "Classroom phrases",
};

interface ReviewPageProps {
  searchParams: Promise<{ set?: string; task?: string }>;
}

export default async function ReviewPage({ searchParams }: ReviewPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth");

  const profile = await getProfileForUser(user);
  if (!profile.onboardingComplete) redirect("/onboarding");

  const { set, task } = await searchParams;
  const setKey = set && SET_LABELS[set] ? set : undefined;
  const cards = await getReviewQueue(user, {
    setKey,
    timeZone: await getLearnerTimeZone(),
  });

  return (
    <AppShell
      active="review"
      width="narrow"
      displayName={profile.displayName}
      avatarUrl={profile.avatarUrl}
      skillScore={computeSkillScore(
        profile.baselineScore,
        profile.progressPoints,
      )}
    >
      {/* With a mission task in hand, an empty queue is still a finish line:
          ReviewSession's done state lets the learner complete the task. */}
      {cards.length === 0 && !task ? (
        <>
        <h1 className="sr-only">Review</h1>
        <EmptyState
          icon={<Layers className="size-6" aria-hidden="true" />}
          title="No cards due right now"
          description="Your schedule is clear. New cards arrive when you start a vocabulary task from today's mission."
          action={
            <Link href="/today" className={buttonClasses({ size: "md" })}>
              Back to today&rsquo;s mission
            </Link>
          }
        />
        </>
      ) : (
        <ReviewSession
          cards={cards}
          taskId={task ?? null}
          setLabel={setKey ? SET_LABELS[setKey] : null}
        />
      )}
    </AppShell>
  );
}
