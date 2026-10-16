-- =====================================================================
-- KROK 2b: Koło fortuny i gry arcade (zmiany ADDYTYWNE)
-- =====================================================================

begin;

-- 1. Atomowe przyznanie kuponu z koła: jedna wygrana na dobę (czas polski).
--    Blokada doradcza zapobiega wyścigowi przy równoległych kliknięciach.
--    Wywołuje tylko serwer (service role) po weryfikacji użytkownika.
create or replace function public.claim_wheel_coupon(
  p_user_id uuid,
  p_title text,
  p_code text,
  p_description text,
  p_gradient text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform pg_advisory_xact_lock(hashtext('wheel:' || p_user_id::text));

  if exists (
    select 1 from public.kupony
    where user_id = p_user_id
      and timezone('Europe/Warsaw', created_at)::date = timezone('Europe/Warsaw', now())::date
  ) then
    return false;
  end if;

  insert into public.kupony
    (user_id, title, code, description, gradient, is_reusable, usage_limit, current_usage, expires_at, is_active)
  values
    (p_user_id, p_title, p_code, p_description, p_gradient, false, 1, 0, null, true);

  return true;
end;
$$;

revoke execute on function public.claim_wheel_coupon(uuid, text, text, text, text) from public, anon, authenticated;
grant  execute on function public.claim_wheel_coupon(uuid, text, text, text, text) to service_role;

-- 2. Cooldown nagród z gier arcade (wcześniej można było je wywoływać w pętli)
alter table public.urwis_pet
  add column if not exists last_arcade_reward_at timestamptz;

commit;
