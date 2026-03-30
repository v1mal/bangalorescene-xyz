# Brevo Newsletter on a Static Site with Supabase Edge Functions

This is a simple pattern for adding a custom newsletter signup form to a static site without using Brevo's embed code.

Use this when you want:
- full control over form styling
- no third-party form scripts on first page load
- Brevo API keys kept off the frontend

## Architecture

Flow:

1. Visitor opens your site
2. Visitor submits a custom form on the frontend
3. Frontend sends `{ email }` to a public Supabase Edge Function
4. Edge Function validates the request
5. Edge Function calls Brevo's Contacts API with your secret API key
6. Brevo adds or updates the contact in a list
7. Frontend shows success or error state

## What You Need

- A static frontend
- A Supabase project
- A Brevo account
- A Brevo list for subscribers

## 1. Create a Brevo list

In Brevo:

1. Go to `Contacts`
2. Go to `Lists`
3. Create a list for signups
4. Note the numeric list ID

Example:
- `Coming Soon`
- list ID: `3`

## 2. Create Brevo API credentials

In Brevo:

1. Go to API settings
2. Create or copy your API key

You will need:

- `BREVO_API_KEY`
- `BREVO_LIST_ID`

## 3. Build a custom frontend form

Create your own form in the site UI instead of using an iframe/embed.

Recommended fields:

- `email`

Optional anti-spam field:

- hidden honeypot field like `company`

Example request body from the frontend:

```json
{
  "email": "reader@example.com",
  "company": ""
}
```

## 4. Create a Supabase Edge Function

Create a public Edge Function, for example:

- `newsletter-signup`

The function should:

1. accept `POST` requests
2. parse JSON body
3. validate email format
4. silently ignore submissions where the honeypot field is filled
5. call Brevo's Contacts API
6. return simple JSON to the frontend

Recommended response shape:

```json
{ "ok": true }
```

or

```json
{ "ok": false, "error": "Enter a valid email address." }
```

## 5. Add Supabase function secrets

In Supabase `Edge Function Secrets`, add:

- `BREVO_API_KEY`
- `BREVO_LIST_ID`

Example:

- `BREVO_API_KEY = xkeysib-...`
- `BREVO_LIST_ID = 3`

## 6. Disable JWT verification if the function is public

If the signup form is public and does not require logged-in users:

1. Open the Edge Function settings
2. Turn off `Verify JWT`

This allows public form submissions.

## 7. Call Brevo from the Edge Function

Use Brevo's Contacts API:

- `POST https://api.brevo.com/v3/contacts`

Recommended payload:

```json
{
  "email": "reader@example.com",
  "listIds": [3],
  "updateEnabled": true
}
```

Recommended headers:

```http
api-key: YOUR_BREVO_API_KEY
Content-Type: application/json
Accept: application/json
```

Why `updateEnabled: true`:

- repeat signups do not hard-fail
- existing contacts can still be treated as success

## 8. Add CORS allowlist

Allow only your real frontend origins.

Example allowlist:

- `http://localhost:4321`
- `https://v1mal.github.io`
- `https://yourdomain.com`

Important:

- CORS helps with browser-origin control
- it is not full security by itself

## 9. Submit from the frontend

On form submit:

1. validate email in the browser
2. send `POST` JSON to the Edge Function URL
3. show loading state while request is running
4. show inline success state on success
5. show inline error state on failure

Example frontend behavior:

- invalid email -> `Enter a valid email address.`
- successful submit -> `You're on the list`
- server failure -> `Something went wrong. Please try again.`

## 10. Add a honeypot field

This is a simple anti-spam layer.

Pattern:

1. add a hidden field such as `company`
2. keep it invisible to humans
3. include it in the request payload
4. if the value is not empty in the Edge Function, return success without sending to Brevo

Why:

- many basic bots fill every field
- humans never see or use it

This helps reduce junk submissions without hurting UX.

## 11. Test the flow

Test these cases:

1. invalid email
2. valid email
3. repeated signup for same email
4. honeypot-filled submission
5. Brevo secret missing
6. wrong list ID

Expected results:

- invalid email stays on the form with inline error
- valid email gets added to Brevo
- repeated email should still succeed
- honeypot submission should not reach Brevo

## 12. Recommended production hardening

Good enough for a lightweight launch:

- server-side validation
- honeypot field
- CORS allowlist
- secret API key in Edge Function only

Recommended next upgrades for busier sites:

- Cloudflare Turnstile
- rate limiting
- logging/monitoring
- optional double opt-in

## Why This Method Is Better Than an Embed

Pros:

- full control over visual design
- no heavy Brevo embed scripts on first paint
- cleaner UX
- secrets stay server-side
- easier to fit into a modal or custom flow

Tradeoffs:

- you now maintain the submission endpoint
- you need to configure secrets yourself
- you need to think about spam protection

## Reusable Checklist

- Create Brevo list
- Copy Brevo API key
- Note Brevo list ID
- Build custom frontend form
- Create Supabase Edge Function
- Add `BREVO_API_KEY`
- Add `BREVO_LIST_ID`
- Disable JWT verification for public use
- Add CORS allowlist
- Call Brevo Contacts API with `updateEnabled: true`
- Add honeypot field
- Test success and failure states

## Current Project Reference

In this repo, the pattern lives in:

- frontend types/helpers:
  - `/src/lib/newsletter.ts`
- homepage modal form:
  - `/src/pages/index.astro`
- Supabase Edge Function:
  - `/supabase/functions/newsletter-signup/index.ts`
- function config:
  - `/supabase/functions/newsletter-signup/config.toml`
- tests:
  - `/tests/newsletter.test.ts`