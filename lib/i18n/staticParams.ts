import { LOCALES } from './locales';

export function generateLocaleStaticParams(): Array<{ locale: string }> {
  return LOCALES.map((locale) => ({ locale }));
}

export function withLocaleStaticParams<T extends Record<string, string>>(params: T[]): Array<T & { locale: string }> {
  return LOCALES.flatMap((locale) => params.map((entry) => ({ locale, ...entry })));
}
