'use client';

import * as React from 'react';
import { type Locale, localizeHref } from '../lib/i18n/locales';

function rewriteTree(root: ParentNode, locale: Locale) {
  root.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((anchor) => {
    const href = anchor.getAttribute('href');
    if (!href) return;
    const localized = localizeHref(href, locale);
    if (localized !== href) anchor.setAttribute('href', localized);
  });

  root.querySelectorAll<HTMLFormElement>('form[action]').forEach((form) => {
    const action = form.getAttribute('action');
    if (!action) return;
    const localized = localizeHref(action, locale);
    if (localized !== action) form.setAttribute('action', localized);
  });
}

export default function LocaleDomEnhancer({ locale }: { locale: Locale }) {
  React.useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    rewriteTree(document, locale);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of Array.from(mutation.addedNodes)) {
          if (node instanceof HTMLElement) rewriteTree(node, locale);
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [locale]);

  return null;
}
