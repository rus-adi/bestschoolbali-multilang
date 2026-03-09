import type { Metadata } from 'next';

import BasePage, {
  generateMetadata as generateBaseMetadata,
  generateStaticParams as generateBaseStaticParams,
} from '../../../parent-feedback/[slug]/page';
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
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};

  const base = await generateBaseMetadata({ params: { slug: params.slug } });
  return localizeMetadata(base, params.locale as Locale, `/parent-feedback/${params.slug}`, {
    noindex: true,
  });
}

export default function LocalizedPage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  return <BasePage params={{ slug: params.slug }} />;
}
