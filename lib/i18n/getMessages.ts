import type { Locale } from './locales';

const loaders: Record<Locale, () => Promise<{ default: Record<string, unknown> }>> = {
  en: () => import('../../locales/en.json'),
  nl: () => import('../../locales/nl.json'),
  de: () => import('../../locales/de.json'),
  es: () => import('../../locales/es.json'),
  fr: () => import('../../locales/fr.json'),
  ru: () => import('../../locales/ru.json'),
  zh: () => import('../../locales/zh.json'),
  ko: () => import('../../locales/ko.json'),
  ja: () => import('../../locales/ja.json'),
  ar: () => import('../../locales/ar.json'),
};

export async function getMessages(locale: Locale) {
  return (await loaders[locale]()).default;
}
