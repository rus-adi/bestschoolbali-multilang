import type { Metadata } from 'next';

import BasePage, { metadata as baseMetadata } from '../../for-schools/page';
import { localizeMetadata } from '../../../lib/seo/i18n';
import { isLocale, type Locale } from '../../../lib/i18n/locales';

export const dynamic = 'error';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};

  return localizeMetadata(baseMetadata, params.locale as Locale, '/for-schools', {
    noindex: params.locale !== 'en',
  });
}

export default function LocalizedPage() {
  return <BasePage />;
}
