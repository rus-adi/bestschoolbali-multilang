'use client';

import * as React from 'react';
import NavToggle from './NavToggle';
import LanguageSwitcher from './LanguageSwitcher';
import LocaleDomEnhancer from './LocaleDomEnhancer';
import { I18nProvider, useLocaleHref, useT } from './I18nProvider';
import type { Locale } from '../lib/i18n/locales';

type Messages = Record<string, unknown>;

function SiteChromeInner({ children }: { children: React.ReactNode }) {
  const t = useT();
  const href = useLocaleHref();

  const truncateLabel = (text: string, max = 18) =>
    text.length > max ? `${text.slice(0, Math.max(0, max - 3)).trimEnd()}...` : text;

  const navLinks = [
    { key: 'nav.home', href: '/' },
    { key: 'nav.schools', href: '/schools' },
    { key: 'nav.types', href: '/types' },
    { key: 'nav.curriculums', href: '/curriculums' },
    { key: 'nav.areas', href: '/areas' },
    { key: 'nav.guides', href: '/guides' },
    { key: 'nav.contact', href: '/contact' },
  ] as const;
  const ctaLabel = t('nav.cta');

  const footerLinks = [
    ['footer.schools', '/schools'],
    ['footer.areas', '/areas'],
    ['footer.types', '/types'],
    ['footer.curriculums', '/curriculums'],
    ['footer.guides', '/guides'],
    ['footer.budget', '/budget'],
    ['footer.fees', '/fees'],
    ['footer.compare', '/compare'],
    ['footer.ages', '/ages'],
    ['footer.forSchools', '/for-schools'],
    ['footer.methodology', '/methodology'],
    ['footer.contact', '/contact'],
    ['footer.privacy', '/privacy'],
    ['footer.terms', '/terms'],
  ] as const;

  return (
    <>
      <header className="siteHeader">
        <div className="container headerInner">
          <a href={href('/')} className="brand" aria-label="Best School Bali">
            <img className="brandLogo" src="/img/brand/logo.webp" alt="" aria-hidden="true" />
            <span className="brandName">Best School Bali</span>
          </a>

          <nav id="site-nav" className="nav" data-nav>
            {navLinks.map((item) => {
              const full = t(item.key);
              return (
                <a key={item.key} className="navLink menuItem" href={href(item.href)} title={full}>
                  {full}
                </a>
              );
            })}
            <a className="btn btnPrimary navCta" href={href('/contact')} title={ctaLabel}>
              <span className="btnText">{truncateLabel(ctaLabel)}</span> <span aria-hidden="true">→</span>
            </a>
          </nav>

          <div className="headerActions">
            <LanguageSwitcher />
            <a className="btn btnPrimary headerCta" href={href('/contact')} title={ctaLabel}>
              <span className="btnText">{truncateLabel(ctaLabel)}</span> <span aria-hidden="true">→</span>
            </a>
            <NavToggle navId="site-nav" />
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="siteFooter">
        <div className="container footerInner">
          <div className="small">© {new Date().getFullYear()} Best School Bali</div>
          <div className="small footerLinks">
            {footerLinks.map(([key, link], index) => (
              <React.Fragment key={key}>
                {index ? <span aria-hidden="true">·</span> : null}
                <a href={href(link)}>{t(key)}</a>
              </React.Fragment>
            ))}
            <span aria-hidden="true">·</span>
            <a href="https://wa.me/6285285408220" rel="nofollow">
              {t('footer.whatsApp')}
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}

export default function SiteChrome({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Messages;
  children: React.ReactNode;
}) {
  return (
    <I18nProvider locale={locale} messages={messages}>
      <LocaleDomEnhancer locale={locale} />
      <SiteChromeInner>{children}</SiteChromeInner>
    </I18nProvider>
  );
}
