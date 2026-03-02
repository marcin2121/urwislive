create table if not exists public.bubble_shooter_scores (
    id uuid default gen_random_uuid() primary key,
    player_name text not null,
    score integer not null,
    level integer not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS
alter table public.bubble_shooter_scores enable row level security;

-- Allow anonymous read access
create policy "Allow anonymous select on bubble_shooter_scores"
    on public.bubble_shooter_scores for select
    using (true);

-- Allow anonymous insert access
create policy "Allow anonymous insert on bubble_shooter_scores"
    on public.bubble_shooter_scores for insert
    with check (true);
