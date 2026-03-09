'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import enMessages from '../locales/en.json';
import SiteChrome from './SiteChrome';
import { splitLocaleFromPathname } from '../lib/i18n/locales';

export default function PathAwareLegacyChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/';
  const { locale } = splitLocaleFromPathname(pathname);

  if (locale) return <>{children}</>;
  return (
    <SiteChrome locale="en" messages={enMessages}>
      {children}
    </SiteChrome>
  );
}
