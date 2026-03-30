# bangalorescene.xyz

Curated Bangalore events platform. Static public site + private moderation admin, backed by Supabase.

## Stack

- **Framework:** Astro (static output, base `/`)
- **Backend:** Supabase (Postgres + Edge Functions + Google OAuth)
- **Newsletter:** Brevo Contacts API via Supabase Edge Function
- **Ingest pipeline:** n8n → Google Sheet intake → AI enrichment (Claude) → Supabase upsert
- **Export pipeline:** n8n (templated, not fully live)
- **Deploy:** GitHub Actions → GitHub Pages, custom domain `bangalorescene.xyz`

## Routes

| Route | Status |
|---|---|
| `/` | Coming-soon landing page (shader hero + newsletter modal) |
| `/archive/` | Live — event feed with shader hero |
| `/events/[slug]/` | Live — event detail |
| `/admin/` | Private — Google sign-in via Supabase |

## Data Flow

1. User pastes event URL into Google Sheet ("Event Inbox")
2. n8n polls sheet every 15 min → fetches page → extracts og:image → AI enrichment → upserts into Supabase as `pending`
3. Moderator reviews in `/admin/`
4. Approved rows exposed via `public.public_approved_events` view
5. n8n export writes static JSON → `public/data/events/`
6. Public site renders from `upcoming.json` / `archive.json`

## Key Files

```
src/
  layouts/
    BaseLayout.astro          Root HTML shell
    PublicLayout.astro         Public design system
    AdminLayout.astro          Admin design system
  pages/
    index.astro                Homepage (coming-soon, shader hero, newsletter modal)
    archive.astro              Archive page (shader hero + event feed)
    events/[slug].astro        Event detail
    admin.astro                Moderation queue
  components/
    PublicEventFeed.astro      Feed component (SSR shell + client revalidation)
    EventCard.astro            Event card
  lib/
    public-feed.ts             Feed fetch/parse logic
    newsletter.ts              Newsletter form client logic
    share.ts                   Share CTA logic
    content.ts                 Content helpers
    types.ts                   Shared types
    utils.ts                   Shared utils

supabase/
  functions/newsletter-signup/index.ts    Edge Function → Brevo API
  migrations/
    20260328090000_create_events.sql
    20260328110000_create_public_approved_events_view.sql

public/data/events/
  upcoming.json               Rendered by archive/homepage feeds
  archive.json

n8n/workflows/export-approved-events.template.json
n8n/workflows/ingest-events.template.json     ⚠️ Baseline only — live workflow configured in n8n UI

.github/workflows/deploy.yml
astro.config.mjs
```

## Shader Heroes

Both `/` and `/archive/` heroes use inline WebGL canvas shaders. Readability is handled inside the shader (no opaque overlay):
- ACES rolloff, restrained vignette, localized text-zone darkening/desaturation, light grain
- Shaders pause offscreen via `IntersectionObserver`
- Mobile: `aspect-ratio: 3 / 4`, content block vertically centered

Do not introduce a boxed overlay or separate readability layer — the shader finishing is intentional.

## Newsletter Flow

Homepage modal → native form → browser POST → Supabase Edge Function → Brevo Contacts API.
Honeypot protection is active.

Required Edge Function secrets: `BREVO_API_KEY`, `BREVO_LIST_ID`

## Admin Behavior

Google sign-in via Supabase. Optimistic moderation actions (approve / reject / hide / restore / save edits) with rollback on failure, background refresh after actions, timeout + stale-response protection.

## Deployment & Auth

Required GitHub Actions secrets: `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`

For production OAuth to work:
- Supabase `Site URL` → live site
- Supabase `Redirect URLs` → deployed admin URL
- Google OAuth origins: `http://localhost:4321`, `https://v1mal.github.io`, `https://bangalorescene.xyz`

If OAuth redirects to localhost in production, check Supabase URL config first.

## Design System

Shared radius scale: `8px`, `12px`, `16px`, `20px`, `999px`
Button model: primary = filled, secondary = outline-only
Footer and hero text use the same inset rhythm across public and admin.

## Known Gaps

- n8n ingest workflow is live; export flow is templated but not wired yet
- `ingest-events.template.json` is a baseline — the live workflow in n8n UI has diverged (Supabase REST API, Build LLM Request code node, Raw body types). Export from n8n to keep in sync.
- Google Sheet ID: `19nQa_D4zGIGx05mGpjkFjIr_8KXAShjyc09B41qj3Iw`
- Footer pages (About, Contact, Privacy, Terms) are stubs
- Public feeds use placeholder event data
- Homepage stays in coming-soon mode until the real curation/export loop is ready
