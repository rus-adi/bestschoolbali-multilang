import type { Metadata } from 'next';

import BasePage, {
  generateMetadata as generateBaseMetadata,
  generateStaticParams as generateBaseStaticParams,
} from '../../../areas/[area]/page';
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
  params: { locale: string; area: string };
}): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};

  const base = await generateBaseMetadata({ params: { area: params.area } });
  return localizeMetadata(base, params.locale as Locale, `/areas/${params.area}`, {
    noindex: params.locale !== 'en',
  });
}

export default function LocalizedPage({
  params,
}: {
  params: { locale: string; area: string };
}) {
  return <BasePage params={{ area: params.area }} />;
}
