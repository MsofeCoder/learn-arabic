-- LisanFlow — initial schema
--
-- Scope: user-scoped learning state only. Curriculum content (programs, days,
-- tasks, vocabulary, lessons) ships as versioned seed data in src/data/seed and
-- is referenced here by its stable slug (`task_ref`, `vocabulary_ref`,
-- `lesson_ref`). This keeps one source of truth for content in the MVP; moving
-- content into Postgres later means adding tables and adding foreign keys to
-- these ref columns, with no change to review history.
--
-- Every table below is user-scoped and has RLS enabled. RLS is the authority on
-- access — route guards and hidden UI are not.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  email text,
  avatar_url text,
  baseline_score numeric(3, 1) not null default 0
    check (baseline_score >= 0 and baseline_score <= 10),
  daily_minutes int not null default 20
    check (daily_minutes in (10, 15, 20, 30)),
  onboarding_complete boolean not null default false,
  -- Points accumulate from completed tasks and successful reviews; the
  -- displayed 0-10 score is derived from this, never stored pre-computed.
  progress_points int not null default 0 check (progress_points >= 0),
  enrolled_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- RLS decides WHICH row; column grants decide WHICH fields. Learners may edit
-- their own settings but never `progress_points`, which only triggers write.
revoke insert, update on public.profiles from anon, authenticated;
grant insert (id, display_name, email, avatar_url)
  on public.profiles to authenticated;
grant update (display_name, email, avatar_url, baseline_score, daily_minutes,
              onboarding_complete, enrolled_on, updated_at)
  on public.profiles to authenticated;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- ---------------------------------------------------------------------------
-- user_task_progress
-- ---------------------------------------------------------------------------
create table if not exists public.user_task_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  task_ref text not null,
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'completed')),
  completed_at timestamptz,
  -- Points this completion earns. The rule lives in the app
  -- (src/domain/progress/score.ts); the database only bounds it.
  points int not null default 0 check (points between 0 and 20),
  created_at timestamptz not null default now(),
  unique (user_id, task_ref)
);

create index if not exists user_task_progress_user_status_idx
  on public.user_task_progress (user_id, status);

alter table public.user_task_progress enable row level security;

-- Completion rows are append-only for learners: a completion is recorded once
-- and never edited, so its points can only ever be awarded once.
revoke update, delete on public.user_task_progress from anon, authenticated;

drop policy if exists "task_progress_select_own" on public.user_task_progress;
create policy "task_progress_select_own" on public.user_task_progress
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "task_progress_insert_own" on public.user_task_progress;
create policy "task_progress_insert_own" on public.user_task_progress
  for insert to authenticated with check ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- user_lesson_progress
-- ---------------------------------------------------------------------------
create table if not exists public.user_lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_ref text not null,
  completed_at timestamptz not null default now(),
  unique (user_id, lesson_ref)
);

create index if not exists user_lesson_progress_user_idx
  on public.user_lesson_progress (user_id);

alter table public.user_lesson_progress enable row level security;

drop policy if exists "lesson_progress_rw_own" on public.user_lesson_progress;
create policy "lesson_progress_rw_own" on public.user_lesson_progress
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- user_cards — per-user spaced-repetition state
-- ---------------------------------------------------------------------------
create table if not exists public.user_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  vocabulary_ref text not null,
  due_at timestamptz not null default now(),
  interval_days numeric(6, 3) not null default 0,
  ease_factor numeric(4, 2) not null default 2.50,
  repetitions int not null default 0,
  last_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, vocabulary_ref)
);

create index if not exists user_cards_user_due_idx
  on public.user_cards (user_id, due_at);

alter table public.user_cards enable row level security;

drop policy if exists "user_cards_rw_own" on public.user_cards;
create policy "user_cards_rw_own" on public.user_cards
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- review_events — immutable history
-- ---------------------------------------------------------------------------
create table if not exists public.review_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  user_card_id uuid not null references public.user_cards (id) on delete cascade,
  grade text not null check (grade in ('again', 'hard', 'good', 'easy')),
  reviewed_at timestamptz not null default now(),
  old_due_at timestamptz,
  new_due_at timestamptz,
  old_interval_days numeric(6, 3),
  new_interval_days numeric(6, 3),
  -- Points this review earns; rule in the app, bound in the schema.
  points int not null default 0 check (points between 0 and 5)
);

create index if not exists review_events_user_reviewed_idx
  on public.review_events (user_id, reviewed_at);

alter table public.review_events enable row level security;

-- History is append-only: learners may write and read their own events, but
-- there is deliberately no update or delete policy.
drop policy if exists "review_events_select_own" on public.review_events;
create policy "review_events_select_own" on public.review_events
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "review_events_insert_own" on public.review_events;
create policy "review_events_insert_own" on public.review_events
  for insert to authenticated with check ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- progress points: awarded by trigger, never by a client call
-- ---------------------------------------------------------------------------
-- Points accrue only as a side effect of recording real activity, so there is
-- no function a client can call to raise its own score. Both source tables are
-- append-only for learners, so each completion and each review counts once.
create or replace function public.award_task_points()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'completed' then
    update public.profiles
       set progress_points = progress_points + new.points,
           updated_at = now()
     where id = new.user_id;
  end if;
  return new;
end;
$$;

drop trigger if exists award_task_points on public.user_task_progress;
create trigger award_task_points
  after insert on public.user_task_progress
  for each row execute function public.award_task_points();

create or replace function public.award_review_points()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
     set progress_points = progress_points + new.points,
         updated_at = now()
   where id = new.user_id;
  return new;
end;
$$;

drop trigger if exists award_review_points on public.review_events;
create trigger award_review_points
  after insert on public.review_events
  for each row execute function public.award_review_points();

-- Trigger functions are not meant to be called directly over the Data API.
revoke update, delete on public.review_events from anon, authenticated;
revoke all on function public.award_task_points() from public, anon, authenticated;
revoke all on function public.award_review_points() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- new-user trigger: create the profile row on sign-up
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.email,
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
