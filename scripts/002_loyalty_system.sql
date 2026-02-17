-- scripts/002_loyalty_system.sql
-- Loyalty points table
create table if not exists public.loyalty_points (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null,
  reason text not null,
  created_at timestamp with time zone default now()
);

alter table public.loyalty_points enable row level security;

create policy "loyalty_points_select_own" on public.loyalty_points for select using (auth.uid() = user_id);
create policy "loyalty_points_insert_own" on public.loyalty_points for insert with check (auth.uid() = user_id);

-- Badges table
create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  icon_url text,
  created_at timestamp with time zone default now()
);

alter table public.badges enable row level security;

create policy "badges_select_public" on public.badges for select using (true);

-- User badges (many-to-many)
create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  earned_at timestamp with time zone default now(),
  unique(user_id, badge_id)
);

alter table public.user_badges enable row level security;

create policy "user_badges_select_own" on public.user_badges for select using (auth.uid() = user_id);
create policy "user_badges_insert_own" on public.user_badges for insert with check (auth.uid() = user_id);
create policy "user_badges_select_public" on public.user_badges for select using (true);
