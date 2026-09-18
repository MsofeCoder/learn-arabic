# LisanFlow Technology Baseline — September 2026

## Important version decision
The original project preference was **Next.js 14**. For a brand-new production app today, do not intentionally pin to an obsolete major just because it was in the initial preference. The official Next.js project has continued through Next.js 16, and the App Router remains the target architecture. Next.js 16 also introduces meaningful architectural/tooling improvements and has a current 16.2 release. Use the current stable release available when the repository is scaffolded, and avoid using APIs tied only to 14. 

## Supabase
Use the current Supabase SSR/auth guidance for Next.js. Supabase provides cookie-based Auth integration for Next.js App Router and direct Google OAuth support. Keep auth/session logic aligned with current `@supabase/ssr`/official guidance rather than copying old community patterns.

## shadcn/ui
Use the current shadcn CLI and current Next.js template. Add only components actually needed by the MVP. RTL support exists in current shadcn Next.js setup, which is useful for Arabic content surfaces.

## Vercel
Deploy the Next.js application to Vercel. Environment variables must be configured separately for local preview and production.

## Dependency policy
Use current stable compatible versions at implementation time. Avoid broad dependency sprawl. Record exact installed versions in the lockfile.

## Environment variables
```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Do not add the Supabase service role key unless a future server-only feature actually needs it.

## Minimum deployment checklist
- Supabase project created.
- Google OAuth provider configured.
- Redirect URLs configured for localhost + production.
- SQL migrations applied.
- Vercel environment variables set.
- Production auth callback verified.
- `pnpm build` passes in CI.

## Current official references checked while preparing this spec
- Next.js 16 release notes and current 16.2 release notes.
- Next.js v14 upgrade documentation for historical comparison.
- Supabase Next.js Auth quickstart.
- Supabase Google OAuth documentation.
- shadcn/ui Next.js installation and RTL documentation.

The coding agent should re-check official documentation at implementation time before locking versions, because the current date is September 2026 and framework/auth APIs can change.
