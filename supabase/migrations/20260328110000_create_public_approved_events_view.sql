create or replace view public.public_approved_events as
select
  id,
  slug,
  title,
  summary,
  event_start_at,
  event_end_at,
  timezone,
  venue_name,
  neighborhood,
  category,
  price_text,
  source_url,
  image_url,
  tags
from public.events
where status = 'approved';

grant select on public.public_approved_events to authenticated;
grant select on public.public_approved_events to anon;
