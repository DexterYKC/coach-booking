-- Adds an optional cover image to each service, editable by the coach or admin.
alter table public.services
  add column if not exists image_url text;

insert into storage.buckets (id, name, public)
values ('service-images', 'service-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read service-images" on storage.objects;
create policy "Public read service-images"
  on storage.objects for select
  using (bucket_id = 'service-images');

drop policy if exists "Coach service images insert" on storage.objects;
create policy "Coach service images insert"
  on storage.objects for insert
  with check (
    bucket_id = 'service-images'
    and (public.is_admin() or public.is_coach())
  );

drop policy if exists "Coach service images update" on storage.objects;
create policy "Coach service images update"
  on storage.objects for update
  using (
    bucket_id = 'service-images'
    and (public.is_admin() or public.is_coach())
  );

drop policy if exists "Coach service images delete" on storage.objects;
create policy "Coach service images delete"
  on storage.objects for delete
  using (
    bucket_id = 'service-images'
    and (public.is_admin() or public.is_coach())
  );
