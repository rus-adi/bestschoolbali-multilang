import type { Metadata } from 'next';

import { metadata as baseMetadata } from '../../guides/page';
import GuidesHubContent from '../../../components/GuidesHubContent';
import { localizeMetadata } from '../../../lib/seo/i18n';
import { isLocale, type Locale } from '../../../lib/i18n/locales';

export const dynamic = 'error';

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
  return <GuidesHubContent locale={params.locale} />;
}
