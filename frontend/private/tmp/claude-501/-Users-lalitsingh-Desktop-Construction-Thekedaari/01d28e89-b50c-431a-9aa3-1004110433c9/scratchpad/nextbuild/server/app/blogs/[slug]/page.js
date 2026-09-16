(()=>{var e={};e.id=688,e.ids=[688],e.modules={72934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},27790:e=>{"use strict";e.exports=require("assert")},84770:e=>{"use strict";e.exports=require("crypto")},17702:e=>{"use strict";e.exports=require("events")},92048:e=>{"use strict";e.exports=require("fs")},32615:e=>{"use strict";e.exports=require("http")},32694:e=>{"use strict";e.exports=require("http2")},35240:e=>{"use strict";e.exports=require("https")},55315:e=>{"use strict";e.exports=require("path")},76162:e=>{"use strict";e.exports=require("stream")},17360:e=>{"use strict";e.exports=require("url")},21764:e=>{"use strict";e.exports=require("util")},71568:e=>{"use strict";e.exports=require("zlib")},52238:(e,t,r)=>{"use strict";r.r(t),r.d(t,{GlobalError:()=>n.a,__next_app__:()=>p,originalPathname:()=>u,pages:()=>d,routeModule:()=>g,tree:()=>c}),r(10133),r(26733),r(35866);var o=r(23191),a=r(88716),i=r(37922),n=r.n(i),l=r(95231),s={};for(let e in l)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(s[e]=()=>l[e]);r.d(t,s);let c=["",{children:["blogs",{children:["[slug]",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(r.bind(r,10133)),"/Users/lalitsingh/Desktop/Construction/Thekedaari/frontend/src/app/blogs/[slug]/page.js"]}]},{}]},{}]},{layout:[()=>Promise.resolve().then(r.bind(r,26733)),"/Users/lalitsingh/Desktop/Construction/Thekedaari/frontend/src/app/layout.js"],"not-found":[()=>Promise.resolve().then(r.t.bind(r,35866,23)),"next/dist/client/components/not-found-error"]}],d=["/Users/lalitsingh/Desktop/Construction/Thekedaari/frontend/src/app/blogs/[slug]/page.js"],u="/blogs/[slug]/page",p={require:r,loadChunk:()=>Promise.resolve()},g=new o.AppPageRouteModule({definition:{kind:a.x.APP_PAGE,page:"/blogs/[slug]/page",pathname:"/blogs/[slug]",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:c}})},24390:()=>{},61085:(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),function(e,t){for(var r in t)Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}(t,{ReadonlyURLSearchParams:function(){return n},RedirectType:function(){return o.RedirectType},notFound:function(){return a.notFound},permanentRedirect:function(){return o.permanentRedirect},redirect:function(){return o.redirect}});let o=r(83953),a=r(16399);class i extends Error{constructor(){super("Method unavailable on `ReadonlyURLSearchParams`. Read more: https://nextjs.org/docs/app/api-reference/functions/use-search-params#updating-searchparams")}}class n extends URLSearchParams{append(){throw new i}delete(){throw new i}set(){throw new i}sort(){throw new i}}("function"==typeof t.default||"object"==typeof t.default&&null!==t.default)&&void 0===t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),e.exports=t.default)},16399:(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),function(e,t){for(var r in t)Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}(t,{isNotFoundError:function(){return a},notFound:function(){return o}});let r="NEXT_NOT_FOUND";function o(){let e=Error(r);throw e.digest=r,e}function a(e){return"object"==typeof e&&null!==e&&"digest"in e&&e.digest===r}("function"==typeof t.default||"object"==typeof t.default&&null!==t.default)&&void 0===t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),e.exports=t.default)},8586:(e,t)=>{"use strict";var r;Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"RedirectStatusCode",{enumerable:!0,get:function(){return r}}),function(e){e[e.SeeOther=303]="SeeOther",e[e.TemporaryRedirect=307]="TemporaryRedirect",e[e.PermanentRedirect=308]="PermanentRedirect"}(r||(r={})),("function"==typeof t.default||"object"==typeof t.default&&null!==t.default)&&void 0===t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),e.exports=t.default)},83953:(e,t,r)=>{"use strict";var o;Object.defineProperty(t,"__esModule",{value:!0}),function(e,t){for(var r in t)Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}(t,{RedirectType:function(){return o},getRedirectError:function(){return s},getRedirectStatusCodeFromError:function(){return f},getRedirectTypeFromError:function(){return g},getURLFromRedirectError:function(){return p},isRedirectError:function(){return u},permanentRedirect:function(){return d},redirect:function(){return c}});let a=r(54580),i=r(72934),n=r(8586),l="NEXT_REDIRECT";function s(e,t,r){void 0===r&&(r=n.RedirectStatusCode.TemporaryRedirect);let o=Error(l);o.digest=l+";"+t+";"+e+";"+r+";";let i=a.requestAsyncStorage.getStore();return i&&(o.mutableCookies=i.mutableCookies),o}function c(e,t){void 0===t&&(t="replace");let r=i.actionAsyncStorage.getStore();throw s(e,t,(null==r?void 0:r.isAction)?n.RedirectStatusCode.SeeOther:n.RedirectStatusCode.TemporaryRedirect)}function d(e,t){void 0===t&&(t="replace");let r=i.actionAsyncStorage.getStore();throw s(e,t,(null==r?void 0:r.isAction)?n.RedirectStatusCode.SeeOther:n.RedirectStatusCode.PermanentRedirect)}function u(e){if("object"!=typeof e||null===e||!("digest"in e)||"string"!=typeof e.digest)return!1;let[t,r,o,a]=e.digest.split(";",4),i=Number(a);return t===l&&("replace"===r||"push"===r)&&"string"==typeof o&&!isNaN(i)&&i in n.RedirectStatusCode}function p(e){return u(e)?e.digest.split(";",3)[2]:null}function g(e){if(!u(e))throw Error("Not a redirect error");return e.digest.split(";",2)[1]}function f(e){if(!u(e))throw Error("Not a redirect error");return Number(e.digest.split(";",4)[3])}(function(e){e.push="push",e.replace="replace"})(o||(o={})),("function"==typeof t.default||"object"==typeof t.default&&null!==t.default)&&void 0===t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),e.exports=t.default)},10133:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>c,generateMetadata:()=>s,revalidate:()=>l});var o=r(19510),a=r(61085),i=r(1125),n=r(24288);r(86040);let l=3600;async function s({params:e}){let t=await (0,n.c)(e.slug);if(!t)return{title:"Blog Not Found | Thekedaari"};let r=(0,i.$)(),o=`${r}/blogs/${t.slug}`,a=t.image||`${r}/thekedaari-logo.png`;return{title:t.metaTitle||t.title||"Blog | Thekedaari",description:t.metaDescription||"",alternates:{canonical:o},robots:{index:!0,follow:!0},openGraph:{type:"article",url:o,title:t.metaTitle||t.title||"",description:t.metaDescription||"",siteName:"Thekedaari",publishedTime:t.createdAt,images:[{url:a,width:1200,height:630,alt:t.title||""}]},twitter:{card:"summary_large_image",title:t.metaTitle||t.title||"",description:t.metaDescription||"",images:[a]}}}async function c({params:e}){let t=await (0,n.c)(e.slug);t||(0,a.notFound)();let r=(0,i.$)(),l=`${r}/blogs/${t.slug}`,s=t.createdAt?new Date(t.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"}):"",c=JSON.stringify({"@context":"https://schema.org","@type":"BlogPosting",headline:t.title||"",description:t.metaDescription||"",image:t.image||`${r}/thekedaari-logo.png`,url:l,datePublished:t.createdAt,publisher:{"@type":"Organization",name:"Thekedaari",url:r}});return(0,o.jsxs)("div",{className:"seo-landing-page",children:[o.jsx("script",{type:"application/ld+json",dangerouslySetInnerHTML:{__html:c}}),o.jsx("header",{className:"topbar",children:(0,o.jsxs)("div",{className:"container nav",children:[o.jsx("a",{className:"brand",href:"/",children:o.jsx("img",{src:"/thekedaari-logo.png",alt:"Thekedaari",width:40,height:40})}),(0,o.jsxs)("nav",{className:"nav-links",children:[o.jsx("a",{href:"/#features",children:"Features"}),o.jsx("a",{href:"/blogs",children:"Blog"}),o.jsx("a",{href:"/contact-us",children:"Contact"})]}),(0,o.jsxs)("div",{className:"nav-actions",children:[o.jsx("a",{className:"btn btn-outline",href:"/login",children:"Login"}),o.jsx("a",{className:"btn btn-primary",href:"/register",children:"Start Free →"})]})]})}),(0,o.jsxs)("main",{className:"container blog-detail-wrap",children:[o.jsx("a",{href:"/blogs",className:"blog-back-link",children:"← All articles"}),(0,o.jsxs)("article",{className:"blog-article",children:[(0,o.jsxs)("header",{className:"blog-article-header",children:[s&&o.jsx("p",{className:"blog-article-date",children:s}),o.jsx("h1",{className:"blog-article-title",children:t.title}),t.metaDescription&&o.jsx("p",{className:"blog-article-lead",children:t.metaDescription})]}),t.image&&o.jsx("div",{className:"blog-article-cover",children:o.jsx("img",{src:t.image,alt:t.title||"",className:"blog-article-cover-img"})}),t.content?o.jsx("div",{className:"blog-article-content",dangerouslySetInnerHTML:{__html:t.content}}):o.jsx("p",{className:"blog-article-empty",children:"Content coming soon."})]}),o.jsx("aside",{className:"blog-cta-box",children:(0,o.jsxs)("div",{className:"cta-wrap",children:[(0,o.jsxs)("div",{children:[o.jsx("h2",{children:"Thekedaar ho? Ab diary chhodo."}),o.jsx("p",{children:"Attendance, labour payment aur site hisaab ko digital karo — bilkul free mein."})]}),(0,o.jsxs)("div",{className:"nav-actions",children:[o.jsx("a",{className:"btn btn-primary",href:"/register",children:"Start Free →"}),o.jsx("a",{className:"btn btn-outline",href:"/login",children:"Login"})]})]})})]}),o.jsx("footer",{className:"footer",style:{marginTop:"48px"},children:(0,o.jsxs)("div",{className:"container footer-wrap",children:[(0,o.jsxs)("div",{children:["\xa9 ",new Date().getFullYear()," Thekedaari. Construction management for Indian contractors."]}),(0,o.jsxs)("div",{className:"footer-links",children:[o.jsx("a",{href:"/",children:"Home"}),o.jsx("a",{href:"/blogs",children:"Blog"}),o.jsx("a",{href:"/thekedaar-software",children:"Thekedaar Software"}),o.jsx("a",{href:"/mazdoor-attendance-app",children:"Mazdoor App"}),o.jsx("a",{href:"/contact-us",children:"Contact"})]})]})}),o.jsx("style",{children:`
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
      `})]})}},24288:(e,t,r)=>{"use strict";function o(){let e="https://thekedaar.com/api".trim();return e?e.replace(/\/$/,""):"http://localhost:5000/api"}async function a(){let e=await fetch(`${o()}/blogs`,{next:{revalidate:3600}});return e.ok?e.json():[]}async function i(e){let t=await fetch(`${o()}/blogs/${encodeURIComponent(e)}`,{next:{revalidate:3600}});return t.ok?t.json():null}r.d(t,{J:()=>a,c:()=>i})},86040:()=>{}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),o=t.X(0,[8948,4491,1024],()=>r(52238));module.exports=o})();