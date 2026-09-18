import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Mic, Target } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ArabicText } from "@/components/learning/arabic-text";
import { ListeningSession } from "@/components/learning/listening-session";
import { PracticePhrases } from "@/components/learning/practice-phrases";
import { Badge } from "@/components/ui/badge";
import { RECORDINGS } from "@/data/seed/recordings";
import { computeSkillScore } from "@/domain/progress/score";
import { getCurrentUser } from "@/lib/auth/session";
import { contentRepository } from "@/lib/repositories";
import { getProfileForUser } from "@/lib/services/learning";
import { formatSeconds } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export const dynamic = "force-dynamic";

interface ListenPageProps {
  params: Promise<{ lessonId: string }>;
  searchParams: Promise<{ task?: string }>;
}

export async function generateMetadata({
  params,
}: ListenPageProps): Promise<Metadata> {
  const { lessonId } = await params;
  const lesson = await contentRepository.getLesson(lessonId);
  return { title: lesson?.title ?? "Listening" };
}

export default async function ListenPage({
  params,
  searchParams,
}: ListenPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth");

  const profile = await getProfileForUser(user);
  if (!profile.onboardingComplete) redirect("/onboarding");

  const { lessonId } = await params;
  const { task } = await searchParams;
  const lesson = await contentRepository.getLesson(lessonId);
  if (!lesson) notFound();

  const recording = lesson.recording;
  const series = recording
    ? RECORDINGS.filter((r) => r.series === recording.series)
    : [];

  return (
    <AppShell
      active="today"
      width="narrow"
      displayName={profile.displayName}
      avatarUrl={profile.avatarUrl}
      skillScore={computeSkillScore(
        profile.baselineScore,
        profile.progressPoints,
      )}
    >
      <div className="space-y-6">
        <Link
          href="/today"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 transition-colors hover:text-ink-700"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Today&rsquo;s mission
        </Link>

        <header>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="brand">Listening</Badge>
            {lesson.speaker ? (
              <Badge tone="muted">
                <Mic className="size-3.5" aria-hidden="true" />
                {lesson.speaker}
              </Badge>
            ) : null}
          </div>
          <h1 className="mt-3 text-2xl leading-tight font-semibold tracking-tight text-ink-900 sm:text-[28px]">
            {lesson.title}
          </h1>
          {recording ? (
            <div className="mt-2">
              <ArabicText size="sm" className="text-ink-700">
                {recording.titleAr}
              </ArabicText>
              <ArabicText as="p" size="sm" className="text-[15px] text-ink-500">
                {recording.speakerAr}
              </ArabicText>
            </div>
          ) : null}
          <p className="mt-2 text-[15px] leading-relaxed text-ink-600">
            {lesson.description}
          </p>
        </header>

        <div className="flex items-start gap-3 rounded-xl border border-emerald-muted bg-emerald-soft px-4 py-3.5">
          <Target
            className="mt-0.5 size-4 shrink-0 text-brand-deep"
            aria-hidden="true"
          />
          <p className="text-sm leading-relaxed text-brand-deep">
            <span className="font-semibold">Your goal: </span>
            {lesson.objective}
          </p>
        </div>

        <ListeningSession
          lessonId={lesson.id}
          taskId={task ?? null}
          title={lesson.title}
          audioUrl={lesson.audioUrl}
          durationSeconds={lesson.durationSeconds}
          segment={lesson.segment}
        >
          {lesson.guide.length > 0 ? (
            <section
              aria-labelledby="guide-heading"
              className="rounded-2xl border border-line bg-white p-5 shadow-card"
            >
              <h2
                id="guide-heading"
                className="text-[15px] font-semibold text-ink-900"
              >
                How to listen
              </h2>
              <ol className="mt-3 space-y-2.5">
                {lesson.guide.map((step, index) => (
                  <li
                    key={step}
                    className="flex gap-3 text-[15px] text-ink-700"
                  >
                    <span
                      aria-hidden="true"
                      className="flex size-6 shrink-0 items-center justify-center rounded-full bg-sand-200 text-xs font-semibold text-ink-600"
                    >
                      {index + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          <PracticePhrases
            lines={lesson.practicePhrases}
            defaultOpen={!lesson.audioUrl}
          />
        </ListeningSession>

        {series.length > 1 ? (
          <section aria-labelledby="series-heading" className="pt-2">
            <h2
              id="series-heading"
              className="text-[13px] font-semibold tracking-[0.1em] text-ink-500 uppercase"
            >
              The full series
            </h2>
            <ul className="mt-3 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white shadow-card">
              {series.map((item) => {
                // aria-current only when the row IS this page; a program lesson
                // built on this part is highlighted but is a different page.
                const isPage = item.id === lesson.id;
                const isSource = item.id === recording?.id;
                return (
                  <li key={item.id}>
                    <Link
                      href={`/listen/${item.id}`}
                      aria-current={isPage ? "page" : undefined}
                      className={cn(
                        "flex min-h-[56px] items-center gap-3 px-4 py-3 transition-colors hover:bg-sand-50",
                        isSource && "bg-emerald-soft/50",
                      )}
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sand-200 text-xs font-semibold tabular-nums text-ink-600">
                        {item.part}
                      </span>
                      <span className="min-w-0 flex-1 text-[14px] font-medium text-ink-800">
                        Part {item.part}
                        {isSource && !isPage ? (
                          <span className="ms-2 text-xs font-normal text-brand-deep">
                            used in this task
                          </span>
                        ) : null}
                      </span>
                      <span className="text-xs tabular-nums text-ink-400">
                        {formatSeconds(item.durationSeconds)}
                      </span>
                      <ChevronRight
                        className="size-4 shrink-0 text-ink-400"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}
      </div>
    </AppShell>
  );
}
