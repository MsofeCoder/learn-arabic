# Claude Code Execution Contract

## First command
Read `CLAUDE.md` and all numbered specs before touching application code.

## Build order
1. Scaffold / normalize repository.
2. Design system.
3. Supabase auth.
4. Onboarding.
5. Mission engine + Today UI.
6. Flashcards + scheduler.
7. Listening.
8. Progress.
9. PWA shell.
10. Tests/build.

## Implementation style
- Create small reusable components.
- Keep all domain algorithms outside React.
- Prefer server actions/repository functions over client-side direct database mutation.
- Use optimistic UI only where failure recovery is simple.
- Seed content from JSON first.

## Anti-patterns
- giant page components
- direct Supabase calls from dozens of components
- hard-coded user IDs
- `any`
- duplicated scheduling logic
- fake loading indicators without real states
- dependency installation for one tiny utility

## Required final report
```text
STATUS: PASS / BLOCKED
Routes:
Primary flows:
Tests:
Build:
Env vars:
Manual setup remaining:
Deferred:
```
