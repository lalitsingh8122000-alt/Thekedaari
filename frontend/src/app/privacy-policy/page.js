import { getSiteUrl } from '@/lib/siteUrl';

export const revalidate = 86400;

export function generateMetadata() {
  const base = getSiteUrl();
  return {
    title: 'Privacy Policy — Thekedaari | Aapka Data Surakshit Hai',
    description:
      'Thekedaari Privacy Policy — jaano aapka data kaise collect, store aur protect hota hai. Hum aapka data kabhi nahi bechte. Indian contractors ke liye secure aur trusted construction management app.',
    alternates: { canonical: `${base}/privacy-policy` },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
    openGraph: {
      type: 'website',
      url: `${base}/privacy-policy`,
      title: 'Privacy Policy — Thekedaari | Aapka Data Surakshit Hai',
      description: 'Thekedaari aapka data kabhi nahi bechta. Jaano aapka information kaise safe rehta hai.',
      siteName: 'Thekedaari',
      locale: 'en_IN',
      images: [{ url: `${base}/thekedaari-logo.png`, width: 512, height: 512, alt: 'Thekedaari' }],
    },
    twitter: {
      card: 'summary',
      title: 'Privacy Policy — Thekedaari',
      description: 'Aapka data aapka hai. Thekedaari mein aapki privacy fully protected hai.',
      images: [`${base}/thekedaari-logo.png`],
    },
  };
}

const jsonLd = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Privacy Policy — Thekedaari',
  description: 'Complete privacy policy of Thekedaari construction management app.',
  url: 'https://thekedaari.com/privacy-policy',
  inLanguage: ['en', 'hi'],
  datePublished: '2026-03-27',
  dateModified: '2026-03-27',
  publisher: {
    '@type': 'Organization',
    name: 'Thekedaari',
    logo: 'https://thekedaari.com/thekedaari-logo.png',
    url: 'https://thekedaari.com',
    email: 'LALITSINGH8122000@gmail.com',
    contactPoint: [
      { '@type': 'ContactPoint', telephone: '+91-6377518112', contactType: 'customer support' },
      { '@type': 'ContactPoint', telephone: '+91-7378255250', contactType: 'customer support' },
    ],
  },
});

export default function PrivacyPolicyPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <div className="pp-root">
        {/* NAV */}
        <nav>
          <a className="nav-logo" href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/thekedaari-logo.png" alt="Thekedaari Logo" style={{ width: 34, height: 34, borderRadius: 9 }} />
            Thekedaari
          </a>
          <div className="nav-right">
            <a href="/about-us" className="nav-link">About Us</a>
            <a href="/register" className="nav-cta">Start Free →</a>
          </div>
        </nav>

        {/* PAGE HERO */}
        <div className="page-hero">
          <div className="page-hero-inner">
            <div className="page-tag">Legal Document</div>
            <h1>Privacy <em>Policy</em></h1>
            <p>Aapka data aapka hai. Thekedaari mein aap kya share karte ho, kaise use hota hai — sab kuch yahan clearly explain kiya gaya hai.</p>
            <div className="page-meta">
              📅 Last Updated: &nbsp;<span>27 March 2026</span> &nbsp;|&nbsp; Effective Date: &nbsp;<span>27 March 2026</span>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="content-wrap">

          {/* TOC */}
          <div className="toc-card reveal-box">
            <h3>📋 Table of Contents</h3>
            <ul className="toc-list">
              <li><a href="#s1">Information We Collect</a></li>
              <li><a href="#s2">How We Use Your Information</a></li>
              <li><a href="#s3">Data Storage &amp; Security</a></li>
              <li><a href="#s4">Information Sharing &amp; Third Parties</a></li>
              <li><a href="#s5">Your Rights &amp; Control</a></li>
              <li><a href="#s6">Cookies &amp; Local Storage</a></li>
              <li><a href="#s7">Children&apos;s Privacy</a></li>
              <li><a href="#s8">Changes to This Policy</a></li>
              <li><a href="#s9">Contact Us</a></li>
            </ul>
          </div>

          <div className="highlight-box green">
            <p><strong>Simple baat pehle:</strong> Thekedaari aapka personal data kabhi bechta nahi, kabhi third-party advertisers ko nahi deta, aur aapke workers ka data sirf aapko dikhta hai. Hum aapki privacy ko seriously lete hain.</p>
          </div>

          <div className="pp-divider" />

          {/* S1 */}
          <div className="pp-section" id="s1">
            <div className="pp-section-header">
              <div className="pp-num">01</div>
              <h2>Information We Collect</h2>
            </div>
            <p>Thekedaari app use karte waqt hum kuch zaroori information collect karte hain taaki app sahi se kaam kare.</p>
            <h3>1.1 Account Information</h3>
            <p>Jab aap Thekedaari pe register karte ho, hum collect karte hain:</p>
            <ul>
              <li>Aapka naam (jaise &quot;Lalit Singh&quot;)</li>
              <li>Phone number (login aur account identification ke liye)</li>
              <li>Account creation date</li>
              <li>Profile photo (optional — aap upload na karo toh bhi chalta hai)</li>
            </ul>
            <h3>1.2 App Usage Data (Jo Aap Enter Karte Ho)</h3>
            <ul>
              <li>Worker ke naam, phone numbers, aur daily rates</li>
              <li>Attendance records (Present/Absent/Half Day)</li>
              <li>Payment aur salary records</li>
              <li>Project names, budgets, aur financial transactions</li>
              <li>Worker ledger entries (salary, bonus, advance payments)</li>
            </ul>
            <h3>1.3 Technical Data (Automatically Collected)</h3>
            <ul>
              <li>Device type aur operating system (Android/iOS)</li>
              <li>Browser ya app version</li>
              <li>App usage patterns — anonymously</li>
              <li>Error logs (app crash hone pe fix karne ke liye)</li>
            </ul>
            <div className="highlight-box amber">
              <p><strong>Note:</strong> Hum aapki location, contacts, ya camera access kabhi bhi background mein nahi lete. Jo permission maange jaate hain, woh sirf specific features ke liye hote hain aur aapki consent se.</p>
            </div>
          </div>

          <div className="pp-divider" />

          {/* S2 */}
          <div className="pp-section" id="s2">
            <div className="pp-section-header">
              <div className="pp-num">02</div>
              <h2>How We Use Your Information</h2>
            </div>
            <p>Hum aapka data sirf inhe kaadon ke liye use karte hain:</p>
            <h3>2.1 App Functionality</h3>
            <ul>
              <li>Aapka account create karna aur login karna</li>
              <li>Workers, attendance, aur salary data store karna</li>
              <li>Project finance aur ledger calculate karna</li>
              <li>Dashboard pe summary dikhana (income, expense, P&amp;L)</li>
            </ul>
            <h3>2.2 App Improvement</h3>
            <ul>
              <li>Bugs fix karna aur performance improve karna</li>
              <li>New features develop karna based on usage patterns</li>
              <li>App stability monitor karna</li>
            </ul>
            <h3>2.3 Communication</h3>
            <ul>
              <li>Important updates ya changes ke baare mein notify karna</li>
              <li>Support requests ka jawab dena</li>
              <li>Security-related alerts bhejna</li>
            </ul>
            <div className="highlight-box green">
              <p><strong>Hum kabhi nahi karte:</strong> Aapko spam bhejna, aapka data ads ke liye use karna, ya bina permission ke koi bhi marketing communication bhejna.</p>
            </div>
          </div>

          <div className="pp-divider" />

          {/* S3 */}
          <div className="pp-section" id="s3">
            <div className="pp-section-header">
              <div className="pp-num">03</div>
              <h2>Data Storage &amp; Security</h2>
            </div>
            <p>Aapka data secure rakhna hamari pehli zimmedari hai.</p>
            <h3>3.1 Where Is Data Stored</h3>
            <p>Thekedaari ka data India mein secure cloud servers par store hota hai. Hum industry-standard encryption use karte hain data store karte waqt (at rest) aur transfer karte waqt (in transit).</p>
            <h3>3.2 Security Measures</h3>
            <ul>
              <li>HTTPS encryption — saara data encrypted channel se travel karta hai</li>
              <li>Password hashing — aapka password plain text mein kabhi store nahi hota</li>
              <li>Regular security audits aur vulnerability checks</li>
              <li>Access controls — sirf authorized team members ko production data access</li>
              <li>Automatic backups — data loss se protection</li>
            </ul>
            <h3>3.3 Data Retention</h3>
            <p>Jab tak aapka account active hai, aapka data hum store karte hain. Account delete karne ke baad:</p>
            <ul>
              <li>Personal data 30 din ke andar permanently delete ho jaata hai</li>
              <li>Anonymized usage statistics retain ki ja sakti hain</li>
              <li>Legal requirements ki wajah se kuch records 90 days tak ho sakti hain</li>
            </ul>
            <div className="highlight-box">
              <p><strong>Important:</strong> Koi bhi security system 100% guarantee nahi de sakta. Agar aapko koi security issue dikhe, please turant <strong>LALITSINGH8122000@gmail.com</strong> par report karein.</p>
            </div>
          </div>

          <div className="pp-divider" />

          {/* S4 */}
          <div className="pp-section" id="s4">
            <div className="pp-section-header">
              <div className="pp-num">04</div>
              <h2>Information Sharing &amp; Third Parties</h2>
            </div>
            <div className="highlight-box green" style={{ marginBottom: 24 }}>
              <p><strong>Simple rule:</strong> Hum aapka data kabhi bhi sell nahi karte. Period.</p>
            </div>
            <p>Thekedaari kisi bhi third party ke saath aapka personal data share nahi karta, sirf in cases ko chhodkar:</p>
            <h3>4.1 Service Providers</h3>
            <ul>
              <li><strong>Cloud Hosting:</strong> Server infrastructure ke liye</li>
              <li><strong>Authentication Services:</strong> Secure login ke liye (phone OTP verification)</li>
              <li><strong>Error Monitoring:</strong> App crashes track karne ke liye (anonymized)</li>
            </ul>
            <h3>4.2 Legal Requirements</h3>
            <p>Agar Indian law, court order, ya government authority require kare, tab hum legally bound hain data share karne ke liye.</p>
            <h3>4.3 Business Transfer</h3>
            <p>Agar Thekedaari kabhi merge ya acquire ho, aapka data transfer ho sakta hai. Lekin hum aapko pehle notify karenge aur aapko data delete karne ka option milega.</p>
          </div>

          <div className="pp-divider" />

          {/* S5 */}
          <div className="pp-section" id="s5">
            <div className="pp-section-header">
              <div className="pp-num">05</div>
              <h2>Your Rights &amp; Control</h2>
            </div>
            <p>Thekedaari mein aap apna data control karte ho. Aapke paas yeh rights hain:</p>
            <h3>5.1 Access</h3>
            <p>Aap kabhi bhi app ke andar apna poora data dekh sakte ho.</p>
            <h3>5.2 Correction</h3>
            <p>Galat information ko aap khud edit kar sakte ho app ke andar.</p>
            <h3>5.3 Deletion</h3>
            <p>Aap apna account aur saara data delete kar sakte ho. Account settings se ya LALITSINGH8122000@gmail.com pe email karke. Delete request ke 30 din ke andar saara data permanently remove ho jaata hai.</p>
            <h3>5.4 Data Export</h3>
            <p>Aap apna data export karna chahte ho toh hum provide karte hain. Support se contact karo aur hum aapka full data (CSV format mein) de denge.</p>
            <h3>5.5 Opt-Out</h3>
            <p>Non-essential communications se opt-out karne ke liye settings ya support se contact karo.</p>
          </div>

          <div className="pp-divider" />

          {/* S6 */}
          <div className="pp-section" id="s6">
            <div className="pp-section-header">
              <div className="pp-num">06</div>
              <h2>Cookies &amp; Local Storage</h2>
            </div>
            <p>Thekedaari ek PWA (Progressive Web App) hai. Hum use karte hain:</p>
            <h3>6.1 Essential Cookies / Local Storage</h3>
            <ul>
              <li><strong>Session tokens:</strong> Aapko logged in rakhne ke liye</li>
              <li><strong>App preferences:</strong> Language setting (Hindi/English), dark mode</li>
              <li><strong>Offline data cache:</strong> App offline kaam kar sake isliye</li>
            </ul>
            <h3>6.2 Analytics (Anonymous)</h3>
            <ul>
              <li>Hum anonymized usage data collect karte hain app improve karne ke liye</li>
              <li>Yeh data aapko personally identify nahi karta</li>
              <li>Koi third-party advertising cookies use nahi karte hain</li>
            </ul>
            <div className="highlight-box">
              <p><strong>Browser settings:</strong> Aap browser mein cookies clear kar sakte ho, lekin isse app ki functionality affect ho sakti hai (logout ho sakte ho).</p>
            </div>
          </div>

          <div className="pp-divider" />

          {/* S7 */}
          <div className="pp-section" id="s7">
            <div className="pp-section-header">
              <div className="pp-num">07</div>
              <h2>Children&apos;s Privacy</h2>
            </div>
            <p>Thekedaari specifically professional contractors aur site managers ke liye bana hai. Yeh app 18 saal se kam umar ke bachon ke liye nahi hai.</p>
            <p>Hum jaanbujhkar 18 saal se kam umar ke logon ka data collect nahi karte. Agar aapko lagta hai kisi minor ka data galti se collect hua hai, please humse turant contact karein.</p>
          </div>

          <div className="pp-divider" />

          {/* S8 */}
          <div className="pp-section" id="s8">
            <div className="pp-section-header">
              <div className="pp-num">08</div>
              <h2>Changes to This Policy</h2>
            </div>
            <p>Hum is Privacy Policy ko update kar sakte hain jab:</p>
            <ul>
              <li>Naye features add hon jo data collection affect karein</li>
              <li>Laws ya regulations change hon</li>
              <li>Hamare practices change hon</li>
            </ul>
            <p>Koi bhi significant changes hone par hum aapko app notification ya email se inform karenge.</p>
          </div>

          <div className="pp-divider" />

          {/* S9 */}
          <div className="pp-section" id="s9">
            <div className="pp-section-header">
              <div className="pp-num">09</div>
              <h2>Contact Us</h2>
            </div>
            <p>Koi bhi privacy-related sawaal, concern, ya request ke liye hum se contact karein:</p>
          </div>

          <div className="contact-card">
            <h3>Privacy ke baare mein koi sawaal hai?</h3>
            <p>Hum 24–48 ghante ke andar jawab dete hain. Aapki privacy hamari zimmedari hai.</p>
            <div className="contact-row">
              <a href="mailto:LALITSINGH8122000@gmail.com" className="contact-chip">
                <span className="ch-ico">✉️</span> LALITSINGH8122000@gmail.com
              </a>
              <a href="tel:+916377518112" className="contact-chip">
                <span className="ch-ico">📞</span> +91 6377518112
              </a>
              <a href="tel:+917378255250" className="contact-chip">
                <span className="ch-ico">📞</span> +91 7378255250
              </a>
              <a href="https://thekedaari.com" className="contact-chip">
                <span className="ch-ico">🌐</span> thekedaari.com
              </a>
            </div>
            <p style={{ marginTop: 20, fontSize: '0.82rem', color: 'var(--pp-text3)' }}>
              Registered Address: Thekedaari, India<br />
              Governing Law: Laws of India (Information Technology Act, 2000 aur amendments)
            </p>
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
              <a href="/blogs">Blog</a>
              <a href="/privacy-policy" style={{ color: 'var(--pp-blue3)' }}>Privacy Policy</a>
              <a href="/register">Register</a>
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
          /* NAV */
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
          /* HERO */
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
          .pp-root .page-meta {
            display:inline-flex; align-items:center; gap:8px;
            padding:8px 18px; border-radius:8px;
            background:var(--pp-card); border:1px solid var(--pp-border2);
            font-size:.8rem; color:var(--pp-text2);
          }
          .pp-root .page-meta span { color:var(--pp-green2); font-weight:600; }
          /* CONTENT */
          .pp-root .content-wrap { max-width:860px; margin:0 auto; padding:80px 5vw 100px; }
          /* TOC */
          .pp-root .toc-card {
            background:var(--pp-card); border:1px solid var(--pp-border2);
            border-radius:20px; padding:28px 32px; margin-bottom:40px;
            position:relative; overflow:hidden;
          }
          .pp-root .toc-card::before {
            content:''; position:absolute; top:0; left:0; right:0; height:2px;
            background:linear-gradient(90deg,var(--pp-blue),var(--pp-green2));
          }
          .pp-root .toc-card h3 {
            font-size:.82rem; font-weight:700; letter-spacing:1px;
            text-transform:uppercase; color:var(--pp-text2); margin-bottom:16px;
          }
          .pp-root .toc-list { list-style:none; display:flex; flex-direction:column; gap:8px; }
          .pp-root .toc-list li a {
            color:var(--pp-blue3); text-decoration:none; font-size:.9rem;
            font-weight:500; transition:color .2s; display:flex; align-items:center; gap:8px;
          }
          .pp-root .toc-list li a:hover { color:#fff; }
          .pp-root .toc-list li a::before { content:'→'; font-size:.75rem; color:var(--pp-text3); }
          /* SECTION */
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
          /* Highlight box */
          .pp-root .highlight-box {
            background:rgba(37,99,235,.06); border:1px solid rgba(37,99,235,.2);
            border-radius:14px; padding:20px 24px; margin:20px 0;
          }
          .pp-root .highlight-box.green { background:rgba(16,185,129,.06); border-color:rgba(16,185,129,.2); }
          .pp-root .highlight-box.amber { background:rgba(245,158,11,.06); border-color:rgba(245,158,11,.2); }
          .pp-root .highlight-box p { margin:0; font-size:.9rem; color:var(--pp-text2); }
          .pp-root .highlight-box p strong { color:var(--pp-text); }
          /* Divider */
          .pp-root .pp-divider {
            height:1px; background:linear-gradient(90deg,transparent,var(--pp-border2),transparent); margin:56px 0;
          }
          /* Contact card */
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
          /* FOOTER */
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
            .pp-root .toc-card { padding:22px; }
          }
        `}</style>
      </div>
    </>
  );
}
