import { getSiteUrl } from '@/lib/siteUrl';

export const revalidate = 86400;

export function generateMetadata() {
  const base = getSiteUrl();
  return {
    title: "About Us — Thekedaari | India's #1 Free Construction Workforce Management App",
    description:
      'Thekedaari ek free construction management app hai Indian contractors ke liye. Worker attendance, salary calculation, project finance tracking — sab ek jagah. 500+ contractors ka bharosa. Abhi register karo!',
    alternates: { canonical: `${base}/about-us` },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
    openGraph: {
      type: 'website',
      url: `${base}/about-us`,
      title: "About Us — Thekedaari | Free Construction Management App for Indian Contractors",
      description: 'Jaano Thekedaari ki kahani — kaise ek simple idea se India ka sabse powerful free construction management app bana.',
      siteName: 'Thekedaari',
      locale: 'en_IN',
      images: [{ url: `${base}/thekedaari-logo.png`, width: 512, height: 512, alt: 'Thekedaari' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: "About Us — Thekedaari | Free Construction App India",
      description: "India ka #1 free construction management app. Worker attendance, salary, project finance — sab digital.",
      images: [`${base}/thekedaari-logo.png`],
    },
  };
}

const jsonLdOrg = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Thekedaari',
  alternateName: 'ठेकेदारी',
  url: 'https://thekedaari.com',
  logo: 'https://thekedaari.com/thekedaari-logo.png',
  description: "India's #1 free construction workforce and project management app for contractors.",
  foundingDate: '2026-03-27',
  founder: { '@type': 'Person', name: 'Lalit Singh' },
  contactPoint: [
    { '@type': 'ContactPoint', telephone: '+91-6377518112', contactType: 'customer support', availableLanguage: ['Hindi', 'English'] },
    { '@type': 'ContactPoint', telephone: '+91-7378255250', contactType: 'customer support', availableLanguage: ['Hindi', 'English'] },
  ],
  email: 'LALITSINGH8122000@gmail.com',
  areaServed: 'IN',
  knowsLanguage: ['Hindi', 'English'],
});

const jsonLdPage = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'About Thekedaari',
  description: 'Thekedaari ek Indian startup hai jo real construction sites ki problems ko samajhkar banaya gaya hai.',
  url: 'https://thekedaari.com/about-us',
  mainEntity: {
    '@type': 'SoftwareApplication',
    name: 'Thekedaari',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Android, iOS, Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', ratingCount: '500' },
  },
});

export default function AboutUsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdOrg }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdPage }} />
      <div className="au-root">

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
            <div className="page-tag">Our Story</div>
            <h1>Building for the<br /><em>Builders of India</em></h1>
            <p>Thekedaari ek Indian startup hai jo real construction sites ki problems ko samajhkar banaya gaya hai. Hum contractors ke liye, contractors ke saath mila kar kaam karte hain.</p>
          </div>
        </div>

        <div className="main-wrap">

          {/* STORY */}
          <div className="story-section">
            <div>
              <div className="story-tag">The Beginning</div>
              <h2>Ek Simple <em>Problem</em> se Shuru Hua Safar</h2>
              <p>Bharat mein lakho contractors roze ek hi problem face karte hain — workers ka hisaab copy register mein, salary ka calculation galat, aur project ka budget kabhi clear nahi.</p>
              <p>Thekedaari ka idea usi frustration se aaya. Jab ek construction site pe 15–20 workers ka attendance manual register mein likhna padta tha, aur fir salary calculate karna padta tha — tab ek tech solution ki zaroorat mehsoos hui.</p>
              <p>2026 mein, ek simple PWA ke roop mein Thekedaari launch hua. Mission tha: <strong style={{ color: '#fff' }}>Har Indian contractor ke haath mein ek smart tool de do.</strong></p>
            </div>
            <div>
              <div className="quote-card">
                <div className="quote-mark">&ldquo;</div>
                <p className="quote-text">Jab maine pehli baar 20 workers ki attendance ek minute mein mark ki aur salary automatically calculate hoti dekhi — tab samjha ki technology kitni powerful ho sakti hai simple logon ke liye.</p>
                <div className="quote-author">
                  <div className="q-av">L</div>
                  <div>
                    <div className="q-name">Lalit Singh</div>
                    <div className="q-role">Founder &amp; First User, Thekedaari</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="sec-divider" />

          {/* PROBLEM */}
          <div className="problem-section">
            <div>
              <div className="story-tag">The Problem</div>
              <h2 className="sec-title">Indian Contractors ki <em>Asli Takleefen</em></h2>
              <p className="sec-sub">Hum ne 100+ contractors se baat ki. Yeh woh problems hain jo har koi face karta tha — roz, bina kisi solution ke.</p>
            </div>
            <div className="problem-grid">
              {[
                { icon: '📔', title: 'Paper Register', desc: 'Attendance aur salary sab copy-register mein. Ek baarish mein data khatam. Galati ka scope zyada.' },
                { icon: '🧮', title: 'Manual Calculation', desc: 'Har mahine salary manually calculate karo. Ek galti aur worker naraaz. Time waste, energy waste.' },
                { icon: '💸', title: 'Paise Ka Hisaab Nahi', desc: 'Project mein kitna aaya, kitna gaya — koi clarity nahi. Profit hua ya loss, pata nahi chalta.' },
                { icon: '👷', title: 'Worker Payment Confusion', desc: 'Kisne advance liya, kisne nahi — yad rakhna mushkil. Disputes aam baat ban jaati hai site pe.' },
                { icon: '🗂️', title: 'Multiple Projects Manage Karna', desc: 'Ek se zyada sites ho toh data alag alag jagah bikhra rehta hai. Overview milna impossible.' },
                { icon: '📱', title: 'Technology Ka Darr', desc: 'Bahut saare apps itne complex hain ki site pe kaam karne wale contractors use hi nahi kar paate.' },
              ].map(({ icon, title, desc }) => (
                <div className="prob-card" key={title}>
                  <div className="prob-icon">{icon}</div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="sec-divider" />

          {/* SOLUTION */}
          <div className="solution-section">
            <div className="solution-header">
              <div className="story-tag">Our Solution</div>
              <h2>Thekedaari ka <em>Jawab</em></h2>
              <p>Complex nahi, simple. Expensive nahi, free. Thekedaari ne in sab problems ka ek systematic solution banaya hai.</p>
            </div>
            <div className="solution-steps">
              {[
                { n: '1', title: 'Digital Attendance — Paper Ki Zaroorat Khatam', desc: 'Har subah ek screen pe aao, sabka attendance mark karo — Present, Absent, Half Day ya Other. Salary automatically calculate hoti hai. No calculator needed, no errors.', badge: '📅 Daily Attendance' },
                { n: '2', title: 'Worker Ledger — Har Rupee Ka Hisaab', desc: 'Har worker ka apna ledger — OWED salary, PAID amount, advance, bonus. Running total dikhta rehta hai. Koi confusion nahi, koi dispute nahi.', badge: '📒 Worker Ledger' },
                { n: '3', title: 'Project Finance — Profit/Loss Ek Nazar Mein', desc: 'Project banao, income aur expense track karo, aur real-time dekho ki aap profit mein ho ya loss mein. Top projects ka summary dashboard pe milta hai.', badge: '🏗️ Project Finance' },
                { n: '4', title: 'PWA — Install Karo Bina App Store Ke', desc: 'Thekedaari ek Progressive Web App hai. Browser se seedha install karo kisi bhi phone pe — Android ya iPhone. Works offline bhi. Simple.', badge: '📱 PWA Technology' },
              ].map(({ n, title, desc, badge }) => (
                <div className="sol-step" key={n}>
                  <div className="sol-left">
                    <div className="sol-num">{n}</div>
                    <div className="sol-line" />
                  </div>
                  <div className="sol-content">
                    <h3>{title}</h3>
                    <p>{desc}</p>
                    <span className="sol-badge">{badge}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="sec-divider" />

          {/* VALUES */}
          <div className="values-section">
            <div className="values-header">
              <div className="story-tag">Our Values</div>
              <h2>Jo Cheezein Hame <em>Drive</em> Karti Hain</h2>
              <p>Thekedaari sirf ek app nahi hai — yeh ek commitment hai Indian contractors ke saath.</p>
            </div>
            <div className="values-grid">
              {[
                { cls: 'v1', icon: '🎯', title: 'Simplicity First', desc: 'Thekedaari itna simple hona chahiye ki jo contractor kabhi smartphone nahi use karta tha, woh bhi 5 minute mein use kar le.' },
                { cls: 'v2', icon: '🌱', title: 'Built for Bharat', desc: 'Hindi support, offline mode, low-data design — sab kuch Indian sites ki reality ko dhyan mein rakh ke banaya gaya hai.' },
                { cls: 'v3', icon: '🔒', title: 'Privacy is Sacred', desc: 'Aapka business data sirf aapka hai. Hum data kabhi nahi bechte, kabhi advertisers ko nahi dete.' },
                { cls: 'v4', icon: '❤️', title: 'Contractor-First', desc: 'Har feature, har update mein ek hi sawaal — "Kya yeh contractor ke liye easier hoga?" Contractor ki zindagi asaan karna hi hamara mission hai.' },
              ].map(({ cls, icon, title, desc }) => (
                <div className={`val-card ${cls}`} key={title}>
                  <div className="val-icon">{icon}</div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="sec-divider" />

          {/* TEAM */}
          <div className="team-section">
            <div className="team-header">
              <div className="story-tag">The Team</div>
              <h2>Jo Log Thekedaari <em>Banate Hain</em></h2>
              <p>Hum ek passionate team hain jo genuinely Indian construction industry ki help karna chahti hai technology ke through.</p>
            </div>
            <div className="team-grid">
              <div className="team-card">
                <div className="team-av" style={{ background: 'linear-gradient(135deg,#2563EB,#1D4ED8)' }}>L</div>
                <div className="team-name">Lalit Singh</div>
                <div className="team-role">Founder &amp; CEO</div>
                <p className="team-desc">Construction industry ki problems ko firsthand dekha aur Thekedaari ka idea liya. Product vision aur contractor relationships handle karte hain.</p>
                <div className="team-since">📅 Member since: 27/3/2026</div>
              </div>
              <div className="team-card">
                <div className="team-av" style={{ background: 'linear-gradient(135deg,#059669,#047857)' }}>T</div>
                <div className="team-name">Tech Team</div>
                <div className="team-role">Development &amp; Engineering</div>
                <p className="team-desc">PWA technology, real-time data sync, offline support — sabkuch build karte hain. Performance aur reliability hamare standards hain.</p>
                <div className="team-since">🛠️ Building since: 2026</div>
              </div>
              <div className="team-card">
                <div className="team-av" style={{ background: 'linear-gradient(135deg,#D97706,#B45309)' }}>S</div>
                <div className="team-name">Support Team</div>
                <div className="team-role">Customer Success</div>
                <p className="team-desc">Aapke sawalon ka jawab 24–48 ghante mein. Har contractor ki problem hum personally solve karte hain. Aap akele nahi hain.</p>
                <div className="team-since">📞 Always available</div>
              </div>
            </div>
          </div>

          <div className="sec-divider" />

          {/* STATS */}
          <div className="stats-band">
            <div className="stats-row">
              {[
                { num: '500+', label: 'Active Contractors' },
                { num: '10K+', label: 'Workers Managed' },
                { num: '₹2Cr+', label: 'Salaries Tracked' },
                { num: "Mar'26", label: 'Founded' },
              ].map(({ num, label }) => (
                <div className="sb-item" key={label}>
                  <div className="sb-num">{num}</div>
                  <div className="sb-label">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="sec-divider" />

          {/* TECH */}
          <div className="tech-section">
            <div>
              <div className="story-tag">Technology</div>
              <h2>Kaise Bana hai <em>Thekedaari</em></h2>
              <p>Hum modern web technologies use karte hain jo fast, reliable, aur Indian internet conditions ke liye optimized hain.</p>
            </div>
            <div className="tech-grid">
              {[
                { icon: '📱', name: 'PWA', desc: 'Progressive Web App — no app store needed' },
                { icon: '⚡', name: 'Offline First', desc: 'Kaam karta hai bina internet ke bhi' },
                { icon: '🔒', name: 'HTTPS Encrypted', desc: 'Saara data encrypted channel se' },
                { icon: '☁️', name: 'Cloud Backend', desc: 'India mein secure servers pe hosted' },
                { icon: '🇮🇳', name: 'Hindi Support', desc: 'Full Hindi & English localization' },
                { icon: '📊', name: 'Real-time Sync', desc: 'Data turant update hota hai' },
                { icon: '🔄', name: 'Auto Backup', desc: 'Data kabhi nahi khoega' },
                { icon: '📲', name: 'Any Device', desc: 'Android, iPhone, sabpe kaam karta hai' },
              ].map(({ icon, name, desc }) => (
                <div className="tech-chip" key={name}>
                  <div className="tc-icon">{icon}</div>
                  <div className="tc-name">{name}</div>
                  <div className="tc-desc">{desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="sec-divider" />

          {/* CTA */}
          <div className="cta-section">
            <div className="cta-bg" />
            <div className="cta-inner">
              <h2>Hamare <em>Mission</em> Ka Hissa Bano</h2>
              <p>Thekedaari ab 500+ contractors ka bharosa hai. Aap bhi apni site ko smart banao — bilkul free mein.</p>
              <div className="cta-btns">
                <a href="/register" className="btn-cta">🚀 Register Free — Abhi</a>
                <a href="/privacy-policy" className="btn-ghost">Privacy Policy Padho →</a>
              </div>
            </div>
          </div>

        </div>{/* /main-wrap */}

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
              <a href="/about-us" style={{ color: 'var(--au-blue3)' }}>About Us</a>
              <a href="/blogs">Blog</a>
              <a href="/privacy-policy">Privacy Policy</a>
              <a href="/register">Register</a>
            </div>
          </div>
          <div className="footer-copy">
            © {new Date().getFullYear()} Thekedaari. All rights reserved. | Made with ❤️ for Indian Contractors 🇮🇳
          </div>
        </footer>

        <style>{`
          .au-root {
            --au-black:  #080C14;
            --au-dark:   #0D1220;
            --au-dark2:  #111827;
            --au-card:   #141B2D;
            --au-border: rgba(255,255,255,0.07);
            --au-border2:rgba(255,255,255,0.12);
            --au-blue:   #2563EB;
            --au-blue2:  #3B82F6;
            --au-blue3:  #60A5FA;
            --au-glow:   rgba(37,99,235,0.35);
            --au-green:  #10B981;
            --au-green2: #34D399;
            --au-amber:  #F59E0B;
            --au-red:    #EF4444;
            --au-text:   #F1F5F9;
            --au-text2:  #94A3B8;
            --au-text3:  #64748B;
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
            background: var(--au-black);
            color: var(--au-text);
            -webkit-font-smoothing: antialiased;
            min-height: 100vh;
          }
          .au-root *, .au-root *::before, .au-root *::after { box-sizing: border-box; margin: 0; padding: 0; }
          /* NAV */
          .au-root nav {
            position:fixed; top:0; left:0; right:0; z-index:999;
            height:72px; display:flex; align-items:center; justify-content:space-between;
            padding:0 5vw; background:rgba(8,12,20,.92); backdrop-filter:blur(20px);
            border-bottom:1px solid var(--au-border);
          }
          .au-root .nav-logo { display:flex; align-items:center; gap:10px; font-size:1.2rem; font-weight:800; color:#fff; text-decoration:none; }
          .au-root .nav-right { display:flex; gap:12px; }
          .au-root .nav-link {
            padding:8px 18px; border-radius:8px; color:var(--au-text2); text-decoration:none;
            font-size:.87rem; font-weight:500; border:1px solid var(--au-border2); transition:all .2s;
          }
          .au-root .nav-link:hover { color:#fff; border-color:rgba(255,255,255,.25); }
          .au-root .nav-cta {
            padding:8px 20px; border-radius:8px; background:var(--au-blue); color:#fff;
            text-decoration:none; font-size:.87rem; font-weight:700;
            transition:all .2s; box-shadow:0 0 20px var(--au-glow);
          }
          .au-root .nav-cta:hover { background:var(--au-blue2); }
          /* HERO */
          .au-root .page-hero {
            padding:140px 5vw 80px;
            background:linear-gradient(180deg,var(--au-dark) 0%,var(--au-black) 100%);
            text-align:center; position:relative; overflow:hidden;
          }
          .au-root .page-hero::before {
            content:''; position:absolute; inset:0;
            background:radial-gradient(ellipse 70% 60% at 50% 0%,rgba(37,99,235,.15) 0%,transparent 70%); pointer-events:none;
          }
          .au-root .page-hero::after {
            content:''; position:absolute; inset:0;
            background-image:linear-gradient(rgba(255,255,255,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px);
            background-size:50px 50px;
            mask-image:radial-gradient(ellipse 80% 80% at 50% 50%,black 0%,transparent 100%); pointer-events:none;
          }
          .au-root .page-hero-inner { position:relative; z-index:1; }
          .au-root .page-tag {
            display:inline-flex; align-items:center; gap:6px; padding:5px 14px; border-radius:100px;
            background:rgba(37,99,235,.1); border:1px solid rgba(37,99,235,.25);
            font-size:.75rem; font-weight:700; letter-spacing:1px; color:var(--au-blue3);
            text-transform:uppercase; margin-bottom:1.2rem;
          }
          .au-root .page-hero h1 {
            font-size:clamp(2.2rem,4.5vw,3.5rem); font-weight:800; letter-spacing:-1.5px;
            color:#fff; margin-bottom:1rem; line-height:1.15;
          }
          .au-root .page-hero h1 em { font-family:'Georgia',serif; font-style:italic; font-weight:400; color:var(--au-blue3); }
          .au-root .page-hero p { font-size:1.05rem; color:var(--au-text2); max-width:580px; margin:0 auto; line-height:1.75; }
          /* MAIN */
          .au-root .main-wrap { max-width:1100px; margin:0 auto; padding:0 5vw; }
          /* STORY */
          .au-root .story-section {
            padding:90px 0 70px; display:grid; grid-template-columns:1fr 1fr; gap:6rem; align-items:center;
          }
          .au-root .story-tag {
            display:inline-block; padding:4px 12px; border-radius:100px;
            background:rgba(37,99,235,.1); border:1px solid rgba(37,99,235,.2);
            font-size:.72rem; font-weight:700; letter-spacing:1px; color:var(--au-blue3);
            text-transform:uppercase; margin-bottom:1rem;
          }
          .au-root .story-section h2 {
            font-size:clamp(1.8rem,3vw,2.6rem); font-weight:800; letter-spacing:-1px;
            color:#fff; margin-bottom:1.2rem; line-height:1.2;
          }
          .au-root .story-section h2 em { font-family:'Georgia',serif; font-style:italic; font-weight:400; color:var(--au-green2); }
          .au-root .story-section p { font-size:.95rem; color:var(--au-text2); line-height:1.8; margin-bottom:18px; }
          .au-root .quote-card {
            background:var(--au-card); border:1px solid var(--au-border2); border-radius:20px;
            padding:32px; position:relative; overflow:hidden;
          }
          .au-root .quote-card::before {
            content:''; position:absolute; top:0; left:0; right:0; height:2px;
            background:linear-gradient(90deg,var(--au-blue),var(--au-green2));
          }
          .au-root .quote-mark { font-size:5rem; color:rgba(37,99,235,.15); line-height:.8; margin-bottom:12px; }
          .au-root .quote-text { font-size:1rem; color:var(--au-text); line-height:1.75; font-style:italic; margin-bottom:20px; }
          .au-root .quote-author { display:flex; align-items:center; gap:12px; }
          .au-root .q-av {
            width:44px; height:44px; border-radius:50%;
            background:linear-gradient(135deg,var(--au-blue),var(--au-green));
            display:flex; align-items:center; justify-content:center;
            font-weight:800; font-size:1rem; color:#fff;
          }
          .au-root .q-name { font-weight:700; color:#fff; font-size:.95rem; }
          .au-root .q-role { font-size:.78rem; color:var(--au-text2); margin-top:2px; }
          /* PROBLEM */
          .au-root .problem-section { padding:0 0 80px; border-top:1px solid var(--au-border); padding-top:80px; }
          .au-root .sec-title { font-size:clamp(1.8rem,3vw,2.5rem); font-weight:800; letter-spacing:-1px; color:#fff; margin-bottom:1rem; }
          .au-root .sec-title em { font-family:'Georgia',serif; font-style:italic; color:var(--au-red); }
          .au-root .sec-sub { font-size:.95rem; color:var(--au-text2); max-width:600px; line-height:1.75; margin-bottom:3rem; }
          .au-root .problem-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
          .au-root .prob-card {
            background:var(--au-dark); border:1px solid var(--au-border); border-radius:18px; padding:24px; transition:all .3s;
          }
          .au-root .prob-card:hover { background:var(--au-card); border-color:var(--au-border2); transform:translateY(-4px); }
          .au-root .prob-icon { font-size:1.8rem; margin-bottom:14px; }
          .au-root .prob-card h3 { font-size:.95rem; font-weight:700; color:var(--au-text); margin-bottom:8px; }
          .au-root .prob-card p { font-size:.85rem; color:var(--au-text2); line-height:1.65; }
          /* SOLUTION */
          .au-root .solution-section { padding:80px 0; border-top:1px solid var(--au-border); }
          .au-root .solution-header { text-align:center; margin-bottom:4rem; }
          .au-root .solution-header h2 { font-size:clamp(1.8rem,3vw,2.5rem); font-weight:800; letter-spacing:-1px; color:#fff; margin-bottom:1rem; }
          .au-root .solution-header h2 em { font-family:'Georgia',serif; font-style:italic; color:var(--au-green2); }
          .au-root .solution-header p { font-size:.95rem; color:var(--au-text2); max-width:560px; margin:0 auto; line-height:1.75; }
          .au-root .solution-steps { display:flex; flex-direction:column; }
          .au-root .sol-step { display:grid; grid-template-columns:80px 1fr; align-items:stretch; }
          .au-root .sol-left { display:flex; flex-direction:column; align-items:center; }
          .au-root .sol-num {
            width:56px; height:56px; border-radius:50%;
            background:var(--au-dark2); border:2px solid var(--au-blue);
            display:flex; align-items:center; justify-content:center;
            font-size:1rem; font-weight:800; color:var(--au-blue3); flex-shrink:0;
            box-shadow:0 0 20px rgba(37,99,235,.2); z-index:1;
          }
          .au-root .sol-line {
            width:2px; flex:1; min-height:40px;
            background:linear-gradient(180deg,var(--au-blue) 0%,transparent 100%);
            margin:4px 0; opacity:.3;
          }
          .au-root .sol-step:last-child .sol-line { display:none; }
          .au-root .sol-content { padding:0 0 48px 28px; }
          .au-root .sol-content h3 { font-size:1.05rem; font-weight:700; color:#fff; margin-bottom:8px; }
          .au-root .sol-content p { font-size:.88rem; color:var(--au-text2); line-height:1.7; }
          .au-root .sol-badge {
            display:inline-block; margin-top:10px; padding:4px 12px; border-radius:100px;
            background:rgba(37,99,235,.1); border:1px solid rgba(37,99,235,.2);
            font-size:.72rem; color:var(--au-blue3); font-weight:600;
          }
          /* VALUES */
          .au-root .values-section { padding:80px 0; border-top:1px solid var(--au-border); }
          .au-root .values-header { margin-bottom:3rem; }
          .au-root .values-header h2 { font-size:clamp(1.8rem,3vw,2.5rem); font-weight:800; letter-spacing:-1px; color:#fff; margin-bottom:1rem; }
          .au-root .values-header h2 em { font-family:'Georgia',serif; font-style:italic; color:var(--au-amber); }
          .au-root .values-header p { font-size:.95rem; color:var(--au-text2); max-width:560px; line-height:1.75; }
          .au-root .values-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:20px; }
          .au-root .val-card {
            background:var(--au-dark); border:1px solid var(--au-border); border-radius:18px; padding:28px;
            transition:all .3s; position:relative; overflow:hidden;
          }
          .au-root .val-card:hover { background:var(--au-card); border-color:var(--au-border2); transform:translateY(-4px); }
          .au-root .val-card::after {
            content:''; position:absolute; top:0; left:0; bottom:0; width:3px; border-radius:3px 0 0 3px;
          }
          .au-root .val-card.v1::after { background:var(--au-blue); }
          .au-root .val-card.v2::after { background:var(--au-green2); }
          .au-root .val-card.v3::after { background:var(--au-amber); }
          .au-root .val-card.v4::after { background:var(--au-red); }
          .au-root .val-icon { font-size:1.8rem; margin-bottom:14px; }
          .au-root .val-card h3 { font-size:1rem; font-weight:700; color:#fff; margin-bottom:8px; }
          .au-root .val-card p { font-size:.87rem; color:var(--au-text2); line-height:1.65; }
          /* TEAM */
          .au-root .team-section { padding:80px 0; border-top:1px solid var(--au-border); }
          .au-root .team-header { margin-bottom:3rem; }
          .au-root .team-header h2 { font-size:clamp(1.8rem,3vw,2.5rem); font-weight:800; letter-spacing:-1px; color:#fff; margin-bottom:1rem; }
          .au-root .team-header h2 em { font-family:'Georgia',serif; font-style:italic; color:var(--au-blue3); }
          .au-root .team-header p { font-size:.95rem; color:var(--au-text2); max-width:560px; line-height:1.75; }
          .au-root .team-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
          .au-root .team-card {
            background:var(--au-dark); border:1px solid var(--au-border); border-radius:20px; padding:28px;
            text-align:center; transition:all .3s; position:relative; overflow:hidden;
          }
          .au-root .team-card:hover { background:var(--au-card); border-color:var(--au-border2); transform:translateY(-4px); }
          .au-root .team-card::before {
            content:''; position:absolute; top:0; left:0; right:0; height:2px;
            background:linear-gradient(90deg,var(--au-blue),var(--au-green2)); opacity:0; transition:opacity .3s;
          }
          .au-root .team-card:hover::before { opacity:1; }
          .au-root .team-av {
            width:72px; height:72px; border-radius:50%; margin:0 auto 16px;
            display:flex; align-items:center; justify-content:center;
            font-size:1.6rem; font-weight:800; color:#fff;
          }
          .au-root .team-name { font-size:1.05rem; font-weight:800; color:#fff; margin-bottom:4px; }
          .au-root .team-role { font-size:.82rem; color:var(--au-blue3); font-weight:600; margin-bottom:12px; }
          .au-root .team-desc { font-size:.83rem; color:var(--au-text2); line-height:1.65; }
          .au-root .team-since {
            margin-top:14px; padding:6px 14px; border-radius:8px;
            background:rgba(37,99,235,.08); border:1px solid rgba(37,99,235,.15);
            font-size:.72rem; color:var(--au-text2); display:inline-block;
          }
          /* STATS */
          .au-root .stats-band { padding:60px 0; border-top:1px solid var(--au-border); }
          .au-root .stats-row {
            display:grid; grid-template-columns:repeat(4,1fr);
            gap:1px; background:var(--au-border); border-radius:20px; overflow:hidden;
          }
          .au-root .sb-item { background:var(--au-dark2); padding:36px 28px; text-align:center; transition:background .2s; }
          .au-root .sb-item:hover { background:var(--au-card); }
          .au-root .sb-num {
            font-size:2.4rem; font-weight:800; letter-spacing:-1.5px;
            background:linear-gradient(135deg,#fff,var(--au-blue3));
            -webkit-background-clip:text; background-clip:text; color:transparent; line-height:1;
          }
          .au-root .sb-label { font-size:.82rem; color:var(--au-text2); margin-top:8px; font-weight:500; }
          /* TECH */
          .au-root .tech-section { padding:80px 0; border-top:1px solid var(--au-border); }
          .au-root .tech-section h2 { font-size:clamp(1.6rem,2.5vw,2.2rem); font-weight:800; letter-spacing:-1px; color:#fff; margin-bottom:1rem; }
          .au-root .tech-section h2 em { font-family:'Georgia',serif; font-style:italic; color:var(--au-blue3); }
          .au-root .tech-section p { font-size:.95rem; color:var(--au-text2); max-width:580px; line-height:1.75; margin-bottom:2.5rem; }
          .au-root .tech-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
          .au-root .tech-chip {
            background:var(--au-dark); border:1px solid var(--au-border); border-radius:14px; padding:18px 20px;
            display:flex; flex-direction:column; align-items:center; gap:8px; text-align:center; transition:all .25s;
          }
          .au-root .tech-chip:hover { background:var(--au-card); border-color:rgba(37,99,235,.3); transform:translateY(-3px); }
          .au-root .tc-icon { font-size:1.6rem; }
          .au-root .tc-name { font-size:.82rem; font-weight:700; color:var(--au-text); }
          .au-root .tc-desc { font-size:.72rem; color:var(--au-text3); }
          /* CTA */
          .au-root .cta-section { padding:80px 0 100px; text-align:center; position:relative; }
          .au-root .cta-bg {
            position:absolute; inset:0;
            background:radial-gradient(ellipse 60% 60% at 50% 50%,rgba(37,99,235,.12) 0%,transparent 70%); pointer-events:none;
          }
          .au-root .cta-inner { position:relative; z-index:1; }
          .au-root .cta-inner h2 { font-size:clamp(2rem,3.5vw,2.8rem); font-weight:800; letter-spacing:-1.5px; color:#fff; margin-bottom:1rem; }
          .au-root .cta-inner h2 em { font-family:'Georgia',serif; font-style:italic; color:var(--au-blue3); }
          .au-root .cta-inner p { font-size:.95rem; color:var(--au-text2); margin-bottom:2rem; }
          .au-root .cta-btns { display:flex; gap:14px; justify-content:center; flex-wrap:wrap; }
          .au-root .btn-cta {
            display:inline-flex; align-items:center; gap:10px; padding:14px 32px; border-radius:12px;
            background:var(--au-blue); color:#fff; font-size:.95rem; font-weight:700; text-decoration:none;
            transition:all .25s; box-shadow:0 0 32px var(--au-glow);
          }
          .au-root .btn-cta:hover { background:var(--au-blue2); transform:translateY(-2px); }
          .au-root .btn-ghost {
            display:inline-flex; align-items:center; gap:10px; padding:14px 28px; border-radius:12px;
            background:rgba(255,255,255,.05); border:1px solid var(--au-border2); color:var(--au-text);
            font-size:.95rem; font-weight:600; text-decoration:none; transition:all .25s;
          }
          .au-root .btn-ghost:hover { background:rgba(255,255,255,.09); transform:translateY(-2px); }
          /* SEC DIVIDER */
          .au-root .sec-divider { height:1px; background:linear-gradient(90deg,transparent,var(--au-border2),transparent); }
          /* FOOTER */
          .au-root footer { background:var(--au-dark); border-top:1px solid var(--au-border); padding:50px 5vw 28px; }
          .au-root .footer-inner {
            max-width:1100px; margin:0 auto;
            display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:20px;
          }
          .au-root .footer-logo { display:flex; align-items:center; gap:8px; font-size:1.1rem; font-weight:800; color:#fff; text-decoration:none; }
          .au-root .footer-links { display:flex; gap:2rem; flex-wrap:wrap; }
          .au-root .footer-links a { text-decoration:none; color:var(--au-text2); font-size:.85rem; transition:color .2s; }
          .au-root .footer-links a:hover { color:#fff; }
          .au-root .footer-copy {
            max-width:1100px; margin:24px auto 0; border-top:1px solid var(--au-border); padding-top:20px;
            font-size:.78rem; color:var(--au-text3); text-align:center;
          }
          @media(max-width:900px){
            .au-root .story-section { grid-template-columns:1fr; gap:3rem; }
            .au-root .problem-grid { grid-template-columns:1fr 1fr; }
            .au-root .values-grid { grid-template-columns:1fr; }
            .au-root .team-grid { grid-template-columns:1fr 1fr; }
            .au-root .stats-row { grid-template-columns:1fr 1fr; }
            .au-root .tech-grid { grid-template-columns:1fr 1fr; }
          }
          @media(max-width:640px){
            .au-root .nav-right .nav-link { display:none; }
            .au-root .problem-grid { grid-template-columns:1fr; }
            .au-root .team-grid { grid-template-columns:1fr; }
            .au-root .sol-step { grid-template-columns:60px 1fr; }
          }
        `}</style>
      </div>
    </>
  );
}
