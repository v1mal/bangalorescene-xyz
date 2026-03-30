const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const allowedOrigins = new Set([
  'http://localhost:4321',
  'https://v1mal.github.io',
  'https://bangalorescene.xyz'
]);

function buildCorsHeaders(origin: string | null) {
  return {
    'Access-Control-Allow-Origin': origin && allowedOrigins.has(origin) ? origin : 'https://bangalorescene.xyz',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
    'Vary': 'Origin'
  };
}

function json(body: Record<string, unknown>, status = 200, origin: string | null = null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: buildCorsHeaders(origin)
  });
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

Deno.serve(async (request) => {
  const origin = request.headers.get('origin');

  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: buildCorsHeaders(origin) });
  }

  if (request.method !== 'POST') {
    return json({ ok: false, error: 'Method not allowed.' }, 405, origin);
  }

  const brevoApiKey = Deno.env.get('BREVO_API_KEY');
  const brevoListId = Deno.env.get('BREVO_LIST_ID');

  if (!brevoApiKey || !brevoListId) {
    return json({ ok: false, error: 'Newsletter signup is not configured yet.' }, 500, origin);
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: 'Something went wrong. Please try again.' }, 400, origin);
  }

  const email = typeof payload === 'object' && payload !== null && 'email' in payload
    ? normalizeEmail(String((payload as { email?: unknown }).email ?? ''))
    : '';
  const company = typeof payload === 'object' && payload !== null && 'company' in payload
    ? String((payload as { company?: unknown }).company ?? '').trim()
    : '';

  if (company) {
    return json({ ok: true }, 200, origin);
  }

  if (!emailPattern.test(email)) {
    return json({ ok: false, error: 'Enter a valid email address.' }, 400, origin);
  }

  const listId = Number.parseInt(brevoListId, 10);

  if (!Number.isFinite(listId)) {
    return json({ ok: false, error: 'Newsletter signup is not configured yet.' }, 500, origin);
  }

  const response = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': brevoApiKey,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      email,
      listIds: [listId],
      updateEnabled: true
    })
  }).catch(() => null);

  if (!response) {
    return json({ ok: false, error: 'Something went wrong. Please try again.' }, 502, origin);
  }

  if (response.ok) {
    return json({ ok: true }, 200, origin);
  }

  return json({ ok: false, error: 'Something went wrong. Please try again.' }, 502, origin);
});
