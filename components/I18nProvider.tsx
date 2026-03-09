'use client';

import * as React from 'react';
import { DEFAULT_LOCALE, type Locale, localizeHref } from '../lib/i18n/locales';

type Messages = Record<string, unknown>;

type I18nContextValue = {
  locale: Locale;
  messages: Messages;
};

const I18nContext = React.createContext<I18nContextValue>({
  locale: DEFAULT_LOCALE,
  messages: {},
});

function getByPath(messages: Messages, key: string): unknown {
  return key.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, messages);
}

function applyVariables(template: string, values?: Record<string, string | number>) {
  if (!values) return template;
  return template.replace(/\{(.*?)\}/g, (_, key) => String(values[key] ?? `{${key}}`));
}

export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Messages;
  children: React.ReactNode;
}) {
  const value = React.useMemo(() => ({ locale, messages }), [locale, messages]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return React.useContext(I18nContext);
}

export function useT() {
  const { messages } = useI18n();
  return React.useCallback(
    (key: string, values?: Record<string, string | number>) => {
      const raw = getByPath(messages, key);
      if (typeof raw !== 'string') return key;
      return applyVariables(raw, values);
    },
    [messages],
  );
}

export function useLocaleHref() {
  const { locale } = useI18n();
  return React.useCallback((href: string) => localizeHref(href, locale), [locale]);
}
