import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { SignInPanel } from "@/components/learning/sign-in-panel";
import { getCurrentUser } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

interface AuthPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const user = await getCurrentUser();
  if (user) redirect("/today");

  const { error } = await searchParams;

  return (
    <div className="geometry-field flex min-h-dvh flex-col bg-sand-100">
      <header className="mx-auto flex h-16 w-full max-w-5xl items-center px-4 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 transition-colors hover:text-ink-700"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md rounded-2xl border border-line bg-white p-7 shadow-card sm:p-9">
          <Logo />

          <h1 className="mt-7 text-2xl leading-tight font-semibold tracking-tight text-ink-900">
            Build Arabic that listens with you.
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-600">
            Sign in to pick up your daily mission, your review schedule, and
            your place in the five-day Dawrah program.
          </p>

          {error ? (
            <p
              role="alert"
              className="mt-6 rounded-xl border border-rose-line bg-rose-soft px-4 py-3 text-sm text-rose-ink"
            >
              That link has expired or was already used. Please sign in, or
              create your account again to get a fresh link.
            </p>
          ) : null}

          <div className="mt-7">
            <SignInPanel supabaseEnabled={isSupabaseConfigured} />
          </div>

          <p className="mt-7 border-t border-line pt-5 text-[12px] leading-relaxed text-ink-400">
            We store only what your learning needs: your name, your starting
            level, and your review schedule.
          </p>
        </div>
      </main>
    </div>
  );
}
