-- Adds editable social media links (Facebook, Instagram, TikTok) to the coach profile.
-- Each link is optional — an absent/empty key means the icon is hidden on the public site.
alter table public.coach_profile
  add column if not exists social_links jsonb not null default '{}'::jsonb;
