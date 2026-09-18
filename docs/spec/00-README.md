# LisanFlow — Production MVP Build Pack

This folder is an implementation specification for a **7-hour production-oriented MVP sprint** using Claude Code or another AI coding agent.

## Product
**Name:** LisanFlow

**Audience:** Anyone learning Arabic, initially optimized for learners who want to understand formal Islamic lectures.

**Initial learning path:** 5-day Dawrah Arabic preparation.

**Primary user metric:** a learner completes today's mission and makes at least one meaningful review action.

## MVP surface map
- `/` — authenticated Today's Mission
- `/review` — flashcard review
- `/listen/[lessonId]` — listening lesson/player
- `/progress` — basic progress
- `/auth` — sign-in
- `/onboarding` — baseline skill + daily availability

## Why the MVP is intentionally small
The goal is not to build a complete language-learning platform in seven hours. The goal is to prove the core loop:

**Sign in → set baseline → receive today's mission → learn/review → listen → progress updates.**

## Specification index
| File | Purpose |
|---|---|
| `CLAUDE.md` | Master agent instructions and guardrails |
| `01-PRD.md` | Product requirements and acceptance criteria |
| `02-UX-UI-SPEC.md` | UX flows, screen specs, responsive behavior |
| `03-DESIGN-SYSTEM.md` | Visual language, tokens, typography, components |
| `04-ARCHITECTURE.md` | Application architecture and boundaries |
| `05-DATA-MODEL.md` | Database schema, RLS, indexes, seed model |
| `06-API-CONTRACTS.md` | Server actions/route contracts and DTOs |
| `07-CONTENT-SEED.md` | Initial Dawrah content and Arabic vocabulary |
| `08-SRS-ALGORITHM.md` | Flashcard scheduling logic |
| `09-SECURITY-QUALITY.md` | Security, accessibility, testing, observability |
| `10-7-HOUR-PLAN.md` | Strict implementation timeline |
| `11-FUTURE-ROADMAP.md` | Extensibility for AI/audio/admin/offline features |
| `12-TECH-BASELINE.md` | Current stack decisions and verification notes |
