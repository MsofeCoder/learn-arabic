# LisanFlow UX/UI Specification

## 1. UX principle
**Focused cognitive load:** show one meaningful next action, keep secondary metrics quiet, and avoid dashboard clutter.

## 2. Information hierarchy
1. Today's mission status.
2. Current task CTA.
3. Time/effort expectation.
4. Supporting progress signal.
5. Navigation.

## 3. Navigation
Desktop: compact left rail or top navigation depending on existing layout.

Mobile: bottom navigation with 3 primary items:
- Today
- Review
- Progress

Listening is accessed from Today/lesson cards rather than adding a fourth persistent tab.

## 4. Screen: Auth
Visual: centered premium card, subtle abstract Islamic geometry in background, no decorative overload.

Elements:
- LisanFlow mark/name.
- “Build Arabic that listens with you.”
- Continue with Google.
- Minimal legal/helper text.

## 5. Screen: Onboarding
One question per step where practical.

Step 1: “How comfortable are you with Arabic today?”
- 0–2 Beginner
- 3–4 Basic
- 5–6 Developing
- 7–8 Strong
- 9–10 Advanced

Step 2: “How many minutes can you usually give Arabic each day?”
- 10
- 15
- 20
- 30+

Step 3: confirm first program: “Dawrah Arabic Preparation”.

Use progressive disclosure; do not expose advanced settings.

## 6. Screen: Today's Mission
This is the flagship screen.

### Header
- Personalized greeting: “As-salāmu ʿalaykum, Adam” only when a real name exists.
- Date.
- Small skill badge: `3.0 / 10`.

### Hero mission card
- Label: `TODAY'S MISSION`
- Day label: `DAY 1 · LECTURE LISTENING`
- Title: clear and action-oriented.
- Description: one or two sentences.
- Time badge: `18 min`.
- Progress ring or slim progress bar.
- Primary CTA.

### Task list
3–5 rows/cards. Each shows:
- task type icon
- concise title
- duration
- completion state
- right-side chevron

### Daily focus
A small section with 3–5 lecture phrases. This is not a second vocabulary wall; it is a “notice these phrases today” block.

## 7. Screen: Flashcard Review
Use a large card occupying most of the viewport.

Front:
- Arabic phrase/word centered.
- Audio button if audio metadata exists.
- Subtle “tap to reveal”.

Back:
- English meaning.
- Swahili can be future content; do not add UI for it in MVP.
- optional transliteration.
- example sentence.

Controls:
`Again` `Hard` `Good` `Easy`

Avoid showing numeric ease/interval to the learner.

## 8. Screen: Listening
Keep controls visually obvious.

- Title
- speaker/content context
- large play/pause button
- scrubbable progress bar
- elapsed/remaining time
- speed selector
- transcript accordion
- completion CTA

## 9. Screen: Progress
Do not build a complex analytics dashboard.

Top:
- Skill score 0–10.
- A one-line interpretation.

Middle:
- `Tasks completed`
- `Words learned`
- `Reviews done`

Bottom:
- current program day
- recent completed tasks

## 10. Empty/loading/error states
Every page must have polished states for:
- loading
- no cards due
- no audio URL
- auth error
- network/database error

## 11. Motion
Use only short opacity/translate transitions. No page-wide animation loops. Respect reduced-motion.

## 12. Mobile rules
At 360px width:
- no horizontal scroll
- primary CTA stays visible
- card controls do not wrap awkwardly
- Arabic text remains readable
- sticky navigation must not obscure bottom content

## 13. RTL rules
Arabic text blocks use `dir="rtl"`.
Mixed-language rows can use logical CSS properties (`ms`, `me`, `start`, `end`) instead of left/right assumptions.

## 14. UX copy
Use calm, direct language:
- “Start mission”
- “Continue”
- “Review cards”
- “Listen”
- “Done for today”
Avoid guilt language such as “You’re falling behind”.
