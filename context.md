# bangalorescene.xyz Context

## Platform Identity

- Platform name: `bangalorescene.xyz`
- Primary domain: `https://bangalorescene.xyz`
- Product type: curated Bangalore events platform
- Delivery model: static public site + private moderation admin
- Primary audience:
  - public users browsing Bangalore events
  - a curator or very small trusted moderation team reviewing imported event candidates

## Product Summary

`bangalorescene.xyz` is designed as a curated local events platform for Bangalore. Events are gathered through automation, reviewed by a human curator, and then published to a static public site. The public experience is optimized for speed, direct linking, resilience, and low operational overhead. The admin experience is optimized for quick moderation decisions and light metadata cleanup, not for heavy editorial workflows.

The initial scope includes:

- homepage for upcoming approved events
- event detail pages with stable slugs
- archive page for past approved events
- private `/admin` moderation interface
- Supabase-backed editorial state
- n8n ingestion and hourly export workflows
- GitHub Pages deployment of the static site

## Architecture

The implementation follows the architecture in `automated-webapp-spec.md`.

### High-level flow

1. n8n imports or generates candidate event records.
2. Candidate records are written into Supabase as `pending`.
3. A curator signs into the admin UI and reviews items.
4. Approved records remain the editorial source of truth in Supabase.
5. An hourly n8n export job rebuilds static JSON snapshots from approved records.
6. GitHub Pages serves the public site from the committed static build artifacts.

### Platform split

- Public site:
  - framework: Astro
  - hosting target: GitHub Pages
  - content source: exported static JSON in `public/data/events/`
  - no live public dependence on Supabase queries

- Admin:
  - route: `/admin`
  - auth: Supabase Google sign-in
  - data source: direct browser-to-Supabase access using publishable credentials
  - capabilities: filter by status, review events, light edits, moderation actions

- Editorial source of truth:
  - Supabase

- Automation:
  - n8n

## Chosen Product Decisions

These were explicitly chosen during planning and implementation:

- Content type: event listings
- Geographic scope: Bangalore local scene
- Ingestion mode: n8n-driven imports from upstream sources
- Publishing cadence: hourly snapshot exports
- Public UX: homepage plus event detail pages plus archive
- Moderator capability: light metadata edits before approval
- Expired event policy: move past approved events to archive, but keep them publicly accessible
- Meaning of `approved`: verified and publishable; curator confirms core details are trustworthy and complete enough
- Initial admin team: single curator or tiny trusted group using Google sign-in
- Out of scope for v1:
  - public submissions
  - multi-role permissions
  - collaborative notes / full audit trail
  - real-time publishing
  - live public Supabase reads

## Current Tech Stack

- Astro
- TypeScript
- Zod
- Supabase JavaScript client
- Vitest
- GitHub Actions for Pages deployment

## Important Files

### Core app

- [`/Users/vimal/Desktop/BangaloreScene.xyz-2026/src/pages/index.astro`](/Users/vimal/Desktop/BangaloreScene.xyz-2026/src/pages/index.astro)
- [`/Users/vimal/Desktop/BangaloreScene.xyz-2026/src/pages/archive.astro`](/Users/vimal/Desktop/BangaloreScene.xyz-2026/src/pages/archive.astro)
- [`/Users/vimal/Desktop/BangaloreScene.xyz-2026/src/pages/events/[slug].astro`](/Users/vimal/Desktop/BangaloreScene.xyz-2026/src/pages/events/[slug].astro)
- [`/Users/vimal/Desktop/BangaloreScene.xyz-2026/src/pages/admin.astro`](/Users/vimal/Desktop/BangaloreScene.xyz-2026/src/pages/admin.astro)
- [`/Users/vimal/Desktop/BangaloreScene.xyz-2026/src/layouts/BaseLayout.astro`](/Users/vimal/Desktop/BangaloreScene.xyz-2026/src/layouts/BaseLayout.astro)
- [`/Users/vimal/Desktop/BangaloreScene.xyz-2026/src/components/EventCard.astro`](/Users/vimal/Desktop/BangaloreScene.xyz-2026/src/components/EventCard.astro)

### Shared domain logic

- [`/Users/vimal/Desktop/BangaloreScene.xyz-2026/src/lib/types.ts`](/Users/vimal/Desktop/BangaloreScene.xyz-2026/src/lib/types.ts)
- [`/Users/vimal/Desktop/BangaloreScene.xyz-2026/src/lib/utils.ts`](/Users/vimal/Desktop/BangaloreScene.xyz-2026/src/lib/utils.ts)
- [`/Users/vimal/Desktop/BangaloreScene.xyz-2026/src/lib/content.ts`](/Users/vimal/Desktop/BangaloreScene.xyz-2026/src/lib/content.ts)
- [`/Users/vimal/Desktop/BangaloreScene.xyz-2026/src/lib/supabase.ts`](/Users/vimal/Desktop/BangaloreScene.xyz-2026/src/lib/supabase.ts)

### Data and infra

- [`/Users/vimal/Desktop/BangaloreScene.xyz-2026/public/data/events/upcoming.json`](/Users/vimal/Desktop/BangaloreScene.xyz-2026/public/data/events/upcoming.json)
- [`/Users/vimal/Desktop/BangaloreScene.xyz-2026/public/data/events/archive.json`](/Users/vimal/Desktop/BangaloreScene.xyz-2026/public/data/events/archive.json)
- [`/Users/vimal/Desktop/BangaloreScene.xyz-2026/supabase/migrations/20260328090000_create_events.sql`](/Users/vimal/Desktop/BangaloreScene.xyz-2026/supabase/migrations/20260328090000_create_events.sql)
- [`/Users/vimal/Desktop/BangaloreScene.xyz-2026/n8n/workflows/ingest-events.template.json`](/Users/vimal/Desktop/BangaloreScene.xyz-2026/n8n/workflows/ingest-events.template.json)
- [`/Users/vimal/Desktop/BangaloreScene.xyz-2026/n8n/workflows/export-approved-events.template.json`](/Users/vimal/Desktop/BangaloreScene.xyz-2026/n8n/workflows/export-approved-events.template.json)
- [`/Users/vimal/Desktop/BangaloreScene.xyz-2026/.github/workflows/deploy.yml`](/Users/vimal/Desktop/BangaloreScene.xyz-2026/.github/workflows/deploy.yml)

### Project docs

- [`/Users/vimal/Desktop/BangaloreScene.xyz-2026/automated-webapp-spec.md`](/Users/vimal/Desktop/BangaloreScene.xyz-2026/automated-webapp-spec.md)
- [`/Users/vimal/Desktop/BangaloreScene.xyz-2026/README.md`](/Users/vimal/Desktop/BangaloreScene.xyz-2026/README.md)

## Public Experience

### Homepage

Route: `/`

Purpose:

- show upcoming approved events only
- render from static exported JSON
- provide direct access to archive and admin

Behavior:

- reads `public/data/events/upcoming.json`
- validates exported JSON with Zod before rendering
- shows explicit error state if export is invalid or unreadable
- shows explicit empty state if no approved upcoming events exist

### Event detail pages

Route pattern: `/events/[slug]/`

Purpose:

- provide stable, shareable event detail URLs
- keep archived events accessible even after they leave the upcoming feed

Behavior:

- generated statically from the union of upcoming + archive datasets
- event slugs are expected to remain stable across exports

### Archive

Route: `/archive/`

Purpose:

- list past approved events
- keep event history publicly accessible

Behavior:

- reads `public/data/events/archive.json`
- only shows past approved items

## Admin Experience

Route: `/admin/`

Purpose:

- moderation and light editorial cleanup

Current implemented behavior:

- signed-out state hides moderation data
- Google OAuth sign-in via Supabase
- status filter buttons for:
  - `pending`
  - `approved`
  - `rejected`
  - `hidden`
- queries the `events` table directly from the browser after auth
- allows light field edits on:
  - `title`
  - `summary`
  - `event_start_at`
  - `event_end_at`
  - `venue_name`
  - `source_url`
  - `tags`
- moderation actions:
  - approve
  - reject
  - hide
  - restore to pending
  - save edits
- after each action:
  - current item is updated in Supabase
  - current filter is reloaded
  - inline feedback is shown

## Data Model

Primary Supabase table: `public.events`

### Columns currently implemented

- `id` UUID primary key
- `slug` unique text
- `status` enum `pending | approved | rejected | hidden`
- `title`
- `summary`
- `description`
- `source_url`
- `source_name`
- `source_event_id`
- `event_start_at`
- `event_end_at`
- `timezone`
- `venue_name`
- `venue_address`
- `neighborhood`
- `category`
- `price_text`
- `image_url`
- `reason`
- `suggestion`
- `score`
- `tags` text array
- `published_at`
- `last_reviewed_at`
- `created_at`
- `updated_at`

### Status semantics

- `pending`: waiting for curator review
- `approved`: verified and publishable
- `rejected`: intentionally not publishable
- `hidden`: retained internally, excluded from public output

### Admin-only / internal fields

These should not leak into public artifacts unless intentionally changed later:

- `reason`
- `suggestion`
- `score`
- internal timestamps like moderation metadata
- source diagnostics

## Shared Types and Validation

Shared schemas live in:

- [`/Users/vimal/Desktop/BangaloreScene.xyz-2026/src/lib/types.ts`](/Users/vimal/Desktop/BangaloreScene.xyz-2026/src/lib/types.ts)

Important types:

- `EventStatus`
- `AdminEventRecord`
- `PublicEventRecord`
- `PublicEventCollection`

Important helpers:

- `toPublicEventRecord()`
- `parsePublicCollection()`
- `isPastEvent()`
- `slugify()`

### Validation boundary

The public site validates exported JSON at read time using Zod. This is intentional to prevent silent failure if the export payload drifts from the expected schema.

## Public Export Contract

Current public snapshot files:

- `public/data/events/upcoming.json`
- `public/data/events/archive.json`

Each file should match:

```json
{
  "generated_at": "ISO timestamp",
  "items": [
    {
      "id": "uuid",
      "slug": "stable-slug",
      "title": "Event title",
      "summary": "Public summary",
      "event_start_at": "ISO timestamp",
      "event_end_at": "ISO timestamp or null",
      "timezone": "Asia/Kolkata",
      "venue_name": "Venue",
      "neighborhood": "Area",
      "category": "Category",
      "price_text": "Free entry / Ticketed / etc",
      "source_url": "External source URL",
      "image_url": "Optional image URL or null",
      "tags": ["tag-1", "tag-2"]
    }
  ]
}
```

### Export rules

- only `approved` events are exported
- `rejected` and `hidden` events are never exported
- future/current approved events go to `upcoming.json`
- past approved events go to `archive.json`
- `event_end_at` is used for archive splitting when available
- otherwise `event_start_at` is used
- snapshot export rewrites the public artifacts from scratch every run

## n8n Workflows

Template files exist for both ingestion and export.

### Ingestion template

File:

- [`/Users/vimal/Desktop/BangaloreScene.xyz-2026/n8n/workflows/ingest-events.template.json`](/Users/vimal/Desktop/BangaloreScene.xyz-2026/n8n/workflows/ingest-events.template.json)

Intent:

- run on a schedule
- normalize upstream event records
- upsert them into Supabase as `pending`
- avoid duplicates via `slug` conflict handling

Current state:

- contains placeholder sample source normalization
- intended to be replaced or extended with actual feed / scraping / API nodes

### Export template

File:

- [`/Users/vimal/Desktop/BangaloreScene.xyz-2026/n8n/workflows/export-approved-events.template.json`](/Users/vimal/Desktop/BangaloreScene.xyz-2026/n8n/workflows/export-approved-events.template.json)

Intent:

- run hourly
- query approved rows from Supabase
- split them into upcoming vs archive
- write JSON snapshots
- commit and push the refreshed artifacts

Current caveat:

- the template uses an execute-command step that assumes it runs in a checked-out repo with git configured
- credentials and environment wiring still need real deployment setup

## Supabase Setup

Migration file:

- [`/Users/vimal/Desktop/BangaloreScene.xyz-2026/supabase/migrations/20260328090000_create_events.sql`](/Users/vimal/Desktop/BangaloreScene.xyz-2026/supabase/migrations/20260328090000_create_events.sql)

Current DB-related implementation:

- creates `event_status` enum
- creates `public.events`
- adds indexes on `status`, `event_start_at`, and `slug`
- adds `updated_at` trigger
- enables RLS
- allows authenticated users to:
  - select events
  - update events

Current auth expectation:

- Supabase Google sign-in is configured in the project
- browser uses `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY`

### Important caveat

The current RLS policy is intentionally simple for v1 and trusts authenticated users. If the platform later expands beyond a tightly controlled curator group, these policies should be tightened.

## Deployment

Current deployment workflow:

- GitHub Actions workflow at `.github/workflows/deploy.yml`
- builds Astro site on pushes to `main`
- uploads `dist`
- deploys to GitHub Pages

Environment/secrets expected for deployment:

- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`

### Domain assumptions

The Astro config site URL is set to:

- `https://bangalorescene.xyz`

Additional DNS and GitHub Pages custom-domain configuration still need to be handled outside the codebase if not already done.

## Local Development

### Commands

- `npm install`
- `npm run dev`
- `npm test`
- `npm run build`

### Environment file

Copy:

- `.env.example` -> `.env`

Required vars:

- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`

## Current Verification Status

Verified locally:

- `npm test` passes
- `npm run build` passes

What has not been fully verified in this workspace:

- real Supabase auth flow with Google
- live admin CRUD against an actual Supabase project
- live n8n ingestion execution
- live n8n export committing to GitHub
- actual GitHub Pages custom domain configuration

## Known Implementation Notes

- The project was bootstrapped manually from an empty directory rather than generated from a starter template.
- Sample public JSON data is included so the static site builds immediately.
- Sample event `source_url` values still use placeholder external URLs such as `example.com`; those represent source listing placeholders, not the platform domain.
- The admin page uses inline client-side logic inside `admin.astro` instead of a dedicated frontend framework. This keeps the app lightweight and static, but it may eventually become worth extracting into separate client modules if admin complexity grows.
- Public rendering is static and serverless; there is no custom backend in this repo.

## Recommended Next Steps

If another LLM or engineer picks this up, the likely next priorities are:

1. connect a real Supabase project and verify Google OAuth redirect behavior for `https://bangalorescene.xyz/admin/`
2. replace placeholder n8n ingestion logic with real Bangalore event sources
3. wire the export workflow to a real checked-out GitHub repo and PAT / deploy credentials
4. replace sample static snapshot JSON with real exported data
5. tighten RLS if admin access broadens
6. improve event taxonomy, deduplication, and source normalization quality

## Short Hand-off Summary

This repo currently contains a working Astro implementation of the planned `bangalorescene.xyz` platform:

- static public site
- static archive
- static event detail pages
- Supabase-backed admin shell
- shared schemas and validation
- Supabase migration
- n8n workflow templates
- GitHub Pages deployment workflow

It is implementation-complete as a scaffold and local build target, but still needs real infrastructure credentials, real event sources, and production service configuration to become fully operational.
