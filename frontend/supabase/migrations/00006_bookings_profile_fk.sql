-- PostgREST can only auto-embed a relationship if there's an actual foreign
-- key it can discover. bookings.user_id only referenced auth.users(id), so
-- the app's "profile:profiles(...)" embeds (used on every bookings list)
-- silently failed with PGRST200 ("no relationship found"). Adding this FK
-- to public.profiles(id) (which mirrors auth.users.id 1:1) fixes the embed
-- without touching the existing auth.users FK.
alter table public.bookings
  add constraint bookings_user_id_profiles_fkey
  foreign key (user_id) references public.profiles(id) on delete cascade;
