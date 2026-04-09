import { getSiteUrl } from '@/lib/siteUrl';

/** Allow indexing of marketing pages; reduce noise from authenticated app shells. */
export default function robots() {
  const base = getSiteUrl();
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/profile', '/projects', '/workers', '/transactions', '/roles', '/attendance'],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
