"use client";

import { useId, useState } from "react";
import { Eye, EyeOff, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signInLocally } from "@/app/actions";
import { signInWithPassword, signUpWithPassword } from "@/app/auth/actions";
import { cn } from "@/lib/utils/cn";

interface SignInPanelProps {
  /** True when Supabase is configured; otherwise the app runs in local mode. */
  supabaseEnabled: boolean;
}

export function SignInPanel({ supabaseEnabled }: SignInPanelProps) {
  return supabaseEnabled ? <PasswordForm /> : <LocalSignIn />;
}

type Mode = "sign-in" | "sign-up";

const INPUT_CLASS =
  "h-12 w-full rounded-xl border border-line-strong bg-white px-3.5 text-[15px] text-ink-900 placeholder:text-ink-400 transition-colors focus:border-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-muted";

function PasswordForm() {
  const ids = { name: useId(), email: useId(), password: useId(), hint: useId() };
  const [mode, setMode] = useState<Mode>("sign-in");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmationSentTo, setConfirmationSentTo] = useState<string | null>(
    null,
  );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    setPending(true);
    setError(null);

    // On success both actions redirect, so reaching the lines below means the
    // attempt ended here: an error, or a sign-up awaiting confirmation.
    const result =
      mode === "sign-in"
        ? await signInWithPassword({ email, password })
        : await signUpWithPassword({
            email,
            password,
            displayName: String(form.get("displayName") ?? ""),
          });

    setPending(false);
    if (!result.ok) {
      setError(result.error ?? "Something went wrong. Please try again.");
      return;
    }
    if (mode === "sign-up") setConfirmationSentTo(email);
  }

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
  }

  if (confirmationSentTo) {
    return (
      <div role="status" className="rounded-xl border border-emerald-muted bg-emerald-soft px-4 py-4">
        <div className="flex items-start gap-3">
          <MailCheck className="mt-0.5 size-5 shrink-0 text-brand-deep" aria-hidden="true" />
          <div>
            <p className="text-[15px] font-medium text-brand-deep">Check your inbox</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-700">
              We sent a confirmation link to{" "}
              <span className="font-medium break-all">{confirmationSentTo}</span>.
              Open it on this device, and you will land on today&rsquo;s mission.
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="mt-3"
          onClick={() => {
            setConfirmationSentTo(null);
            switchMode("sign-in");
          }}
        >
          Already confirmed? Sign in
        </Button>
      </div>
    );
  }

  const isSignUp = mode === "sign-up";

  return (
    <div>
      <div
        role="group"
        aria-label="Sign in or create an account"
        className="grid grid-cols-2 gap-1 rounded-xl bg-sand-200 p-1"
      >
        {(["sign-in", "sign-up"] as const).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={mode === value}
            onClick={() => switchMode(value)}
            className={cn(
              "min-h-[40px] rounded-lg text-sm font-medium transition-colors",
              mode === value
                ? "bg-white text-ink-900 shadow-card"
                : "text-ink-500 hover:text-ink-700",
            )}
          >
            {value === "sign-in" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        {isSignUp ? (
          <div>
            <label htmlFor={ids.name} className="text-sm font-medium text-ink-700">
              Your name
            </label>
            <input
              id={ids.name}
              name="displayName"
              type="text"
              autoComplete="name"
              required
              maxLength={60}
              placeholder="Adam Ibn Mohamad"
              className={cn(INPUT_CLASS, "mt-1.5")}
            />
          </div>
        ) : null}

        <div>
          <label htmlFor={ids.email} className="text-sm font-medium text-ink-700">
            Email
          </label>
          <input
            id={ids.email}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            className={cn(INPUT_CLASS, "mt-1.5")}
          />
        </div>

        <div>
          <label htmlFor={ids.password} className="text-sm font-medium text-ink-700">
            Password
          </label>
          <div className="relative mt-1.5">
            <input
              id={ids.password}
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              required
              minLength={isSignUp ? 8 : undefined}
              maxLength={128}
              aria-describedby={isSignUp ? ids.hint : undefined}
              className={cn(INPUT_CLASS, "pe-12")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="absolute inset-y-0 end-0 flex w-12 items-center justify-center rounded-e-xl text-ink-400 hover:text-ink-600"
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>
          {isSignUp ? (
            <p id={ids.hint} className="mt-1.5 text-[12px] text-ink-400">
              At least 8 characters, with both letters and numbers.
            </p>
          ) : null}
        </div>

        {error ? (
          <p
            role="alert"
            className="rounded-xl border border-rose-line bg-rose-soft px-4 py-3 text-sm text-rose-ink"
          >
            {error}
          </p>
        ) : null}

        <Button type="submit" size="lg" fullWidth loading={pending}>
          {isSignUp ? "Create account" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}

function LocalSignIn() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function continueLocally() {
    setPending(true);
    setError(null);
    const result = await signInLocally({});
    // On success the action redirects, so reaching here means it failed.
    if (result && !result.ok) {
      setError(result.error ?? "Could not start a local session.");
      setPending(false);
    }
  }

  return (
    <div className="w-full">
      <Button size="lg" fullWidth onClick={continueLocally} loading={pending}>
        Continue without an account
      </Button>
      <p className="mt-3 text-[13px] leading-relaxed text-ink-500">
        Accounts switch on once Supabase is configured. Until then your
        progress is saved on this device.
      </p>
      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-rose-line bg-rose-soft px-4 py-3 text-sm text-rose-ink"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
