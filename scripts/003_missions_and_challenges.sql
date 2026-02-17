-- scripts/003_missions_and_challenges.sql
-- Missions table
create table if not exists public.missions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null,
  exp_reward integer default 0,
  points_reward integer default 0,
  difficulty text default 'normal',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.missions enable row level security;

create policy "missions_select_public" on public.missions for select using (true);

-- User mission progress
create table if not exists public.user_mission_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mission_id uuid not null references public.missions(id) on delete cascade,
  status text default 'not_started',
  progress integer default 0,
  completed_at timestamp with time zone,
  started_at timestamp with time zone default now(),
  unique(user_id, mission_id)
);

alter table public.user_mission_progress enable row level security;

create policy "user_mission_progress_select_own" on public.user_mission_progress for select using (auth.uid() = user_id);
create policy "user_mission_progress_insert_own" on public.user_mission_progress for insert with check (auth.uid() = user_id);
create policy "user_mission_progress_update_own" on public.user_mission_progress for update using (auth.uid() = user_id);

-- Games (mini-games)
create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  exp_reward integer default 0,
  points_reward integer default 0,
  created_at timestamp with time zone default now()
);

alter table public.games enable row level security;

create policy "games_select_public" on public.games for select using (true);

-- Game scores
create table if not exists public.game_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  game_id uuid not null references public.games(id) on delete cascade,
  score integer not null,
  completed_at timestamp with time zone default now()
);

alter table public.game_scores enable row level security;

create policy "game_scores_select_own" on public.game_scores for select using (auth.uid() = user_id);
create policy "game_scores_insert_own" on public.game_scores for insert with check (auth.uid() = user_id);
create policy "game_scores_select_public" on public.game_scores for select using (true);
