-- =====================================================================
-- KROK 1/3: Archiwizacja tabel Akademii Urwisa i starego portalu z grami
-- =====================================================================
-- Tabele NIE są usuwane - trafiają do schematu `archive`, który nie jest
-- wystawiony przez API (PostgREST / GraphQL). Dane zostają, a cofnięcie to:
--   alter table archive.<nazwa> set schema public;
--
-- Bezpieczne do zastosowania od razu: kod sklepu nie używa żadnej z tych tabel.
-- UWAGA: przed zastosowaniem sprawdź w Dashboard → Authentication → Hooks,
-- że "Custom Access Token" hook NIE jest włączony (funkcja hooka czyta
-- archiwizowaną tabelę `profiles`).

begin;

create schema if not exists archive;
revoke all on schema archive from public, anon, authenticated;

-- 1. Usunięcie archiwizowanych tabel z publikacji Realtime
alter publication supabase_realtime
  drop table public.claimed_rewards, public.profiles, public.quiz_live_answers, public.quiz_rooms;

-- 2. urwis_pet ma klucz obcy do `schools` (żaden zwierzak nie ma przypisanej szkoły)
do $$
declare r record;
begin
  for r in
    select conname from pg_constraint
    where conrelid = 'public.urwis_pet'::regclass
      and contype = 'f'
      and confrelid = 'public.schools'::regclass
  loop
    execute format('alter table public.urwis_pet drop constraint %I', r.conname);
  end loop;
end $$;

-- 3. Widoki
alter view public.active_school_ranking set schema archive;
alter view public.quiz_leaderboard      set schema archive;
alter view public.online_status         set schema archive;

-- 4. Tabele - Akademia Urwisa
alter table public.academy_profiles        set schema archive;
alter table public.academy_quiz_sessions   set schema archive;
alter table public.classrooms              set schema archive;
alter table public.classroom_students      set schema archive;
alter table public.schools                 set schema archive;
alter table public.seasons                 set schema archive;
alter table public.school_season_scores    set schema archive;
alter table public.teams                   set schema archive;
alter table public.trivia_questions        set schema archive;
alter table public.quiz_questions          set schema archive;
alter table public.quiz_results            set schema archive;
alter table public.quiz_rooms              set schema archive;
alter table public.quiz_live_answers       set schema archive;
alter table public.quiz_sessions           set schema archive;
alter table public.weekly_challenges       set schema archive;
alter table public.challenge_completions   set schema archive;
alter table public.challenge_duels         set schema archive;

-- 5. Tabele - stary portal z grami / niewykorzystane
alter table public.profiles                 set schema archive;
alter table public.achievements             set schema archive;
alter table public.achievements_definitions set schema archive;
alter table public.user_achievements        set schema archive;
alter table public.badges                   set schema archive;
alter table public.user_badges              set schema archive;
alter table public.games                    set schema archive;
alter table public.game_types               set schema archive;
alter table public.game_scores              set schema archive;
alter table public.leaderboards             set schema archive;
alter table public.user_rankings            set schema archive;
alter table public.missions                 set schema archive;
alter table public.user_mission_progress    set schema archive;
alter table public.completed_missions       set schema archive;
alter table public.quests                   set schema archive;
alter table public.user_quests              set schema archive;
alter table public.events                   set schema archive;
alter table public.user_event_participation set schema archive;
alter table public.duels                    set schema archive;
alter table public.friendships              set schema archive;
alter table public.salutes                  set schema archive;
alter table public.hidden_urwis_finds       set schema archive;
alter table public.items                    set schema archive;
alter table public.inventory                set schema archive;
alter table public.user_items               set schema archive;
alter table public.rewards                  set schema archive;
alter table public.reward_claims            set schema archive;
alter table public.rewards_catalog          set schema archive;
alter table public.claimed_rewards          set schema archive;
alter table public.daily_rewards            set schema archive;
alter table public.exp_history              set schema archive;
alter table public.points_history           set schema archive;
alter table public.loyalty_points           set schema archive;
alter table public.loyalty_history          set schema archive;
alter table public.user_streaks             set schema archive;
alter table public.notification_preferences set schema archive;
alter table public.promo_codes              set schema archive;
alter table public.code_usages              set schema archive;
alter table public.used_codes               set schema archive;
alter table public.user_coupons             set schema archive;
alter table public.promotions               set schema archive;
alter table public.facebook_queue           set schema archive;
alter table public.waitlist                 set schema archive;
alter table public.site_settings            set schema archive;

-- 6. Funkcje starego portalu / Akademii (m.in. otwarte RPC do dodawania punktów)
alter function public.add_experience(uuid, integer, text)                 set schema archive;
alter function public.add_loyalty_points(uuid, integer, text)             set schema archive;
alter function public.spend_loyalty_points(uuid, integer, text)           set schema archive;
alter function public.claim_reward(uuid, integer)                         set schema archive;
alter function public.add_school_points_academy(uuid, integer)            set schema archive;
alter function public.increment_academy_points(uuid, integer)             set schema archive;
alter function public.get_random_trivia_questions(integer, text, text)    set schema archive;
alter function public.get_user_rank(uuid)                                 set schema archive;
alter function public.increment_code_uses(uuid)                           set schema archive;
alter function public.salute_agent(uuid, uuid)                            set schema archive;
alter function public.custom_access_token_hook(jsonb)                     set schema archive;

revoke all on all tables    in schema archive from public, anon, authenticated;
revoke all on all functions in schema archive from public, anon, authenticated;

-- 7. Kontrola: w public mają zostać dokładnie tabele sklepu.
--    Jeśli coś się nie zgadza, cała migracja jest wycofywana.
do $$
declare
  expected text[] := array[
    'arkanoid_scores','bubble_shooter_scores','klocki_scores','kupony','loyalty_cards',
    'promocje','push_analytics','push_history','push_subscriptions','shared_items',
    'urwis_pet','wheel_prizes'
  ];
  actual text[];
begin
  select array_agg(relname::text order by relname) into actual
  from pg_class where relnamespace = 'public'::regnamespace and relkind in ('r','v','m');

  if actual is distinct from expected then
    raise exception 'Nieoczekiwany stan schematu public: %', actual;
  end if;
end $$;

commit;
