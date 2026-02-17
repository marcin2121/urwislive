-- scripts/006_leaderboards_and_rankings.sql
-- Leaderboards table
create table if not exists public.leaderboards (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  type text not null,
  period text default 'all_time',
  created_at timestamp with time zone default now()
);

alter table public.leaderboards enable row level security;

create policy "leaderboards_select_public" on public.leaderboards for select using (true);

-- Leaderboard entries
create table if not exists public.leaderboard_entries (
  id uuid primary key default gen_random_uuid(),
  leaderboard_id uuid not null references public.leaderboards(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rank integer,
  score integer not null,
  updated_at timestamp with time zone default now(),
  unique(leaderboard_id, user_id)
);

alter table public.leaderboard_entries enable row level security;

create policy "leaderboard_entries_select_public" on public.leaderboard_entries for select using (true);
create policy "leaderboard_entries_insert_own" on public.leaderboard_entries for insert with check (auth.uid() = user_id);
create policy "leaderboard_entries_update_own" on public.leaderboard_entries for update using (auth.uid() = user_id);

-- Push notification preferences
create table if not exists public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  notifications_enabled boolean default true,
  email_notifications boolean default true,
  push_notifications boolean default true,
  mission_reminders boolean default true,
  event_alerts boolean default true,
  achievement_alerts boolean default true,
  streak_reminders boolean default true,
  updated_at timestamp with time zone default now()
);

alter table public.notification_preferences enable row level security;

create policy "notification_preferences_select_own" on public.notification_preferences for select using (auth.uid() = user_id);
create policy "notification_preferences_insert_own" on public.notification_preferences for insert with check (auth.uid() = user_id);
create policy "notification_preferences_update_own" on public.notification_preferences for update using (auth.uid() = user_id);

-- Profile showcase
create table if not exists public.profile_showcase (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  bio text,
  favorite_badge_id uuid references public.badges(id),
  featured_achievement_id uuid references public.achievements(id),
  theme text default 'default',
  is_public boolean default true,
  updated_at timestamp with time zone default now()
);

alter table public.profile_showcase enable row level security;

create policy "profile_showcase_select_own" on public.profile_showcase for select using (auth.uid() = user_id);
create policy "profile_showcase_insert_own" on public.profile_showcase for insert with check (auth.uid() = user_id);
create policy "profile_showcase_update_own" on public.profile_showcase for update using (auth.uid() = user_id);
create policy "profile_showcase_select_public" on public.profile_showcase for select using (is_public = true);
