/** Fetch blogs from the backend — used in server components (SSR/ISR). */

function getApiBase() {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (raw) return raw.replace(/\/$/, '');
  return 'http://localhost:5000/api';
}

export async function fetchBlogs() {
  try {
    const res = await fetch(`${getApiBase()}/blogs`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch (err) {
    return [];
  }
}

export async function fetchBlogBySlug(slug) {
  try {
    const res = await fetch(`${getApiBase()}/blogs/${encodeURIComponent(slug)}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    return null;
  }
}
