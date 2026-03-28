import { createClient } from '@supabase/supabase-js';

export function createBrowserSupabaseClient() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Supabase environment variables are missing for bangalorescene.xyz.');
  }

  return createClient(url, anonKey);
}
