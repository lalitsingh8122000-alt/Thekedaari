/** Canonical site origin for SEO (canonical URLs, Open Graph, sitemap). */
export function getSiteUrl() {
  const raw = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SITE_URL?.trim() : '';
  if (raw) return raw.replace(/\/$/, '');
  return 'https://thekedaari.com';
}
