import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import SiteChrome from '../../components/SiteChrome';
import { getMessages } from '../../lib/i18n/getMessages';
import { isLocale, LOCALES, type Locale } from '../../lib/i18n/locales';

export const dynamic = 'error';
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const messages = await getMessages(locale);

  return (
    <SiteChrome locale={locale} messages={messages}>
      {children}
    </SiteChrome>
  );
}
