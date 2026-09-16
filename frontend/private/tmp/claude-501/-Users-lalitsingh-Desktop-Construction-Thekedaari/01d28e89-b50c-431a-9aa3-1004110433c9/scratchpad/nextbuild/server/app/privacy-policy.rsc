3:I[4707,[],""]
4:I[6423,[],""]
5:I[7136,["3301","static/chunks/3301-1c9e21dc67e7460c.js","3415","static/chunks/3415-7877d947d6f97596.js","3185","static/chunks/app/layout-d16e8a2ed482357e.js"],"default"]
2:T28aa,
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
        0:["YqSA-vqC6yZ4NbfI6AryH",[[["",{"children":["privacy-policy",{"children":["__PAGE__",{}]}]},"$undefined","$undefined",true],["",{"children":["privacy-policy",{"children":["__PAGE__",{},[["$L1",[["$","script",null,{"type":"application/ld+json","dangerouslySetInnerHTML":{"__html":"{\"@context\":\"https://schema.org\",\"@type\":\"WebPage\",\"name\":\"Privacy Policy — Thekedaari\",\"description\":\"Complete privacy policy of Thekedaari construction management app.\",\"url\":\"https://thekedaari.com/privacy-policy\",\"inLanguage\":[\"en\",\"hi\"],\"datePublished\":\"2026-03-27\",\"dateModified\":\"2026-03-27\",\"publisher\":{\"@type\":\"Organization\",\"name\":\"Thekedaari\",\"logo\":\"https://thekedaari.com/thekedaari-logo.png\",\"url\":\"https://thekedaari.com\",\"email\":\"LALITSINGH8122000@gmail.com\",\"contactPoint\":[{\"@type\":\"ContactPoint\",\"telephone\":\"+91-6377518112\",\"contactType\":\"customer support\"},{\"@type\":\"ContactPoint\",\"telephone\":\"+91-7378255250\",\"contactType\":\"customer support\"}]}}"}}],["$","div",null,{"className":"pp-root","children":[["$","nav",null,{"children":[["$","a",null,{"className":"nav-logo","href":"/","children":[["$","img",null,{"src":"/thekedaari-logo.png","alt":"Thekedaari Logo","style":{"width":34,"height":34,"borderRadius":9}}],"Thekedaari"]}],["$","div",null,{"className":"nav-right","children":[["$","a",null,{"href":"/about-us","className":"nav-link","children":"About Us"}],["$","a",null,{"href":"/register","className":"nav-cta","children":"Start Free →"}]]}]]}],["$","div",null,{"className":"page-hero","children":["$","div",null,{"className":"page-hero-inner","children":[["$","div",null,{"className":"page-tag","children":"Legal Document"}],["$","h1",null,{"children":["Privacy ",["$","em",null,{"children":"Policy"}]]}],["$","p",null,{"children":"Aapka data aapka hai. Thekedaari mein aap kya share karte ho, kaise use hota hai — sab kuch yahan clearly explain kiya gaya hai."}],["$","div",null,{"className":"page-meta","children":["📅 Last Updated:  ",["$","span",null,{"children":"27 March 2026"}],"  |  Effective Date:  ",["$","span",null,{"children":"27 March 2026"}]]}]]}]}],["$","div",null,{"className":"content-wrap","children":[["$","div",null,{"className":"toc-card reveal-box","children":[["$","h3",null,{"children":"📋 Table of Contents"}],["$","ul",null,{"className":"toc-list","children":[["$","li",null,{"children":["$","a",null,{"href":"#s1","children":"Information We Collect"}]}],["$","li",null,{"children":["$","a",null,{"href":"#s2","children":"How We Use Your Information"}]}],["$","li",null,{"children":["$","a",null,{"href":"#s3","children":"Data Storage & Security"}]}],["$","li",null,{"children":["$","a",null,{"href":"#s4","children":"Information Sharing & Third Parties"}]}],["$","li",null,{"children":["$","a",null,{"href":"#s5","children":"Your Rights & Control"}]}],["$","li",null,{"children":["$","a",null,{"href":"#s6","children":"Cookies & Local Storage"}]}],["$","li",null,{"children":["$","a",null,{"href":"#s7","children":"Children's Privacy"}]}],["$","li",null,{"children":["$","a",null,{"href":"#s8","children":"Changes to This Policy"}]}],["$","li",null,{"children":["$","a",null,{"href":"#s9","children":"Contact Us"}]}]]}]]}],["$","div",null,{"className":"highlight-box green","children":["$","p",null,{"children":[["$","strong",null,{"children":"Simple baat pehle:"}]," Thekedaari aapka personal data kabhi bechta nahi, kabhi third-party advertisers ko nahi deta, aur aapke workers ka data sirf aapko dikhta hai. Hum aapki privacy ko seriously lete hain."]}]}],["$","div",null,{"className":"pp-divider"}],["$","div",null,{"className":"pp-section","id":"s1","children":[["$","div",null,{"className":"pp-section-header","children":[["$","div",null,{"className":"pp-num","children":"01"}],["$","h2",null,{"children":"Information We Collect"}]]}],["$","p",null,{"children":"Thekedaari app use karte waqt hum kuch zaroori information collect karte hain taaki app sahi se kaam kare."}],["$","h3",null,{"children":"1.1 Account Information"}],["$","p",null,{"children":"Jab aap Thekedaari pe register karte ho, hum collect karte hain:"}],["$","ul",null,{"children":[["$","li",null,{"children":"Aapka naam (jaise \"Lalit Singh\")"}],["$","li",null,{"children":"Phone number (login aur account identification ke liye)"}],["$","li",null,{"children":"Account creation date"}],["$","li",null,{"children":"Profile photo (optional — aap upload na karo toh bhi chalta hai)"}]]}],["$","h3",null,{"children":"1.2 App Usage Data (Jo Aap Enter Karte Ho)"}],["$","ul",null,{"children":[["$","li",null,{"children":"Worker ke naam, phone numbers, aur daily rates"}],["$","li",null,{"children":"Attendance records (Present/Absent/Half Day)"}],["$","li",null,{"children":"Payment aur salary records"}],["$","li",null,{"children":"Project names, budgets, aur financial transactions"}],["$","li",null,{"children":"Worker ledger entries (salary, bonus, advance payments)"}]]}],["$","h3",null,{"children":"1.3 Technical Data (Automatically Collected)"}],["$","ul",null,{"children":[["$","li",null,{"children":"Device type aur operating system (Android/iOS)"}],["$","li",null,{"children":"Browser ya app version"}],["$","li",null,{"children":"App usage patterns — anonymously"}],["$","li",null,{"children":"Error logs (app crash hone pe fix karne ke liye)"}]]}],["$","div",null,{"className":"highlight-box amber","children":["$","p",null,{"children":[["$","strong",null,{"children":"Note:"}]," Hum aapki location, contacts, ya camera access kabhi bhi background mein nahi lete. Jo permission maange jaate hain, woh sirf specific features ke liye hote hain aur aapki consent se."]}]}]]}],["$","div",null,{"className":"pp-divider"}],["$","div",null,{"className":"pp-section","id":"s2","children":[["$","div",null,{"className":"pp-section-header","children":[["$","div",null,{"className":"pp-num","children":"02"}],["$","h2",null,{"children":"How We Use Your Information"}]]}],["$","p",null,{"children":"Hum aapka data sirf inhe kaadon ke liye use karte hain:"}],["$","h3",null,{"children":"2.1 App Functionality"}],["$","ul",null,{"children":[["$","li",null,{"children":"Aapka account create karna aur login karna"}],["$","li",null,{"children":"Workers, attendance, aur salary data store karna"}],["$","li",null,{"children":"Project finance aur ledger calculate karna"}],["$","li",null,{"children":"Dashboard pe summary dikhana (income, expense, P&L)"}]]}],["$","h3",null,{"children":"2.2 App Improvement"}],["$","ul",null,{"children":[["$","li",null,{"children":"Bugs fix karna aur performance improve karna"}],["$","li",null,{"children":"New features develop karna based on usage patterns"}],["$","li",null,{"children":"App stability monitor karna"}]]}],["$","h3",null,{"children":"2.3 Communication"}],["$","ul",null,{"children":[["$","li",null,{"children":"Important updates ya changes ke baare mein notify karna"}],["$","li",null,{"children":"Support requests ka jawab dena"}],["$","li",null,{"children":"Security-related alerts bhejna"}]]}],["$","div",null,{"className":"highlight-box green","children":["$","p",null,{"children":[["$","strong",null,{"children":"Hum kabhi nahi karte:"}]," Aapko spam bhejna, aapka data ads ke liye use karna, ya bina permission ke koi bhi marketing communication bhejna."]}]}]]}],["$","div",null,{"className":"pp-divider"}],["$","div",null,{"className":"pp-section","id":"s3","children":[["$","div",null,{"className":"pp-section-header","children":[["$","div",null,{"className":"pp-num","children":"03"}],["$","h2",null,{"children":"Data Storage & Security"}]]}],["$","p",null,{"children":"Aapka data secure rakhna hamari pehli zimmedari hai."}],["$","h3",null,{"children":"3.1 Where Is Data Stored"}],["$","p",null,{"children":"Thekedaari ka data India mein secure cloud servers par store hota hai. Hum industry-standard encryption use karte hain data store karte waqt (at rest) aur transfer karte waqt (in transit)."}],["$","h3",null,{"children":"3.2 Security Measures"}],["$","ul",null,{"children":[["$","li",null,{"children":"HTTPS encryption — saara data encrypted channel se travel karta hai"}],["$","li",null,{"children":"Password hashing — aapka password plain text mein kabhi store nahi hota"}],["$","li",null,{"children":"Regular security audits aur vulnerability checks"}],["$","li",null,{"children":"Access controls — sirf authorized team members ko production data access"}],["$","li",null,{"children":"Automatic backups — data loss se protection"}]]}],["$","h3",null,{"children":"3.3 Data Retention"}],["$","p",null,{"children":"Jab tak aapka account active hai, aapka data hum store karte hain. Account delete karne ke baad:"}],["$","ul",null,{"children":[["$","li",null,{"children":"Personal data 30 din ke andar permanently delete ho jaata hai"}],["$","li",null,{"children":"Anonymized usage statistics retain ki ja sakti hain"}],["$","li",null,{"children":"Legal requirements ki wajah se kuch records 90 days tak ho sakti hain"}]]}],["$","div",null,{"className":"highlight-box","children":["$","p",null,{"children":[["$","strong",null,{"children":"Important:"}]," Koi bhi security system 100% guarantee nahi de sakta. Agar aapko koi security issue dikhe, please turant ",["$","strong",null,{"children":"LALITSINGH8122000@gmail.com"}]," par report karein."]}]}]]}],["$","div",null,{"className":"pp-divider"}],["$","div",null,{"className":"pp-section","id":"s4","children":[["$","div",null,{"className":"pp-section-header","children":[["$","div",null,{"className":"pp-num","children":"04"}],["$","h2",null,{"children":"Information Sharing & Third Parties"}]]}],["$","div",null,{"className":"highlight-box green","style":{"marginBottom":24},"children":["$","p",null,{"children":[["$","strong",null,{"children":"Simple rule:"}]," Hum aapka data kabhi bhi sell nahi karte. Period."]}]}],["$","p",null,{"children":"Thekedaari kisi bhi third party ke saath aapka personal data share nahi karta, sirf in cases ko chhodkar:"}],["$","h3",null,{"children":"4.1 Service Providers"}],["$","ul",null,{"children":[["$","li",null,{"children":[["$","strong",null,{"children":"Cloud Hosting:"}]," Server infrastructure ke liye"]}],["$","li",null,{"children":[["$","strong",null,{"children":"Authentication Services:"}]," Secure login ke liye (phone OTP verification)"]}],["$","li",null,{"children":[["$","strong",null,{"children":"Error Monitoring:"}]," App crashes track karne ke liye (anonymized)"]}]]}],["$","h3",null,{"children":"4.2 Legal Requirements"}],["$","p",null,{"children":"Agar Indian law, court order, ya government authority require kare, tab hum legally bound hain data share karne ke liye."}],["$","h3",null,{"children":"4.3 Business Transfer"}],["$","p",null,{"children":"Agar Thekedaari kabhi merge ya acquire ho, aapka data transfer ho sakta hai. Lekin hum aapko pehle notify karenge aur aapko data delete karne ka option milega."}]]}],["$","div",null,{"className":"pp-divider"}],["$","div",null,{"className":"pp-section","id":"s5","children":[["$","div",null,{"className":"pp-section-header","children":[["$","div",null,{"className":"pp-num","children":"05"}],["$","h2",null,{"children":"Your Rights & Control"}]]}],["$","p",null,{"children":"Thekedaari mein aap apna data control karte ho. Aapke paas yeh rights hain:"}],["$","h3",null,{"children":"5.1 Access"}],["$","p",null,{"children":"Aap kabhi bhi app ke andar apna poora data dekh sakte ho."}],["$","h3",null,{"children":"5.2 Correction"}],["$","p",null,{"children":"Galat information ko aap khud edit kar sakte ho app ke andar."}],["$","h3",null,{"children":"5.3 Deletion"}],["$","p",null,{"children":"Aap apna account aur saara data delete kar sakte ho. Account settings se ya LALITSINGH8122000@gmail.com pe email karke. Delete request ke 30 din ke andar saara data permanently remove ho jaata hai."}],["$","h3",null,{"children":"5.4 Data Export"}],["$","p",null,{"children":"Aap apna data export karna chahte ho toh hum provide karte hain. Support se contact karo aur hum aapka full data (CSV format mein) de denge."}],["$","h3",null,{"children":"5.5 Opt-Out"}],["$","p",null,{"children":"Non-essential communications se opt-out karne ke liye settings ya support se contact karo."}]]}],["$","div",null,{"className":"pp-divider"}],["$","div",null,{"className":"pp-section","id":"s6","children":[["$","div",null,{"className":"pp-section-header","children":[["$","div",null,{"className":"pp-num","children":"06"}],["$","h2",null,{"children":"Cookies & Local Storage"}]]}],["$","p",null,{"children":"Thekedaari ek PWA (Progressive Web App) hai. Hum use karte hain:"}],["$","h3",null,{"children":"6.1 Essential Cookies / Local Storage"}],["$","ul",null,{"children":[["$","li",null,{"children":[["$","strong",null,{"children":"Session tokens:"}]," Aapko logged in rakhne ke liye"]}],["$","li",null,{"children":[["$","strong",null,{"children":"App preferences:"}]," Language setting (Hindi/English), dark mode"]}],["$","li",null,{"children":[["$","strong",null,{"children":"Offline data cache:"}]," App offline kaam kar sake isliye"]}]]}],["$","h3",null,{"children":"6.2 Analytics (Anonymous)"}],["$","ul",null,{"children":[["$","li",null,{"children":"Hum anonymized usage data collect karte hain app improve karne ke liye"}],["$","li",null,{"children":"Yeh data aapko personally identify nahi karta"}],["$","li",null,{"children":"Koi third-party advertising cookies use nahi karte hain"}]]}],["$","div",null,{"className":"highlight-box","children":["$","p",null,{"children":[["$","strong",null,{"children":"Browser settings:"}]," Aap browser mein cookies clear kar sakte ho, lekin isse app ki functionality affect ho sakti hai (logout ho sakte ho)."]}]}]]}],["$","div",null,{"className":"pp-divider"}],["$","div",null,{"className":"pp-section","id":"s7","children":[["$","div",null,{"className":"pp-section-header","children":[["$","div",null,{"className":"pp-num","children":"07"}],["$","h2",null,{"children":"Children's Privacy"}]]}],["$","p",null,{"children":"Thekedaari specifically professional contractors aur site managers ke liye bana hai. Yeh app 18 saal se kam umar ke bachon ke liye nahi hai."}],["$","p",null,{"children":"Hum jaanbujhkar 18 saal se kam umar ke logon ka data collect nahi karte. Agar aapko lagta hai kisi minor ka data galti se collect hua hai, please humse turant contact karein."}]]}],["$","div",null,{"className":"pp-divider"}],["$","div",null,{"className":"pp-section","id":"s8","children":[["$","div",null,{"className":"pp-section-header","children":[["$","div",null,{"className":"pp-num","children":"08"}],["$","h2",null,{"children":"Changes to This Policy"}]]}],["$","p",null,{"children":"Hum is Privacy Policy ko update kar sakte hain jab:"}],["$","ul",null,{"children":[["$","li",null,{"children":"Naye features add hon jo data collection affect karein"}],["$","li",null,{"children":"Laws ya regulations change hon"}],["$","li",null,{"children":"Hamare practices change hon"}]]}],["$","p",null,{"children":"Koi bhi significant changes hone par hum aapko app notification ya email se inform karenge."}]]}],["$","div",null,{"className":"pp-divider"}],["$","div",null,{"className":"pp-section","id":"s9","children":[["$","div",null,{"className":"pp-section-header","children":[["$","div",null,{"className":"pp-num","children":"09"}],["$","h2",null,{"children":"Contact Us"}]]}],["$","p",null,{"children":"Koi bhi privacy-related sawaal, concern, ya request ke liye hum se contact karein:"}]]}],["$","div",null,{"className":"contact-card","children":[["$","h3",null,{"children":"Privacy ke baare mein koi sawaal hai?"}],["$","p",null,{"children":"Hum 24–48 ghante ke andar jawab dete hain. Aapki privacy hamari zimmedari hai."}],["$","div",null,{"className":"contact-row","children":[["$","a",null,{"href":"mailto:LALITSINGH8122000@gmail.com","className":"contact-chip","children":[["$","span",null,{"className":"ch-ico","children":"✉️"}]," LALITSINGH8122000@gmail.com"]}],["$","a",null,{"href":"tel:+916377518112","className":"contact-chip","children":[["$","span",null,{"className":"ch-ico","children":"📞"}]," +91 6377518112"]}],["$","a",null,{"href":"tel:+917378255250","className":"contact-chip","children":[["$","span",null,{"className":"ch-ico","children":"📞"}]," +91 7378255250"]}],["$","a",null,{"href":"https://thekedaari.com","className":"contact-chip","children":[["$","span",null,{"className":"ch-ico","children":"🌐"}]," thekedaari.com"]}]]}],["$","p",null,{"style":{"marginTop":20,"fontSize":"0.82rem","color":"var(--pp-text3)"},"children":["Registered Address: Thekedaari, India",["$","br",null,{}],"Governing Law: Laws of India (Information Technology Act, 2000 aur amendments)"]}]]}]]}],["$","footer",null,{"children":[["$","div",null,{"className":"footer-inner","children":[["$","a",null,{"className":"footer-logo","href":"/","children":[["$","img",null,{"src":"/thekedaari-logo.png","alt":"Thekedaari Logo","style":{"width":30,"height":30,"borderRadius":8}}],"Thekedaari"]}],["$","div",null,{"className":"footer-links","children":[["$","a",null,{"href":"/","children":"Home"}],["$","a",null,{"href":"/about-us","children":"About Us"}],["$","a",null,{"href":"/blogs","children":"Blog"}],["$","a",null,{"href":"/privacy-policy","style":{"color":"var(--pp-blue3)"},"children":"Privacy Policy"}],["$","a",null,{"href":"/register","children":"Register"}]]}]]}],["$","div",null,{"className":"footer-copy","children":["© ",2026," Thekedaari. All rights reserved. | Made with ❤️ for Indian Contractors 🇮🇳"]}]]}],["$","style",null,{"children":"$2"}]]}]],null],null],null]},[null,["$","$L3",null,{"parallelRouterKey":"children","segmentPath":["children","privacy-policy","children"],"error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","notFoundStyles":"$undefined"}]],null]},[[[["$","link","0",{"rel":"stylesheet","href":"/_next/static/css/117bda18fb1588f4.css","precedence":"next","crossOrigin":"$undefined"}]],["$","html",null,{"lang":"en","children":[["$","head",null,{"children":[["$","meta",null,{"name":"mobile-web-app-capable","content":"yes"}],["$","meta",null,{"name":"apple-mobile-web-app-capable","content":"yes"}],["$","meta",null,{"name":"apple-mobile-web-app-status-bar-style","content":"default"}],["$","link",null,{"rel":"apple-touch-icon","href":"/apple-touch-icon.png"}]]}],["$","body",null,{"className":"min-h-screen bg-gray-50","children":["$","$L5",null,{"children":["$","$L3",null,{"parallelRouterKey":"children","segmentPath":["children"],"error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[["$","title",null,{"children":"404: This page could not be found."}],["$","div",null,{"style":{"fontFamily":"system-ui,\"Segoe UI\",Roboto,Helvetica,Arial,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\"","height":"100vh","textAlign":"center","display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center"},"children":["$","div",null,{"children":[["$","style",null,{"dangerouslySetInnerHTML":{"__html":"body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}"}}],["$","h1",null,{"className":"next-error-h1","style":{"display":"inline-block","margin":"0 20px 0 0","padding":"0 23px 0 0","fontSize":24,"fontWeight":500,"verticalAlign":"top","lineHeight":"49px"},"children":"404"}],["$","div",null,{"style":{"display":"inline-block"},"children":["$","h2",null,{"style":{"fontSize":14,"fontWeight":400,"lineHeight":"49px","margin":0},"children":"This page could not be found."}]}]]}]}]],"notFoundStyles":[]}]}]}]]}]],null],null],["$L6",null]]]]
6:[["$","meta","0",{"name":"viewport","content":"width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, user-scalable=no"}],["$","meta","1",{"name":"theme-color","content":"#2563eb"}],["$","meta","2",{"charSet":"utf-8"}],["$","title","3",{"children":"Privacy Policy — Thekedaari | Aapka Data Surakshit Hai"}],["$","meta","4",{"name":"description","content":"Thekedaari Privacy Policy — jaano aapka data kaise collect, store aur protect hota hai. Hum aapka data kabhi nahi bechte. Indian contractors ke liye secure aur trusted construction management app."}],["$","meta","5",{"name":"application-name","content":"Thekedaari"}],["$","link","6",{"rel":"manifest","href":"/manifest.json","crossOrigin":"use-credentials"}],["$","meta","7",{"name":"robots","content":"index, follow"}],["$","meta","8",{"name":"googlebot","content":"index, follow, max-image-preview:large, max-snippet:-1"}],["$","link","9",{"rel":"canonical","href":"https://thekedaari.com/privacy-policy"}],["$","meta","10",{"name":"apple-mobile-web-app-capable","content":"yes"}],["$","meta","11",{"name":"apple-mobile-web-app-title","content":"Thekedaari"}],["$","meta","12",{"name":"apple-mobile-web-app-status-bar-style","content":"default"}],["$","meta","13",{"property":"og:title","content":"Privacy Policy — Thekedaari | Aapka Data Surakshit Hai"}],["$","meta","14",{"property":"og:description","content":"Thekedaari aapka data kabhi nahi bechta. Jaano aapka information kaise safe rehta hai."}],["$","meta","15",{"property":"og:url","content":"https://thekedaari.com/privacy-policy"}],["$","meta","16",{"property":"og:site_name","content":"Thekedaari"}],["$","meta","17",{"property":"og:locale","content":"en_IN"}],["$","meta","18",{"property":"og:image","content":"https://thekedaari.com/thekedaari-logo.png"}],["$","meta","19",{"property":"og:image:width","content":"512"}],["$","meta","20",{"property":"og:image:height","content":"512"}],["$","meta","21",{"property":"og:image:alt","content":"Thekedaari"}],["$","meta","22",{"property":"og:type","content":"website"}],["$","meta","23",{"name":"twitter:card","content":"summary"}],["$","meta","24",{"name":"twitter:title","content":"Privacy Policy — Thekedaari"}],["$","meta","25",{"name":"twitter:description","content":"Aapka data aapka hai. Thekedaari mein aapki privacy fully protected hai."}],["$","meta","26",{"name":"twitter:image","content":"https://thekedaari.com/thekedaari-logo.png"}],["$","link","27",{"rel":"icon","href":"/icon-192x192.png","sizes":"192x192","type":"image/png"}],["$","link","28",{"rel":"icon","href":"/icon-512x512.png","sizes":"512x512","type":"image/png"}],["$","link","29",{"rel":"apple-touch-icon","href":"/apple-touch-icon.png","sizes":"180x180","type":"image/png"}]]
1:null
