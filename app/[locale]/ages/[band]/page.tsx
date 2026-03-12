import type { Metadata } from 'next';

import BasePage, {
  generateMetadata as generateBaseMetadata,
  generateStaticParams as generateBaseStaticParams,
} from '../../../ages/[band]/page';
import { localizeMetadata } from '../../../../lib/seo/i18n';
import { withLocaleStaticParams } from '../../../../lib/i18n/staticParams';
import { isLocale, type Locale } from '../../../../lib/i18n/locales';

export const dynamic = 'error';
export const dynamicParams = false;

export function generateStaticParams() {
  return withLocaleStaticParams(generateBaseStaticParams());
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string; band: string };
}): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};

  const base = await generateBaseMetadata({ params: { band: params.band }, locale: params.locale });
  return localizeMetadata(base, params.locale as Locale, `/ages/${params.band}`, {
    noindex: params.locale !== 'en',
  });
}

export default function LocalizedPage({
  params,
}: {
  params: { locale: string; band: string };
}) {
  return <BasePage params={{ band: params.band }} locale={params.locale} />;
}
