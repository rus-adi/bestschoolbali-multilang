import type { Metadata } from 'next';

import BasePage, { metadata as baseMetadata } from '../../areas/page';
import { localizeMetadata } from '../../../lib/seo/i18n';
import { isLocale, type Locale } from '../../../lib/i18n/locales';
import { generateLocaleStaticParams } from '../../../lib/i18n/staticParams';

export const dynamic = 'error';

export function generateStaticParams() {
  return generateLocaleStaticParams();
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};

  return localizeMetadata(baseMetadata, params.locale as Locale, '/areas', {
    noindex: params.locale !== 'en',
  });
}

export default function LocalizedPage({ params }: { params: { locale: string } }) {
  return <BasePage locale={params.locale} />;
}
