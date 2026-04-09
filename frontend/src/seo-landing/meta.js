import { getSiteUrl } from '@/lib/siteUrl';

const SEO_PAGES = {
  'thekedaar-software': {
    path: '/thekedaar-software',
    title: 'Thekedaar Software | Worker Attendance, Site Hisaab & Profit Tracking | Thekedaari',
    description:
      'Thekedaari is a powerful thekedaar software for contractors and site owners. Track worker attendance, labour payment, site kharcha, material, udhaar and profit-loss in one place.',
    ogTitle: 'Thekedaar Software | Worker Attendance, Site Hisaab & Profit Tracking | Thekedaari',
    ogDescription:
      'Manage worker attendance, labour payments, site expenses and project profit in one smart thekedaar software.',
    twitterTitle: 'Thekedaar Software | Thekedaari',
    twitterDescription: 'Construction ka smart hisaab. Attendance, labour aur site finance ko digital banao.',
  },
  'contractor-management-software': {
    path: '/contractor-management-software',
    title: 'Contractor Management Software | Projects, Workers & Site Finance | Thekedaari',
    description:
      'Thekedaari is contractor management software for project tracking, labour attendance, daily site expense, material records, payment management and profit visibility.',
    ogTitle: 'Contractor Management Software | Projects, Workers & Site Finance | Thekedaari',
    ogDescription:
      'Run contractor operations with one smart dashboard for attendance, expenses, payments and project control.',
    twitterTitle: 'Contractor Management Software | Thekedaari',
    twitterDescription: 'From labour to ledger, manage your contractor business with clarity.',
  },
  'mazdoor-attendance-app': {
    path: '/mazdoor-attendance-app',
    title: 'Mazdoor Attendance App | Labour Attendance Software for Contractors | Thekedaari',
    description:
      'Thekedaari is a mazdoor attendance app for contractors and site teams. Mark labour attendance, full day, half day, wages and worker payment records with ease.',
    ogTitle: 'Mazdoor Attendance App | Labour Attendance Software | Thekedaari',
    ogDescription: 'Mark attendance, link wages and keep labour records clean with one easy app.',
    twitterTitle: 'Mazdoor Attendance App | Thekedaari',
    twitterDescription: 'The easy way to manage labour attendance and worker payment records.',
  },
  'construction-hisaab-kitab': {
    path: '/construction-hisaab-kitab',
    title: 'Construction Hisaab Kitab Software | Site Expense, Ledger & Profit Loss | Thekedaari',
    description:
      'Thekedaari helps contractors manage construction hisaab kitab including site expense, labour payment, material purchase, udhaar, balance and project profit-loss.',
    ogTitle: 'Construction Hisaab Kitab Software | Site Expense, Ledger & Profit Loss | Thekedaari',
    ogDescription:
      'Keep construction accounts clear with digital site expense tracking, labour payment and project wise profit visibility.',
    twitterTitle: 'Construction Hisaab Kitab Software | Thekedaari',
    twitterDescription:
      'Track site expense, labour payment, material and project profit-loss with one system.',
  },
};

export function getSeoPageMetadata(slug) {
  const p = SEO_PAGES[slug];
  if (!p) throw new Error(`Unknown SEO slug: ${slug}`);
  const base = getSiteUrl();
  const url = `${base}${p.path}`;
  const imageUrl = `${base}/thekedaari-logo.png`;
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: url },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    openGraph: {
      type: 'website',
      url,
      title: p.ogTitle,
      description: p.ogDescription,
      siteName: 'Thekedaari',
      locale: 'en_IN',
      images: [
        {
          url: imageUrl,
          width: 512,
          height: 512,
          alt: 'Thekedaari',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: p.twitterTitle,
      description: p.twitterDescription,
      images: [imageUrl],
    },
  };
}

export const SEO_PAGE_SLUGS = Object.keys(SEO_PAGES);
