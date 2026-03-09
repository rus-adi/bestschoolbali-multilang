export const LOCALES = ["en", "nl", "de", "es", "fr", "ru", "zh", "ko", "ja", "ar"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';


export const LOCALE_FLAGS: Record<Locale, string> = {
  en: '🇬🇧',
  nl: '🇳🇱',
  de: '🇩🇪',
  es: '🇪🇸',
  fr: '🇫🇷',
  ru: '🇷🇺',
  zh: '🇨🇳',
  ko: '🇰🇷',
  ja: '🇯🇵',
  ar: '🇸🇦',
};

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  nl: 'Nederlands',
  de: 'Deutsch',
  es: 'Español',
  fr: 'Français',
  ru: 'Русский',
  zh: '中文',
  ko: '한국어',
  ja: '日本語',
  ar: 'العربية',
};

const STATIC_PREFIXES = ['/img/', '/videos/', '/_next/', '/favicon', '/robots.txt', '/sitemap.xml', '/manifest'];

export function isLocale(value: string | null | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

export function splitLocaleFromPathname(pathname: string) {
  const normalized = pathname?.startsWith('/') ? pathname : `/${pathname ?? ''}`;
  const parts = normalized.split('/');
  const maybeLocale = parts[1] || null;
  if (isLocale(maybeLocale)) {
    const rest = `/${parts.slice(2).join('/')}`.replace(/\/+/g, '/');
    return {
      locale: maybeLocale,
      pathname: rest === '/' ? '/' : rest.replace(/\/$/, '') || '/',
    };
  }
  return { locale: null, pathname: normalized === '' ? '/' : normalized.replace(/\/$/, '') || '/' };
}

export function isExternalHref(href: string) {
  return /^(https?:|mailto:|tel:|sms:|javascript:|#)/i.test(href);
}

export function isLocalizablePathname(pathname: string) {
  if (!pathname.startsWith('/')) return false;
  if (STATIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix))) return false;
  const last = pathname.split('/').pop() ?? '';
  if (/\.[a-z0-9]{1,8}$/i.test(last)) return false;
  return true;
}

export function localizeHref(href: string, locale: Locale) {
  if (!href) return href;
  if (isExternalHref(href)) return href;
  const [pathAndQuery, hash = ''] = href.split('#');
  const [pathname, query = ''] = pathAndQuery.split('?');
  if (!isLocalizablePathname(pathname)) return href;
  const { pathname: barePath } = splitLocaleFromPathname(pathname);
  const localizedPath = barePath === '/' ? `/${locale}` : `/${locale}${barePath}`;
  return `${localizedPath}${query ? `?${query}` : ''}${hash ? `#${hash}` : ''}`;
}
