-- =====================================================================
-- KROK 2/3: Helpery bezpieczeństwa i RPC dla sklepu (zmiany ADDYTYWNE)
-- =====================================================================
-- Nic nie odbiera dostępu - można zastosować od razu, przed wdrożeniem kodu.
-- Przygotowuje grunt pod krok 3 (dokręcenie RLS).

begin;

-- ---------------------------------------------------------------------
-- 1. Jedno źródło prawdy o adminie: app_metadata.role (użytkownik NIE może
--    go zmienić sam, w przeciwieństwie do user_metadata). Tak samo sprawdza
--    to proxy.ts dla /admin.
-- ---------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
$$;

-- Nadanie roli admina kolejnym kontom (odkomentuj właściwe przed zastosowaniem).
-- Dziś app_metadata.role = 'admin' ma tylko admin@sklep-urwis.pl.
-- update auth.users
--    set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'
--  where email in ('marcin.molenda17@wp.pl');

-- ---------------------------------------------------------------------
-- 2. loyalty_cards: powiązanie karty z kontem (dziś tylko przez numer
--    telefonu, a kod w /api/urwis/sync i WheelTab odwołuje się do
--    nieistniejących kolumn user_id / auth_user_id).
-- ---------------------------------------------------------------------
alter table public.loyalty_cards
  add column if not exists auth_user_id uuid
    default auth.uid()
    references auth.users(id) on delete set null;

create unique index if not exists loyalty_cards_auth_user_id_key
  on public.loyalty_cards (auth_user_id);

-- Jednorazowe dopasowanie istniejących kart (56 z 61 ma pasujący telefon)
update public.loyalty_cards c
   set auth_user_id = u.id
  from auth.users u
 where c.auth_user_id is null
   and u.raw_user_meta_data ->> 'phone' = c.phone_number;

-- Trigger rejestracji: zakłada kartę od razu powiązaną z kontem
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.loyalty_cards (phone_number, full_name, points, auth_user_id)
  values (
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'full_name',
    0,
    new.id
  );
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- 3. Realizacja kuponu przy kasie (zastępuje bezpośredni UPDATE z
--    przeglądarki w /rabaty, który pozwalał zmienić dowolne pole).
-- ---------------------------------------------------------------------
create or replace function public.redeem_coupon(p_coupon_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_updated integer;
begin
  if auth.uid() is null then
    return false;
  end if;

  update public.kupony k
     set current_usage = coalesce(k.current_usage, 0) + 1
   where k.id = p_coupon_id
     and k.is_active
     and (k.expires_at is null or k.expires_at > now())
     and (
       k.user_id is null                     -- kupon ogólny: licznik to statystyka
       or (
         k.user_id = auth.uid()              -- kupon osobisty: pilnujemy limitu
         and (k.is_reusable or coalesce(k.current_usage, 0) < coalesce(k.usage_limit, 1))
       )
     );

  get diagnostics v_updated = row_count;
  return v_updated > 0;
end;
$$;

revoke execute on function public.redeem_coupon(uuid) from public, anon;
grant  execute on function public.redeem_coupon(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- 4. Subskrypcje push bez publicznego odczytu tabeli. Znajomość endpointu
--    (unikalny, losowy URL od przeglądarki) jest "kluczem" do własnego wiersza.
-- ---------------------------------------------------------------------
create or replace function public.push_subscribe(
  p_endpoint text,
  p_subscription jsonb,
  p_topics text[] default array['wszystkie']
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_endpoint is null or p_endpoint !~ '^https://' or length(p_endpoint) > 1000 then
    raise exception 'Nieprawidłowy endpoint';
  end if;
  if p_subscription ->> 'endpoint' is distinct from p_endpoint then
    raise exception 'Endpoint nie zgadza się z subskrypcją';
  end if;
  if coalesce(array_length(p_topics, 1), 0) > 20 then
    raise exception 'Za dużo kategorii';
  end if;

  insert into public.push_subscriptions (endpoint, subscription_data, topics)
  values (p_endpoint, p_subscription, coalesce(p_topics, array['wszystkie']))
  on conflict (endpoint) do update
    set subscription_data = excluded.subscription_data,
        topics            = excluded.topics;
end;
$$;

create or replace function public.push_get_topics(p_endpoint text)
returns text[]
language sql
stable
security definer
set search_path = ''
as $$
  select topics from public.push_subscriptions where endpoint = p_endpoint
$$;

create or replace function public.push_set_topics(p_endpoint text, p_topics text[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(array_length(p_topics, 1), 0) > 20 then
    raise exception 'Za dużo kategorii';
  end if;

  update public.push_subscriptions
     set topics = coalesce(p_topics, '{}')
   where endpoint = p_endpoint;
end;
$$;

revoke execute on function public.push_subscribe(text, jsonb, text[]) from public;
revoke execute on function public.push_get_topics(text)               from public;
revoke execute on function public.push_set_topics(text, text[])       from public;
grant  execute on function public.push_subscribe(text, jsonb, text[]) to anon, authenticated;
grant  execute on function public.push_get_topics(text)               to anon, authenticated;
grant  execute on function public.push_set_topics(text, text[])       to anon, authenticated;

commit;
