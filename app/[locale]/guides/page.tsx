import type { Metadata } from 'next';

import { metadata as baseMetadata } from '../../guides/page';
import GuidesHubPageContent from '../../guides/GuidesHubPageContent';
import { localizeMetadata } from '../../../lib/seo/i18n';
import { isLocale, LOCALES, type Locale } from '../../../lib/i18n/locales';

export const dynamic = 'error';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};

  return localizeMetadata(baseMetadata, params.locale as Locale, '/guides', {
    noindex: params.locale !== 'en',
  });
}

export default function LocalizedPage({ params }: { params: { locale: string } }) {
  return <GuidesHubPageContent locale={params.locale} />;
}
