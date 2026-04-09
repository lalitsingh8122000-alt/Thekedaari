import fs from 'fs';
import path from 'path';
import { getSiteUrl } from '@/lib/siteUrl';
import '@/styles/seo-landing.css';

export default function SeoMarketingLanding({ slug }) {
  const site = getSiteUrl();
  const bodyPath = path.join(process.cwd(), 'src/seo-landing/bodies', `${slug}.html`);
  const jsonPath = path.join(process.cwd(), 'src/seo-landing/jsonld', `${slug}.json`);
  let body = fs.readFileSync(bodyPath, 'utf8');
  body = body.replace(/__SITE_URL__/g, site);
  const jsonLd = fs.readFileSync(jsonPath, 'utf8').replace(/__SITE_URL__/g, site);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <div className="seo-landing-page" dangerouslySetInnerHTML={{ __html: body }} />
    </>
  );
}
