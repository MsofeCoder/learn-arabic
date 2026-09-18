# LisanFlow Security, Accessibility, Testing & Quality

## Security baseline
- Supabase Auth for identity.
- Google OAuth redirect URIs restricted to known environments.
- RLS enabled for every user-owned table.
- Server-side authorization checks before user mutations.
- Service-role key server-only.
- Public environment variables limited to Supabase URL + anon/publishable key.
- No secret values in logs.
- Escape/render user-generated text safely.
- Validate route/action inputs.
- Rate-limit future public write-heavy endpoints.
- Keep dependencies minimal and update them regularly.

## Threats to explicitly guard against
- Cross-user data access through guessed IDs.
- Client-side tampering of `user_id`.
- OAuth callback misconfiguration.
- XSS through future user notes/transcripts.
- Broken authorization on Server Actions.
- Accidental exposure of service role credentials.

## Accessibility
- Semantic HTML.
- Visible focus.
- `aria-label` for icon-only controls.
- Logical tab order.
- Contrast compliant with WCAG-oriented design practice.
- RTL support at component level.
- Reduced motion.
- Keyboard-accessible flashcard reveal and review controls.

## Unit tests
Must cover:
- mission generation for 10/15/20/30 minute settings
- day selection
- empty/incomplete program states
- each review grade
- interval bounds
- skill score calculation

## Integration/E2E tests
Minimum critical path:
1. load app
2. auth mock/test mode
3. onboarding saved
4. Today mission visible
5. open review
6. grade one card
7. progress reflects update

Use a deterministic local/test repository for E2E if live OAuth is too costly for the sprint.

## Manual QA checklist
### Mobile
- 360×800
- 390×844
- 412×915

### Desktop
- 1280×800
- 1440×900

### Check
- no horizontal overflow
- Arabic renders correctly
- buttons do not shift unexpectedly
- loading states are intentional
- error states recover
- audio controls are usable
- route refresh preserves auth

## Build gates
The agent must not call the sprint complete until:
```text
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
pass.
