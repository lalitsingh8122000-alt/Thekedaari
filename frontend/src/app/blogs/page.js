import Link from 'next/link';
import { getSiteUrl } from '@/lib/siteUrl';
import { fetchBlogs } from '@/lib/blogApi';
import '@/styles/seo-landing.css';

export const revalidate = 3600;

export function generateMetadata() {
  const base = getSiteUrl();
  return {
    title: 'Construction & Contractor Tips — Blog | Thekedaari',
    description:
      'Read expert guides on worker attendance, site hisaab, contractor management, labour payment and construction project tracking. Thekedaari blog for contractors and thekedaars.',
    alternates: { canonical: `${base}/blogs` },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      url: `${base}/blogs`,
      title: 'Construction & Contractor Tips — Blog | Thekedaari',
      description:
        'Expert guides on attendance, site hisaab, contractor management and labour payment for Indian contractors.',
      siteName: 'Thekedaari',
      images: [{ url: `${base}/thekedaari-logo.png`, width: 512, height: 512, alt: 'Thekedaari' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Construction Blog | Thekedaari',
      description: 'Tips and guides for contractors, thekedaars and site teams.',
      images: [`${base}/thekedaari-logo.png`],
    },
  };
}

function BlogCard({ blog }) {
  const base = getSiteUrl();
  const date = blog.createdAt
    ? new Date(blog.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  return (
    <article className="blog-card">
      {blog.image && (
        <div className="blog-card-img-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={blog.image} alt={blog.title || ''} className="blog-card-img" loading="lazy" />
        </div>
      )}
      <div className="blog-card-body">
        {date && <p className="blog-card-date">{date}</p>}
        <h2 className="blog-card-title">{blog.title || 'Untitled'}</h2>
        {blog.metaDescription && (
          <p className="blog-card-excerpt">{blog.metaDescription}</p>
        )}
        <Link href={`/blogs/${blog.slug}`} className="blog-card-link" prefetch={false}>
          Read more →
        </Link>
      </div>
    </article>
  );
}

export default async function BlogsListPage() {
  const blogs = await fetchBlogs();

  return (
    <div className="seo-landing-page">
      {/* Nav */}
      <header className="topbar">
        <div className="container nav">
          <a className="brand" href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/thekedaari-logo.png" alt="Thekedaari" width={40} height={40} />
          </a>
          <nav className="nav-links">
            <a href="/#features">Features</a>
            <a href="/blogs" aria-current="page">Blog</a>
            <a href="/contact-us">Contact</a>
          </nav>
          <div className="nav-actions">
            <a className="btn btn-outline" href="/login">Login</a>
            <a className="btn btn-primary" href="/register">Start Free →</a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="blogs-hero grid-overlay">
        <div className="container" style={{ paddingTop: '56px', paddingBottom: '40px', textAlign: 'center' }}>
          <div className="eyebrow" style={{ margin: '0 auto 18px' }}>
            <span className="eyebrow-dot" />
            Construction Knowledge Base
          </div>
          <h1 style={{ fontSize: 'clamp(2rem,5vw,3.4rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05, margin: '0 0 16px' }}>
            Thekedaari <span className="accent">Blog</span>
          </h1>
          <p style={{ color: 'var(--seo-lp-muted)', maxWidth: 600, margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.8 }}>
            Practical guides on worker attendance, hisaab kitab, contractor management and project finance for Indian contractors.
          </p>
        </div>
      </section>

      {/* Blog grid */}
      <main className="container blogs-grid-section">
        {blogs.length === 0 ? (
          <div className="blogs-empty">
            <p>No posts published yet. Check back soon!</p>
          </div>
        ) : (
          <div className="blogs-grid">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer" style={{ marginTop: '64px' }}>
        <div className="container footer-wrap">
          <div>© {new Date().getFullYear()} Thekedaari. Construction management for Indian contractors.</div>
          <div className="footer-links">
            <a href="/">Home</a>
            <a href="/blogs">Blog</a>
            <a href="/thekedaar-software">Thekedaar Software</a>
            <a href="/mazdoor-attendance-app">Mazdoor App</a>
            <a href="/contact-us">Contact</a>
          </div>
        </div>
      </footer>

      <style>{`
        .blogs-hero { position: relative; overflow: hidden; }
        .blogs-grid-section { padding: 48px 0 32px; }
        .blogs-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .blog-card {
          background: linear-gradient(180deg, rgba(12,32,57,.96), rgba(7,22,41,.96));
          border: 1px solid rgba(74,144,226,.18);
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform .2s, box-shadow .2s;
        }
        .blog-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 24px 48px rgba(0,0,0,.45);
        }
        .blog-card-img-wrap { width: 100%; aspect-ratio: 16/9; overflow: hidden; }
        .blog-card-img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .blog-card-body { padding: 20px; flex: 1; display: flex; flex-direction: column; gap: 8px; }
        .blog-card-date { font-size: .78rem; color: var(--seo-lp-cyan); font-weight: 700; letter-spacing: .04em; }
        .blog-card-title {
          font-size: 1.12rem;
          font-weight: 800;
          line-height: 1.35;
          color: var(--seo-lp-text);
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .blog-card-excerpt {
          font-size: .9rem;
          color: var(--seo-lp-muted);
          line-height: 1.7;
          margin: 0;
          flex: 1;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .blog-card-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: .88rem;
          font-weight: 800;
          color: var(--seo-lp-cyan);
          margin-top: 4px;
          transition: color .2s;
        }
        .blog-card-link:hover { color: #fff; }
        .blogs-empty {
          text-align: center;
          padding: 80px 0;
          color: var(--seo-lp-muted);
          font-size: 1.1rem;
        }
        @media (max-width: 900px) {
          .blogs-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 560px) {
          .blogs-grid { grid-template-columns: 1fr; }
          .blogs-grid-section { padding: 32px 0; }
        }
      `}</style>
    </div>
  );
}
