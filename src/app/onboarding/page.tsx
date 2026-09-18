import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Logo } from "@/components/layout/logo";
import { OnboardingFlow } from "@/components/learning/onboarding-flow";
import { getCurrentUser } from "@/lib/auth/session";
import { contentRepository } from "@/lib/repositories";
import { getProfileForUser } from "@/lib/services/learning";

export const metadata: Metadata = { title: "Set up" };
export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth");

  const profile = await getProfileForUser(user);
  if (profile.onboardingComplete) redirect("/today");

  const program = await contentRepository.getActiveProgram();

  return (
    <div className="flex min-h-dvh flex-col bg-sand-100">
      <header className="flex h-16 items-center px-4 sm:px-6">
        <Logo />
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pt-4 pb-16 sm:items-center sm:pt-0">
        <OnboardingFlow programTitle={program.title} />
      </main>
    </div>
  );
}
