# LisanFlow MVP Spaced Repetition

## Goal
Implement a transparent, deterministic scheduler quickly. Hide algorithm complexity from the learner.

## Grades
- `again` — forgot / could not recall
- `hard` — recalled with difficulty
- `good` — normal successful recall
- `easy` — immediate recall

## Initial defaults
```ts
intervalDays = 0
repetitions = 0
easeFactor = 2.5
```

## Scheduling rules
### Again
- repetitions = 0
- interval = 0.007 days (~10 minutes) for same-session retry, or clamp to 10 minutes
- easeFactor = max(1.3, easeFactor - 0.20)

### Hard
- repetitions += 1
- interval = max(1, round(previousInterval * 1.2))
- easeFactor = max(1.3, easeFactor - 0.15)

### Good
- repetitions += 1
- if previous interval < 1 day: interval = 1 day
- else if previous interval < 6 days: interval = round(previousInterval * 2.2)
- else: interval = round(previousInterval * easeFactor)

### Easy
- repetitions += 1
- interval = max(2, round(previousInterval * 2.8))
- easeFactor = min(3.0, easeFactor + 0.15)

Clamp intervals to a reasonable MVP maximum, e.g. 180 days.

## Important engineering rule
Keep the scheduler pure:
```ts
scheduleReview(cardState, grade, now) => nextCardState
```
No React, no database, no dates from global state.

## Future migration
Hide this behind `ReviewScheduler` so FSRS or another research-backed scheduler can replace it later without UI changes.
