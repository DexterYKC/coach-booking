# Coach Booking — booking platform for independent coaches

A complete **appointment-booking web app for a solo coach** (originally built for a basketball / fitness coach): clients browse services, pick a free slot and book; the coach confirms and manages their schedule; an admin supervises everything. Notifications go out by email and WhatsApp.

This is a **sanitized demo export**. It runs with **zero configuration** thanks to an in-memory, Supabase-compatible mock backend, so the full flow can be tried without creating any account. The UI is in French; code and docs are in English.

## Features

- **Three roles**: client, coach (a single account created by the admin) and admin
- Public landing page: hero, about, services, how-it-works, reviews, location map, contact form
- Email + password signup with email verification; editable profile with avatar upload
- **Booking flow**: service catalogue, 7-day slot picker, **double-booking prevention**, price snapshot stored on the booking, status badges (pending / confirmed / cancelled)
- **Coach space**: dashboard, weekly schedule and availability, booking confirmation, services CRUD, public profile with gallery and social links
- **Review system** with moderation by coach and admin
- **Admin space**: KPIs, users, bookings, services, schedule, notification templates, contact messages
- **Notifications**: email (Resend) and a provider-agnostic WhatsApp sender, with dynamic templates (`{{first_name}}`, `{{slot_date}}`, …). Without API keys they fall back to console logging.

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase (Postgres, Auth, Storage, **Row Level Security**) · Resend · Netlify.

## Architecture notes

- `frontend/supabase/migrations/` holds the schema, storage buckets and RLS policies. Users only access their own rows; coach/admin policies widen access; admin-only operations go through the service-role key on the server.
- `frontend/src/lib/mock/` re-implements the subset of the Supabase client / PostgREST query surface the app uses (auth, query builder, storage), so the same UI code runs against the mock or real Supabase depending on whether the env vars are set.
- REST endpoints live under `src/app/api/` (bookings, services, schedule, coach-profile, reviews, notifications, admin stats and users, upload, contact).

## Run it locally

```bash
cd frontend
npm install
npm run dev     # mock mode, no env needed
```

Demo accounts are shown on the login page when `NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS=true`. To use real Supabase, copy `.env.example` to `.env.local`, run the SQL migrations, then `node scripts/seed-admin.mjs`.

## Status

Feature-complete demo. A real deployment needs your own Supabase project, a verified Resend domain and, optionally, a WhatsApp Business provider.
