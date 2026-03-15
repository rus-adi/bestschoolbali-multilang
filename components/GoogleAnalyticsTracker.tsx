'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_MEASUREMENT_ID = 'G-753DZKBTTG';

function trackPageView(path: string) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
    send_to: GA_MEASUREMENT_ID,
  });
}

function trackClickEvent(target: HTMLElement) {
  if (typeof window.gtag !== 'function') return;

  const label =
    target.getAttribute('aria-label') ||
    target.getAttribute('title') ||
    target.textContent?.trim() ||
    target.getAttribute('id') ||
    target.className ||
    'unknown';

  window.gtag('event', 'click', {
    event_category: target.tagName.toLowerCase(),
    event_label: label.slice(0, 120),
    page_path: window.location.pathname,
    send_to: GA_MEASUREMENT_ID,
  });
}

export default function GoogleAnalyticsTracker() {
  const pathname = usePathname();
  React.useEffect(() => {
    if (!pathname) return;
    const query = typeof window !== 'undefined' ? window.location.search : '';
    const path = `${pathname}${query}`;
    trackPageView(path);
  }, [pathname]);

  React.useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target instanceof HTMLElement ? event.target : null;
      if (!target) return;

      const clickable = target.closest<HTMLElement>('a, button, [role="button"], [data-track-click]');
      if (!clickable) return;

      trackClickEvent(clickable);
    };

    document.addEventListener('click', onDocumentClick, true);
    return () => document.removeEventListener('click', onDocumentClick, true);
  }, []);

  return null;
}
