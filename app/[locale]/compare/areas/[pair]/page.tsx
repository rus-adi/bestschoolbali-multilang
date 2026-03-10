import type { Metadata } from 'next';

import BasePage, {
  generateMetadata as generateBaseMetadata,
  generateStaticParams as generateBaseStaticParams,
} from '../../../../compare/areas/[pair]/page';
import { localizeMetadata } from '../../../../../lib/seo/i18n';
import { isLocale, type Locale } from '../../../../../lib/i18n/locales';

export const dynamic = 'error';
export const dynamicParams = false;

export function generateStaticParams() {
  return generateBaseStaticParams();
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string; pair: string };
}): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};

  const base = await generateBaseMetadata({ params: { pair: params.pair }, locale: params.locale });
  return localizeMetadata(base, params.locale as Locale, `/compare/areas/${params.pair}`, {
    noindex: params.locale !== 'en',
  });
}

export default function LocalizedPage({
  params,
}: {
  params: { locale: string; pair: string };
}) {
  return <BasePage params={{ pair: params.pair }} locale={params.locale} />;
}
