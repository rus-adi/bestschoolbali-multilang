'use client';

import { useLocaleHref, useT } from './I18nProvider';
import type { TypeEntry } from '../lib/taxonomy';

const SITE_URL = 'https://bestschoolbali.com';

function withFallback(value: string, key: string, fallback: string) {
  return value === key ? fallback : value;
}

function applyValues(template: string, values?: Record<string, string | number>) {
  if (!values) return template;
  return template.replace(/\{(.*?)\}/g, (_, key) => String(values[key] ?? `{${key}}`));
}

export default function TypesPageContent({ types }: { types: TypeEntry[] }) {
  const t = useT();
  const href = useLocaleHref();

  const tr = (key: string, fallback: string, values?: Record<string, string | number>) =>
    applyValues(withFallback(t(key, values), key, fallback), values);

  const faqItems = [
    {
      q: tr('typesPage.faq.q1', 'What does a school type mean?'),
      a: tr(
        'typesPage.faq.a1',
        'Type labels are a simple browsing shortcut. Schools sometimes use different wording, so always open a profile and confirm the exact program, language of instruction, and age/grade coverage.',
      ),
    },
    {
      q: tr('typesPage.faq.q2', 'Is ‘international school’ always the best option?'),
      a: tr(
        'typesPage.faq.a2',
        'Not necessarily. Many families prioritize commute, community fit, and support. Use type as a starting point, then shortlist based on age range, curriculum pathway, and total first‑year cost.',
      ),
    },
    {
      q: tr('typesPage.faq.q3', 'How should we shortlist schools after choosing a type?'),
      a: tr(
        'typesPage.faq.a3',
        'Pick your area first (traffic matters), then confirm ages/grade levels and curriculum. Finally, compare fees by asking for the full first‑year total (tuition + one‑time fees + recurring extras).',
      ),
    },
    {
      q: tr('typesPage.faq.q4', 'Can you help us choose?'),
      a: tr(
        'typesPage.faq.a4',
        'Yes. If you share your area, child’s age, and a couple of priorities (curriculum, budget, language support), we’ll suggest a shortlist and the exact questions to send to admissions.',
      ),
    },
  ];

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: tr('nav.home', 'Home'), item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: tr('nav.types', 'Types'), item: `${SITE_URL}${href('/types')}` },
    ],
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <div className="container">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <a href={href('/')}>{tr('nav.home', 'Home')}</a>
        <span aria-hidden="true">/</span>
        <span>{tr('nav.types', 'Types')}</span>
      </nav>

      <section className="hero" style={{ marginTop: 12 }}>
        <div className="heroInner">
          <div>
            <h1>{tr('typesPage.title', 'School types')}</h1>
            <p className="small" style={{ marginTop: 6 }}>
              {tr('typesPage.subtitle', 'Browse schools by type, then open profiles to confirm curriculum, ages, and fees.')}
            </p>
          </div>
          <div className="heroMedia" aria-hidden="true">
            <img src="/img/banners/hero.webp" alt="" />
          </div>
        </div>
      </section>

      <div className="grid" style={{ marginTop: 16 }}>
        {types.map((type) => (
          <div key={type.slug} className="card">
            <h3 style={{ marginTop: 0 }}>
              <a href={href(`/types/${type.slug}`)}>{tr(`typesPage.typeLabels.${type.slug}`, type.name)}</a>
            </h3>
            <div className="small">{tr('typesPage.cards.schoolsCount', '{count} schools', { count: type.count })}</div>
            <div className="inlineLinks" style={{ marginTop: 10 }}>
              <a className="btn btnLink" href={href(`/types/${type.slug}`)}>
                {tr('typesPage.cards.browse', 'Browse')} <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="grid" style={{ marginTop: 16 }}>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>{tr('typesPage.sections.combine.title', 'Combine type with area')}</h2>
          <p className="small" style={{ marginTop: 0 }}>
            {tr(
              'typesPage.sections.combine.body',
              'Type helps you narrow quickly, but commute is often the deciding factor. Pick an area first, then check type.',
            )}
          </p>
          <div className="inlineLinks">
            <a className="btn" href={href('/areas')}>
              {tr('typesPage.sections.combine.areasCta', 'Browse areas')}
            </a>
            <a className="btn" href={href('/schools')}>
              {tr('typesPage.sections.combine.directoryCta', 'Open directory')}
            </a>
          </div>
        </div>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>{tr('typesPage.sections.fees.title', 'Fees & budget')}</h2>
          <p className="small" style={{ marginTop: 0 }}>
            {tr(
              'typesPage.sections.fees.body',
              'Compare schools using total first‑year cost. Budget bands are the fastest way to filter early.',
            )}
          </p>
          <div className="inlineLinks">
            <a className="btn" href={href('/budget')}>
              {tr('typesPage.sections.fees.budgetCta', 'Budget bands')}
            </a>
            <a className="btn" href={href('/fees')}>
              {tr('typesPage.sections.fees.feesCta', 'Fees overview')}
            </a>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>{tr('typesPage.faq.title', 'FAQ')}</h2>
        <div className="faqList">
          {faqItems.map((f) => (
            <details key={f.q} className="faqItem">
              <summary>{f.q}</summary>
              <div className="faqAnswer">
                <p style={{ marginTop: 0 }}>{f.a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    </div>
  );
}
