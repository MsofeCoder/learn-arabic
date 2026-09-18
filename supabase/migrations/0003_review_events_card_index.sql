-- Covering index for the review_events -> user_cards foreign key, so cascade
-- deletes and per-card history lookups do not scan the whole table.
-- Raised by the Supabase performance advisor.
create index if not exists review_events_user_card_idx
  on public.review_events (user_card_id);
