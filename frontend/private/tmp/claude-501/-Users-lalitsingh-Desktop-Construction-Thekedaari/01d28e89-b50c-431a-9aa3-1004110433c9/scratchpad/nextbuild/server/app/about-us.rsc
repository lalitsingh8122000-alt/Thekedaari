3:I[4707,[],""]
4:I[6423,[],""]
5:I[7136,["3301","static/chunks/3301-1c9e21dc67e7460c.js","3415","static/chunks/3415-7877d947d6f97596.js","3185","static/chunks/app/layout-d16e8a2ed482357e.js"],"default"]
2:T45f9,
          .au-root {
            --au-blue:   #2563EB;
            --au-blue2:  #3B82F6;
            --au-blue3:  #1d4ed8;
            --au-green:  #059669;
            --au-green2: #10B981;
            --au-amber:  #D97706;
            --au-red:    #DC2626;
            --au-text:   #0f172a;
            --au-text2:  #64748b;
            --au-text3:  #94a3b8;
            --au-bg:     #f8fafc;
            --au-card:   #ffffff;
            --au-border: #e2e8f0;
            --au-border2:#cbd5e1;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--au-bg);
            color: var(--au-text);
            -webkit-font-smoothing: antialiased;
            min-height: 100vh;
          }
          .au-root *, .au-root *::before, .au-root *::after { box-sizing: border-box; margin: 0; padding: 0; }
          /* NAV */
          .au-root nav {
            position:fixed; top:0; left:0; right:0; z-index:999;
            height:64px; display:flex; align-items:center; justify-content:space-between;
            padding:0 5vw; background:rgba(255,255,255,.95); backdrop-filter:blur(12px);
            border-bottom:1px solid var(--au-border);
          }
          .au-root .nav-logo { display:flex; align-items:center; gap:10px; font-size:1.2rem; font-weight:700; color:var(--au-text); text-decoration:none; }
          .au-root .nav-right { display:flex; gap:12px; }
          .au-root .nav-link {
            padding:8px 18px; border-radius:8px; color:var(--au-text2); text-decoration:none;
            font-size:.87rem; font-weight:500; border:1px solid var(--au-border); transition:all .2s;
          }
          .au-root .nav-link:hover { color:var(--au-blue); border-color:var(--au-blue); }
          .au-root .nav-cta {
            padding:8px 20px; border-radius:8px; background:var(--au-blue); color:#fff;
            text-decoration:none; font-size:.87rem; font-weight:600;
            transition:all .2s;
          }
          .au-root .nav-cta:hover { background:var(--au-blue3); }
          /* HERO */
          .au-root .page-hero {
            padding:120px 5vw 60px;
            background:linear-gradient(180deg,#ffffff 0%,#f0f4f8 100%);
            text-align:center; position:relative; overflow:hidden;
          }
          .au-root .page-hero-inner { position:relative; z-index:1; }
          .au-root .page-tag {
            display:inline-flex; align-items:center; gap:6px; padding:6px 14px; border-radius:100px;
            background:#eff6ff; border:1px solid #bfdbfe;
            font-size:.75rem; font-weight:700; letter-spacing:1px; color:var(--au-blue);
            text-transform:uppercase; margin-bottom:1.2rem;
          }
          .au-root .page-hero h1 {
            font-size:clamp(2.2rem,4.5vw,3.5rem); font-weight:800; letter-spacing:-1px;
            color:var(--au-text); margin-bottom:1rem; line-height:1.15;
          }
          .au-root .page-hero h1 em { font-style:italic; font-weight:400; color:var(--au-blue); }
          .au-root .page-hero p { font-size:1.05rem; color:var(--au-text2); max-width:580px; margin:0 auto; line-height:1.75; }
          /* MAIN */
          .au-root .main-wrap { max-width:1100px; margin:0 auto; padding:0 5vw; }
          /* STORY */
          .au-root .story-section {
            padding:80px 0 60px; display:grid; grid-template-columns:1fr 1fr; gap:5rem; align-items:center;
          }
          .au-root .story-tag {
            display:inline-block; padding:4px 12px; border-radius:100px;
            background:#eff6ff; border:1px solid #bfdbfe;
            font-size:.72rem; font-weight:700; letter-spacing:1px; color:var(--au-blue);
            text-transform:uppercase; margin-bottom:1rem;
          }
          .au-root .story-section h2 {
            font-size:clamp(1.8rem,3vw,2.6rem); font-weight:800; letter-spacing:-.5px;
            color:var(--au-text); margin-bottom:1.2rem; line-height:1.2;
          }
          .au-root .story-section h2 em { font-style:italic; font-weight:400; color:var(--au-green2); }
          .au-root .story-section p { font-size:.95rem; color:var(--au-text2); line-height:1.8; margin-bottom:18px; }
          .au-root .quote-card {
            background:var(--au-card); border:1px solid var(--au-border); border-radius:20px;
            padding:32px; position:relative; overflow:hidden;
            box-shadow:0 4px 16px rgba(0,0,0,.04);
          }
          .au-root .quote-card::before {
            content:''; position:absolute; top:0; left:0; right:0; height:3px;
            background:linear-gradient(90deg,var(--au-blue),var(--au-green2));
          }
          .au-root .quote-mark { font-size:5rem; color:rgba(37,99,235,.12); line-height:.8; margin-bottom:12px; }
          .au-root .quote-text { font-size:1rem; color:var(--au-text2); line-height:1.75; font-style:italic; margin-bottom:20px; }
          .au-root .quote-author { display:flex; align-items:center; gap:12px; }
          .au-root .q-av {
            width:44px; height:44px; border-radius:50%;
            background:linear-gradient(135deg,var(--au-blue),var(--au-green));
            display:flex; align-items:center; justify-content:center;
            font-weight:800; font-size:1rem; color:#fff;
          }
          .au-root .q-name { font-weight:700; color:var(--au-text); font-size:.95rem; }
          .au-root .q-role { font-size:.78rem; color:var(--au-text2); margin-top:2px; }
          /* PROBLEM */
          .au-root .problem-section { padding:80px 0; border-top:1px solid var(--au-border); }
          .au-root .sec-title { font-size:clamp(1.8rem,3vw,2.5rem); font-weight:800; letter-spacing:-.5px; color:var(--au-text); margin-bottom:1rem; }
          .au-root .sec-title em { font-style:italic; color:var(--au-red); }
          .au-root .sec-sub { font-size:.95rem; color:var(--au-text2); max-width:600px; line-height:1.75; margin-bottom:3rem; }
          .au-root .problem-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
          .au-root .prob-card {
            background:var(--au-card); border:1px solid var(--au-border); border-radius:16px; padding:24px; transition:all .2s;
          }
          .au-root .prob-card:hover { border-color:#bfdbfe; box-shadow:0 8px 24px rgba(37,99,235,.06); transform:translateY(-2px); }
          .au-root .prob-icon { font-size:1.8rem; margin-bottom:14px; }
          .au-root .prob-card h3 { font-size:.95rem; font-weight:700; color:var(--au-text); margin-bottom:8px; }
          .au-root .prob-card p { font-size:.85rem; color:var(--au-text2); line-height:1.65; }
          /* SOLUTION */
          .au-root .solution-section { padding:80px 0; border-top:1px solid var(--au-border); }
          .au-root .solution-header { text-align:center; margin-bottom:4rem; }
          .au-root .solution-header h2 { font-size:clamp(1.8rem,3vw,2.5rem); font-weight:800; letter-spacing:-.5px; color:var(--au-text); margin-bottom:1rem; }
          .au-root .solution-header h2 em { font-style:italic; color:var(--au-green2); }
          .au-root .solution-header p { font-size:.95rem; color:var(--au-text2); max-width:560px; margin:0 auto; line-height:1.75; }
          .au-root .solution-steps { display:flex; flex-direction:column; }
          .au-root .sol-step { display:grid; grid-template-columns:80px 1fr; align-items:stretch; }
          .au-root .sol-left { display:flex; flex-direction:column; align-items:center; }
          .au-root .sol-num {
            width:56px; height:56px; border-radius:50%;
            background:#eff6ff; border:2px solid #bfdbfe;
            display:flex; align-items:center; justify-content:center;
            font-size:1rem; font-weight:800; color:var(--au-blue); flex-shrink:0; z-index:1;
          }
          .au-root .sol-line {
            width:2px; flex:1; min-height:40px;
            background:linear-gradient(180deg,#bfdbfe 0%,transparent 100%);
            margin:4px 0;
          }
          .au-root .sol-step:last-child .sol-line { display:none; }
          .au-root .sol-content { padding:0 0 48px 28px; }
          .au-root .sol-content h3 { font-size:1.05rem; font-weight:700; color:var(--au-text); margin-bottom:8px; }
          .au-root .sol-content p { font-size:.88rem; color:var(--au-text2); line-height:1.7; }
          .au-root .sol-badge {
            display:inline-block; margin-top:10px; padding:4px 12px; border-radius:100px;
            background:#eff6ff; border:1px solid #bfdbfe;
            font-size:.72rem; color:var(--au-blue); font-weight:600;
          }
          /* VALUES */
          .au-root .values-section { padding:80px 0; border-top:1px solid var(--au-border); }
          .au-root .values-header { margin-bottom:3rem; }
          .au-root .values-header h2 { font-size:clamp(1.8rem,3vw,2.5rem); font-weight:800; letter-spacing:-.5px; color:var(--au-text); margin-bottom:1rem; }
          .au-root .values-header h2 em { font-style:italic; color:var(--au-amber); }
          .au-root .values-header p { font-size:.95rem; color:var(--au-text2); max-width:560px; line-height:1.75; }
          .au-root .values-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:20px; }
          .au-root .val-card {
            background:var(--au-card); border:1px solid var(--au-border); border-radius:16px; padding:28px;
            transition:all .2s; position:relative; overflow:hidden;
          }
          .au-root .val-card:hover { border-color:#bfdbfe; box-shadow:0 8px 24px rgba(37,99,235,.06); transform:translateY(-2px); }
          .au-root .val-card::after {
            content:''; position:absolute; top:0; left:0; bottom:0; width:3px; border-radius:3px 0 0 3px;
          }
          .au-root .val-card.v1::after { background:var(--au-blue); }
          .au-root .val-card.v2::after { background:var(--au-green2); }
          .au-root .val-card.v3::after { background:var(--au-amber); }
          .au-root .val-card.v4::after { background:var(--au-red); }
          .au-root .val-icon { font-size:1.8rem; margin-bottom:14px; }
          .au-root .val-card h3 { font-size:1rem; font-weight:700; color:var(--au-text); margin-bottom:8px; }
          .au-root .val-card p { font-size:.87rem; color:var(--au-text2); line-height:1.65; }
          /* TEAM */
          .au-root .team-section { padding:80px 0; border-top:1px solid var(--au-border); }
          .au-root .team-header { margin-bottom:3rem; }
          .au-root .team-header h2 { font-size:clamp(1.8rem,3vw,2.5rem); font-weight:800; letter-spacing:-.5px; color:var(--au-text); margin-bottom:1rem; }
          .au-root .team-header h2 em { font-style:italic; color:var(--au-blue); }
          .au-root .team-header p { font-size:.95rem; color:var(--au-text2); max-width:560px; line-height:1.75; }
          .au-root .team-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
          .au-root .team-card {
            background:var(--au-card); border:1px solid var(--au-border); border-radius:16px; padding:28px;
            text-align:center; transition:all .2s; position:relative; overflow:hidden;
          }
          .au-root .team-card:hover { border-color:#bfdbfe; box-shadow:0 8px 24px rgba(37,99,235,.06); transform:translateY(-2px); }
          .au-root .team-card::before {
            content:''; position:absolute; top:0; left:0; right:0; height:3px;
            background:linear-gradient(90deg,var(--au-blue),var(--au-green2)); opacity:0; transition:opacity .3s;
          }
          .au-root .team-card:hover::before { opacity:1; }
          .au-root .team-av {
            width:72px; height:72px; border-radius:50%; margin:0 auto 16px;
            display:flex; align-items:center; justify-content:center;
            font-size:1.6rem; font-weight:800; color:#fff;
          }
          .au-root .team-name { font-size:1.05rem; font-weight:800; color:var(--au-text); margin-bottom:4px; }
          .au-root .team-role { font-size:.82rem; color:var(--au-blue); font-weight:600; margin-bottom:12px; }
          .au-root .team-desc { font-size:.83rem; color:var(--au-text2); line-height:1.65; }
          .au-root .team-since {
            margin-top:14px; padding:6px 14px; border-radius:8px;
            background:#eff6ff; border:1px solid #bfdbfe;
            font-size:.72rem; color:var(--au-text2); display:inline-block;
          }
          /* STATS */
          .au-root .stats-band { padding:60px 0; border-top:1px solid var(--au-border); }
          .au-root .stats-row {
            display:grid; grid-template-columns:repeat(4,1fr);
            gap:1px; background:var(--au-border); border-radius:16px; overflow:hidden;
          }
          .au-root .sb-item { background:var(--au-card); padding:36px 28px; text-align:center; transition:background .2s; }
          .au-root .sb-item:hover { background:#f0f4f8; }
          .au-root .sb-num {
            font-size:2.4rem; font-weight:800; letter-spacing:-1.5px;
            color:var(--au-blue); line-height:1;
          }
          .au-root .sb-label { font-size:.82rem; color:var(--au-text2); margin-top:8px; font-weight:500; }
          /* TECH */
          .au-root .tech-section { padding:80px 0; border-top:1px solid var(--au-border); }
          .au-root .tech-section h2 { font-size:clamp(1.6rem,2.5vw,2.2rem); font-weight:800; letter-spacing:-.5px; color:var(--au-text); margin-bottom:1rem; }
          .au-root .tech-section h2 em { font-style:italic; color:var(--au-blue); }
          .au-root .tech-section p { font-size:.95rem; color:var(--au-text2); max-width:580px; line-height:1.75; margin-bottom:2.5rem; }
          .au-root .tech-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
          .au-root .tech-chip {
            background:var(--au-card); border:1px solid var(--au-border); border-radius:14px; padding:18px 20px;
            display:flex; flex-direction:column; align-items:center; gap:8px; text-align:center; transition:all .2s;
          }
          .au-root .tech-chip:hover { border-color:#bfdbfe; box-shadow:0 4px 12px rgba(37,99,235,.06); transform:translateY(-2px); }
          .au-root .tc-icon { font-size:1.6rem; }
          .au-root .tc-name { font-size:.82rem; font-weight:700; color:var(--au-text); }
          .au-root .tc-desc { font-size:.72rem; color:var(--au-text3); }
          /* CTA */
          .au-root .cta-section { padding:80px 0 100px; text-align:center; position:relative; }
          .au-root .cta-bg {
            position:absolute; inset:0;
            background:linear-gradient(135deg,#2563eb,#1d4ed8); border-radius:24px; pointer-events:none;
          }
          .au-root .cta-inner { position:relative; z-index:1; background:linear-gradient(135deg,#2563eb,#1d4ed8); border-radius:24px; padding:60px 40px; }
          .au-root .cta-inner h2 { font-size:clamp(2rem,3.5vw,2.8rem); font-weight:800; letter-spacing:-.5px; color:#fff; margin-bottom:1rem; }
          .au-root .cta-inner h2 em { font-style:italic; color:#bfdbfe; }
          .au-root .cta-inner p { font-size:.95rem; color:rgba(255,255,255,.85); margin-bottom:2rem; }
          .au-root .cta-btns { display:flex; gap:14px; justify-content:center; flex-wrap:wrap; }
          .au-root .btn-cta {
            display:inline-flex; align-items:center; gap:10px; padding:14px 32px; border-radius:12px;
            background:#fff; color:var(--au-blue); font-size:.95rem; font-weight:700; text-decoration:none;
            transition:all .2s; box-shadow:0 4px 14px rgba(0,0,0,.1);
          }
          .au-root .btn-cta:hover { background:#f8fafc; transform:translateY(-2px); }
          .au-root .btn-ghost {
            display:inline-flex; align-items:center; gap:10px; padding:14px 28px; border-radius:12px;
            background:rgba(255,255,255,.15); border:1px solid rgba(255,255,255,.3); color:#fff;
            font-size:.95rem; font-weight:600; text-decoration:none; transition:all .2s;
          }
          .au-root .btn-ghost:hover { background:rgba(255,255,255,.25); transform:translateY(-2px); }
          /* SEC DIVIDER */
          .au-root .sec-divider { height:1px; background:var(--au-border); }
          /* FOOTER */
          .au-root footer { background:var(--au-card); border-top:1px solid var(--au-border); padding:50px 5vw 28px; }
          .au-root .footer-inner {
            max-width:1100px; margin:0 auto;
            display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:20px;
          }
          .au-root .footer-logo { display:flex; align-items:center; gap:8px; font-size:1.1rem; font-weight:700; color:var(--au-text); text-decoration:none; }
          .au-root .footer-links { display:flex; gap:2rem; flex-wrap:wrap; }
          .au-root .footer-links a { text-decoration:none; color:var(--au-text2); font-size:.85rem; transition:color .2s; }
          .au-root .footer-links a:hover { color:var(--au-blue); }
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
        0:["YqSA-vqC6yZ4NbfI6AryH",[[["",{"children":["about-us",{"children":["__PAGE__",{}]}]},"$undefined","$undefined",true],["",{"children":["about-us",{"children":["__PAGE__",{},[["$L1",[["$","script",null,{"type":"application/ld+json","dangerouslySetInnerHTML":{"__html":"{\"@context\":\"https://schema.org\",\"@type\":\"Organization\",\"name\":\"Thekedaari\",\"alternateName\":\"ठेकेदारी\",\"url\":\"https://thekedaari.com\",\"logo\":\"https://thekedaari.com/thekedaari-logo.png\",\"description\":\"India's #1 free construction workforce and project management app for contractors.\",\"foundingDate\":\"2026-03-27\",\"founder\":{\"@type\":\"Person\",\"name\":\"Lalit Singh\"},\"contactPoint\":[{\"@type\":\"ContactPoint\",\"telephone\":\"+91-6377518112\",\"contactType\":\"customer support\",\"availableLanguage\":[\"Hindi\",\"English\"]},{\"@type\":\"ContactPoint\",\"telephone\":\"+91-7378255250\",\"contactType\":\"customer support\",\"availableLanguage\":[\"Hindi\",\"English\"]}],\"email\":\"LALITSINGH8122000@gmail.com\",\"areaServed\":\"IN\",\"knowsLanguage\":[\"Hindi\",\"English\"]}"}}],["$","script",null,{"type":"application/ld+json","dangerouslySetInnerHTML":{"__html":"{\"@context\":\"https://schema.org\",\"@type\":\"AboutPage\",\"name\":\"About Thekedaari\",\"description\":\"Thekedaari ek Indian startup hai jo real construction sites ki problems ko samajhkar banaya gaya hai.\",\"url\":\"https://thekedaari.com/about-us\",\"mainEntity\":{\"@type\":\"SoftwareApplication\",\"name\":\"Thekedaari\",\"applicationCategory\":\"BusinessApplication\",\"operatingSystem\":\"Android, iOS, Web\",\"offers\":{\"@type\":\"Offer\",\"price\":\"0\",\"priceCurrency\":\"INR\"},\"aggregateRating\":{\"@type\":\"AggregateRating\",\"ratingValue\":\"4.8\",\"ratingCount\":\"500\"}}}"}}],["$","div",null,{"className":"au-root","children":[["$","nav",null,{"children":[["$","a",null,{"className":"nav-logo","href":"/","children":[["$","img",null,{"src":"/thekedaari-logo.png","alt":"Thekedaari Logo","style":{"width":34,"height":34,"borderRadius":9}}],"Thekedaari"]}],["$","div",null,{"className":"nav-right","children":[["$","a",null,{"href":"/privacy-policy","className":"nav-link","children":"Privacy Policy"}],["$","a",null,{"href":"/register","className":"nav-cta","children":"Start Free →"}]]}]]}],["$","div",null,{"className":"page-hero","children":["$","div",null,{"className":"page-hero-inner","children":[["$","div",null,{"className":"page-tag","children":"Our Story"}],["$","h1",null,{"children":["Building for the",["$","br",null,{}],["$","em",null,{"children":"Builders of India"}]]}],["$","p",null,{"children":"Thekedaari ek Indian startup hai jo real construction sites ki problems ko samajhkar banaya gaya hai. Hum contractors ke liye, contractors ke saath mila kar kaam karte hain."}]]}]}],["$","div",null,{"className":"main-wrap","children":[["$","div",null,{"className":"story-section","children":[["$","div",null,{"children":[["$","div",null,{"className":"story-tag","children":"The Beginning"}],["$","h2",null,{"children":["Ek Simple ",["$","em",null,{"children":"Problem"}]," se Shuru Hua Safar"]}],["$","p",null,{"children":"Bharat mein lakho contractors roze ek hi problem face karte hain — workers ka hisaab copy register mein, salary ka calculation galat, aur project ka budget kabhi clear nahi."}],["$","p",null,{"children":"Thekedaari ka idea usi frustration se aaya. Jab ek construction site pe 15–20 workers ka attendance manual register mein likhna padta tha, aur fir salary calculate karna padta tha — tab ek tech solution ki zaroorat mehsoos hui."}],["$","p",null,{"children":["2026 mein, ek simple PWA ke roop mein Thekedaari launch hua. Mission tha: ",["$","strong",null,{"style":{"color":"#0f172a"},"children":"Har Indian contractor ke haath mein ek smart tool de do."}]]}]]}],["$","div",null,{"children":["$","div",null,{"className":"quote-card","children":[["$","div",null,{"className":"quote-mark","children":"“"}],["$","p",null,{"className":"quote-text","children":"Jab maine pehli baar 20 workers ki attendance ek minute mein mark ki aur salary automatically calculate hoti dekhi — tab samjha ki technology kitni powerful ho sakti hai simple logon ke liye."}],["$","div",null,{"className":"quote-author","children":[["$","div",null,{"className":"q-av","children":"L"}],["$","div",null,{"children":[["$","div",null,{"className":"q-name","children":"Lalit Singh"}],["$","div",null,{"className":"q-role","children":"Founder & First User, Thekedaari"}]]}]]}]]}]}]]}],["$","div",null,{"className":"sec-divider"}],["$","div",null,{"className":"problem-section","children":[["$","div",null,{"children":[["$","div",null,{"className":"story-tag","children":"The Problem"}],["$","h2",null,{"className":"sec-title","children":["Indian Contractors ki ",["$","em",null,{"children":"Asli Takleefen"}]]}],["$","p",null,{"className":"sec-sub","children":"Hum ne 100+ contractors se baat ki. Yeh woh problems hain jo har koi face karta tha — roz, bina kisi solution ke."}]]}],["$","div",null,{"className":"problem-grid","children":[["$","div","Paper Register",{"className":"prob-card","children":[["$","div",null,{"className":"prob-icon","children":"📔"}],["$","h3",null,{"children":"Paper Register"}],["$","p",null,{"children":"Attendance aur salary sab copy-register mein. Ek baarish mein data khatam. Galati ka scope zyada."}]]}],["$","div","Manual Calculation",{"className":"prob-card","children":[["$","div",null,{"className":"prob-icon","children":"🧮"}],["$","h3",null,{"children":"Manual Calculation"}],["$","p",null,{"children":"Har mahine salary manually calculate karo. Ek galti aur worker naraaz. Time waste, energy waste."}]]}],["$","div","Paise Ka Hisaab Nahi",{"className":"prob-card","children":[["$","div",null,{"className":"prob-icon","children":"💸"}],["$","h3",null,{"children":"Paise Ka Hisaab Nahi"}],["$","p",null,{"children":"Project mein kitna aaya, kitna gaya — koi clarity nahi. Profit hua ya loss, pata nahi chalta."}]]}],["$","div","Worker Payment Confusion",{"className":"prob-card","children":[["$","div",null,{"className":"prob-icon","children":"👷"}],["$","h3",null,{"children":"Worker Payment Confusion"}],["$","p",null,{"children":"Kisne advance liya, kisne nahi — yad rakhna mushkil. Disputes aam baat ban jaati hai site pe."}]]}],["$","div","Multiple Projects Manage Karna",{"className":"prob-card","children":[["$","div",null,{"className":"prob-icon","children":"🗂️"}],["$","h3",null,{"children":"Multiple Projects Manage Karna"}],["$","p",null,{"children":"Ek se zyada sites ho toh data alag alag jagah bikhra rehta hai. Overview milna impossible."}]]}],["$","div","Technology Ka Darr",{"className":"prob-card","children":[["$","div",null,{"className":"prob-icon","children":"📱"}],["$","h3",null,{"children":"Technology Ka Darr"}],["$","p",null,{"children":"Bahut saare apps itne complex hain ki site pe kaam karne wale contractors use hi nahi kar paate."}]]}]]}]]}],["$","div",null,{"className":"sec-divider"}],["$","div",null,{"className":"solution-section","children":[["$","div",null,{"className":"solution-header","children":[["$","div",null,{"className":"story-tag","children":"Our Solution"}],["$","h2",null,{"children":["Thekedaari ka ",["$","em",null,{"children":"Jawab"}]]}],["$","p",null,{"children":"Complex nahi, simple. Expensive nahi, free. Thekedaari ne in sab problems ka ek systematic solution banaya hai."}]]}],["$","div",null,{"className":"solution-steps","children":[["$","div","1",{"className":"sol-step","children":[["$","div",null,{"className":"sol-left","children":[["$","div",null,{"className":"sol-num","children":"1"}],["$","div",null,{"className":"sol-line"}]]}],["$","div",null,{"className":"sol-content","children":[["$","h3",null,{"children":"Digital Attendance — Paper Ki Zaroorat Khatam"}],["$","p",null,{"children":"Har subah ek screen pe aao, sabka attendance mark karo — Present, Absent, Half Day ya Other. Salary automatically calculate hoti hai. No calculator needed, no errors."}],["$","span",null,{"className":"sol-badge","children":"📅 Daily Attendance"}]]}]]}],["$","div","2",{"className":"sol-step","children":[["$","div",null,{"className":"sol-left","children":[["$","div",null,{"className":"sol-num","children":"2"}],["$","div",null,{"className":"sol-line"}]]}],["$","div",null,{"className":"sol-content","children":[["$","h3",null,{"children":"Worker Ledger — Har Rupee Ka Hisaab"}],["$","p",null,{"children":"Har worker ka apna ledger — OWED salary, PAID amount, advance, bonus. Running total dikhta rehta hai. Koi confusion nahi, koi dispute nahi."}],["$","span",null,{"className":"sol-badge","children":"📒 Worker Ledger"}]]}]]}],["$","div","3",{"className":"sol-step","children":[["$","div",null,{"className":"sol-left","children":[["$","div",null,{"className":"sol-num","children":"3"}],["$","div",null,{"className":"sol-line"}]]}],["$","div",null,{"className":"sol-content","children":[["$","h3",null,{"children":"Project Finance — Profit/Loss Ek Nazar Mein"}],["$","p",null,{"children":"Project banao, income aur expense track karo, aur real-time dekho ki aap profit mein ho ya loss mein. Top projects ka summary dashboard pe milta hai."}],["$","span",null,{"className":"sol-badge","children":"🏗️ Project Finance"}]]}]]}],["$","div","4",{"className":"sol-step","children":[["$","div",null,{"className":"sol-left","children":[["$","div",null,{"className":"sol-num","children":"4"}],["$","div",null,{"className":"sol-line"}]]}],["$","div",null,{"className":"sol-content","children":[["$","h3",null,{"children":"PWA — Install Karo Bina App Store Ke"}],["$","p",null,{"children":"Thekedaari ek Progressive Web App hai. Browser se seedha install karo kisi bhi phone pe — Android ya iPhone. Works offline bhi. Simple."}],["$","span",null,{"className":"sol-badge","children":"📱 PWA Technology"}]]}]]}]]}]]}],["$","div",null,{"className":"sec-divider"}],["$","div",null,{"className":"values-section","children":[["$","div",null,{"className":"values-header","children":[["$","div",null,{"className":"story-tag","children":"Our Values"}],["$","h2",null,{"children":["Jo Cheezein Hame ",["$","em",null,{"children":"Drive"}]," Karti Hain"]}],["$","p",null,{"children":"Thekedaari sirf ek app nahi hai — yeh ek commitment hai Indian contractors ke saath."}]]}],["$","div",null,{"className":"values-grid","children":[["$","div","Simplicity First",{"className":"val-card v1","children":[["$","div",null,{"className":"val-icon","children":"🎯"}],["$","h3",null,{"children":"Simplicity First"}],["$","p",null,{"children":"Thekedaari itna simple hona chahiye ki jo contractor kabhi smartphone nahi use karta tha, woh bhi 5 minute mein use kar le."}]]}],["$","div","Built for Bharat",{"className":"val-card v2","children":[["$","div",null,{"className":"val-icon","children":"🌱"}],["$","h3",null,{"children":"Built for Bharat"}],["$","p",null,{"children":"Hindi support, offline mode, low-data design — sab kuch Indian sites ki reality ko dhyan mein rakh ke banaya gaya hai."}]]}],["$","div","Privacy is Sacred",{"className":"val-card v3","children":[["$","div",null,{"className":"val-icon","children":"🔒"}],["$","h3",null,{"children":"Privacy is Sacred"}],["$","p",null,{"children":"Aapka business data sirf aapka hai. Hum data kabhi nahi bechte, kabhi advertisers ko nahi dete."}]]}],["$","div","Contractor-First",{"className":"val-card v4","children":[["$","div",null,{"className":"val-icon","children":"❤️"}],["$","h3",null,{"children":"Contractor-First"}],["$","p",null,{"children":"Har feature, har update mein ek hi sawaal — \"Kya yeh contractor ke liye easier hoga?\" Contractor ki zindagi asaan karna hi hamara mission hai."}]]}]]}]]}],["$","div",null,{"className":"sec-divider"}],["$","div",null,{"className":"team-section","children":[["$","div",null,{"className":"team-header","children":[["$","div",null,{"className":"story-tag","children":"The Team"}],["$","h2",null,{"children":["Jo Log Thekedaari ",["$","em",null,{"children":"Banate Hain"}]]}],["$","p",null,{"children":"Hum ek passionate team hain jo genuinely Indian construction industry ki help karna chahti hai technology ke through."}]]}],["$","div",null,{"className":"team-grid","children":[["$","div",null,{"className":"team-card","children":[["$","div",null,{"className":"team-av","style":{"background":"linear-gradient(135deg,#2563EB,#1D4ED8)"},"children":"L"}],["$","div",null,{"className":"team-name","children":"Lalit Singh"}],["$","div",null,{"className":"team-role","children":"Founder & CEO"}],["$","p",null,{"className":"team-desc","children":"Construction industry ki problems ko firsthand dekha aur Thekedaari ka idea liya. Product vision aur contractor relationships handle karte hain."}],["$","div",null,{"className":"team-since","children":"📅 Member since: 27/3/2026"}]]}],["$","div",null,{"className":"team-card","children":[["$","div",null,{"className":"team-av","style":{"background":"linear-gradient(135deg,#059669,#047857)"},"children":"T"}],["$","div",null,{"className":"team-name","children":"Tech Team"}],["$","div",null,{"className":"team-role","children":"Development & Engineering"}],["$","p",null,{"className":"team-desc","children":"PWA technology, real-time data sync, offline support — sabkuch build karte hain. Performance aur reliability hamare standards hain."}],["$","div",null,{"className":"team-since","children":"🛠️ Building since: 2026"}]]}],["$","div",null,{"className":"team-card","children":[["$","div",null,{"className":"team-av","style":{"background":"linear-gradient(135deg,#D97706,#B45309)"},"children":"S"}],["$","div",null,{"className":"team-name","children":"Support Team"}],["$","div",null,{"className":"team-role","children":"Customer Success"}],["$","p",null,{"className":"team-desc","children":"Aapke sawalon ka jawab 24–48 ghante mein. Har contractor ki problem hum personally solve karte hain. Aap akele nahi hain."}],["$","div",null,{"className":"team-since","children":"📞 Always available"}]]}]]}]]}],["$","div",null,{"className":"sec-divider"}],["$","div",null,{"className":"stats-band","children":["$","div",null,{"className":"stats-row","children":[["$","div","Active Contractors",{"className":"sb-item","children":[["$","div",null,{"className":"sb-num","children":"500+"}],["$","div",null,{"className":"sb-label","children":"Active Contractors"}]]}],["$","div","Workers Managed",{"className":"sb-item","children":[["$","div",null,{"className":"sb-num","children":"10K+"}],["$","div",null,{"className":"sb-label","children":"Workers Managed"}]]}],["$","div","Salaries Tracked",{"className":"sb-item","children":[["$","div",null,{"className":"sb-num","children":"₹2Cr+"}],["$","div",null,{"className":"sb-label","children":"Salaries Tracked"}]]}],["$","div","Founded",{"className":"sb-item","children":[["$","div",null,{"className":"sb-num","children":"Mar'26"}],["$","div",null,{"className":"sb-label","children":"Founded"}]]}]]}]}],["$","div",null,{"className":"sec-divider"}],["$","div",null,{"className":"tech-section","children":[["$","div",null,{"children":[["$","div",null,{"className":"story-tag","children":"Technology"}],["$","h2",null,{"children":["Kaise Bana hai ",["$","em",null,{"children":"Thekedaari"}]]}],["$","p",null,{"children":"Hum modern web technologies use karte hain jo fast, reliable, aur Indian internet conditions ke liye optimized hain."}]]}],["$","div",null,{"className":"tech-grid","children":[["$","div","PWA",{"className":"tech-chip","children":[["$","div",null,{"className":"tc-icon","children":"📱"}],["$","div",null,{"className":"tc-name","children":"PWA"}],["$","div",null,{"className":"tc-desc","children":"Progressive Web App — no app store needed"}]]}],["$","div","Offline First",{"className":"tech-chip","children":[["$","div",null,{"className":"tc-icon","children":"⚡"}],["$","div",null,{"className":"tc-name","children":"Offline First"}],["$","div",null,{"className":"tc-desc","children":"Kaam karta hai bina internet ke bhi"}]]}],["$","div","HTTPS Encrypted",{"className":"tech-chip","children":[["$","div",null,{"className":"tc-icon","children":"🔒"}],["$","div",null,{"className":"tc-name","children":"HTTPS Encrypted"}],["$","div",null,{"className":"tc-desc","children":"Saara data encrypted channel se"}]]}],["$","div","Cloud Backend",{"className":"tech-chip","children":[["$","div",null,{"className":"tc-icon","children":"☁️"}],["$","div",null,{"className":"tc-name","children":"Cloud Backend"}],["$","div",null,{"className":"tc-desc","children":"India mein secure servers pe hosted"}]]}],["$","div","Hindi Support",{"className":"tech-chip","children":[["$","div",null,{"className":"tc-icon","children":"🇮🇳"}],["$","div",null,{"className":"tc-name","children":"Hindi Support"}],["$","div",null,{"className":"tc-desc","children":"Full Hindi & English localization"}]]}],["$","div","Real-time Sync",{"className":"tech-chip","children":[["$","div",null,{"className":"tc-icon","children":"📊"}],["$","div",null,{"className":"tc-name","children":"Real-time Sync"}],["$","div",null,{"className":"tc-desc","children":"Data turant update hota hai"}]]}],["$","div","Auto Backup",{"className":"tech-chip","children":[["$","div",null,{"className":"tc-icon","children":"🔄"}],["$","div",null,{"className":"tc-name","children":"Auto Backup"}],["$","div",null,{"className":"tc-desc","children":"Data kabhi nahi khoega"}]]}],["$","div","Any Device",{"className":"tech-chip","children":[["$","div",null,{"className":"tc-icon","children":"📲"}],["$","div",null,{"className":"tc-name","children":"Any Device"}],["$","div",null,{"className":"tc-desc","children":"Android, iPhone, sabpe kaam karta hai"}]]}]]}]]}],["$","div",null,{"className":"sec-divider"}],["$","div",null,{"className":"cta-section","children":[["$","div",null,{"className":"cta-bg"}],["$","div",null,{"className":"cta-inner","children":[["$","h2",null,{"children":["Hamare ",["$","em",null,{"children":"Mission"}]," Ka Hissa Bano"]}],["$","p",null,{"children":"Thekedaari ab 500+ contractors ka bharosa hai. Aap bhi apni site ko smart banao — bilkul free mein."}],["$","div",null,{"className":"cta-btns","children":[["$","a",null,{"href":"/register","className":"btn-cta","children":"🚀 Register Free — Abhi"}],["$","a",null,{"href":"/privacy-policy","className":"btn-ghost","children":"Privacy Policy Padho →"}]]}]]}]]}]]}],["$","footer",null,{"children":[["$","div",null,{"className":"footer-inner","children":[["$","a",null,{"className":"footer-logo","href":"/","children":[["$","img",null,{"src":"/thekedaari-logo.png","alt":"Thekedaari Logo","style":{"width":30,"height":30,"borderRadius":8}}],"Thekedaari"]}],["$","div",null,{"className":"footer-links","children":[["$","a",null,{"href":"/","children":"Home"}],["$","a",null,{"href":"/about-us","style":{"color":"var(--au-blue)"},"children":"About Us"}],["$","a",null,{"href":"/blogs","children":"Blog"}],["$","a",null,{"href":"/privacy-policy","children":"Privacy Policy"}],["$","a",null,{"href":"/register","children":"Register"}]]}]]}],["$","div",null,{"className":"footer-copy","children":["© ",2026," Thekedaari. All rights reserved. | Made with ❤️ for Indian Contractors 🇮🇳"]}]]}],["$","style",null,{"children":"$2"}]]}]],null],null],null]},[null,["$","$L3",null,{"parallelRouterKey":"children","segmentPath":["children","about-us","children"],"error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","notFoundStyles":"$undefined"}]],null]},[[[["$","link","0",{"rel":"stylesheet","href":"/_next/static/css/117bda18fb1588f4.css","precedence":"next","crossOrigin":"$undefined"}]],["$","html",null,{"lang":"en","children":[["$","head",null,{"children":[["$","meta",null,{"name":"mobile-web-app-capable","content":"yes"}],["$","meta",null,{"name":"apple-mobile-web-app-capable","content":"yes"}],["$","meta",null,{"name":"apple-mobile-web-app-status-bar-style","content":"default"}],["$","link",null,{"rel":"apple-touch-icon","href":"/apple-touch-icon.png"}]]}],["$","body",null,{"className":"min-h-screen bg-gray-50","children":["$","$L5",null,{"children":["$","$L3",null,{"parallelRouterKey":"children","segmentPath":["children"],"error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[["$","title",null,{"children":"404: This page could not be found."}],["$","div",null,{"style":{"fontFamily":"system-ui,\"Segoe UI\",Roboto,Helvetica,Arial,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\"","height":"100vh","textAlign":"center","display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center"},"children":["$","div",null,{"children":[["$","style",null,{"dangerouslySetInnerHTML":{"__html":"body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}"}}],["$","h1",null,{"className":"next-error-h1","style":{"display":"inline-block","margin":"0 20px 0 0","padding":"0 23px 0 0","fontSize":24,"fontWeight":500,"verticalAlign":"top","lineHeight":"49px"},"children":"404"}],["$","div",null,{"style":{"display":"inline-block"},"children":["$","h2",null,{"style":{"fontSize":14,"fontWeight":400,"lineHeight":"49px","margin":0},"children":"This page could not be found."}]}]]}]}]],"notFoundStyles":[]}]}]}]]}]],null],null],["$L6",null]]]]
6:[["$","meta","0",{"name":"viewport","content":"width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, user-scalable=no"}],["$","meta","1",{"name":"theme-color","content":"#2563eb"}],["$","meta","2",{"charSet":"utf-8"}],["$","title","3",{"children":"About Us — Thekedaari | India's #1 Free Construction Workforce Management App"}],["$","meta","4",{"name":"description","content":"Thekedaari ek free construction management app hai Indian contractors ke liye. Worker attendance, salary calculation, project finance tracking — sab ek jagah. 500+ contractors ka bharosa. Abhi register karo!"}],["$","meta","5",{"name":"application-name","content":"Thekedaari"}],["$","link","6",{"rel":"manifest","href":"/manifest.json","crossOrigin":"use-credentials"}],["$","meta","7",{"name":"robots","content":"index, follow"}],["$","meta","8",{"name":"googlebot","content":"index, follow, max-image-preview:large, max-snippet:-1"}],["$","link","9",{"rel":"canonical","href":"https://thekedaari.com/about-us"}],["$","meta","10",{"name":"apple-mobile-web-app-capable","content":"yes"}],["$","meta","11",{"name":"apple-mobile-web-app-title","content":"Thekedaari"}],["$","meta","12",{"name":"apple-mobile-web-app-status-bar-style","content":"default"}],["$","meta","13",{"property":"og:title","content":"About Us — Thekedaari | Free Construction Management App for Indian Contractors"}],["$","meta","14",{"property":"og:description","content":"Jaano Thekedaari ki kahani — kaise ek simple idea se India ka sabse powerful free construction management app bana."}],["$","meta","15",{"property":"og:url","content":"https://thekedaari.com/about-us"}],["$","meta","16",{"property":"og:site_name","content":"Thekedaari"}],["$","meta","17",{"property":"og:locale","content":"en_IN"}],["$","meta","18",{"property":"og:image","content":"https://thekedaari.com/thekedaari-logo.png"}],["$","meta","19",{"property":"og:image:width","content":"512"}],["$","meta","20",{"property":"og:image:height","content":"512"}],["$","meta","21",{"property":"og:image:alt","content":"Thekedaari"}],["$","meta","22",{"property":"og:type","content":"website"}],["$","meta","23",{"name":"twitter:card","content":"summary_large_image"}],["$","meta","24",{"name":"twitter:title","content":"About Us — Thekedaari | Free Construction App India"}],["$","meta","25",{"name":"twitter:description","content":"India ka #1 free construction management app. Worker attendance, salary, project finance — sab digital."}],["$","meta","26",{"name":"twitter:image","content":"https://thekedaari.com/thekedaari-logo.png"}],["$","link","27",{"rel":"icon","href":"/icon-192x192.png","sizes":"192x192","type":"image/png"}],["$","link","28",{"rel":"icon","href":"/icon-512x512.png","sizes":"512x512","type":"image/png"}],["$","link","29",{"rel":"apple-touch-icon","href":"/apple-touch-icon.png","sizes":"180x180","type":"image/png"}]]
1:null
