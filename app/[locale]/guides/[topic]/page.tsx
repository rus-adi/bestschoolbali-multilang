import type { Metadata } from 'next';

import {
  generateMetadata as generateBaseMetadata,
  generateStaticParams as generateBaseStaticParams,
} from '../../../guides/[topic]/page';
import GuideTopicPageContent from '../../../guides/[topic]/GuideTopicPageContent';
import { localizeMetadata } from '../../../../lib/seo/i18n';
import { isLocale, type Locale } from '../../../../lib/i18n/locales';

export const dynamic = 'error';
export const dynamicParams = false;

export function generateStaticParams() {
  return generateBaseStaticParams();
}

type LocalizedGuideTopicPageProps = {
  params: { locale: string; topic: string };
};

export async function generateMetadata({
  params,
}: LocalizedGuideTopicPageProps): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};

  const base = await generateBaseMetadata({ params: { topic: params.topic } });
  return localizeMetadata(base, params.locale as Locale, `/guides/${params.topic}`, {
    noindex: params.locale !== 'en',
  });
}

export default function LocalizedPage({
  params,
}: LocalizedGuideTopicPageProps) {
  return <GuideTopicPageContent params={{ topic: params.topic }} locale={params.locale} />;
}
