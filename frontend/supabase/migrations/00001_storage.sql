-- =====================================================================
-- STORAGE BUCKETS & POLICIES
-- Run this AFTER the initial schema migration, in the Supabase SQL editor.
-- =====================================================================

insert into storage.buckets (id, name, public)
values ('coach-images', 'coach-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('user-avatars', 'user-avatars', true)
on conflict (id) do nothing;

-- Public read for both buckets (images are displayed publicly on home page / lists)
drop policy if exists "Public read coach-images" on storage.objects;
create policy "Public read coach-images"
  on storage.objects for select
  using (bucket_id = 'coach-images');

drop policy if exists "Public read user-avatars" on storage.objects;
create policy "Public read user-avatars"
  on storage.objects for select
  using (bucket_id = 'user-avatars');

-- user-avatars: each user can only write under their uid/ folder
drop policy if exists "Own avatar insert" on storage.objects;
create policy "Own avatar insert"
  on storage.objects for insert
  with check (
    bucket_id = 'user-avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Own avatar update" on storage.objects;
create policy "Own avatar update"
  on storage.objects for update
  using (
    bucket_id = 'user-avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Own avatar delete" on storage.objects;
create policy "Own avatar delete"
  on storage.objects for delete
  using (
    bucket_id = 'user-avatars'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or public.is_admin()
    )
  );

-- coach-images: only coach or admin can write
drop policy if exists "Coach images insert" on storage.objects;
create policy "Coach images insert"
  on storage.objects for insert
  with check (
    bucket_id = 'coach-images'
    and (public.is_admin() or public.is_coach())
  );

drop policy if exists "Coach images update" on storage.objects;
create policy "Coach images update"
  on storage.objects for update
  using (
    bucket_id = 'coach-images'
    and (public.is_admin() or public.is_coach())
  );

drop policy if exists "Coach images delete" on storage.objects;
create policy "Coach images delete"
  on storage.objects for delete
  using (
    bucket_id = 'coach-images'
    and (public.is_admin() or public.is_coach())
  );
