# LisanFlow — Claude Code Master Instructions

## Mission
Build **LisanFlow**, a production-quality, mobile-first Arabic learning PWA focused initially on **formal Islamic lecture Arabic**. The first release is a brutally scoped **7-hour MVP**. It must feel premium, fast, coherent, and useful on the first session.

## Product promise
> Open LisanFlow. Know exactly what to study today. Finish a focused Arabic mission. See measurable progress.

## Non-negotiable MVP scope
1. Responsive web app + installable PWA shell.
2. User accounts with Supabase Auth + Google OAuth.
3. Today's Arabic Mission as the primary home experience.
4. Personalized daily study plan using deterministic rules; **no AI API** in MVP.
5. Vocabulary flashcards with spaced repetition.
6. Arabic listening player using seeded/mock lesson audio metadata and browser audio where a valid URL exists.
7. Basic progress dashboard.
8. Seed the 5-day Dawrah preparation program and Islamic Arabic vocabulary/lecture phrases.

## Explicitly out of MVP
Shadowing, speech/pronunciation analysis, admin CMS, AI tutor, AI-generated exercises, full offline lesson data, streaks/gamification, notes, search, multi-language UI.

## Future-proofing requirement
Architect stable domain interfaces so future features can plug in without rewriting the UI/domain model:
- `ContentRepository`
- `ReviewScheduler`
- `LearningPlanEngine`
- `AudioSource`
- `AuthProvider`
- `AIAssistant` (interface only; no implementation)

## Technology
Preferred by user:
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase (Postgres + Auth)
- Vercel

Current implementation guidance: use the **current stable Next.js App Router release** rather than pinning a new project to Next.js 14. Keep code portable and avoid framework-specific experiments that are not necessary for MVP. Supabase's current Next.js Auth guidance uses cookie-based SSR/session handling, and Google OAuth is supported directly. shadcn/ui has current Next.js setup and RTL guidance. See `12-TECH-BASELINE.md`.

## Engineering principles
- Mobile-first.
- Server-first where practical; use client components only for interactive learning surfaces.
- Strong TypeScript; avoid `any`.
- Domain logic must be unit-testable without React.
- Database access must be isolated from presentational components.
- Validate external/user input at boundaries.
- Use Supabase RLS for user-scoped data.
- Never expose service-role secrets to the client.
- Accessibility is part of done: keyboard support, labels, focus states, contrast, reduced motion.
- Arabic content must render correctly with `dir="rtl"` at component level where needed.
- Do not use emoji as core UI icons; use Lucide/shadcn icons.
- Avoid huge client bundles and unnecessary dependencies.
- No TODO placeholders in the primary user flows.

## UX priority order
1. Today's Mission
2. Flashcard review
3. Listening
4. Basic progress
5. Auth/onboarding
Everything else is secondary.

## Definition of done
`pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` pass.
Primary mobile flows work at ~360px width without horizontal scrolling.
Google sign-in works when Supabase credentials are supplied.
A newly registered user can complete onboarding, land on Today's Mission, start a task, review cards, and see progress update.
All user-scoped database tables have RLS policies.
No secrets are committed.

## Agent operating protocol
1. Read all files under `claude-code/`, then the relevant domain specs before coding.
2. Inspect existing repo state; do not overwrite working code blindly.
3. Create a thin vertical slice first: auth → onboarding → Today → flashcard → progress.
4. Use mock JSON content first. Keep repository interfaces so switching to DB is localized.
5. Implement only the necessary data writes for MVP.
6. Run validation after each major milestone.
7. If a feature threatens the 7-hour budget, cut it rather than reducing quality of the primary flow.
8. Prefer boring, reliable implementations over clever abstractions.

## Stop-the-line rules
Do not spend sprint time on:
- complex animation libraries
- advanced charting
- rich text editing
- custom backend frameworks
- AI APIs
- full audio transcoding
- elaborate role systems
- elaborate gamification
- custom design-system tooling beyond what shadcn/Tailwind need

## Expected first implementation commands
Use the package manager already present in the repository. If none exists, prefer pnpm.

Scaffold using the current stable Next.js App Router template, TypeScript, Tailwind, ESLint, `src/` directory, and `@/*` alias. Then add only the minimum shadcn components and Supabase packages required by the specs.

## Files to read
- `01-PRD.md`
- `02-UX-UI-SPEC.md`
- `03-DESIGN-SYSTEM.md`
- `04-ARCHITECTURE.md`
- `05-DATA-MODEL.md`
- `06-API-CONTRACTS.md`
- `07-CONTENT-SEED.md`
- `08-SRS-ALGORITHM.md`
- `09-SECURITY-QUALITY.md`
- `10-7-HOUR-PLAN.md`
- `11-FUTURE-ROADMAP.md`
- `12-TECH-BASELINE.md`

## Final response expected from Claude Code
Report:
- files created/changed
- commands run
- tests/build status
- required environment variables
- any intentionally deferred feature
- exact manual setup steps remaining for Supabase/Vercel
