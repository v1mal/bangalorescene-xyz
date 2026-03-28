# bangalorescene.xyz

Static Astro frontend plus a Supabase-backed moderation admin for curated Bangalore events under the `bangalorescene.xyz` platform.

## Stack

- Astro for the static public site and `/admin` shell
- Supabase for auth and editorial state
- n8n for ingestion and hourly snapshot exports
- GitHub Pages for static deployment

## Local setup

1. Copy `.env.example` to `.env`.
2. Install dependencies with `npm install`.
3. Start the app with `npm run dev`.
4. Apply the SQL migration in [`supabase/migrations/20260328090000_create_events.sql`](/Users/vimal/Desktop/BangaloreScene.xyz-2026/supabase/migrations/20260328090000_create_events.sql).
5. Import the n8n templates from [`n8n/workflows/ingest-events.template.json`](/Users/vimal/Desktop/BangaloreScene.xyz-2026/n8n/workflows/ingest-events.template.json) and [`n8n/workflows/export-approved-events.template.json`](/Users/vimal/Desktop/BangaloreScene.xyz-2026/n8n/workflows/export-approved-events.template.json).

## Public export contract

- `public/data/events/upcoming.json`
- `public/data/events/archive.json`

Each file must match the `PublicEventCollection` schema in [`src/lib/types.ts`](/Users/vimal/Desktop/BangaloreScene.xyz-2026/src/lib/types.ts).
