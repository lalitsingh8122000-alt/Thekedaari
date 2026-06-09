import { notFound } from 'next/navigation';
import { getSiteUrl } from '@/lib/siteUrl';
import { fetchBlogBySlug } from '@/lib/blogApi';
import '@/styles/seo-landing.css';

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const blog = await fetchBlogBySlug(params.slug);
  if (!blog) return { title: 'Blog Not Found | Thekedaari' };

  const base = getSiteUrl();
  const url = `${base}/blogs/${blog.slug}`;
  const image = blog.image || `${base}/thekedaari-logo.png`;

  return {
    title: blog.metaTitle || blog.title || 'Blog | Thekedaari',
    description: blog.metaDescription || '',
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'article',
      url,
      title: blog.metaTitle || blog.title || '',
      description: blog.metaDescription || '',
      siteName: 'Thekedaari',
      publishedTime: blog.createdAt,
      images: [{ url: image, width: 1200, height: 630, alt: blog.title || '' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.metaTitle || blog.title || '',
      description: blog.metaDescription || '',
      images: [image],
    },
  };
}

export default async function BlogDetailPage({ params }) {
  const blog = await fetchBlogBySlug(params.slug);
  if (!blog) notFound();

  const base = getSiteUrl();
  const url = `${base}/blogs/${blog.slug}`;
  const date = blog.createdAt
    ? new Date(blog.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title || '',
    description: blog.metaDescription || '',
    image: blog.image || `${base}/thekedaari-logo.png`,
    url,
    datePublished: blog.createdAt,
    publisher: {
      '@type': 'Organization',
      name: 'Thekedaari',
      url: base,
    },
  });

  return (
    <div className="seo-landing-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      {/* Nav */}
      <header className="topbar">
        <div className="container nav">
          <a className="brand" href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/thekedaari-logo.png" alt="Thekedaari" width={40} height={40} />
          </a>
          <nav className="nav-links">
            <a href="/#features">Features</a>
            <a href="/blogs">Blog</a>
            <a href="/contact-us">Contact</a>
          </nav>
          <div className="nav-actions">
            <a className="btn btn-outline" href="/login">Login</a>
            <a className="btn btn-primary" href="/register">Start Free →</a>
          </div>
        </div>
      </header>

      {/* Article */}
      <main className="container blog-detail-wrap">
        {/* Back */}
        <a href="/blogs" className="blog-back-link">← All articles</a>

        <article className="blog-article">
          {/* Header */}
          <header className="blog-article-header">
            {date && <p className="blog-article-date">{date}</p>}
            <h1 className="blog-article-title">{blog.title}</h1>
            {blog.metaDescription && (
              <p className="blog-article-lead">{blog.metaDescription}</p>
            )}
          </header>

          {/* Cover image */}
          {blog.image && (
            <div className="blog-article-cover">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={blog.image} alt={blog.title || ''} className="blog-article-cover-img" />
            </div>
          )}

          {/* Content — rendered as HTML (written by admin) */}
          {blog.content ? (
            <div
              className="blog-article-content"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          ) : (
            <p className="blog-article-empty">Content coming soon.</p>
          )}
        </article>

        {/* CTA */}
        <aside className="blog-cta-box">
          <div className="cta-wrap">
            <div>
              <h2>Thekedaar ho? Ab diary chhodo.</h2>
              <p>Attendance, labour payment aur site hisaab ko digital karo — bilkul free mein.</p>
            </div>
            <div className="nav-actions">
              <a className="btn btn-primary" href="/register">Start Free →</a>
              <a className="btn btn-outline" href="/login">Login</a>
            </div>
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="footer" style={{ marginTop: '48px' }}>
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
        .blog-detail-wrap {
          max-width: 780px;
          padding-top: 32px;
          padding-bottom: 48px;
        }
        .blog-back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: .88rem;
          font-weight: 700;
          color: #2563eb;
          margin-bottom: 28px;
          transition: color .2s;
        }
        .blog-back-link:hover { color: #1d4ed8; }
        .blog-article {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0,0,0,.04);
        }
        .blog-article-header {
          padding: 36px 36px 0;
        }
        .blog-article-date {
          font-size: .78rem;
          color: #2563eb;
          font-weight: 700;
          letter-spacing: .05em;
          text-transform: uppercase;
          margin: 0 0 10px;
        }
        .blog-article-title {
          font-size: clamp(1.6rem, 4vw, 2.4rem);
          font-weight: 900;
          letter-spacing: -.03em;
          line-height: 1.1;
          margin: 0 0 14px;
          color: #0f172a;
        }
        .blog-article-lead {
          font-size: 1.05rem;
          color: #64748b;
          line-height: 1.8;
          margin: 0 0 28px;
          border-left: 3px solid #bfdbfe;
          padding-left: 16px;
        }
        .blog-article-cover {
          width: 100%;
          aspect-ratio: 16/9;
          overflow: hidden;
        }
        .blog-article-cover-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .blog-article-content {
          padding: 36px;
          font-size: 1rem;
          line-height: 1.9;
          color: #334155;
        }
        .blog-article-content h1,
        .blog-article-content h2,
        .blog-article-content h3,
        .blog-article-content h4 {
          color: #0f172a;
          font-weight: 800;
          margin: 1.6em 0 .5em;
          letter-spacing: -.02em;
          line-height: 1.2;
        }
        .blog-article-content h2 { font-size: 1.45rem; }
        .blog-article-content h3 { font-size: 1.2rem; }
        .blog-article-content p { margin: 0 0 1.1em; }
        .blog-article-content a { color: #2563eb; text-decoration: underline; }
        .blog-article-content ul,
        .blog-article-content ol { padding-left: 1.4em; margin: 0 0 1.1em; }
        .blog-article-content li { margin-bottom: .4em; }
        .blog-article-content blockquote {
          border-left: 3px solid #bfdbfe;
          margin: 1.2em 0;
          padding: .6em 1.2em;
          color: #64748b;
          font-style: italic;
          background: #f8fafc;
          border-radius: 0 8px 8px 0;
        }
        .blog-article-content img {
          max-width: 100%;
          border-radius: 12px;
          margin: 1em 0;
        }
        .blog-article-content pre,
        .blog-article-content code {
          background: #f1f5f9;
          border-radius: 8px;
          font-size: .92rem;
        }
        .blog-article-content pre { padding: 1em 1.2em; overflow-x: auto; border: 1px solid #e2e8f0; }
        .blog-article-content code { padding: .15em .4em; }
        .blog-article-empty {
          padding: 36px;
          color: #64748b;
          font-style: italic;
        }
        .blog-cta-box {
          margin-top: 36px;
          border-radius: 20px;
          padding: 30px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          border: none;
          box-shadow: 0 12px 32px rgba(37,99,235,.2);
          position: relative;
          overflow: hidden;
        }
        .blog-cta-box .cta-wrap h2 {
          font-size: clamp(1.4rem, 3vw, 1.9rem);
          font-weight: 900;
          margin: 0 0 8px;
          color: #fff;
        }
        .blog-cta-box .cta-wrap p {
          color: rgba(255,255,255,.85);
          margin: 0;
          line-height: 1.7;
        }
        @media (max-width: 600px) {
          .blog-article-header,
          .blog-article-content { padding: 20px 16px; }
          .blog-article-title { font-size: clamp(1.35rem, 5.5vw, 1.7rem); }
          .blog-detail-wrap { padding-top: 16px; padding-bottom: 32px; }
          .blog-back-link { margin-bottom: 16px; }
          .blog-cta-box { padding: 22px 18px; margin-top: 24px; }
          .blog-cta-box .cta-wrap { flex-direction: column; gap: 16px; }
          .blog-cta-box .cta-wrap .nav-actions { flex-wrap: wrap; }
        }
      `}</style>
    </div>
  );
}
