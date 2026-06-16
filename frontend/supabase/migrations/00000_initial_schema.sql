-- =====================================================================
-- BASKETBALL COACHING TUNISIA — Initial Schema
-- =====================================================================
-- Run this in the Supabase SQL editor or via the Supabase CLI:
--   supabase db push
-- =====================================================================

-- Extensions
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
do $$ begin
  create type user_role as enum ('user', 'coach', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type basketball_level as enum ('debutant', 'intermediaire', 'avance', 'aucun');
exception when duplicate_object then null; end $$;

do $$ begin
  create type age_group as enum ('enfant', 'adolescent', 'adulte', 'senior');
exception when duplicate_object then null; end $$;

do $$ begin
  create type booking_status as enum ('en_attente', 'confirme', 'annule');
exception when duplicate_object then null; end $$;

do $$ begin
  create type notification_type as enum (
    'booking_created_user',
    'booking_status_user',
    'booking_created_admin',
    'booking_status_admin'
  );
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- PROFILES — extends auth.users
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'user',
  first_name text,
  last_name text,
  email text,
  phone text,
  city text,
  basketball_level basketball_level default 'aucun',
  age_group age_group default 'adulte',
  avatar_url text,
  banned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles(role);

-- ---------------------------------------------------------------------
-- SERVICES — bookable services
-- ---------------------------------------------------------------------
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  duration_minutes int not null default 60,
  price numeric(10,2) default 0,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- COACH PROFILE — singleton row for the one coach
-- ---------------------------------------------------------------------
create table if not exists public.coach_profile (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null default 'Coach Basketball',
  tagline text default 'Coach de basketball certifié — Tunisie',
  bio text,
  photo_url text,
  gallery jsonb not null default '[]'::jsonb,
  location text default 'Tunis, Tunisie',
  specialties text[] not null default '{}',
  certifications text[] not null default '{}',
  experience_years int default 0,
  philosophy text,
  contact_email text,
  contact_phone text,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- AVAILABILITY SLOTS — recurring weekly schedule
-- day_of_week: 0 = Sunday ... 6 = Saturday
-- ---------------------------------------------------------------------
create table if not exists public.availability_slots (
  id uuid primary key default gen_random_uuid(),
  day_of_week int not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists availability_day_idx on public.availability_slots(day_of_week);

-- ---------------------------------------------------------------------
-- BOOKINGS
-- ---------------------------------------------------------------------
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete restrict,
  slot_date date not null,
  slot_time time not null,
  status booking_status not null default 'en_attente',
  notes text,
  price_snapshot numeric(10,2) default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bookings_user_idx on public.bookings(user_id);
create index if not exists bookings_status_idx on public.bookings(status);
create index if not exists bookings_date_idx on public.bookings(slot_date);

-- ---------------------------------------------------------------------
-- NOTIFICATION CONFIG
-- ---------------------------------------------------------------------
create table if not exists public.notification_emails (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  label text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.notification_whatsapp (
  id uuid primary key default gen_random_uuid(),
  phone_number text not null unique,
  label text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.notification_templates (
  id uuid primary key default gen_random_uuid(),
  type notification_type not null unique,
  subject text,
  body_email text,
  body_whatsapp text,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- AUDIT — last activity for the admin feed (optional)
-- ---------------------------------------------------------------------
create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- =====================================================================
--  TRIGGER: auto-create profile when a new auth user is created
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, last_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'user')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
--  Helper: check role
-- =====================================================================
create or replace function public.current_user_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role from public.profiles where id = auth.uid()) = 'admin', false);
$$;

create or replace function public.is_coach()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role from public.profiles where id = auth.uid()) = 'coach', false);
$$;

-- =====================================================================
--  ROW LEVEL SECURITY
-- =====================================================================
alter table public.profiles            enable row level security;
alter table public.services            enable row level security;
alter table public.coach_profile       enable row level security;
alter table public.availability_slots  enable row level security;
alter table public.bookings            enable row level security;
alter table public.notification_emails enable row level security;
alter table public.notification_whatsapp enable row level security;
alter table public.notification_templates enable row level security;
alter table public.activity_log        enable row level security;

-- ---------------- PROFILES ----------------
drop policy if exists "Profile self select" on public.profiles;
create policy "Profile self select"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin() or public.is_coach());

drop policy if exists "Profile self update" on public.profiles;
create policy "Profile self update"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin());

drop policy if exists "Profile admin insert" on public.profiles;
create policy "Profile admin insert"
  on public.profiles for insert
  with check (public.is_admin() or auth.uid() = id);

drop policy if exists "Profile admin delete" on public.profiles;
create policy "Profile admin delete"
  on public.profiles for delete
  using (public.is_admin());

-- ---------------- SERVICES (public read) ----------------
drop policy if exists "Services public read" on public.services;
create policy "Services public read"
  on public.services for select
  using (true);

drop policy if exists "Services admin write" on public.services;
create policy "Services admin write"
  on public.services for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------- COACH PROFILE (public read) ----------------
drop policy if exists "Coach public read" on public.coach_profile;
create policy "Coach public read"
  on public.coach_profile for select
  using (true);

drop policy if exists "Coach admin or coach write" on public.coach_profile;
create policy "Coach admin or coach write"
  on public.coach_profile for all
  using (public.is_admin() or public.is_coach())
  with check (public.is_admin() or public.is_coach());

-- ---------------- AVAILABILITY (public read) ----------------
drop policy if exists "Avail public read" on public.availability_slots;
create policy "Avail public read"
  on public.availability_slots for select
  using (true);

drop policy if exists "Avail admin or coach write" on public.availability_slots;
create policy "Avail admin or coach write"
  on public.availability_slots for all
  using (public.is_admin() or public.is_coach())
  with check (public.is_admin() or public.is_coach());

-- ---------------- BOOKINGS ----------------
drop policy if exists "Bookings owner select" on public.bookings;
create policy "Bookings owner select"
  on public.bookings for select
  using (auth.uid() = user_id or public.is_admin() or public.is_coach());

drop policy if exists "Bookings owner insert" on public.bookings;
create policy "Bookings owner insert"
  on public.bookings for insert
  with check (auth.uid() = user_id);

drop policy if exists "Bookings update admin coach" on public.bookings;
create policy "Bookings update admin coach"
  on public.bookings for update
  using (public.is_admin() or public.is_coach() or auth.uid() = user_id);

drop policy if exists "Bookings delete admin" on public.bookings;
create policy "Bookings delete admin"
  on public.bookings for delete
  using (public.is_admin());

-- ---------------- NOTIFICATION CONFIG (admin only) ----------------
drop policy if exists "Notif emails admin" on public.notification_emails;
create policy "Notif emails admin"
  on public.notification_emails for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Notif whatsapp admin" on public.notification_whatsapp;
create policy "Notif whatsapp admin"
  on public.notification_whatsapp for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Notif templates admin" on public.notification_templates;
create policy "Notif templates admin"
  on public.notification_templates for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------- ACTIVITY LOG (admin only) ----------------
drop policy if exists "Activity admin select" on public.activity_log;
create policy "Activity admin select"
  on public.activity_log for select
  using (public.is_admin());

-- =====================================================================
--  SEED DATA
-- =====================================================================
insert into public.coach_profile (full_name, tagline, bio, location, specialties, certifications, experience_years, philosophy)
select
  'Coach Basketball',
  'Coach de basketball certifié — Tunisie',
  'Coach passionné depuis plus de 10 ans, je propose un coaching individuel et collectif adapté à tous les niveaux. Ma méthode allie technique, condition physique et plaisir du jeu.',
  'Tunis, Tunisie',
  array['Tir à 3 points', 'Dribble & handle', 'Préparation physique', 'Tactique de jeu'],
  array['BEES Basketball', 'FIBA Coach Level 1'],
  10,
  'Le basketball, c''est avant tout du collectif et du dépassement de soi.'
where not exists (select 1 from public.coach_profile);

insert into public.services (name, description, duration_minutes, price, sort_order)
values
  ('Coaching basketball individuel', 'Séance personnalisée de coaching basketball technique et tactique.', 60, 60, 1),
  ('Coaching basketball groupe', 'Séance collective (2 à 6 joueurs) — technique, tactique et match.', 90, 35, 2),
  ('Fitness & préparation physique', 'Préparation physique adaptée à tous les âges — endurance, gainage, agilité.', 60, 45, 3),
  ('Basketball jeunes (6-15 ans)', 'Initiation et perfectionnement pour les jeunes joueurs en toute sécurité.', 60, 40, 4)
on conflict do nothing;

insert into public.availability_slots (day_of_week, start_time, end_time, active)
values
  (1, '09:00', '10:00', true),
  (1, '10:00', '11:00', true),
  (1, '17:00', '18:00', true),
  (1, '18:00', '19:00', true),
  (2, '17:00', '18:00', true),
  (2, '18:00', '19:00', true),
  (3, '09:00', '10:00', true),
  (3, '10:00', '11:00', true),
  (3, '17:00', '18:00', true),
  (4, '17:00', '18:00', true),
  (4, '18:00', '19:00', true),
  (5, '09:00', '10:00', true),
  (5, '17:00', '18:00', true),
  (6, '09:00', '10:00', true),
  (6, '10:00', '11:00', true),
  (6, '11:00', '12:00', true)
on conflict do nothing;

insert into public.notification_templates (type, subject, body_email, body_whatsapp) values
  ('booking_created_user',
   'Votre demande de réservation est bien reçue',
   'Bonjour {{first_name}},\n\nNous avons bien reçu votre demande de réservation pour "{{service_name}}" le {{slot_date}} à {{slot_time}}.\n\nElle est actuellement EN ATTENTE de confirmation par le coach.\n\nÀ très vite,\nL''équipe Coaching Basketball',
   'Bonjour {{first_name}} 👋\nVotre demande de réservation pour {{service_name}} le {{slot_date}} à {{slot_time}} est bien enregistrée. Statut: EN ATTENTE.'),
  ('booking_status_user',
   'Mise à jour de votre réservation',
   'Bonjour {{first_name}},\n\nVotre réservation pour "{{service_name}}" le {{slot_date}} à {{slot_time}} est désormais: {{status}}.\n\nMerci,\nCoaching Basketball Tunisie',
   'Bonjour {{first_name}}, votre réservation pour {{service_name}} le {{slot_date}} à {{slot_time}} est désormais: {{status}}.'),
  ('booking_created_admin',
   'Nouvelle réservation reçue',
   'Nouvelle réservation:\n- Client: {{first_name}} {{last_name}} ({{email}})\n- Téléphone: {{phone}}\n- Service: {{service_name}}\n- Date: {{slot_date}} à {{slot_time}}\n\nMerci de confirmer ou annuler la demande.',
   'Nouvelle réservation: {{first_name}} {{last_name}} - {{service_name}} - {{slot_date}} {{slot_time}}'),
  ('booking_status_admin',
   'Statut de réservation modifié',
   'La réservation de {{first_name}} {{last_name}} pour "{{service_name}}" le {{slot_date}} à {{slot_time}} est maintenant: {{status}}.',
   'Statut MAJ: {{first_name}} {{last_name}} - {{service_name}} {{slot_date}} {{slot_time}} = {{status}}')
on conflict (type) do nothing;

-- =====================================================================
--  STORAGE BUCKETS — run separately in Supabase SQL editor
-- =====================================================================
-- To create the storage buckets, also run:
--
--   insert into storage.buckets (id, name, public) values ('coach-images', 'coach-images', true)
--     on conflict (id) do nothing;
--   insert into storage.buckets (id, name, public) values ('user-avatars', 'user-avatars', true)
--     on conflict (id) do nothing;
--
-- And add policies:
--   create policy "Public read avatars" on storage.objects for select using (bucket_id = 'user-avatars');
--   create policy "Public read coach-images" on storage.objects for select using (bucket_id = 'coach-images');
--   create policy "Own avatar write" on storage.objects for insert with check (bucket_id = 'user-avatars' and auth.uid()::text = (storage.foldername(name))[1]);
--   create policy "Own avatar update" on storage.objects for update using (bucket_id = 'user-avatars' and auth.uid()::text = (storage.foldername(name))[1]);
--   create policy "Own avatar delete" on storage.objects for delete using (bucket_id = 'user-avatars' and auth.uid()::text = (storage.foldername(name))[1]);
--   create policy "Coach/admin coach-images" on storage.objects for all
--     using (bucket_id = 'coach-images' and (public.is_admin() or public.is_coach()))
--     with check (bucket_id = 'coach-images' and (public.is_admin() or public.is_coach()));
-- =====================================================================
