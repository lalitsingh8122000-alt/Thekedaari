import SeoMarketingLanding from '@/components/seo/SeoMarketingLanding';
import { getSeoPageMetadata } from '@/seo-landing/meta';

export const revalidate = 86400;

export function generateMetadata() {
  return getSeoPageMetadata('thekedaar-software');
}

export default function ThekedaarSoftwarePage() {
  return <SeoMarketingLanding slug="thekedaar-software" />;
}
