create table
  public.arkanoid_scores (
    id uuid not null default gen_random_uuid (),
    player_name text not null,
    score integer not null,
    level integer not null,
    created_at timestamp with time zone not null default now(),
    constraint arkanoid_scores_pkey primary key (id)
  ) tablespace pg_default;

-- Włącz Row Level Security
alter table public.arkanoid_scores enable row level security;

-- Zasady dla odczytu anonimowego (każdy widzi tabelę wyników)
create policy "Allow anonymous read" on public.arkanoid_scores
  for select
  using (true);

-- Zasady dla dopisywania anonimowego wyników wgłąb API (każdy może wpisać wynik bez logowania Supabase Auth)
create policy "Allow anonymous insert" on public.arkanoid_scores
  for insert
  with check (true);
