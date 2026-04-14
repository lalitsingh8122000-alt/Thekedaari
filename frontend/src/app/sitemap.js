import { getSiteUrl } from '@/lib/siteUrl';
import { SEO_PAGE_SLUGS, getSeoPageMetadata } from '@/seo-landing/meta';
import { fetchBlogs } from '@/lib/blogApi';

/** Public marketing URLs that should be discoverable by search engines. */
export default async function sitemap() {
  const base = getSiteUrl();
  const now = new Date();

  const main = [
    { path: '', changeFrequency: 'weekly', priority: 1 },
    { path: '/login', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/register', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/contact-us', changeFrequency: 'monthly', priority: 0.5 },
    { path: '/how-to-use', changeFrequency: 'monthly', priority: 0.5 },
    { path: '/blogs', changeFrequency: 'daily', priority: 0.85 },
  ];

  const seo = SEO_PAGE_SLUGS.map((slug) => {
    const m = getSeoPageMetadata(slug);
    const path = new URL(m.alternates.canonical).pathname;
    return { path, changeFrequency: 'weekly', priority: 0.9 };
  });

  const blogs = await fetchBlogs().catch(() => []);
  const blogEntries = blogs.map((b) => ({
    url: `${base}/blogs/${b.slug}`,
    lastModified: b.createdAt ? new Date(b.createdAt) : now,
    changeFrequency: 'monthly',
    priority: 0.75,
  }));

  const staticEntries = [...main, ...seo].map(({ path, changeFrequency, priority }) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  return [...staticEntries, ...blogEntries];
}
