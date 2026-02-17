-- scripts/004_streaks_and_freezes.sql
-- User streaks
create table if not exists public.user_streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  current_streak integer default 0,
  best_streak integer default 0,
  last_activity_date date,
  streak_frozen boolean default false,
  freeze_used_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.user_streaks enable row level security;

create policy "user_streaks_select_own" on public.user_streaks for select using (auth.uid() = user_id);
create policy "user_streaks_insert_own" on public.user_streaks for insert with check (auth.uid() = user_id);
create policy "user_streaks_update_own" on public.user_streaks for update using (auth.uid() = user_id);

-- Streak freeze items (power-ups/items)
create table if not exists public.user_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_type text not null,
  quantity integer default 1,
  acquired_at timestamp with time zone default now(),
  expires_at timestamp with time zone
);

alter table public.user_items enable row level security;

create policy "user_items_select_own" on public.user_items for select using (auth.uid() = user_id);
create policy "user_items_insert_own" on public.user_items for insert with check (auth.uid() = user_id);
create policy "user_items_update_own" on public.user_items for update using (auth.uid() = user_id);
