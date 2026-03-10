import { getMessages } from './getMessages';
import { isLocale, type Locale } from './locales';

type Messages = Record<string, unknown>;

function getByPath(messages: Messages, key: string): unknown {
  return key.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, messages);
}

function applyValues(template: string, values?: Record<string, string | number>) {
  if (!values) return template;
  return template.replace(/\{(.*?)\}/g, (_, key) => String(values[key] ?? `{${key}}`));
}

export async function createServerT(locale?: string) {
  const en = await getMessages('en');
  const local = locale && isLocale(locale) ? await getMessages(locale as Locale) : en;

  return (key: string, fallback: string, values?: Record<string, string | number>) => {
    const localized = getByPath(local, key);
    if (typeof localized === 'string') return applyValues(localized, values);

    const english = getByPath(en, key);
    if (typeof english === 'string') return applyValues(english, values);

    return applyValues(fallback, values);
  };
}
