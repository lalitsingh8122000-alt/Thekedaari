3:I[4707,[],""]
4:I[6423,[],""]
5:I[7136,["3301","static/chunks/3301-1c9e21dc67e7460c.js","3415","static/chunks/3415-7877d947d6f97596.js","3185","static/chunks/app/layout-d16e8a2ed482357e.js"],"default"]
2:T20ae,
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
      0:["YqSA-vqC6yZ4NbfI6AryH",[[["",{"children":["delete-account",{"children":["__PAGE__",{}]}]},"$undefined","$undefined",true],["",{"children":["delete-account",{"children":["__PAGE__",{},[["$L1",["$","div",null,{"className":"pp-root","children":[["$","nav",null,{"children":[["$","a",null,{"className":"nav-logo","href":"/","children":[["$","img",null,{"src":"/thekedaari-logo.png","alt":"Thekedaari Logo","style":{"width":34,"height":34,"borderRadius":9}}],"Thekedaari"]}],["$","div",null,{"className":"nav-right","children":[["$","a",null,{"href":"/privacy-policy","className":"nav-link","children":"Privacy Policy"}],["$","a",null,{"href":"/register","className":"nav-cta","children":"Start Free →"}]]}]]}],["$","div",null,{"className":"page-hero","children":["$","div",null,{"className":"page-hero-inner","children":[["$","div",null,{"className":"page-tag","children":"Account Management"}],["$","h1",null,{"children":["Delete Your ",["$","em",null,{"children":"Account"}]]}],["$","p",null,{"children":"If you want to delete your account and all associated data, please follow the steps below."}]]}]}],["$","div",null,{"className":"content-wrap","children":[["$","div",null,{"className":"pp-section","children":[["$","div",null,{"className":"pp-section-header","children":[["$","div",null,{"className":"pp-num","children":"01"}],["$","h2",null,{"children":"How to Request Account Deletion"}]]}],["$","p",null,{"children":"To delete your Thekedaari account and all associated data, follow these simple steps:"}],["$","ul",null,{"children":[["$","li",null,{"children":["Email us at: ",["$","a",null,{"href":"mailto:lalitsingh8122000@gmail.com","style":{"color":"#60A5FA","textDecoration":"none","fontWeight":600},"children":"lalitsingh8122000@gmail.com"}]]}],["$","li",null,{"children":"Send your registered mobile number or email address in the email"}],["$","li",null,{"children":["We will process your request and delete your account within ",["$","strong",null,{"style":{"color":"#F1F5F9"},"children":"3–5 working days"}]]}]]}],["$","div",null,{"className":"highlight-box green","children":["$","p",null,{"children":[["$","strong",null,{"children":"Tip:"}]," Use the same email or phone number you registered with so we can quickly locate your account."]}]}]]}],["$","div",null,{"className":"pp-divider"}],["$","div",null,{"className":"pp-section","children":[["$","div",null,{"className":"pp-section-header","children":[["$","div",null,{"className":"pp-num","children":"02"}],["$","h2",null,{"children":"Data That Will Be Deleted"}]]}],["$","p",null,{"children":"Once your account deletion request is processed, the following data will be permanently removed:"}],["$","ul",null,{"children":[["$","li",null,{"children":[["$","strong",null,{"style":{"color":"#F1F5F9"},"children":"Profile information"}]," — your name, phone number, email, and profile photo"]}],["$","li",null,{"children":[["$","strong",null,{"style":{"color":"#F1F5F9"},"children":"Labour data"}]," — all worker records, attendance, and salary information"]}],["$","li",null,{"children":[["$","strong",null,{"style":{"color":"#F1F5F9"},"children":"Expense records"}]," — all project transactions, payments, and financial data"]}]]}]]}],["$","div",null,{"className":"pp-divider"}],["$","div",null,{"className":"pp-section","children":[["$","div",null,{"className":"pp-section-header","children":[["$","div",null,{"className":"pp-num","children":"03"}],["$","h2",null,{"children":"Data Retention Notice"}]]}],["$","p",null,{"children":"Some data may be retained for legal and regulatory purposes as required by applicable laws. This may include:"}],["$","ul",null,{"children":[["$","li",null,{"children":"Transaction records required for tax or accounting compliance"}],["$","li",null,{"children":"Data required to comply with legal obligations or court orders"}],["$","li",null,{"children":"Anonymized usage statistics that cannot identify you personally"}]]}],["$","div",null,{"className":"highlight-box amber","children":["$","p",null,{"children":[["$","strong",null,{"children":"Please note:"}]," Once deleted, your data cannot be recovered. Make sure to export any data you need before requesting deletion."]}]}]]}],["$","div",null,{"className":"pp-divider"}],["$","div",null,{"className":"contact-card","children":[["$","h3",null,{"children":"Need Help?"}],["$","p",null,{"children":"If you have any questions about the account deletion process, reach out to us."}],["$","div",null,{"className":"contact-row","children":["$","a",null,{"href":"mailto:lalitsingh8122000@gmail.com","className":"contact-chip","children":[["$","span",null,{"className":"ch-ico","children":"✉️"}]," lalitsingh8122000@gmail.com"]}]}]]}]]}],["$","footer",null,{"children":[["$","div",null,{"className":"footer-inner","children":[["$","a",null,{"className":"footer-logo","href":"/","children":[["$","img",null,{"src":"/thekedaari-logo.png","alt":"Thekedaari Logo","style":{"width":30,"height":30,"borderRadius":8}}],"Thekedaari"]}],["$","div",null,{"className":"footer-links","children":[["$","a",null,{"href":"/","children":"Home"}],["$","a",null,{"href":"/about-us","children":"About Us"}],["$","a",null,{"href":"/privacy-policy","children":"Privacy Policy"}],["$","a",null,{"href":"/delete-account","style":{"color":"var(--pp-blue3)"},"children":"Delete Account"}]]}]]}],["$","div",null,{"className":"footer-copy","children":["© ",2026," Thekedaari. All rights reserved. | Made with ❤️ for Indian Contractors 🇮🇳"]}]]}],["$","style",null,{"children":"$2"}]]}],null],null],null]},[null,["$","$L3",null,{"parallelRouterKey":"children","segmentPath":["children","delete-account","children"],"error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","notFoundStyles":"$undefined"}]],null]},[[[["$","link","0",{"rel":"stylesheet","href":"/_next/static/css/117bda18fb1588f4.css","precedence":"next","crossOrigin":"$undefined"}]],["$","html",null,{"lang":"en","children":[["$","head",null,{"children":[["$","meta",null,{"name":"mobile-web-app-capable","content":"yes"}],["$","meta",null,{"name":"apple-mobile-web-app-capable","content":"yes"}],["$","meta",null,{"name":"apple-mobile-web-app-status-bar-style","content":"default"}],["$","link",null,{"rel":"apple-touch-icon","href":"/apple-touch-icon.png"}]]}],["$","body",null,{"className":"min-h-screen bg-gray-50","children":["$","$L5",null,{"children":["$","$L3",null,{"parallelRouterKey":"children","segmentPath":["children"],"error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[["$","title",null,{"children":"404: This page could not be found."}],["$","div",null,{"style":{"fontFamily":"system-ui,\"Segoe UI\",Roboto,Helvetica,Arial,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\"","height":"100vh","textAlign":"center","display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center"},"children":["$","div",null,{"children":[["$","style",null,{"dangerouslySetInnerHTML":{"__html":"body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}"}}],["$","h1",null,{"className":"next-error-h1","style":{"display":"inline-block","margin":"0 20px 0 0","padding":"0 23px 0 0","fontSize":24,"fontWeight":500,"verticalAlign":"top","lineHeight":"49px"},"children":"404"}],["$","div",null,{"style":{"display":"inline-block"},"children":["$","h2",null,{"style":{"fontSize":14,"fontWeight":400,"lineHeight":"49px","margin":0},"children":"This page could not be found."}]}]]}]}]],"notFoundStyles":[]}]}]}]]}]],null],null],["$L6",null]]]]
6:[["$","meta","0",{"name":"viewport","content":"width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, user-scalable=no"}],["$","meta","1",{"name":"theme-color","content":"#2563eb"}],["$","meta","2",{"charSet":"utf-8"}],["$","title","3",{"children":"Delete Your Account — Thekedaari"}],["$","meta","4",{"name":"description","content":"Request deletion of your Thekedaari account and all associated data. We process account deletion requests within 3-5 working days."}],["$","meta","5",{"name":"application-name","content":"Thekedaari"}],["$","link","6",{"rel":"manifest","href":"/manifest.json","crossOrigin":"use-credentials"}],["$","meta","7",{"name":"robots","content":"index, follow"}],["$","meta","8",{"name":"googlebot","content":"index, follow, max-snippet:-1"}],["$","link","9",{"rel":"canonical","href":"https://thekedaari.com/delete-account"}],["$","meta","10",{"name":"apple-mobile-web-app-capable","content":"yes"}],["$","meta","11",{"name":"apple-mobile-web-app-title","content":"Thekedaari"}],["$","meta","12",{"name":"apple-mobile-web-app-status-bar-style","content":"default"}],["$","meta","13",{"property":"og:title","content":"Delete Your Account — Thekedaari"}],["$","meta","14",{"property":"og:description","content":"Request deletion of your Thekedaari account and all associated data."}],["$","meta","15",{"property":"og:url","content":"https://thekedaari.com/delete-account"}],["$","meta","16",{"property":"og:site_name","content":"Thekedaari"}],["$","meta","17",{"property":"og:locale","content":"en_IN"}],["$","meta","18",{"property":"og:image","content":"https://thekedaari.com/thekedaari-logo.png"}],["$","meta","19",{"property":"og:image:width","content":"512"}],["$","meta","20",{"property":"og:image:height","content":"512"}],["$","meta","21",{"property":"og:image:alt","content":"Thekedaari"}],["$","meta","22",{"property":"og:type","content":"website"}],["$","meta","23",{"name":"twitter:card","content":"summary_large_image"}],["$","meta","24",{"name":"twitter:title","content":"Delete Your Account — Thekedaari"}],["$","meta","25",{"name":"twitter:description","content":"Request deletion of your Thekedaari account and all associated data."}],["$","meta","26",{"name":"twitter:image","content":"https://thekedaari.com/thekedaari-logo.png"}],["$","meta","27",{"name":"twitter:image:width","content":"512"}],["$","meta","28",{"name":"twitter:image:height","content":"512"}],["$","meta","29",{"name":"twitter:image:alt","content":"Thekedaari"}],["$","link","30",{"rel":"icon","href":"/icon-192x192.png","sizes":"192x192","type":"image/png"}],["$","link","31",{"rel":"icon","href":"/icon-512x512.png","sizes":"512x512","type":"image/png"}],["$","link","32",{"rel":"apple-touch-icon","href":"/apple-touch-icon.png","sizes":"180x180","type":"image/png"}]]
1:null
