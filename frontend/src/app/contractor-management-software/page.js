import SeoMarketingLanding from '@/components/seo/SeoMarketingLanding';
import { getSeoPageMetadata } from '@/seo-landing/meta';

export const revalidate = 86400;

export function generateMetadata() {
  return getSeoPageMetadata('contractor-management-software');
}

export default function ContractorManagementSoftwarePage() {
  return <SeoMarketingLanding slug="contractor-management-software" />;
}
