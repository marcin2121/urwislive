-- scripts/007_trigger_auto_create_profile.sql
-- Auto-create profile on new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'avatar_url', null)
  )
  on conflict (id) do nothing;

  -- Auto-create streak record
  insert into public.user_streaks (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  -- Auto-create notification preferences
  insert into public.notification_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  -- Auto-create profile showcase
  insert into public.profile_showcase (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
