-- Tuteria referral case study — schema + seed
-- Run in Supabase SQL editor (or via `supabase db push`).

create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  -- the person who made the referral (receives the reward email)
  referrer_id uuid not null references public.users(id) on delete cascade,
  -- the referred person who enrolled
  user_id uuid not null references public.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  currency text not null default 'NGN',
  referral_amount integer not null default 5000,
  created_at timestamptz not null default now()
);

-- Explicit FK names so PostgREST joins resolve deterministically:
--   leads_referrer_id_fkey and leads_user_id_fkey
alter table public.leads
  drop constraint if exists leads_referrer_id_fkey,
  add constraint leads_referrer_id_fkey
    foreign key (referrer_id) references public.users(id) on delete cascade;

alter table public.leads
  drop constraint if exists leads_user_id_fkey,
  add constraint leads_user_id_fkey
    foreign key (user_id) references public.users(id) on delete cascade;

-- Enable RLS with read-only anon access (writes happen via service role on the server).
alter table public.users enable row level security;
alter table public.courses enable row level security;
alter table public.leads enable row level security;

drop policy if exists "read users" on public.users;
drop policy if exists "read courses" on public.courses;
drop policy if exists "read leads" on public.leads;

create policy "read users" on public.users for select using (true);
create policy "read courses" on public.courses for select using (true);
create policy "read leads" on public.leads for select using (true);

-- ---------- Seed data ----------
insert into public.users (id, name, email) values
  ('11111111-1111-1111-1111-111111111111', 'Olayinka Joseph', 'referrer@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'Amaka Obi', 'amaka@example.com'),
  ('33333333-3333-3333-3333-333333333333', 'Tunde Bello', 'tunde@example.com')
on conflict (id) do nothing;

insert into public.courses (id, name) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Medical Coding Fundamentals'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Clinical Documentation Improvement')
on conflict (id) do nothing;

insert into public.leads (id, referrer_id, user_id, course_id, currency, referral_amount) values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc',
   '11111111-1111-1111-1111-111111111111',
   '22222222-2222-2222-2222-222222222222',
   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'NGN', 5000),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd',
   '11111111-1111-1111-1111-111111111111',
   '33333333-3333-3333-3333-333333333333',
   'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'NGN', 7500)
on conflict (id) do nothing;
