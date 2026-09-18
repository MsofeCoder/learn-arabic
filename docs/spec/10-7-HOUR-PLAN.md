# LisanFlow — Strict 7-Hour Implementation Plan

## Time-box rule
**7 hours is a hard ceiling.** Protect the critical path.

## 0:00–0:30 — Repository/scaffold
- inspect repo
- scaffold/normalize Next.js app
- configure Tailwind + shadcn
- configure fonts
- configure Supabase env placeholders
- create folder boundaries

**Checkpoint:** app runs locally.

## 0:30–1:15 — Design system + shell
- global tokens
- app shell
- mobile navigation
- core buttons/cards/badges/progress
- typography + RTL helpers

**Checkpoint:** visual shell looks production-ready on mobile.

## 1:15–2:00 — Auth + onboarding
- Supabase client/server helpers
- Google OAuth button
- protected layout
- onboarding form
- profile persistence

**Checkpoint:** login and onboarding route work with configured credentials.

## 2:00–3:15 — Today's Mission vertical slice
- seed JSON content
- mission engine
- MissionHero
- task cards
- task completion
- realistic loading/empty/error states

**Checkpoint:** user sees a meaningful mission immediately after onboarding.

## 3:15–4:30 — Flashcards + scheduler
- review queue
- Flashcard component
- scheduler
- review write path
- session progress

**Checkpoint:** user can complete at least one review and card due date changes.

## 4:30–5:15 — Listening
- lesson page
- audio player
- progress interaction
- graceful no-audio state

**Checkpoint:** listening task is usable even when audio URL is missing.

## 5:15–5:45 — Progress
- score card
- three core metrics
- current program day
- recent activity

**Checkpoint:** review/task completion changes visible progress.

## 5:45–6:15 — PWA + polish
- manifest
- icons
- installable-friendly metadata
- responsive fixes
- loading skeletons
- reduced motion

## 6:15–6:45 — Security/RLS + QA
- verify RLS
- verify session handling
- check secret boundaries
- run mobile and desktop pass

## 6:45–7:00 — Build gate
Run:
```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
Fix only blockers.

## If behind schedule
Cut in this order:
1. Fancy visual micro-animation
2. Extra progress detail
3. Transcript extras
4. Extra onboarding copy
5. Secondary desktop nav refinements

Never cut:
- mission flow
- flashcard mechanics
- authentication
- user data isolation
- responsive quality
