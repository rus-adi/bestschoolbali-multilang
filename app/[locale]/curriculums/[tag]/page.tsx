import type { Metadata } from 'next';

import BasePage, {
  generateMetadata as generateBaseMetadata,
  generateStaticParams as generateBaseStaticParams,
} from '../../../curriculums/[tag]/page';
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
  params: { locale: string; tag: string };
}): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};

  const base = await generateBaseMetadata({ params: { tag: params.tag }, locale: params.locale });
  return localizeMetadata(base, params.locale as Locale, `/curriculums/${params.tag}`, {
    noindex: params.locale !== 'en',
  });
}

export default function LocalizedPage({
  params,
}: {
  params: { locale: string; tag: string };
}) {
  return <BasePage params={{ tag: params.tag }} locale={params.locale} />;
}
