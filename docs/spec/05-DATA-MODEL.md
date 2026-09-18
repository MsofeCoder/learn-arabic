# LisanFlow Data Model

## 1. Design goals
- User data isolated by `user_id`.
- Content can be global and reusable.
- Review state is per user.
- Programs can be added without schema changes.
- Avoid storing derived metrics when they can be calculated cheaply.

## 2. Tables
### `profiles`
- `id uuid primary key references auth.users(id)`
- `display_name text`
- `skill_score numeric(3,1) default 0`
- `baseline_score numeric(3,1) default 0`
- `daily_minutes int default 20`
- `onboarding_complete boolean default false`
- `created_at timestamptz`
- `updated_at timestamptz`

### `programs`
- `id uuid primary key`
- `slug text unique`
- `title text`
- `description text`
- `start_date date nullable`
- `end_date date nullable`
- `is_active boolean`
- `created_at timestamptz`

### `program_days`
- `id uuid primary key`
- `program_id uuid references programs(id)`
- `day_number int`
- `title text`
- `objective text`
- `estimated_minutes int`
- `unique(program_id, day_number)`

### `tasks`
- `id uuid primary key`
- `program_day_id uuid references program_days(id)`
- `task_type text check in ('vocabulary','listening','reading','review')`
- `title text`
- `description text`
- `sort_order int`
- `estimated_minutes int`
- `content_ref text nullable`

### `vocabulary_items`
- `id uuid primary key`
- `arabic text`
- `meaning_en text`
- `transliteration text nullable`
- `example_ar text nullable`
- `example_en text nullable`
- `topic text`
- `level int nullable`
- `audio_url text nullable`

### `lessons`
- `id uuid primary key`
- `title text`
- `description text`
- `audio_url text nullable`
- `duration_seconds int nullable`
- `transcript_ar text nullable`
- `translation_en text nullable`
- `speaker text nullable`
- `topic text`

### `user_programs`
- `id uuid primary key`
- `user_id uuid references auth.users(id)`
- `program_id uuid references programs(id)`
- `started_at timestamptz`
- `current_day int default 1`
- `status text check in ('active','completed','paused')`
- `unique(user_id, program_id)`

### `user_task_progress`
- `id uuid primary key`
- `user_id uuid references auth.users(id)`
- `task_id uuid references tasks(id)`
- `status text check in ('not_started','in_progress','completed')`
- `completed_at timestamptz nullable`
- `unique(user_id, task_id)`

### `user_cards`
- `id uuid primary key`
- `user_id uuid references auth.users(id)`
- `vocabulary_item_id uuid references vocabulary_items(id)`
- `due_at timestamptz`
- `interval_days int default 0`
- `ease_factor numeric(4,2) default 2.50`
- `repetitions int default 0`
- `last_reviewed_at timestamptz nullable`
- `unique(user_id, vocabulary_item_id)`

### `review_events`
- `id uuid primary key`
- `user_id uuid references auth.users(id)`
- `user_card_id uuid references user_cards(id)`
- `grade text check in ('again','hard','good','easy')`
- `reviewed_at timestamptz`
- `old_due_at timestamptz`
- `new_due_at timestamptz`
- `old_interval_days int`
- `new_interval_days int`

## 3. Indexes
At minimum:
- `user_task_progress(user_id, status)`
- `user_cards(user_id, due_at)`
- `review_events(user_id, reviewed_at)`
- `tasks(program_day_id, sort_order)`
- `program_days(program_id, day_number)`

## 4. RLS
Enable RLS on all user-scoped tables.

Policy rule:
`auth.uid() = user_id`

For `profiles.id`, allow the authenticated user to read/update their own row.

Global content tables may be readable by authenticated users; writes must not be allowed from normal client sessions.

## 5. Seeding
Seed:
- one active program `dawrah-arabic-prep`
- five program days
- task records
- vocabulary items
- at least one listening lesson metadata record

Use deterministic IDs or stable slugs where practical for development data.

## 6. Important security rule
Never rely only on hidden UI controls to prevent cross-user access. RLS is the authority.
