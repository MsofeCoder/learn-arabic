# LisanFlow — Claude Code Master Build Prompt

You are the lead product engineer, senior UI/UX engineer, and QA owner for **LisanFlow**.

Read, in order:
1. `CLAUDE.md`
2. `01-PRD.md`
3. `02-UX-UI-SPEC.md`
4. `03-DESIGN-SYSTEM.md`
5. `04-ARCHITECTURE.md`
6. `05-DATA-MODEL.md`
7. `06-API-CONTRACTS.md`
8. `07-CONTENT-SEED.md`
9. `08-SRS-ALGORITHM.md`
10. `09-SECURITY-QUALITY.md`
11. `10-7-HOUR-PLAN.md`
12. `11-FUTURE-ROADMAP.md`
13. `12-TECH-BASELINE.md`
14. `claude-code/EXECUTION.md`

## Objective
Ship the LisanFlow MVP within a strict seven-hour engineering time box.

## Product definition
LisanFlow helps Arabic learners build practical comprehension through a single focused daily mission. The initial specialization is formal Islamic lecture Arabic, beginning with a five-day Dawrah preparation program.

## MVP must contain
- responsive mobile-first web app
- installable PWA shell
- Google OAuth via Supabase Auth
- onboarding with skill score 0–10 and daily minutes
- Today's Mission
- deterministic personalization
- vocabulary flashcards
- spaced repetition
- lightweight listening player
- basic progress dashboard
- seeded 5-day Dawrah content

## Do not build
AI, speech recognition, pronunciation scoring, admin CMS, notes, search, streaks, full offline sync, multilingual UI.

## Build strategy
Start with mock JSON and a polished UI. Build repository interfaces. Connect Supabase user state and progress. Keep the content adapter replaceable.

## Quality bar
The primary mobile screens should feel like a polished consumer SaaS product. Do not accept “developer default” styling. Use the defined emerald/sand/slate palette, Inter + Noto Sans Arabic, strong spacing, clear hierarchy, accessible controls, and restrained motion.

## Critical user story
A first-time user should be able to:
1. sign in
2. choose skill level and available minutes
3. see today's mission
4. start a vocabulary review
5. reveal a card and submit a rating
6. open a listening lesson
7. finish at least one task
8. open progress and see updated metrics

## Engineering constraints
- TypeScript strict.
- No `any` unless absolutely unavoidable and justified.
- No service role secrets in browser code.
- User ID comes from server-side auth context, never mutation input.
- RLS is mandatory for user-owned rows.
- Pure domain logic for mission generation and review scheduling.
- Prefer Server Components; isolate interactivity.
- Avoid adding libraries unless they remove significant implementation risk.

## Execution behavior
Do not ask for clarification unless the repository is truly unusable. Make reasonable engineering decisions, document them, and keep moving.

When something is too large for the 7-hour budget, simplify it while preserving the user-facing outcome.

At each checkpoint, run relevant tests. At the end run lint, typecheck, tests, and build.

## Final deliverable
Return a concise report with:
- implementation status
- key routes
- major components
- database migrations
- tests run
- build result
- environment variables required
- manual setup still required
- intentionally deferred work
