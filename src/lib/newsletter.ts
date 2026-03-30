export interface NewsletterSignupRequest {
  email: string;
  company?: string;
}

export type NewsletterSignupResponse =
  | { ok: true }
  | { ok: false; error: string };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeNewsletterEmail(value: string) {
  return value.trim().toLowerCase();
}

export function isValidNewsletterEmail(value: string) {
  return emailPattern.test(normalizeNewsletterEmail(value));
}

export function getNewsletterEndpoint(publicSupabaseUrl?: string) {
  if (!publicSupabaseUrl) {
    return '';
  }

  return `${publicSupabaseUrl.replace(/\/+$/g, '')}/functions/v1/newsletter-signup`;
}
