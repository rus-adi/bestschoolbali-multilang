import './globals.css';
import type { Metadata } from 'next';
import Script from 'next/script';
import PathAwareLegacyChrome from '../components/PathAwareLegacyChrome';
import GoogleAnalyticsTracker from '../components/GoogleAnalyticsTracker';

const SITE_URL = 'https://bestschoolbali.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Best School Bali',
    template: '%s | Best School Bali',
  },
  description: 'Compare international and private schools in Bali by area, curriculum, ages, and budget.',
  alternates: {
    canonical: `${SITE_URL}/en`,
  },
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    type: 'website',
    siteName: 'Best School Bali',
    url: `${SITE_URL}/en`,
    title: 'Best School Bali',
    description: 'Compare international and private schools in Bali by area, curriculum, ages, and budget.',
    images: [{ url: `${SITE_URL}/img/banners/hero.webp` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best School Bali',
    description: 'Compare international and private schools in Bali by area, curriculum, ages, and budget.',
    images: [`${SITE_URL}/img/banners/hero.webp`],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}#organization`,
    name: 'Best School Bali',
    url: SITE_URL,
    logo: `${SITE_URL}/img/brand/logo.webp`,
  };

  const siteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}#website`,
    name: 'Best School Bali',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/en/schools?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-753DZKBTTG" strategy="afterInteractive" />
        <Script id="google-analytics-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', 'G-753DZKBTTG');
          `}
        </Script>
        <GoogleAnalyticsTracker />
        <PathAwareLegacyChrome>{children}</PathAwareLegacyChrome>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([orgJsonLd, siteJsonLd]) }}
        />
      </body>
    </html>
  );
}
