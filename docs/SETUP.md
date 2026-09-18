# LisanFlow — remaining setup

Done already: Supabase project **lisanflow** (`wjzikvociparmphwlmcy`,
eu-central-1, free plan) with all three migrations applied, row-level security
verified, and the public `lesson-audio` storage bucket created.

Sign-in uses **email + password** (Google sign-in is postponed). The app is
already switched to Supabase mode in `.env.local`.

## 1. Create your account (about 3 minutes)

**First, one dashboard setting.** A new Supabase project requires every new
account to click a confirmation email. On the free plan those emails only reach
addresses that are members of your Supabase organization, and at most two an
hour. For this private phase, turn confirmation off:

- Supabase Dashboard → project *lisanflow* → **Authentication → Sign In /
  Providers → Email** → switch **Confirm email** off → Save.

(Leave it on only if you will sign up with the same email you use for Supabase.
Turn it back on, with a custom SMTP sender, before inviting other learners.)

**Then create the account in the app:**

1. `pnpm dev`, open http://localhost:3000 → **Start your first mission**.
2. Choose **Create account**, enter your name, email and a password
   (at least 8 characters, letters and numbers).
3. You land on onboarding, then today's mission. From then on, **Sign in**
   with the same email and password on any device.

If confirmation stays on, you will see "Check your inbox" instead — open the
link on the same device and browser you signed up from.

**Before production:** under **Authentication → URL Configuration**, set the
Site URL to your real domain and add `https://<your-domain>/auth/callback` to
Redirect URLs.

## 2. Upload the lecture audio (about 5 minutes, 448 MB)

Supabase Dashboard → **Project Settings → API Keys** → copy the **secret
(service_role)** key. It bypasses every security rule — keep it out of `.env*`
files, chat, and git. Pass it for this one command only:

```bash
SUPABASE_URL=https://wjzikvociparmphwlmcy.supabase.co SUPABASE_SERVICE_ROLE_KEY=<secret key> pnpm audio:upload
```

The script is idempotent (re-running skips finished files). When it prints
`Done`, uncomment `NEXT_PUBLIC_LESSON_AUDIO_BASE` in `.env.local`.

## 3. Deploy to Vercel

1. Import the repository in Vercel.
2. Environment variables (Production and Preview):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_LESSON_AUDIO_BASE`
   - `NEXT_PUBLIC_SITE_URL` = `https://<your-domain>`
3. Add `https://<your-domain>/auth/callback` to Supabase Redirect URLs (step 1).

Do **not** add the service-role key to Vercel. The app never needs it.
