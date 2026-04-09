import SeoMarketingLanding from '@/components/seo/SeoMarketingLanding';
import { getSeoPageMetadata } from '@/seo-landing/meta';

export const revalidate = 86400;

export function generateMetadata() {
  return getSeoPageMetadata('construction-hisaab-kitab');
}

export default function ConstructionHisaabKitabPage() {
  return <SeoMarketingLanding slug="construction-hisaab-kitab" />;
}
