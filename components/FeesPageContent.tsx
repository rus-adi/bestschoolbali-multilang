'use client';

import { useLocaleHref, useT } from './I18nProvider';
import type { BudgetEntry } from '../lib/taxonomy';

function withFallback(value: string, key: string, fallback: string) {
  return value === key ? fallback : value;
}

function applyValues(template: string, values?: Record<string, string | number>) {
  if (!values) return template;
  return template.replace(/\{(.*?)\}/g, (_, key) => String(values[key] ?? `{${key}}`));
}

export default function FeesPageContent({
  budgets,
  listed,
  estimate,
  total,
}: {
  budgets: BudgetEntry[];
  listed: number;
  estimate: number;
  total: number;
}) {
  const t = useT();
  const href = useLocaleHref();

  const tr = (key: string, fallback: string, values?: Record<string, string | number>) =>
    applyValues(withFallback(t(key, values), key, fallback), values);

  return (
    <div className="container">
      <section className="hero">
        <div className="heroInner">
          <div>
            <h1>{tr('feesPage.title', 'School fees in Bali')}</h1>
            <p className="small" style={{ marginTop: 6 }}>
              {tr(
                'feesPage.subtitle',
                'Fees are a moving target. This directory shows best-effort ranges as a starting point — then you confirm the latest fee sheet directly with admissions.',
              )}
            </p>
          </div>
          <div className="heroMedia" aria-hidden="true">
            <img src="/img/banners/hero.webp" alt="" />
          </div>
        </div>
      </section>

      <div className="grid" style={{ marginTop: 16 }}>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>{tr('feesPage.meaning.title', 'What the fee numbers usually mean')}</h2>
          <p className="small" style={{ marginTop: 0 }}>
            {tr(
              'feesPage.meaning.body',
              'Many schools quote tuition per year. The part families miss is the “first-year total” — tuition plus one‑time registration, uniforms, transport, meals, exams, and activities.',
            )}
          </p>
          <ul style={{ marginBottom: 0 }}>
            <li>
              <strong>{tr('feesPage.meaning.listedLabel', 'Listed')}</strong>: {tr('feesPage.meaning.listedBody', 'a fee range publicly available (still confirm the latest).')}
            </li>
            <li>
              <strong>{tr('feesPage.meaning.estimateLabel', 'Estimate')}</strong>: {tr('feesPage.meaning.estimateBody', 'best-effort range based on available info; always request the school’s current fee table.')}
            </li>
          </ul>
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>{tr('feesPage.coverage.title', 'Directory coverage')}</h2>
          <p className="small" style={{ marginTop: 0 }}>
            {tr(
              'feesPage.coverage.body',
              'Out of {total} schools in the directory, {listed} have publicly listed ranges and {estimate} are best-effort estimates.',
              { total, listed, estimate },
            )}
          </p>
          <div className="inlineLinks">
            <a className="btn" href={href('/fees/estimate')}>
              {tr('feesPage.coverage.seeFeeNotes', 'See fee notes')}
            </a>
            <a className="btn" href={href('/budget')}>
              {tr('feesPage.coverage.browseByBudget', 'Browse by budget')}
            </a>
            <a className="btn btnPrimary" href={href('/contact')}>
              {tr('feesPage.coverage.getFreeGuidance', 'Get free guidance')}
            </a>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>{tr('feesPage.budgetBand.title', 'Browse by budget band')}</h2>
        <p className="small" style={{ marginTop: 0 }}>
          {tr(
            'feesPage.budgetBand.body',
            'Budget bands help you narrow quickly. Within any band, you’ll still see differences by age level and what’s included.',
          )}
        </p>
        <div className="tagRow">
          {budgets.map((b) => (
            <a key={b.slug} className="tag" href={href(`/budget/${b.slug}`)}>
              {tr(`feesPage.budgetBand.labels.${b.slug}`, b.name)} ({b.count})
            </a>
          ))}
        </div>
      </div>

      <div className="grid" style={{ marginTop: 16 }}>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>{tr('feesPage.questions.title', 'Questions to ask every school')}</h2>
          <ol style={{ marginBottom: 0 }}>
            <li>{tr('feesPage.questions.q1', 'What is the total first-year cost (tuition + one-time fees)?')}</li>
            <li>{tr('feesPage.questions.q2', 'What is included (uniforms, meals, transport, books, exams, activities)?')}</li>
            <li>{tr('feesPage.questions.q3', 'Are there discounts (siblings, mid-year entry) or payment plans?')}</li>
            <li>{tr('feesPage.questions.q4', 'What refunds apply if plans change?')}</li>
            <li>{tr('feesPage.questions.q5', 'Are there additional support fees (EAL/learning support)?')}</li>
          </ol>
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>{tr('feesPage.shortlist.title', 'Prefer a short list?')}</h2>
          <p className="small" style={{ marginTop: 0 }}>
            {tr(
              'feesPage.shortlist.body',
              'Tell us your area, your child’s age, and the curriculum you want. We’ll help you shortlist and prepare a simple script for admissions calls.',
            )}
          </p>
          <div className="inlineLinks">
            <a className="btn" href={href('/schools')}>
              {tr('feesPage.shortlist.browseAllSchools', 'Browse all schools')}
            </a>
            <a className="btn" href={href('/methodology')}>
              {tr('feesPage.shortlist.howWeLabelFees', 'How we label fees')}
            </a>
            <a className="btn btnPrimary" href={href('/contact')}>
              {tr('feesPage.shortlist.getFreeGuidance', 'Get free guidance')}
            </a>
          </div>
        </div>
      </div>

      <p className="small" style={{ marginTop: 16 }}>
        {tr('feesPage.disclaimer', 'Disclaimer: fee data changes frequently. Always confirm directly with the school.')}
      </p>
    </div>
  );
}
