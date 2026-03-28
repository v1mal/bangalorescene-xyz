create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'event_status') then
    create type event_status as enum ('pending', 'approved', 'rejected', 'hidden');
  end if;
end $$;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  status event_status not null default 'pending',
  title text not null,
  summary text not null default '',
  description text not null default '',
  source_url text not null,
  source_name text not null default '',
  source_event_id text not null default '',
  event_start_at timestamptz not null,
  event_end_at timestamptz,
  timezone text not null default 'Asia/Kolkata',
  venue_name text not null default '',
  venue_address text not null default '',
  neighborhood text not null default '',
  category text not null default 'General',
  price_text text not null default '',
  image_url text,
  reason text not null default '',
  suggestion text not null default '',
  score numeric,
  tags text[] not null default '{}',
  published_at timestamptz,
  last_reviewed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists events_status_idx on public.events (status);
create index if not exists events_event_start_idx on public.events (event_start_at);
create index if not exists events_slug_idx on public.events (slug);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
before update on public.events
for each row
execute function public.set_updated_at();

alter table public.events enable row level security;

create policy "Authenticated curators can read events"
on public.events
for select
to authenticated
using (true);

create policy "Authenticated curators can update events"
on public.events
for update
to authenticated
using (true)
with check (true);
