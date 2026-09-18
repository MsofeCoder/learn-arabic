# LisanFlow Architecture

## 1. Architecture objective
Deliver a small codebase now that can evolve into a multi-program Arabic learning platform without a rewrite.

## 2. Proposed stack
- Next.js App Router + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase Postgres + Auth
- Vercel
- Vitest for domain/unit tests
- Playwright for a small critical-path E2E suite

## 3. High-level layers
```text
UI / Route Layer
    ↓
Application Services
    ↓
Domain Logic (pure TypeScript)
    ↓
Repository Interfaces
    ↓
Supabase / JSON adapters
```

## 4. Suggested folders
```text
src/
  app/
    (auth)/auth/page.tsx
    (public)/page.tsx
    (app)/layout.tsx
    (app)/page.tsx
    (app)/review/page.tsx
    (app)/listen/[lessonId]/page.tsx
    (app)/progress/page.tsx
    (app)/onboarding/page.tsx
    api/health/route.ts
  components/
    ui/
    learning/
    layout/
  domain/
    content/
    missions/
    reviews/
    progress/
  lib/
    supabase/
    repositories/
    validation/
    utils/
  data/
    seed/
  types/
```

## 5. Server/client split
Server Components:
- mission shell/data fetch
- progress page
- lesson metadata

Client Components:
- flashcard interaction
- audio player controls
- mission task completion interaction
- small onboarding widgets

## 6. Repository interfaces
Define interfaces before wiring data so MVP can start from JSON.

```ts
interface ContentRepository {
  getActiveProgram(): Promise<Program>;
  getProgramDay(programId: string, dayNumber: number): Promise<ProgramDay | null>;
  getVocabularyItems(ids: string[]): Promise<VocabularyItem[]>;
  getLesson(id: string): Promise<Lesson | null>;
}

interface LearningRepository {
  getProfile(userId: string): Promise<Profile | null>;
  saveOnboarding(userId: string, input: OnboardingInput): Promise<void>;
  getTodayState(userId: string): Promise<TodayState>;
  recordTaskCompletion(userId: string, taskId: string): Promise<void>;
}

interface ReviewRepository {
  getDueCards(userId: string, limit: number): Promise<UserCard[]>;
  recordReview(userId: string, cardId: string, grade: ReviewGrade, result: ReviewResult): Promise<void>;
}
```

## 7. Mission engine
Pure function:
`buildTodayMission(program, userState, date): Mission`

Inputs:
- current day
- baseline score
- daily minutes
- incomplete tasks
- due reviews

Outputs:
- mission metadata
- ordered tasks
- estimated minutes

No database calls inside the pure engine.

## 8. Data strategy
For the first visual sprint:
- content comes from checked-in JSON.
- user state comes from Supabase after auth.
- after the primary UI is stable, replace content repository implementation with database reads if useful.

Do not duplicate business logic between JSON and database adapters.

## 9. Auth strategy
Use Supabase Auth with Google OAuth and SSR-safe session handling. Keep authorization in server-side data access and database RLS, not only route guards.

## 10. PWA strategy
MVP:
- web app manifest
- icons
- standalone display metadata
- mobile viewport correctness
- installability-friendly shell

Defer full offline caching and sync.

## 11. Scalability path
Later:
- object storage for audio
- background transcription workers
- AI exercise service
- content/admin service
- analytics event pipeline
- offline sync protocol

Keep stable domain IDs so content remains referentially safe when storage moves.

## 12. Error handling
Use typed application errors at service boundaries. Show friendly UI messages; log diagnostic details server-side.

## 13. Observability
MVP: structured console/server logs + a health endpoint.
Future: Sentry/OpenTelemetry and product analytics.
