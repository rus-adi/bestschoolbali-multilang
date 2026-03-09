'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { LOCALE_FLAGS, LOCALE_LABELS, LOCALES, type Locale, localizeHref, splitLocaleFromPathname } from '../lib/i18n/locales';
import { useI18n, useT } from './I18nProvider';

export default function LanguageSwitcher() {
  const { locale } = useI18n();
  const t = useT();
  const pathname = usePathname() || '/';
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  const currentBarePath = React.useMemo(() => {
    const barePath = splitLocaleFromPathname(pathname).pathname;
    if (barePath === '/blog') return '/posts';
    if (barePath.startsWith('/blog/')) return `/posts${barePath.slice('/blog'.length)}`;
    return barePath;
  }, [pathname]);

  const buildHref = React.useCallback(
    (nextLocale: Locale) => {
      const query = typeof window !== 'undefined' ? window.location.search : '';
      return localizeHref(`${currentBarePath}${query}`, nextLocale);
    },
    [currentBarePath],
  );

  React.useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current) return;
      const target = event.target as Node | null;
      if (target && !rootRef.current.contains(target)) setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className="localeSwitcher" ref={rootRef}>
      <button
        type="button"
        className="localeTrigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('language.label')}
        title={`${t('language.label')}: ${LOCALE_LABELS[locale]}`}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="localeTriggerFlag" aria-hidden="true">
          {LOCALE_FLAGS[locale]}
        </span>
      </button>

      {open ? (
        <div className="localeMenu" role="menu" aria-label={t('language.label')}>
          {LOCALES.map((value) => {
            const active = value === locale;
            return (
              <button
                key={value}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                className={`localeOption${active ? ' isActive' : ''}`}
                title={LOCALE_LABELS[value]}
                onClick={() => {
                  setOpen(false);
                  if (value === locale) return;
                  window.location.assign(buildHref(value));
                }}
              >
                <span className="localeFlag" aria-hidden="true">
                  {LOCALE_FLAGS[value]}
                </span>
                <span className="localeOptionLabel">{LOCALE_LABELS[value]}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
