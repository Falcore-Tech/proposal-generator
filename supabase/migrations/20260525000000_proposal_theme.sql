-- ---------------------------------------------------------------------------
-- Proposal viewer theming
--   * per-proposal theme override (animated_proposals.theme, null = use global)
--   * global default theme (app_settings singleton)
-- Theme ids must match lib/proposal-themes.ts THEMES.
-- ---------------------------------------------------------------------------

create or replace function public.is_valid_proposal_theme(p_theme text)
returns boolean
language sql immutable as $$
  select p_theme in ('latte', 'rose-pine-dawn', 'solarized-light', 'nord', 'dracula');
$$;

-- --- per-proposal override --------------------------------------------------

alter table public.animated_proposals
  add column if not exists theme text
  check (theme is null or public.is_valid_proposal_theme(theme));

-- --- global default (single-row settings table) -----------------------------

create table if not exists public.app_settings (
  id             boolean primary key default true,
  proposal_theme text not null default 'latte'
                 check (public.is_valid_proposal_theme(proposal_theme)),
  updated_at     timestamptz not null default now(),
  updated_by     uuid references auth.users(id),
  constraint app_settings_singleton check (id)
);

insert into public.app_settings (id) values (true)
  on conflict (id) do nothing;

alter table public.app_settings enable row level security;

-- The public proposal viewer (anon) must read the global theme.
create policy "app_settings_select" on public.app_settings
  for select to anon, authenticated
  using (true);

-- Any logged-in user may change the global theme.
create policy "app_settings_update" on public.app_settings
  for update to authenticated
  using (true)
  with check (true);

grant select on public.app_settings to anon, authenticated;
grant update on public.app_settings to authenticated;
