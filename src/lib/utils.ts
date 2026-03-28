import type { AdminEventRecord, PublicEventRecord } from '@/lib/types';
import { publicEventCollectionSchema, publicEventRecordSchema } from '@/lib/types';

export function formatEventDateRange(event: Pick<PublicEventRecord, 'event_start_at' | 'event_end_at'>) {
  const start = new Date(event.event_start_at);
  const end = event.event_end_at ? new Date(event.event_end_at) : null;
  const options: Intl.DateTimeFormatOptions = {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata'
  };
  const startLabel = new Intl.DateTimeFormat('en-IN', options).format(start);

  if (!end) {
    return startLabel;
  }

  const sameDay = start.toDateString() === end.toDateString();
  if (sameDay) {
    const endTime = new Intl.DateTimeFormat('en-IN', {
      timeStyle: 'short',
      timeZone: 'Asia/Kolkata'
    }).format(end);
    return `${startLabel} - ${endTime}`;
  }

  const endLabel = new Intl.DateTimeFormat('en-IN', options).format(end);
  return `${startLabel} - ${endLabel}`;
}

export function isPastEvent(event: Pick<PublicEventRecord, 'event_start_at' | 'event_end_at'>, now = new Date()) {
  const edge = event.event_end_at ?? event.event_start_at;
  return new Date(edge).getTime() < now.getTime();
}

export function toPublicEventRecord(event: AdminEventRecord): PublicEventRecord | null {
  if (event.status !== 'approved') {
    return null;
  }

  return publicEventRecordSchema.parse({
    id: event.id,
    slug: event.slug,
    title: event.title,
    summary: event.summary,
    event_start_at: event.event_start_at,
    event_end_at: event.event_end_at,
    timezone: event.timezone,
    venue_name: event.venue_name,
    neighborhood: event.neighborhood,
    category: event.category,
    price_text: event.price_text,
    source_url: event.source_url,
    image_url: event.image_url,
    tags: event.tags
  });
}

export function parsePublicCollection(raw: unknown) {
  return publicEventCollectionSchema.parse(raw);
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
