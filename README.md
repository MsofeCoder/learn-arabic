# LisanFlow

A focused Arabic-learning PWA for formal Islamic lecture Arabic. Open it, and the
next study action is already decided: one daily mission, spaced-repetition
vocabulary, and listening built from the phrases you just learned.

The first program is a five-day **Dawrah Arabic Preparation** track.

## Run it

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000. With no Supabase credentials the app runs in **local
mode**: the full learning loop works and progress persists to
`.lisanflow/state.json` on this machine. Add Supabase credentials to switch to
email + password accounts with Postgres and row-level security — no code change.

## Commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Vitest (domain + repository suites) |

## Environment

Copy `.env.example` to `.env.local`. Every variable is optional; see that file
for what each one switches on.

| Variable | Effect |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | With the key below, switches on Supabase mode |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key |
| `NEXT_PUBLIC_SITE_URL` | Fallback origin for auth email links (the request origin is preferred) |
| `NEXT_PUBLIC_LESSON_AUDIO_BASE` | Storage base URL for lecture audio (`<base>/<storageKey>`) |

The app never uses a service-role key. Only the one-off `pnpm audio:upload`
command needs it, passed in the shell for that command alone.

## Supabase setup

The Supabase project **lisanflow** (`wjzikvociparmphwlmcy`) exists with all
migrations applied and RLS verified. Sign-in is email + password through
Supabase Auth. Creating your account, uploading the audio, and deploying are in
**[docs/SETUP.md](docs/SETUP.md)**.

Migrations live in `supabase/migrations/`:

| File | What it does |
| --- | --- |
| `0001_init.sql` | User-scoped tables with RLS; column grants; points awarded by trigger only |
| `0002_lesson_audio_storage.sql` | Public-read `lesson-audio` bucket (50 MiB, `audio/mpeg`) |
| `0003_review_events_card_index.sql` | Foreign-key index raised by the performance advisor |

## Lecture audio

Twelve recordings by Shaykh Munīr as-Saʿdī (at-Tibyān, parts 1–11, and a short
talk on the student's adab) live in `sample-duroos-audios/` locally. That folder
is gitignored (448 MB). The manifest is `src/data/seed/recordings.ts`.

`src/lib/audio/source.ts` decides where audio plays from:
`NEXT_PUBLIC_LESSON_AUDIO_BASE` (Supabase Storage) if set, otherwise the local
Range-capable route `/api/audio/<recording-id>`. `pnpm audio:upload` copies the
files to storage.

## How it is put together

```text
src/
  app/            routes + server actions (the mutation boundary)
  components/     ui primitives, learning surfaces, layout
  domain/         pure TypeScript: SRS scheduler, mission engine, scoring
  lib/
    repositories/ ContentRepository / LearningRepository / ReviewRepository
    services/     composition of domain + repositories
    supabase/     cookie-based clients
  data/seed/      the 5-day program, vocabulary, listening lessons
supabase/migrations/
```

Three rules hold the shape:

- **Domain logic never imports React.** The scheduler and mission engine are
  pure functions, unit-tested without a DOM, and replaceable behind their
  interfaces.
- **The UI never talks to a database.** It calls services; services call
  repositories; repositories choose Supabase or local mode.
- **Mutations derive the user from the session,** validate with Zod, and are
  authorised by RLS rather than by hidden UI.

### Extension points

`ContentRepository`, `ReviewScheduler`, `LearningRepository`, `ReviewRepository`
and `AuthProvider` are the seams a future AI tutor, FSRS scheduler, audio
ingestion pipeline or admin CMS plugs into. `AIAssistant` is declared as an
interface only — there is no implementation and nothing calls it.

## Content

Lesson material is curated teaching content written for this course. It is not a
transcript of any lecture and must not be presented as one.
