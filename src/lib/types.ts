import { z } from 'zod';

export const eventStatusSchema = z.enum(['pending', 'approved', 'rejected', 'hidden']);

export type EventStatus = z.infer<typeof eventStatusSchema>;

export const adminEventRecordSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  status: eventStatusSchema,
  title: z.string().min(1),
  summary: z.string().default(''),
  description: z.string().default(''),
  source_url: z.string().url(),
  source_name: z.string().default('Unknown source'),
  event_start_at: z.string().datetime({ offset: true }),
  event_end_at: z.string().datetime({ offset: true }).nullable(),
  timezone: z.string().default('Asia/Kolkata'),
  venue_name: z.string().default('TBA'),
  venue_address: z.string().default(''),
  neighborhood: z.string().default(''),
  category: z.string().default('General'),
  price_text: z.string().default(''),
  image_url: z.string().url().nullable(),
  reason: z.string().default(''),
  suggestion: z.string().default(''),
  score: z.number().nullable(),
  published_at: z.string().datetime({ offset: true }).nullable(),
  created_at: z.string().datetime({ offset: true }),
  updated_at: z.string().datetime({ offset: true }),
  last_reviewed_at: z.string().datetime({ offset: true }).nullable(),
  source_event_id: z.string().default(''),
  tags: z.array(z.string()).default([])
});

export type AdminEventRecord = z.infer<typeof adminEventRecordSchema>;

export const publicEventRecordSchema = adminEventRecordSchema.pick({
  id: true,
  slug: true,
  title: true,
  summary: true,
  event_start_at: true,
  event_end_at: true,
  timezone: true,
  venue_name: true,
  neighborhood: true,
  category: true,
  price_text: true,
  source_url: true,
  image_url: true,
  tags: true
});

export type PublicEventRecord = z.infer<typeof publicEventRecordSchema>;

export const publicEventCollectionSchema = z.object({
  generated_at: z.string().datetime({ offset: true }),
  items: z.array(publicEventRecordSchema)
});

export type PublicEventCollection = z.infer<typeof publicEventCollectionSchema>;
