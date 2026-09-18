# LisanFlow MVP — Product Requirements Document

## 1. Product vision
LisanFlow is a focused Arabic learning application that reduces cognitive load by answering one question immediately:

> **What should I study today?**

The first program is a five-day Dawrah preparation track for learners starting around a 3/10 Arabic skill level and needing practical comprehension of formal Islamic lectures.

## 2. Personas
### Primary
Beginner Arabic learner with limited listening comprehension who wants structured, practical progress.

### Secondary
Learner with basic Arabic knowledge who wants a specialized Islamic Arabic path.

## 3. MVP goals
- Make the next study action obvious.
- Deliver 10–30 minutes of focused work rather than an overwhelming course catalog.
- Teach high-frequency lecture phrases and Islamic vocabulary.
- Create a useful first spaced-repetition loop.
- Give the user a simple progress signal on a 0–10 skill scale.

## 4. Non-goals
- AI tutoring.
- Full language assessment.
- Speech scoring.
- Admin content management.
- Rich social features.
- Deep gamification.
- Full offline synchronization.

## 5. Primary user journey
1. Visit app.
2. Sign in with Google.
3. Onboarding: choose current Arabic skill (0–10) and minutes/day.
4. App generates today's mission from the active program and user state.
5. User starts the mission.
6. Vocabulary review uses flashcards + scheduler.
7. Listening task opens a lightweight player with transcript/translation toggle only when seeded.
8. Completion events update progress.
9. Dashboard shows current skill score, completed tasks, review totals, and next mission.

## 6. Mission generation
Deterministic MVP rules:
- Select active program day based on program start date and user enrollment date.
- If onboarding happens after a day boundary, default to the earliest incomplete day.
- Build a mission with 3–5 tasks and a target of 10–30 minutes.
- Include at least one review task and one new-content task when available.
- If overdue cards exist, allocate a small review block first.
- Personalize task count using available minutes: 10, 15, 20, 30.

## 7. Skill score
The user selects an initial 0–10 self-assessment.

MVP progress score is deliberately simple:
- `baseline_score` is user-declared.
- `progress_points` are accumulated from completed tasks and successful reviews.
- Displayed score can move slowly and is bounded 0–10.
- Never imply this is a validated proficiency assessment.

Suggested score update:
`displayed_score = min(10, baseline_score + floor(progress_points / 100))`

The UI should explain: **“Learning score — a simple progress indicator, not a formal language exam.”**

## 8. MVP feature requirements
### Auth
- Google OAuth through Supabase.
- Protected routes for learning content.
- Auth state survives refresh.

### Today's Mission
- Greeting.
- Current program/day.
- Estimated total minutes.
- Progress indicator.
- Ordered task cards.
- One dominant CTA: `Start mission` / `Continue mission`.

### Flashcards
- Arabic front.
- Translation/meaning back.
- Optional transliteration.
- Example sentence where available.
- Buttons: Again, Hard, Good, Easy.
- Record review and next due time.

### Listening
- Play/pause.
- Progress bar.
- Playback speed 0.75×, 1×, 1.25×.
- Lesson title + objective.
- Transcript panel is optional if seed content has transcript text.

### Progress
- Skill score 0–10.
- Tasks completed today.
- Total learned words.
- Reviews completed.
- Current program day.

## 9. Content rules
Arabic must be treated as first-class content:
- Store source Arabic separately from translation.
- Support RTL.
- Do not transliterate every item by default; use it as optional support.
- No unverified line-by-line claims from source videos. Seed only curated phrases/vocabulary from the project content specification.

## 10. Accessibility acceptance criteria
- Keyboard navigable.
- Visible focus states.
- Buttons have accessible labels.
- `prefers-reduced-motion` respected.
- Arabic content uses readable line height.
- Touch targets ~44px or larger.

## 11. Performance goals
- Fast first contentful render on a mid-range mobile connection.
- Avoid shipping chart libraries for the simple progress screen.
- Keep interactive state local to the smallest client components possible.
- Prefer server-rendered pages and cached static seed content.

## 12. MVP acceptance tests
A new user can sign in, complete onboarding, start today's mission, review at least one card, play a listening lesson, and see progress change.

A returning user sees a different mission state reflecting completed work.

A user cannot read or modify another user's review/progress records.

## 13. Success metrics to instrument later
- onboarding completion rate
- mission start rate
- mission completion rate
- flashcard review completion
- listening play rate
- 7-day return rate
