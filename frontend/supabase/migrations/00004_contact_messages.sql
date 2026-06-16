-- Public contact form submissions, visible only to admins.
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

drop policy if exists "Anyone can submit a contact message" on public.contact_messages;
create policy "Anyone can submit a contact message"
  on public.contact_messages for insert
  with check (true);

drop policy if exists "Admins can read contact messages" on public.contact_messages;
create policy "Admins can read contact messages"
  on public.contact_messages for select
  using (public.is_admin());

drop policy if exists "Admins can update contact messages" on public.contact_messages;
create policy "Admins can update contact messages"
  on public.contact_messages for update
  using (public.is_admin());

drop policy if exists "Admins can delete contact messages" on public.contact_messages;
create policy "Admins can delete contact messages"
  on public.contact_messages for delete
  using (public.is_admin());
