import { getSiteUrl } from '@/lib/siteUrl';

export const revalidate = 86400;

export function generateMetadata() {
  const base = getSiteUrl();
  return {
    title: 'Delete Your Account — Thekedaari',
    description:
      'Request deletion of your Thekedaari account and all associated data. We process account deletion requests within 3-5 working days.',
    alternates: { canonical: `${base}/delete-account` },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-snippet': -1 },
    },
    openGraph: {
      type: 'website',
      url: `${base}/delete-account`,
      title: 'Delete Your Account — Thekedaari',
      description: 'Request deletion of your Thekedaari account and all associated data.',
      siteName: 'Thekedaari',
      locale: 'en_IN',
      images: [{ url: `${base}/thekedaari-logo.png`, width: 512, height: 512, alt: 'Thekedaari' }],
    },
  };
}

export default function DeleteAccountPage() {
  return (
    <div className="pp-root">
      {/* NAV */}
      <nav>
        <a className="nav-logo" href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/thekedaari-logo.png" alt="Thekedaari Logo" style={{ width: 34, height: 34, borderRadius: 9 }} />
          Thekedaari
        </a>
        <div className="nav-right">
          <a href="/privacy-policy" className="nav-link">Privacy Policy</a>
          <a href="/register" className="nav-cta">Start Free →</a>
        </div>
      </nav>

      {/* PAGE HERO */}
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="page-tag">Account Management</div>
          <h1>Delete Your <em>Account</em></h1>
          <p>If you want to delete your account and all associated data, please follow the steps below.</p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="content-wrap">

        {/* HOW TO DELETE */}
        <div className="pp-section">
          <div className="pp-section-header">
            <div className="pp-num">01</div>
            <h2>How to Request Account Deletion</h2>
          </div>
          <p>To delete your Thekedaari account and all associated data, follow these simple steps:</p>
          <ul>
            <li>Email us at: <a href="mailto:support@thekedaari.com" style={{ color: '#60A5FA', textDecoration: 'none', fontWeight: 600 }}>support@thekedaari.com</a></li>
            <li>Send your registered mobile number or email address in the email</li>
            <li>We will process your request and delete your account within <strong style={{ color: '#F1F5F9' }}>3–5 working days</strong></li>
          </ul>
          <div className="highlight-box green">
            <p><strong>Tip:</strong> Use the same email or phone number you registered with so we can quickly locate your account.</p>
          </div>
        </div>

        <div className="pp-divider" />

        {/* DATA DELETED */}
        <div className="pp-section">
          <div className="pp-section-header">
            <div className="pp-num">02</div>
            <h2>Data That Will Be Deleted</h2>
          </div>
          <p>Once your account deletion request is processed, the following data will be permanently removed:</p>
          <ul>
            <li><strong style={{ color: '#F1F5F9' }}>Profile information</strong> — your name, phone number, email, and profile photo</li>
            <li><strong style={{ color: '#F1F5F9' }}>Labour data</strong> — all worker records, attendance, and salary information</li>
            <li><strong style={{ color: '#F1F5F9' }}>Expense records</strong> — all project transactions, payments, and financial data</li>
          </ul>
        </div>

        <div className="pp-divider" />

        {/* DATA RETENTION */}
        <div className="pp-section">
          <div className="pp-section-header">
            <div className="pp-num">03</div>
            <h2>Data Retention Notice</h2>
          </div>
          <p>Some data may be retained for legal and regulatory purposes as required by applicable laws. This may include:</p>
          <ul>
            <li>Transaction records required for tax or accounting compliance</li>
            <li>Data required to comply with legal obligations or court orders</li>
            <li>Anonymized usage statistics that cannot identify you personally</li>
          </ul>
          <div className="highlight-box amber">
            <p><strong>Please note:</strong> Once deleted, your data cannot be recovered. Make sure to export any data you need before requesting deletion.</p>
          </div>
        </div>

        <div className="pp-divider" />

        {/* CONTACT */}
        <div className="contact-card">
          <h3>Need Help?</h3>
          <p>If you have any questions about the account deletion process, reach out to us.</p>
          <div className="contact-row">
            <a href="mailto:support@thekedaari.com" className="contact-chip">
              <span className="ch-ico">✉️</span> support@thekedaari.com
            </a>
          </div>
        </div>

      </div>{/* /content-wrap */}

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <a className="footer-logo" href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/thekedaari-logo.png" alt="Thekedaari Logo" style={{ width: 30, height: 30, borderRadius: 8 }} />
            Thekedaari
          </a>
          <div className="footer-links">
            <a href="/">Home</a>
            <a href="/about-us">About Us</a>
            <a href="/privacy-policy">Privacy Policy</a>
            <a href="/delete-account" style={{ color: 'var(--pp-blue3)' }}>Delete Account</a>
          </div>
        </div>
        <div className="footer-copy">
          © {new Date().getFullYear()} Thekedaari. All rights reserved. | Made with ❤️ for Indian Contractors 🇮🇳
        </div>
      </footer>

      <style>{`
        .pp-root {
          --pp-black:  #080C14;
          --pp-dark:   #0D1220;
          --pp-dark2:  #111827;
          --pp-card:   #141B2D;
          --pp-border: rgba(255,255,255,0.07);
          --pp-border2:rgba(255,255,255,0.12);
          --pp-blue:   #2563EB;
          --pp-blue2:  #3B82F6;
          --pp-blue3:  #60A5FA;
          --pp-glow:   rgba(37,99,235,0.35);
          --pp-green:  #10B981;
          --pp-green2: #34D399;
          --pp-amber:  #F59E0B;
          --pp-text:   #F1F5F9;
          --pp-text2:  #94A3B8;
          --pp-text3:  #64748B;
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          background: var(--pp-black);
          color: var(--pp-text);
          -webkit-font-smoothing: antialiased;
          line-height: 1.75;
          min-height: 100vh;
        }
        .pp-root *, .pp-root *::before, .pp-root *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .pp-root nav {
          position: fixed; top:0; left:0; right:0; z-index:999;
          height:72px; display:flex; align-items:center; justify-content:space-between;
          padding:0 5vw;
          background:rgba(8,12,20,0.92); backdrop-filter:blur(20px);
          border-bottom:1px solid var(--pp-border);
        }
        .pp-root .nav-logo {
          display:flex; align-items:center; gap:10px;
          font-size:1.2rem; font-weight:800; color:#fff; text-decoration:none;
        }
        .pp-root .nav-right { display:flex; gap:12px; }
        .pp-root .nav-link {
          padding:8px 18px; border-radius:8px; color:var(--pp-text2);
          text-decoration:none; font-size:.87rem; font-weight:500;
          border:1px solid var(--pp-border2); transition:all .2s;
        }
        .pp-root .nav-link:hover { color:#fff; border-color:rgba(255,255,255,.25); }
        .pp-root .nav-cta {
          padding:8px 20px; border-radius:8px; background:var(--pp-blue);
          color:#fff; text-decoration:none; font-size:.87rem; font-weight:700;
          transition:all .2s; box-shadow:0 0 20px var(--pp-glow);
        }
        .pp-root .nav-cta:hover { background:var(--pp-blue2); }
        .pp-root .page-hero {
          padding:140px 5vw 80px;
          background:linear-gradient(180deg,var(--pp-dark) 0%,var(--pp-black) 100%);
          text-align:center; position:relative; overflow:hidden;
        }
        .pp-root .page-hero::before {
          content:''; position:absolute; inset:0;
          background:radial-gradient(ellipse 70% 60% at 50% 0%,rgba(37,99,235,.15) 0%,transparent 70%);
          pointer-events:none;
        }
        .pp-root .page-hero::after {
          content:''; position:absolute; inset:0;
          background-image:linear-gradient(rgba(255,255,255,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px);
          background-size:50px 50px;
          mask-image:radial-gradient(ellipse 80% 80% at 50% 50%,black 0%,transparent 100%);
          pointer-events:none;
        }
        .pp-root .page-hero-inner { position:relative; z-index:1; }
        .pp-root .page-tag {
          display:inline-flex; align-items:center; gap:6px;
          padding:5px 14px; border-radius:100px;
          background:rgba(37,99,235,.1); border:1px solid rgba(37,99,235,.25);
          font-size:.75rem; font-weight:700; letter-spacing:1px;
          color:var(--pp-blue3); text-transform:uppercase; margin-bottom:1.2rem;
        }
        .pp-root .page-hero h1 {
          font-size:clamp(2rem,4vw,3.2rem); font-weight:800; letter-spacing:-1.5px;
          color:#fff; margin-bottom:1rem; line-height:1.15;
        }
        .pp-root .page-hero h1 em {
          font-family:'Georgia',serif; font-style:italic; font-weight:400; color:var(--pp-blue3);
        }
        .pp-root .page-hero p { font-size:1rem; color:var(--pp-text2); max-width:560px; margin:0 auto 1.5rem; }
        .pp-root .content-wrap { max-width:860px; margin:0 auto; padding:80px 5vw 100px; }
        .pp-root .pp-section { margin-bottom:60px; scroll-margin-top:100px; }
        .pp-root .pp-section-header { display:flex; align-items:flex-start; gap:16px; margin-bottom:24px; }
        .pp-root .pp-num {
          width:36px; height:36px; border-radius:10px;
          background:rgba(37,99,235,.12); border:1px solid rgba(37,99,235,.25);
          display:flex; align-items:center; justify-content:center;
          font-size:.78rem; font-weight:800; color:var(--pp-blue3); flex-shrink:0; margin-top:4px;
        }
        .pp-root .pp-section h2 { font-size:1.35rem; font-weight:800; color:#fff; letter-spacing:-.5px; line-height:1.3; }
        .pp-root .pp-section h3 { font-size:1rem; font-weight:700; color:var(--pp-text); margin:24px 0 10px; }
        .pp-root .pp-section p { font-size:.93rem; color:var(--pp-text2); margin-bottom:14px; line-height:1.8; }
        .pp-root .pp-section ul { list-style:none; display:flex; flex-direction:column; gap:10px; margin-bottom:16px; }
        .pp-root .pp-section ul li {
          display:flex; gap:10px; align-items:flex-start;
          font-size:.9rem; color:var(--pp-text2); line-height:1.7;
        }
        .pp-root .pp-section ul li::before {
          content:''; width:6px; height:6px; border-radius:50%;
          background:var(--pp-blue3); flex-shrink:0; margin-top:8px;
        }
        .pp-root .highlight-box {
          background:rgba(37,99,235,.06); border:1px solid rgba(37,99,235,.2);
          border-radius:14px; padding:20px 24px; margin:20px 0;
        }
        .pp-root .highlight-box.green { background:rgba(16,185,129,.06); border-color:rgba(16,185,129,.2); }
        .pp-root .highlight-box.amber { background:rgba(245,158,11,.06); border-color:rgba(245,158,11,.2); }
        .pp-root .highlight-box p { margin:0; font-size:.9rem; color:var(--pp-text2); }
        .pp-root .highlight-box p strong { color:var(--pp-text); }
        .pp-root .pp-divider {
          height:1px; background:linear-gradient(90deg,transparent,var(--pp-border2),transparent); margin:56px 0;
        }
        .pp-root .contact-card {
          background:var(--pp-card); border:1px solid var(--pp-border2);
          border-radius:20px; padding:36px; text-align:center; position:relative; overflow:hidden;
        }
        .pp-root .contact-card::before {
          content:''; position:absolute; top:0; left:0; right:0; height:2px;
          background:linear-gradient(90deg,var(--pp-blue),var(--pp-green2));
        }
        .pp-root .contact-card h3 { font-size:1.25rem; font-weight:800; color:#fff; margin-bottom:10px; }
        .pp-root .contact-card p { font-size:.92rem; color:var(--pp-text2); margin-bottom:24px; }
        .pp-root .contact-row { display:flex; gap:16px; justify-content:center; flex-wrap:wrap; }
        .pp-root .contact-chip {
          display:flex; align-items:center; gap:10px;
          padding:12px 22px; border-radius:12px;
          background:var(--pp-dark2); border:1px solid var(--pp-border2);
          text-decoration:none; color:var(--pp-text); font-size:.88rem; font-weight:600; transition:all .2s;
        }
        .pp-root .contact-chip:hover { border-color:var(--pp-blue); color:var(--pp-blue3); }
        .pp-root footer { background:var(--pp-dark); border-top:1px solid var(--pp-border); padding:50px 5vw 28px; }
        .pp-root .footer-inner {
          max-width:860px; margin:0 auto;
          display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:20px;
        }
        .pp-root .footer-logo {
          display:flex; align-items:center; gap:8px;
          font-size:1.1rem; font-weight:800; color:#fff; text-decoration:none;
        }
        .pp-root .footer-links { display:flex; gap:2rem; flex-wrap:wrap; }
        .pp-root .footer-links a { text-decoration:none; color:var(--pp-text2); font-size:.85rem; transition:color .2s; }
        .pp-root .footer-links a:hover { color:#fff; }
        .pp-root .footer-copy {
          max-width:860px; margin:24px auto 0; border-top:1px solid var(--pp-border); padding-top:20px;
          font-size:.78rem; color:var(--pp-text3); text-align:center;
        }
        @media(max-width:640px){
          .pp-root nav { padding:0 4vw; }
          .pp-root .nav-right .nav-link { display:none; }
          .pp-root .content-wrap { padding:60px 4vw 80px; }
        }
      `}</style>
    </div>
  );
}
