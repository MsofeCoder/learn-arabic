# LisanFlow API / Server Contract

Prefer Server Actions or server-side repository functions for authenticated mutations. Use Route Handlers only where a stable HTTP endpoint is actually useful.

## 1. `getTodayMission`
Input:
```ts
{ userId: string; date: string }
```
Output:
```ts
{
  program: { id: string; title: string; dayNumber: number },
  title: string,
  objective: string,
  estimatedMinutes: number,
  tasks: MissionTask[]
}
```

## 2. `completeTask`
Input:
```ts
{ taskId: string }
```
Server requirements:
- derive `userId` from authenticated session, not client input
- verify task exists
- upsert `user_task_progress`
- return updated completion status

## 3. `getReviewQueue`
Input:
```ts
{ limit?: number }
```
Default limit: 10. Max: 30.

Return due cards ordered by `due_at` ascending.

## 4. `submitReview`
Input:
```ts
{
  cardId: string;
  grade: 'again' | 'hard' | 'good' | 'easy';
}
```
Server requirements:
- authenticate
- verify card ownership
- run pure scheduler
- update card
- insert immutable review event
- return next due time + interval

## 5. `getProgressSummary`
Output:
```ts
{
  skillScore: number;
  baselineScore: number;
  tasksCompleted: number;
  wordsLearned: number;
  reviewsCompleted: number;
  currentProgramDay: number;
}
```

## 6. `getLesson`
Input: `lessonId`.

Return public lesson metadata only; if a lesson becomes private/user-owned in future, enforce ownership in repository policy.

## 7. Health endpoint
`GET /api/health`

Response:
```json
{ "ok": true, "service": "lisanflow" }
```

Do not include secrets, database credentials, or internal stack traces.

## 8. Validation
Use Zod at action/route boundaries if a schema library is already present. Do not build hand-written repeated validation logic.
