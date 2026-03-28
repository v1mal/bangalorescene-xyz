import { defineConfig } from 'astro/config';

function normalizeBasePath(value) {
  if (!value || value === '/') return '/';
  return `/${String(value).replace(/^\/+|\/+$/g, '')}/`;
}

const envSiteBase = process.env.SITE_BASE?.trim();
const envSiteUrl = process.env.SITE_URL?.trim();
const base = normalizeBasePath(envSiteBase || (process.env.NODE_ENV === 'production' ? '/bangalorescene-xyz/' : '/'));
const site =
  envSiteUrl ||
  (base === '/' ? 'https://bangalorescene.xyz' : `https://v1mal.github.io${base.slice(0, -1)}`);

export default defineConfig({
  site,
  base,
  output: 'static'
});
