# LisanFlow Future Roadmap

## Phase 1 — MVP
Today's mission, flashcards, listening, progress, Google OAuth.

## Phase 2 — Better practice
- Shadowing mode.
- Browser recording.
- Pronunciation feedback via pluggable speech service.
- More granular listening comprehension checks.

## Phase 3 — Content platform
- Admin/content editor.
- Content versioning.
- Programs/courses.
- Teacher-curated lessons.
- Audio storage/CDN.

## Phase 4 — AI layer
Introduce an `AIAssistant` domain interface.
Potential capabilities:
- explain vocabulary
- generate quizzes from approved content
- adapt mission difficulty
- summarize a lesson
- identify weak vocabulary

Guardrails:
- AI must not invent religious citations.
- AI-generated religious content should be clearly labeled.
- Prefer retrieval from approved content sources.
- Keep provider calls server-side.

## Phase 5 — Audio ingestion pipeline
Target pipeline:
`upload → normalize → transcribe → segment → glossary extraction → exercise generation → review cards`

This should be asynchronous and job-based, not part of request/response UI.

## Phase 6 — Offline/PWA
- IndexedDB/local-first lesson cache.
- Offline review queue.
- Conflict-safe sync.
- Background sync where supported.

## Phase 7 — Internationalization
Add locale-aware UI with English first; add Swahili and Arabic UI later.

Use translation keys from the beginning even if only one locale ships in MVP, but do not expose language switching UI yet.
