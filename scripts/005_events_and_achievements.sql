-- scripts/005_events_and_achievements.sql
-- Time-limited events
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  exp_multiplier decimal default 1.0,
  points_multiplier decimal default 1.0,
  created_at timestamp with time zone default now()
);

alter table public.events enable row level security;

create policy "events_select_public" on public.events for select using (true);

-- User event participation
create table if not exists public.user_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  score integer default 0,
  joined_at timestamp with time zone default now(),
  unique(user_id, event_id)
);

alter table public.user_events enable row level security;

create policy "user_events_select_own" on public.user_events for select using (auth.uid() = user_id);
create policy "user_events_insert_own" on public.user_events for insert with check (auth.uid() = user_id);
create policy "user_events_update_own" on public.user_events for update using (auth.uid() = user_id);
create policy "user_events_select_public" on public.user_events for select using (true);

-- Achievements
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  icon_url text,
  requirement_type text not null,
  requirement_value integer not null,
  created_at timestamp with time zone default now()
);

alter table public.achievements enable row level security;

create policy "achievements_select_public" on public.achievements for select using (true);

-- User achievements (earned)
create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  unlocked_at timestamp with time zone default now(),
  unique(user_id, achievement_id)
);

alter table public.user_achievements enable row level security;

create policy "user_achievements_select_own" on public.user_achievements for select using (auth.uid() = user_id);
create policy "user_achievements_insert_own" on public.user_achievements for insert with check (auth.uid() = user_id);
create policy "user_achievements_select_public" on public.user_achievements for select using (true);
