# LisanFlow Design System

## Brand direction
Modern premium + subtle Islamic identity.

The Islamic identity should emerge from typography, rhythm, geometric micro-details, and tone — not from ornamental overload.

## Color tokens
Primary emerald: `#10B981`

Background: `#F8F9FA`

Text / charcoal: `#1F2937`

Supporting neutrals should be generated as a small scale from Tailwind/shadcn conventions. Keep the emerald primarily for actions, active states, progress, and meaningful accents.

Do not use color as the only signal of completion/error.

## Typography
- Latin/UI: Inter.
- Arabic: Noto Sans Arabic.
- Use `next/font` where supported.
- Arabic body line-height should be generous (~1.8–2.0 depending on size).

## Type scale
- Display: 32–40px
- Page title: 24–28px
- Section title: 18–20px
- Body: 15–17px
- Caption: 12–13px

## Radius
Use moderately rounded premium surfaces. Avoid excessive pill shapes except for compact status badges.

## Shadows
Use one restrained elevation level for primary cards. Avoid “glassmorphism everywhere”.

## Components
Start with a small shadcn/ui footprint:
- Button
- Card
- Progress
- Badge
- Avatar
- Separator
- Skeleton
- Dialog / Sheet where needed
- Tooltip

Build custom domain components:
- MissionHero
- MissionTaskCard
- Flashcard
- ReviewRatingBar
- AudioPlayer
- SkillScoreCard
- StatCard

## Iconography
Lucide icons. Consistent 18–22px default size.

## Spacing
Use Tailwind spacing rhythm. Favor 4/8px visual increments.

## States
Every interactive component needs:
- default
- hover
- focus-visible
- active
- disabled
- loading
- success/error where relevant

## Arabic content styling
Arabic vocabulary should look like content, not like a label. Use Noto Sans Arabic, `dir="rtl"`, and enough vertical breathing room.

## PWA identity
Use emerald app icon on light background with a simple `ل` / LisanFlow monogram or abstract flowing glyph. Avoid complex illustrations that become illegible at 32px.
