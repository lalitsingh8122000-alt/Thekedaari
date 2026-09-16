(()=>{var e={};e.id=5606,e.ids=[5606],e.modules={72934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},27790:e=>{"use strict";e.exports=require("assert")},84770:e=>{"use strict";e.exports=require("crypto")},17702:e=>{"use strict";e.exports=require("events")},92048:e=>{"use strict";e.exports=require("fs")},32615:e=>{"use strict";e.exports=require("http")},32694:e=>{"use strict";e.exports=require("http2")},35240:e=>{"use strict";e.exports=require("https")},55315:e=>{"use strict";e.exports=require("path")},76162:e=>{"use strict";e.exports=require("stream")},17360:e=>{"use strict";e.exports=require("url")},21764:e=>{"use strict";e.exports=require("util")},71568:e=>{"use strict";e.exports=require("zlib")},89356:(e,t,r)=>{"use strict";r.r(t),r.d(t,{GlobalError:()=>o.a,__next_app__:()=>g,originalPathname:()=>p,pages:()=>d,routeModule:()=>h,tree:()=>c}),r(28514),r(26733),r(35866);var a=r(23191),s=r(88716),i=r(37922),o=r.n(i),n=r(95231),l={};for(let e in n)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(l[e]=()=>n[e]);r.d(t,l);let c=["",{children:["blogs",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(r.bind(r,28514)),"/Users/lalitsingh/Desktop/Construction/Thekedaari/frontend/src/app/blogs/page.js"]}]},{}]},{layout:[()=>Promise.resolve().then(r.bind(r,26733)),"/Users/lalitsingh/Desktop/Construction/Thekedaari/frontend/src/app/layout.js"],"not-found":[()=>Promise.resolve().then(r.t.bind(r,35866,23)),"next/dist/client/components/not-found-error"]}],d=["/Users/lalitsingh/Desktop/Construction/Thekedaari/frontend/src/app/blogs/page.js"],p="/blogs/page",g={require:r,loadChunk:()=>Promise.resolve()},h=new a.AppPageRouteModule({definition:{kind:s.x.APP_PAGE,page:"/blogs/page",pathname:"/blogs",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:c}})},10951:(e,t,r)=>{Promise.resolve().then(r.t.bind(r,79404,23))},50131:(e,t,r)=>{"use strict";e.exports=r(81616).vendored.contexts.RouterContext},670:(e,t,r)=>{"use strict";let{createProxy:a}=r(68570);e.exports=a("/Users/lalitsingh/Desktop/Construction/Thekedaari/frontend/node_modules/next/dist/client/link.js")},28514:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>p,generateMetadata:()=>c,revalidate:()=>l});var a=r(19510),s=r(670),i=r.n(s),o=r(1125),n=r(24288);r(86040);let l=3600;function c(){let e=(0,o.$)();return{title:"Construction & Contractor Tips — Blog | Thekedaari",description:"Read expert guides on worker attendance, site hisaab, contractor management, labour payment and construction project tracking. Thekedaari blog for contractors and thekedaars.",alternates:{canonical:`${e}/blogs`},robots:{index:!0,follow:!0},openGraph:{type:"website",url:`${e}/blogs`,title:"Construction & Contractor Tips — Blog | Thekedaari",description:"Expert guides on attendance, site hisaab, contractor management and labour payment for Indian contractors.",siteName:"Thekedaari",images:[{url:`${e}/thekedaari-logo.png`,width:512,height:512,alt:"Thekedaari"}]},twitter:{card:"summary_large_image",title:"Construction Blog | Thekedaari",description:"Tips and guides for contractors, thekedaars and site teams.",images:[`${e}/thekedaari-logo.png`]}}}function d({blog:e}){(0,o.$)();let t=e.createdAt?new Date(e.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}):"";return(0,a.jsxs)("article",{className:"blog-card",children:[e.image&&a.jsx("div",{className:"blog-card-img-wrap",children:a.jsx("img",{src:e.image,alt:e.title||"",className:"blog-card-img",loading:"lazy"})}),(0,a.jsxs)("div",{className:"blog-card-body",children:[t&&a.jsx("p",{className:"blog-card-date",children:t}),a.jsx("h2",{className:"blog-card-title",children:e.title||"Untitled"}),e.metaDescription&&a.jsx("p",{className:"blog-card-excerpt",children:e.metaDescription}),a.jsx(i(),{href:`/blogs/${e.slug}`,className:"blog-card-link",prefetch:!1,children:"Read more →"})]})]})}async function p(){let e=await (0,n.J)();return(0,a.jsxs)("div",{className:"seo-landing-page",children:[a.jsx("header",{className:"topbar",children:(0,a.jsxs)("div",{className:"container nav",children:[a.jsx("a",{className:"brand",href:"/",children:a.jsx("img",{src:"/thekedaari-logo.png",alt:"Thekedaari",width:40,height:40})}),(0,a.jsxs)("nav",{className:"nav-links",children:[a.jsx("a",{href:"/#features",children:"Features"}),a.jsx("a",{href:"/blogs","aria-current":"page",children:"Blog"}),a.jsx("a",{href:"/contact-us",children:"Contact"})]}),(0,a.jsxs)("div",{className:"nav-actions",children:[a.jsx("a",{className:"btn btn-outline",href:"/login",children:"Login"}),a.jsx("a",{className:"btn btn-primary",href:"/register",children:"Start Free →"})]})]})}),a.jsx("section",{className:"blogs-hero grid-overlay",children:(0,a.jsxs)("div",{className:"container",style:{paddingTop:"56px",paddingBottom:"40px",textAlign:"center"},children:[(0,a.jsxs)("div",{className:"eyebrow",style:{margin:"0 auto 18px"},children:[a.jsx("span",{className:"eyebrow-dot"}),"Construction Knowledge Base"]}),(0,a.jsxs)("h1",{className:"blogs-hero-h1",children:["Thekedaari ",a.jsx("span",{className:"accent",children:"Blog"})]}),a.jsx("p",{style:{color:"var(--seo-lp-muted)",maxWidth:600,margin:"0 auto",fontSize:"1.05rem",lineHeight:1.8},children:"Practical guides on worker attendance, hisaab kitab, contractor management and project finance for Indian contractors."})]})}),a.jsx("main",{className:"container blogs-grid-section",children:0===e.length?a.jsx("div",{className:"blogs-empty",children:a.jsx("p",{children:"No posts published yet. Check back soon!"})}):a.jsx("div",{className:"blogs-grid",children:e.map(e=>a.jsx(d,{blog:e},e.id))})}),a.jsx("footer",{className:"footer",style:{marginTop:"64px"},children:(0,a.jsxs)("div",{className:"container footer-wrap",children:[(0,a.jsxs)("div",{children:["\xa9 ",new Date().getFullYear()," Thekedaari. Construction management for Indian contractors."]}),(0,a.jsxs)("div",{className:"footer-links",children:[a.jsx("a",{href:"/",children:"Home"}),a.jsx("a",{href:"/blogs",children:"Blog"}),a.jsx("a",{href:"/thekedaar-software",children:"Thekedaar Software"}),a.jsx("a",{href:"/mazdoor-attendance-app",children:"Mazdoor App"}),a.jsx("a",{href:"/contact-us",children:"Contact"})]})]})}),a.jsx("style",{children:`
        .blogs-hero { position: relative; overflow: hidden; background: linear-gradient(180deg, #fff 0%, #f0f4f8 100%); }
        .blogs-grid-section { padding: 48px 0 32px; }
        .blogs-hero-h1 {
          font-size: clamp(1.6rem, 5vw, 3.4rem);
          font-weight: 900;
          letter-spacing: -0.04em;
          line-height: 1.05;
          margin: 0 0 16px;
        }
        .blogs-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .blog-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform .2s, box-shadow .2s;
        }
        .blog-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(37,99,235,.08);
          border-color: #bfdbfe;
        }
        .blog-card-img-wrap { width: 100%; aspect-ratio: 16/9; overflow: hidden; }
        .blog-card-img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .blog-card-body { padding: 20px; flex: 1; display: flex; flex-direction: column; gap: 8px; }
        .blog-card-date { font-size: .78rem; color: #2563eb; font-weight: 700; letter-spacing: .04em; }
        .blog-card-title {
          font-size: 1.12rem;
          font-weight: 800;
          line-height: 1.35;
          color: #0f172a;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .blog-card-excerpt {
          font-size: .9rem;
          color: #64748b;
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
          font-weight: 700;
          color: #2563eb;
          margin-top: 4px;
          transition: color .2s;
        }
        .blog-card-link:hover { color: #1d4ed8; }
        .blogs-empty {
          text-align: center;
          padding: 80px 0;
          color: #64748b;
          font-size: 1.1rem;
        }
        @media (max-width: 900px) {
          .blogs-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .blogs-hero-h1 { font-size: clamp(1.4rem, 6vw, 1.8rem); }
          .blog-card-title { font-size: 1rem; }
        }
        @media (max-width: 560px) {
          .blogs-grid { grid-template-columns: 1fr; gap: 16px; }
          .blogs-grid-section { padding: 24px 0; }
        }
      `})]})}},24288:(e,t,r)=>{"use strict";function a(){let e="https://thekedaar.com/api".trim();return e?e.replace(/\/$/,""):"http://localhost:5000/api"}async function s(){let e=await fetch(`${a()}/blogs`,{next:{revalidate:3600}});return e.ok?e.json():[]}async function i(e){let t=await fetch(`${a()}/blogs/${encodeURIComponent(e)}`,{next:{revalidate:3600}});return t.ok?t.json():null}r.d(t,{J:()=>s,c:()=>i})},86040:()=>{}};var t=require("../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),a=t.X(0,[8948,4491,9404,1024],()=>r(89356));module.exports=a})();