import type { Metadata } from 'next';
import { DEFAULT_LOCALE, LOCALES, type Locale } from '../i18n/locales';
import { SITE_URL } from './site';

function buildLocalizedUrl(locale: Locale, pathname: string) {
  return `${SITE_URL}/${locale}${pathname === '/' ? '' : pathname}`;
}

function mergeRobots(base: Metadata['robots'], noindex: boolean): Metadata['robots'] {
  if (!noindex) {
    if (typeof base === 'object' && base) return base;
    return { index: true, follow: true };
  }
  return { index: false, follow: true };
}

export function localizeMetadata(base: Metadata, locale: Locale, pathname: string, opts?: { noindex?: boolean }) {
  const canonical = opts?.noindex
    ? buildLocalizedUrl(DEFAULT_LOCALE, pathname)
    : buildLocalizedUrl(locale, pathname);

  const languages: Record<string, string> = {};
  for (const l of LOCALES) {
    languages[l] = buildLocalizedUrl(l, pathname);
  }
  languages['x-default'] = buildLocalizedUrl(DEFAULT_LOCALE, pathname);

  return {
    ...base,
    metadataBase: new URL(SITE_URL),
    alternates: {
      ...(base.alternates ?? {}),
      canonical,
      languages,
    },
    openGraph: base.openGraph
      ? {
          ...base.openGraph,
          url: buildLocalizedUrl(locale, pathname),
        }
      : {
          url: buildLocalizedUrl(locale, pathname),
        },
    robots: mergeRobots(base.robots, !!opts?.noindex),
  } satisfies Metadata;
}
