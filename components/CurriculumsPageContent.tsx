'use client';

import { useLocaleHref, useT } from './I18nProvider';
import type { CurriculumEntry } from '../lib/taxonomy';

function withFallback(value: string, key: string, fallback: string) {
  return value === key ? fallback : value;
}

function applyValues(template: string, values?: Record<string, string | number>) {
  if (!values) return template;
  return template.replace(/\{(.*?)\}/g, (_, key) => String(values[key] ?? `{${key}}`));
}

export default function CurriculumsPageContent({ tags }: { tags: CurriculumEntry[] }) {
  const t = useT();
  const href = useLocaleHref();

  const tr = (key: string, fallback: string, values?: Record<string, string | number>) =>
    applyValues(withFallback(t(key, values), key, fallback), values);

  return (
    <div className="container">
      <section className="hero">
        <div className="heroInner">
          <div>
            <h1>{tr('curriculumsPage.title', 'Curriculums')}</h1>
            <p className="small" style={{ marginTop: 6 }}>
              {tr('curriculumsPage.subtitle', 'Explore schools by curriculum approach.')}
            </p>
          </div>
          <div className="heroMedia" aria-hidden="true">
            <img src="/img/banners/hero.webp" alt="" />
          </div>
        </div>
      </section>

      <div className="grid" style={{ marginTop: 16 }}>
        {tags.map((tag) => (
          <div key={tag.tag} className="card">
            <h3 style={{ marginTop: 0 }}>
              <a href={href(`/curriculums/${tag.slug}`)}>{tag.tag}</a>
            </h3>
            <div className="small">{tr('curriculumsPage.cards.schoolsCount', '{count} schools', { count: tag.count })}</div>
            <div className="inlineLinks" style={{ marginTop: 10 }}>
              <a className="btn btnLink" href={href(`/curriculums/${tag.slug}`)}>
                {tr('curriculumsPage.cards.browse', 'Browse')} <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="grid" style={{ marginTop: 16 }}>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>{tr('curriculumsPage.sections.combine.title', 'Combine curriculum with area')}</h2>
          <p className="small" style={{ marginTop: 0 }}>
            {tr(
              'curriculumsPage.sections.combine.body',
              'Curriculum is important, but daily commute is often the deciding factor. Pick an area first, then shortlist.',
            )}
          </p>
          <div className="inlineLinks">
            <a className="btn" href={href('/areas')}>
              {tr('curriculumsPage.sections.combine.areasCta', 'Browse areas')}
            </a>
            <a className="btn" href={href('/schools')}>
              {tr('curriculumsPage.sections.combine.directoryCta', 'Open directory')}
            </a>
          </div>
        </div>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>{tr('curriculumsPage.sections.types.title', 'Browse by school type')}</h2>
          <p className="small" style={{ marginTop: 0 }}>
            {tr(
              'curriculumsPage.sections.types.body',
              'Type labels can help if you’re looking for something specific (international, bilingual, Montessori, etc.).',
            )}
          </p>
          <div className="inlineLinks">
            <a className="btn" href={href('/types')}>
              {tr('curriculumsPage.sections.types.typesCta', 'School types')}
            </a>
            <a className="btn" href={href('/areas')}>
              {tr('curriculumsPage.sections.types.areasCta', 'Areas')}
            </a>
          </div>
        </div>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>{tr('curriculumsPage.sections.fees.title', 'Fees and budget')}</h2>
          <p className="small" style={{ marginTop: 0 }}>
            {tr(
              'curriculumsPage.sections.fees.body',
              'Compare schools using total first-year cost. Budget bands are a quick way to narrow your shortlist.',
            )}
          </p>
          <div className="inlineLinks">
            <a className="btn" href={href('/budget')}>
              {tr('curriculumsPage.sections.fees.budgetCta', 'Budget bands')}
            </a>
            <a className="btn" href={href('/fees')}>
              {tr('curriculumsPage.sections.fees.feesCta', 'Fees overview')}
            </a>
          </div>
        </div>
      </div>

      <p className="small" style={{ marginTop: 16 }}>
        {tr(
          'curriculumsPage.tip',
          'Tip: You can combine curriculum with area and budget filters on the directory page.',
        )}
      </p>
    </div>
  );
}
