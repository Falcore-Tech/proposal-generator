-- Down migration: remove animated proposals feature
-- Apply manually via: psql $SUPABASE_DB_URL -f supabase/migrations/archive/20260424_animated_proposals_down.sql

drop trigger if exists animated_proposals_updated_at on public.animated_proposals;
drop function if exists public.set_animated_updated_at();
drop function if exists public.get_animated_by_token(text);
drop table if exists public.animated_proposal_events;
drop table if exists public.animated_proposals;
