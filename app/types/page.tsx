import type { Metadata } from 'next';
import TypesPageContent from '../../components/TypesPageContent';
import { getAllTypes } from '../../lib/taxonomy';

export const dynamic = 'error';

const SITE_URL = 'https://bestschoolbali.com';

export const metadata: Metadata = {
  title: 'School types in Bali',
  description:
    'Browse Bali schools by type (international, bilingual, Montessori, and more). Open profiles to compare curriculum, ages, and fees.',
  alternates: { canonical: `${SITE_URL}/types` },
  openGraph: {
    title: 'School types in Bali',
    description: 'Browse Bali schools by type and open profiles to compare curriculum, ages, and fees.',
    url: `${SITE_URL}/types`,
    images: [{ url: `${SITE_URL}/img/banners/hero.webp` }],
  },
};

export default function TypesIndexPage({ locale = "en" }: { locale?: string }) {
  const types = getAllTypes(locale);
  return <TypesPageContent types={types} />;
}
