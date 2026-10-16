-- =====================================================================
-- KROK 3/3: RLS dla tabel sklepu
-- =====================================================================
-- ZASTOSUJ DOPIERO PO WDROŻENIU KODU, który:
--   - używa RPC redeem_coupon / push_subscribe / push_get_topics / push_set_topics,
--   - w cronie push-scheduler i przy zapisie kuponu z koła używa klienta service role.
-- Wcześniejsze zastosowanie zepsuje /rabaty, przycisk powiadomień i koło fortuny.
--
-- Zasada: admin = public.is_admin() (app_metadata.role), service role omija RLS.

begin;

-- 1. Usuń WSZYSTKIE dotychczasowe polityki z tabel sklepu (było ich ~40,
--    w tym duplikaty i "Public update/delete" na danych klientów).
do $$
declare r record;
begin
  for r in
    select policyname, tablename from pg_policies
    where schemaname = 'public'
      and tablename in (
        'loyalty_cards','kupony','wheel_prizes','promocje',
        'push_subscriptions','push_history','push_analytics','shared_items',
        'urwis_pet','klocki_scores','bubble_shooter_scores','arkanoid_scores'
      )
  loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- 2. loyalty_cards - dane osobowe klientów (imię, telefon)
create policy "loyalty_cards: właściciel czyta swoją kartę"
  on public.loyalty_cards for select to authenticated
  using (auth_user_id = auth.uid() or public.is_admin());

create policy "loyalty_cards: właściciel zakłada pustą kartę"
  on public.loyalty_cards for insert to authenticated
  with check (
    auth_user_id = auth.uid()
    and coalesce(points, 0) = 0
    and coalesce(stamps_count, 0) = 0
    and not coalesce(reward_ready, false)
  );

create policy "loyalty_cards: admin zarządza"
  on public.loyalty_cards for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- 3. kupony - odczyt ogólnych i własnych; zmiany tylko admin
--    (realizacja przy kasie przez RPC redeem_coupon, losowanie przez service role)
create policy "kupony: odczyt ogólnych i własnych"
  on public.kupony for select to anon, authenticated
  using (user_id is null or user_id = auth.uid() or public.is_admin());

create policy "kupony: admin zarządza"
  on public.kupony for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- 4. wheel_prizes, promocje - publiczny odczyt, zmiany tylko admin
create policy "wheel_prizes: publiczny odczyt"
  on public.wheel_prizes for select to anon, authenticated using (true);
create policy "wheel_prizes: admin zarządza"
  on public.wheel_prizes for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "promocje: publiczny odczyt"
  on public.promocje for select to anon, authenticated using (true);
create policy "promocje: admin zarządza"
  on public.promocje for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- 5. push_subscriptions - tylko admin (klienci przez RPC push_*)
create policy "push_subscriptions: admin zarządza"
  on public.push_subscriptions for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- 6. push_history - tylko admin (dziś brak polityk = panel historii nie działa)
create policy "push_history: admin zarządza"
  on public.push_history for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- 7. push_analytics - każdy może zapisać zdarzenie, czyta tylko admin
create policy "push_analytics: zapis zdarzeń"
  on public.push_analytics for insert to anon, authenticated
  with check (length(coalesce(action, '')) <= 100 and length(coalesce(url, '')) <= 2000);
create policy "push_analytics: odczyt admin"
  on public.push_analytics for select to authenticated using (public.is_admin());

-- 8. shared_items - zapis przez zalogowanych (share-target), odczyt admin
create policy "shared_items: zapis zalogowanych"
  on public.shared_items for insert to authenticated with check (true);
create policy "shared_items: odczyt admin"
  on public.shared_items for select to authenticated using (public.is_admin());

-- 9. urwis_pet - ranking publiczny; zapisy wyłącznie przez serwer (service role),
--    inaczej każdy mógłby przez API ustawić sobie monety, poziom i postęp misji
create policy "urwis_pet: publiczny odczyt (ranking)"
  on public.urwis_pet for select to anon, authenticated using (true);

-- 10. Rankingi gier - publiczne, z rozsądnymi limitami
create policy "klocki_scores: publiczny odczyt"
  on public.klocki_scores for select to anon, authenticated using (true);
create policy "klocki_scores: zapis wyniku"
  on public.klocki_scores for insert to anon, authenticated
  with check (score between 0 and 10000000 and length(player_name) between 1 and 30);

create policy "bubble_shooter_scores: publiczny odczyt"
  on public.bubble_shooter_scores for select to anon, authenticated using (true);
create policy "bubble_shooter_scores: zapis wyniku"
  on public.bubble_shooter_scores for insert to anon, authenticated
  with check (score between 0 and 10000000 and length(player_name) between 1 and 30);

create policy "arkanoid_scores: publiczny odczyt"
  on public.arkanoid_scores for select to anon, authenticated using (true);
create policy "arkanoid_scores: zapis wyniku"
  on public.arkanoid_scores for insert to anon, authenticated
  with check (score between 0 and 10000000 and length(player_name) between 1 and 30);

-- 11. Storage push-images: publiczny podgląd, zapis/usuwanie tylko admin
drop policy if exists "Public Insert" on storage.objects;
drop policy if exists "Public Update" on storage.objects;
drop policy if exists "Public Delete" on storage.objects;

create policy "push-images: admin wgrywa"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'push-images' and public.is_admin());
create policy "push-images: admin aktualizuje"
  on storage.objects for update to authenticated
  using (bucket_id = 'push-images' and public.is_admin());
create policy "push-images: admin usuwa"
  on storage.objects for delete to authenticated
  using (bucket_id = 'push-images' and public.is_admin());

commit;
