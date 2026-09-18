import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarCheck, Headphones, Layers } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { ArabicText } from "@/components/learning/arabic-text";
import { buttonClasses } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const PILLARS = [
  {
    icon: CalendarCheck,
    title: "One mission a day",
    body: "Open the app and the next action is already decided. No course catalogue, no deciding where to start.",
  },
  {
    icon: Layers,
    title: "Vocabulary that sticks",
    body: "Lecture phrases and creed vocabulary on flashcards that return exactly when you are about to forget them.",
  },
  {
    icon: Headphones,
    title: "Listening you can follow",
    body: "Real lessons in short, targeted windows, so a lecture stops being a wall of sound.",
  },
];

interface LandingPageProps {
  searchParams: Promise<{ code?: string }>;
}

export default async function LandingPage({ searchParams }: LandingPageProps) {
  // Supabase sends confirmation links to the bare Site URL when the requested
  // redirect is not on the project's allow-list. Forward the code to the real
  // callback rather than dropping the learner on the landing page, signed out.
  const { code } = await searchParams;
  if (code) redirect(`/auth/callback?code=${encodeURIComponent(code)}`);

  const user = await getCurrentUser();
  if (user) redirect("/today");

  return (
    <div className="flex min-h-dvh flex-col bg-sand-100">
      <header className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <Link
          href="/auth"
          className={buttonClasses({ variant: "ghost", size: "sm" })}
        >
          Sign in
        </Link>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 sm:px-6">
        <section className="geometry-field relative overflow-hidden rounded-3xl border border-line bg-white px-6 py-14 sm:px-12 sm:py-20">
          <div className="relative max-w-2xl">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-brand-deep">
              DAWRAH ARABIC PREPARATION
            </p>
            <h1 className="mt-4 text-[34px] leading-[1.1] font-semibold tracking-tight text-ink-900 sm:text-[52px]">
              Build Arabic that listens with you.
            </h1>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-ink-600">
              LisanFlow turns formal Islamic lecture Arabic into a daily
              practice you can actually keep: one focused mission, spaced
              vocabulary, and listening aimed at real lessons.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/auth"
                className={buttonClasses({
                  size: "lg",
                  fullWidth: true,
                  className: "sm:w-auto",
                })}
              >
                Start your first mission
              </Link>
              <p className="text-[13px] text-ink-500">
                Five days. 10–30 minutes each.
              </p>
            </div>
          </div>

          <div className="relative mt-12 max-w-md rounded-2xl border border-line bg-sand-50 p-5">
            <p className="text-[11px] font-semibold tracking-[0.12em] text-ink-400 uppercase">
              Day 1 · Lecture foundation
            </p>
            <ArabicText size="lg" className="mt-3">
              والدليل على ذلك
            </ArabicText>
            <p className="mt-2 text-[15px] text-ink-700">
              the evidence for that
              <span className="ms-2 text-[13px] text-ink-400 italic">
                wa-d-dalīlu ʿalā dhālik
              </span>
            </p>
          </div>
        </section>

        <section className="grid gap-4 py-14 sm:grid-cols-3">
          {PILLARS.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-2xl border border-line bg-white p-6 shadow-card"
            >
              <span className="flex size-10 items-center justify-center rounded-lg bg-emerald-soft text-brand-deep">
                <Icon className="size-5" aria-hidden="true" strokeWidth={1.9} />
              </span>
              <h2 className="mt-4 text-[17px] font-semibold text-ink-900">
                {title}
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-600">
                {body}
              </p>
            </div>
          ))}
        </section>
      </main>

      <footer className="mx-auto w-full max-w-5xl px-4 pb-10 sm:px-6">
        <p className="border-t border-line pt-6 text-[13px] text-ink-400">
          LisanFlow · Practice sentences are written for this course.
          Lecture recordings are by Shaykh Munīr as-Saʿdī.
        </p>
      </footer>
    </div>
  );
}
