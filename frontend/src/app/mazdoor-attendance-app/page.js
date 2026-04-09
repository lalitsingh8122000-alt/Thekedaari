import SeoMarketingLanding from '@/components/seo/SeoMarketingLanding';
import { getSeoPageMetadata } from '@/seo-landing/meta';

export const revalidate = 86400;

export function generateMetadata() {
  return getSeoPageMetadata('mazdoor-attendance-app');
}

export default function MazdoorAttendanceAppPage() {
  return <SeoMarketingLanding slug="mazdoor-attendance-app" />;
}
