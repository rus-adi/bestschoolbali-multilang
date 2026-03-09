'use client';

import React from 'react';
import type { School } from '../lib/schools';
import { slugify } from '../lib/slug';
import { getSchoolLogo } from '../lib/schoolLogo';
import { useLocaleHref, useT } from './I18nProvider';
import SchoolInterestButton from './SchoolInterestButton';
import SchoolLogoImage from './SchoolLogoImage';

const COMPARE_STORAGE_KEY = 'bsb_compare_ids_v1';

function uniq(ids: string[]) {
  const out: string[] = [];
  for (const id of ids) {
    const v = String(id || '').trim();
    if (!v) continue;
    if (!out.includes(v)) out.push(v);
  }
  return out;
}

function readCompareIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(COMPARE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return uniq(parsed.map(String));
    return uniq(String(raw).split(',').map((s) => s.trim()));
  } catch {
    return [];
  }
}

function writeCompareIds(ids: string[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

export default function SchoolSearchClient({
  schools,
  maxResults = 12,
  showDirectoryLink = true,
}: {
  schools: School[];
  maxResults?: number;
  showDirectoryLink?: boolean;
}) {
  const [q, setQ] = React.useState('');
  const [area, setArea] = React.useState('All');
  const [tag, setTag] = React.useState('All');
  const [budget, setBudget] = React.useState('All');

  const [compareIds, setCompareIds] = React.useState<string[]>([]);
  const t = useT();
  const href = useLocaleHref();

  React.useEffect(() => {
    setCompareIds(readCompareIds());
  }, []);

  React.useEffect(() => {
    writeCompareIds(compareIds);
  }, [compareIds]);

  function toggleCompare(id: string) {
    setCompareIds((prev) => {
      const has = prev.includes(id);
      const next = has ? prev.filter((x) => x !== id) : uniq(prev.concat(id));
      return next.slice(0, 4);
    });
  }

  function clearCompare() {
    setCompareIds([]);
  }

  const compareUrl = compareIds.length ? href(`/compare?ids=${encodeURIComponent(compareIds.join(','))}`) : href('/compare');

  const areas = React.useMemo(() => {
    const set = new Set(schools.map((s) => s.area).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [schools]);

  const tags = React.useMemo(() => {
    // Normalize by slug to avoid duplicates like "Nature-Based" vs "Nature-based".
    const buckets = new Map<
      string,
      {
        count: number;
        variants: Map<string, number>;
      }
    >();

    for (const s of schools) {
      for (const raw of s.curriculum_tags ?? []) {
        const tag = String(raw ?? '').trim();
        if (!tag) continue;
        const slug = slugify(tag);
        const bucket = buckets.get(slug) ?? { count: 0, variants: new Map<string, number>() };
        bucket.count += 1;
        bucket.variants.set(tag, (bucket.variants.get(tag) ?? 0) + 1);
        buckets.set(slug, bucket);
      }
    }

    const displays: string[] = [];
    for (const [slug, b] of buckets.entries()) {
      let display = slug;
      let best = -1;
      for (const [variant, c] of b.variants.entries()) {
        if (c > best || (c === best && variant.length < display.length)) {
          best = c;
          display = variant;
        }
      }
      displays.push(display);
    }

    return ['All', ...displays.sort((a, b) => a.localeCompare(b))];
  }, [schools]);

  const budgets = React.useMemo(() => {
    const set = new Set<string>();
    for (const s of schools) if (s.budget_category) set.add(s.budget_category);
    const order = ['Budget', 'Mid-range', 'Premium', 'Luxury'];
    const sorted = Array.from(set).sort((a, b) => {
      const ai = order.indexOf(a);
      const bi = order.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
    return ['All', ...sorted];
  }, [schools]);

  const didInitFromQuery = React.useRef(false);

  React.useEffect(() => {
    if (didInitFromQuery.current) return;
    if (typeof window === 'undefined') return;
    didInitFromQuery.current = true;

    const params = new URLSearchParams(window.location.search);
    const qParam = params.get('q');
    const areaParam = params.get('area');
    const tagParam = params.get('tag');
    const budgetParam = params.get('budget');

    if (qParam) setQ(qParam);
    if (areaParam && areas.includes(areaParam)) setArea(areaParam);
    if (tagParam) {
      if (tags.includes(tagParam)) {
        setTag(tagParam);
      } else {
        // Also accept a slug value in the URL.
        const match = tags.find((t) => slugify(t) === slugify(tagParam));
        if (match) setTag(match);
      }
    }
    if (budgetParam && budgets.includes(budgetParam)) setBudget(budgetParam);
  }, [areas, tags, budgets]);

  const filtered = React.useMemo(() => {
    const query = q.trim().toLowerCase();
    const tagSlug = tag !== 'All' ? slugify(tag) : '';
    return schools.filter((s) => {
      if (area !== 'All' && s.area !== area) return false;
      if (tag !== 'All' && !(s.curriculum_tags ?? []).some((t) => slugify(t) === tagSlug)) return false;
      if (budget !== 'All' && (s.budget_category ?? '') !== budget) return false;
      if (!query) return true;

      const blob = [
        s.name,
        s.area,
        s.type ?? '',
        s.budget_category ?? '',
        ...(s.curriculum_tags ?? []),
      ]
        .join(' ')
        .toLowerCase();
      return blob.includes(query);
    });
  }, [schools, q, area, tag, budget]);

  return (
    <div>
      <div className="compareBar">
        <div className="small">
          <strong>{compareIds.length}</strong> {t('search.selectedCompare')}
          {compareIds.length < 2 ? <span className="muted"> · {t('search.addAtLeastTwo')}</span> : null}
        </div>
        <div className="inlineLinks" style={{ marginTop: 0 }}>
          <a className="btn" href={compareUrl}>
            {t('actions.compare')}
          </a>
          <button className="btn" type="button" onClick={clearCompare} disabled={!compareIds.length}>
            {t('actions.clear')}
          </button>
        </div>
      </div>

      <div className="controls">
        <div>
          <label className="small">{t('search.search')}</label>
          <input
            className="input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('search.placeholderSchool')}
          />
        </div>
        <div>
          <label className="small">{t('search.area')}</label>
          <select className="select" value={area} onChange={(e) => setArea(e.target.value)}>
            {areas.map((a) => (
              <option key={a} value={a}>
                {a === 'All' ? t('common.all') : a}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="small">{t('search.curriculum')}</label>
          <select className="select" value={tag} onChange={(e) => setTag(e.target.value)}>
            {tags.map((tagValue) => (
              <option key={tagValue} value={tagValue}>
                {tagValue === 'All' ? t('common.all') : tagValue}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="small">{t('search.budget')}</label>
          <select className="select" value={budget} onChange={(e) => setBudget(e.target.value)}>
            {budgets.map((b) => (
              <option key={b} value={b}>
                {b === 'All' ? t('common.all') : b}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginTop: 12 }} className="small">
        {t('search.showing', { shown: filtered.length, total: schools.length })}
        {showDirectoryLink ? (
          <>
            {' '}· <a href={href('/schools')}>{t('actions.openDirectory')}</a>
          </>
        ) : null}
      </div>

      <div style={{ marginTop: 12 }} className="grid">
        {filtered.slice(0, maxResults).map((s) => {
          const icon = getSchoolLogo(s);
          const tagsPreview = (s.curriculum_tags ?? []).slice(0, 5);
          const selected = compareIds.includes(s.id);
          return (
            <div key={s.id} className="card">
              <div className="schoolCardTop">
                <SchoolLogoImage className="favicon" src={icon} schoolName={s.name} alt={`${s.name} logo`} loading="lazy" />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 800, lineHeight: 1.25 }}>
                    <a href={href(`/schools/${s.id}`)}>{s.name}</a>
                    {s.verification?.status === 'verified' ? <span className="pill">{t('common.verified')}</span> : null}
                    {s.sponsorship?.sponsored ? <span className="pill pillSponsored">{t('common.sponsored')}</span> : null}
                  </div>
                  <div className="small">
                    <a href={href(`/areas/${slugify(s.area)}`)}>{s.area}</a>
                    {s.type ? ` · ${s.type}` : ''}
                  </div>
                </div>

                <button
                  type="button"
                  className={selected ? 'comparePill isOn' : 'comparePill'}
                  onClick={() => toggleCompare(s.id)}
                  aria-pressed={selected}
                >
                  {selected ? t('actions.added') : t('actions.compare')}
                </button>
              </div>

              {s.budget_category || tagsPreview.length ? (
                <div className="tagRow">
                  {s.budget_category ? (
                    <span className="tag" title={t('search.budgetBands')}>
                      {s.budget_category}
                    </span>
                  ) : null}
                  {tagsPreview.map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="small" style={{ marginTop: 10 }}>
                <strong>{t('search.feesLabel')}</strong> {s.fees?.display ?? t('search.callForFees')}
                {s.fees?.status === 'estimate' ? <span className="pill">{t('search.estimate')}</span> : null}
              </div>

              <div className="inlineLinks">
                <a className="btn" href={href(`/schools/${s.id}`)}>
                  {t('actions.view')}
                </a>
                <SchoolInterestButton schoolName={s.name} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
