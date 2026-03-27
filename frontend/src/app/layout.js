import './globals.css';
import Providers from '@/components/Providers';

export const metadata = {
  title: 'ठेकेदार - Thekedaar',
  description: 'Construction Workforce & Project Management System',
  manifest: '/manifest.json',
  applicationName: 'Thekedaar',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Thekedaar',
  },
  icons: {
    icon: [{ url: '/icon-192.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-touch-icon.svg', type: 'image/svg+xml' }],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#2563eb',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
      </head>
      <body className="min-h-screen bg-gray-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
