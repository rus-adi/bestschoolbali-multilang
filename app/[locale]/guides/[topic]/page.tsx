import type { Metadata } from 'next';

import BasePage, {
  generateMetadata as generateBaseMetadata,
  generateStaticParams as generateBaseStaticParams,
} from '../../../guides/[topic]/page';
import { localizeMetadata } from '../../../../lib/seo/i18n';
import { isLocale, type Locale } from '../../../../lib/i18n/locales';

export const dynamic = 'error';
export const dynamicParams = false;

export function generateStaticParams() {
  return generateBaseStaticParams();
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string; topic: string };
}): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};

  const base = await generateBaseMetadata({ params: { topic: params.topic } });
  return localizeMetadata(base, params.locale as Locale, `/guides/${params.topic}`, {
    noindex: params.locale !== 'en',
  });
}

export default function LocalizedPage({
  params,
}: {
  params: { locale: string; topic: string };
}) {
  return <BasePage params={{ topic: params.topic }} />;
}
