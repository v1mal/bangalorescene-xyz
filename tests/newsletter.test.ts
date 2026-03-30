import { describe, expect, it } from 'vitest';
import {
  getNewsletterEndpoint,
  isValidNewsletterEmail,
  normalizeNewsletterEmail
} from '@/lib/newsletter';

describe('newsletter utilities', () => {
  it('normalizes newsletter emails', () => {
    expect(normalizeNewsletterEmail('  User@Example.COM  ')).toBe('user@example.com');
  });

  it('validates newsletter emails', () => {
    expect(isValidNewsletterEmail('user@example.com')).toBe(true);
    expect(isValidNewsletterEmail('invalid-email')).toBe(false);
  });

  it('builds the newsletter endpoint from the public supabase url', () => {
    expect(getNewsletterEndpoint('https://project.supabase.co')).toBe(
      'https://project.supabase.co/functions/v1/newsletter-signup'
    );
    expect(getNewsletterEndpoint('https://project.supabase.co/')).toBe(
      'https://project.supabase.co/functions/v1/newsletter-signup'
    );
  });

  it('returns an empty endpoint when no public supabase url is configured', () => {
    expect(getNewsletterEndpoint()).toBe('');
  });

  it('keeps newsletter request shape compatible with optional honeypot values', () => {
    const payload = {
      email: normalizeNewsletterEmail('reader@example.com'),
      company: ''
    };

    expect(payload).toEqual({
      email: 'reader@example.com',
      company: ''
    });
  });
});
