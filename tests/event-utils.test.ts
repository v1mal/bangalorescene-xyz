import { describe, expect, it } from 'vitest';
import { decodePublicFeedPayload } from '@/lib/public-feed';
import { isPastEvent, parsePublicCollection, toPublicEventRecord } from '@/lib/utils';
import type { AdminEventRecord } from '@/lib/types';

const approvedEvent: AdminEventRecord = {
  id: '2de0aa4e-89f5-4b2f-8a17-71f74281ca47',
  slug: 'approved-event',
  status: 'approved',
  title: 'Approved Event',
  summary: 'A verified event.',
  description: '',
  source_url: 'https://example.com/event',
  source_name: 'Example',
  source_event_id: 'source-1',
  event_start_at: '2026-04-01T18:00:00+05:30',
  event_end_at: '2026-04-01T20:00:00+05:30',
  timezone: 'Asia/Kolkata',
  venue_name: 'Venue',
  venue_address: 'Address',
  neighborhood: 'Indiranagar',
  category: 'Music',
  price_text: 'Free',
  image_url: 'https://example.com/image.jpg',
  reason: 'Reason',
  suggestion: 'Suggestion',
  score: 0.8,
  published_at: '2026-03-28T09:00:00+05:30',
  created_at: '2026-03-28T09:00:00+05:30',
  updated_at: '2026-03-28T09:00:00+05:30',
  last_reviewed_at: '2026-03-28T09:00:00+05:30',
  tags: ['music']
};

describe('event export utilities', () => {
  it('maps approved admin records to public records without internal fields', () => {
    const result = toPublicEventRecord(approvedEvent);
    expect(result).toMatchObject({
      id: approvedEvent.id,
      slug: approvedEvent.slug,
      title: approvedEvent.title,
      source_url: approvedEvent.source_url
    });
    expect(result).not.toHaveProperty('reason');
    expect(result).not.toHaveProperty('score');
  });

  it('does not export non-approved items', () => {
    expect(toPublicEventRecord({ ...approvedEvent, status: 'hidden' })).toBeNull();
    expect(toPublicEventRecord({ ...approvedEvent, status: 'rejected' })).toBeNull();
  });

  it('detects archive eligibility from end date or start date', () => {
    expect(isPastEvent(
      {
        event_start_at: '2026-03-01T18:00:00+05:30',
        event_end_at: '2026-03-01T20:00:00+05:30'
      },
      new Date('2026-03-28T09:00:00+05:30')
    )).toBe(true);

    expect(isPastEvent(
      {
        event_start_at: '2026-04-01T18:00:00+05:30',
        event_end_at: null
      },
      new Date('2026-03-28T09:00:00+05:30')
    )).toBe(false);
  });

  it('validates exported public collection payloads', () => {
    expect(() => parsePublicCollection({
      generated_at: '2026-03-28T09:00:00+05:30',
      items: [
        {
          id: approvedEvent.id,
          slug: approvedEvent.slug,
          title: approvedEvent.title,
          summary: approvedEvent.summary,
          event_start_at: approvedEvent.event_start_at,
          event_end_at: approvedEvent.event_end_at,
          timezone: approvedEvent.timezone,
          venue_name: approvedEvent.venue_name,
          neighborhood: approvedEvent.neighborhood,
          category: approvedEvent.category,
          price_text: approvedEvent.price_text,
          source_url: approvedEvent.source_url,
          image_url: approvedEvent.image_url,
          tags: approvedEvent.tags
        }
      ]
    })).not.toThrow();
  });

  it('accepts a valid empty public payload', () => {
    expect(decodePublicFeedPayload(JSON.stringify({
      generated_at: '2026-03-28T09:00:00+05:30',
      items: []
    }))).toMatchObject({
      generated_at: '2026-03-28T09:00:00+05:30',
      items: []
    });
  });

  it('rejects malformed public JSON payloads', () => {
    expect(() => decodePublicFeedPayload('{"generated_at":')).toThrow(
      'The public export is malformed JSON.'
    );
  });

  it('rejects payloads with a missing or invalid top-level items array', () => {
    expect(() => decodePublicFeedPayload(JSON.stringify({
      generated_at: '2026-03-28T09:00:00+05:30'
    }))).toThrow('The public export is missing required fields or has an invalid items array.');

    expect(() => decodePublicFeedPayload(JSON.stringify({
      generated_at: '2026-03-28T09:00:00+05:30',
      items: {}
    }))).toThrow('The public export is missing required fields or has an invalid items array.');
  });
});
