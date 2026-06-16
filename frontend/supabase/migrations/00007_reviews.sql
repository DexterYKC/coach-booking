-- Customer reviews, submitted by logged-in clients and moderated by the
-- coach or admin before appearing publicly on the homepage.
do $$ begin
  create type review_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text not null,
  status review_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reviews_status_idx on public.reviews(status);

alter table public.reviews enable row level security;

drop policy if exists "Reviews read" on public.reviews;
create policy "Reviews read"
  on public.reviews for select
  using (status = 'approved' or auth.uid() = user_id or public.is_admin() or public.is_coach());

drop policy if exists "Reviews owner insert" on public.reviews;
create policy "Reviews owner insert"
  on public.reviews for insert
  with check (auth.uid() = user_id);

drop policy if exists "Reviews moderate update" on public.reviews;
create policy "Reviews moderate update"
  on public.reviews for update
  using (public.is_admin() or public.is_coach());

drop policy if exists "Reviews moderate delete" on public.reviews;
create policy "Reviews moderate delete"
  on public.reviews for delete
  using (public.is_admin() or public.is_coach());

grant all on public.reviews to anon, authenticated, service_role;
