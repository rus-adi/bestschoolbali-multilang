'use client';

import React from 'react';
import type { School } from '../lib/schools';
import { slugify } from '../lib/slug';
import { getSchoolLogo } from '../lib/schoolLogo';
import { useLocaleHref, useT } from './I18nProvider';
import SchoolInterestButton from './SchoolInterestButton';

const STORAGE_KEY = 'bsb_compare_ids_v1';

function uniq(ids: string[]) {
  const out: string[] = [];
  for (const id of ids) {
    const v = String(id || '').trim();
    if (!v) continue;
    if (!out.includes(v)) out.push(v);
  }
  return out;
}

function parseIdsFromQuery(): string[] {
  if (typeof window === 'undefined') return [];
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('ids');
  if (!raw) return [];
  return uniq(
    raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

function readStoredIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return uniq(parsed.map(String));
    if (typeof raw === 'string') return uniq(raw.split(',').map((s) => s.trim()));
    return [];
  } catch {
    return [];
  }
}

function writeStoredIds(ids: string[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

function buildCompareUrl(ids: string[]) {
  const clean = uniq(ids).slice(0, 4);
  if (!clean.length) return '/compare';
  return `/compare?ids=${encodeURIComponent(clean.join(','))}`;
}

export default function CompareClient({
  schools,
}: {
  schools: Array<
    Pick<
      School,
      'id' | 'name' | 'area' | 'type' | 'fees' | 'budget_category' | 'age_min' | 'age_max' | 'curriculum_tags' | 'map_query' | 'summary'
    >
  >;
}) {
  const byId = React.useMemo(() => new Map(schools.map((s) => [s.id, s] as const)), [schools]);

  const [ids, setIds] = React.useState<string[]>([]);
  const [q, setQ] = React.useState('');
  const t = useT();
  const href = useLocaleHref();

  React.useEffect(() => {
    const fromQuery = parseIdsFromQuery();
    if (fromQuery.length) {
      setIds(fromQuery.slice(0, 4));
      writeStoredIds(fromQuery.slice(0, 4));
      return;
    }

    const stored = readStoredIds();
    if (stored.length) setIds(stored.slice(0, 4));
  }, []);

  React.useEffect(() => {
    writeStoredIds(ids);
  }, [ids]);

  const selected = React.useMemo(() => ids.map((id) => byId.get(id)).filter(Boolean) as School[], [ids, byId]);

  const suggestions = React.useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    const exclude = new Set(ids);
    return schools
      .filter((s) => !exclude.has(s.id))
      .filter((s) => {
        const blob = `${s.name} ${s.area} ${s.type ?? ''} ${(s.curriculum_tags ?? []).join(' ')}`.toLowerCase();
        return blob.includes(query);
      })
      .slice(0, 8);
  }, [q, ids, schools]);

  function add(id: string) {
    setIds((prev) => uniq(prev.concat(id)).slice(0, 4));
    setQ('');
  }

  function remove(id: string) {
    setIds((prev) => prev.filter((x) => x !== id));
  }

  function clear() {
    setIds([]);
    setQ('');
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('ids');
      window.history.replaceState({}, '', url.toString());
    }
  }

  async function copyLink() {
    const url = typeof window !== 'undefined' ? `${window.location.origin}${href(buildCompareUrl(ids))}` : '';
    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);
      alert(t('actions.copyLink'));
    } catch {
      try {
        const el = document.createElement('textarea');
        el.value = url;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        alert(t('actions.copyLink'));
      } catch {
        alert(t('actions.copyFailed'));
      }
    }
  }

  const compareUrl = href(buildCompareUrl(ids));

  return (
    <div>
      <div className="compareBar">
        <div className="small">
          <strong>{ids.length}</strong> {t('search.selected')}
          {ids.length < 2 ? <span className="muted"> · {t('search.addAtLeastTwo')}</span> : null}
        </div>
        <div className="inlineLinks" style={{ marginTop: 0 }}>
          <a className="btn" href={href('/schools')}>
            {t('actions.browseSchools')}
          </a>
          <button className="btn" type="button" onClick={copyLink} disabled={!ids.length}>
            {t('actions.copyLink')}
          </button>
          <button className="btn" type="button" onClick={clear} disabled={!ids.length}>
            {t('actions.clear')}
          </button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>{t('search.addSchools')}</h2>
        <p className="small" style={{ marginTop: 0 }}>
          {t('search.quickCompareNote')}
        </p>

        <div className="compareAdd">
          <input
            className="input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('search.placeholderCompare')}
            aria-label={t('search.searchSchoolsToAdd')}
          />

          {suggestions.length ? (
            <div className="compareSuggest" role="listbox" aria-label={t('search.suggestions')}>
              {suggestions.map((s) => (
                <button key={s.id} className="compareSuggestItem" type="button" onClick={() => add(s.id)}>
                  <span className="compareSuggestTitle">{s.name}</span>
                  <span className="small compareSuggestMeta">
                    {s.area}
                    {s.type ? ` · ${s.type}` : ''}
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {selected.length ? (
          <div className="compareSelected" style={{ marginTop: 12 }}>
            {selected.map((s) => (
              <div key={s.id} className="compareChip">
                <img src={getSchoolLogo(s)} alt="" aria-hidden="true" />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 800, lineHeight: 1.2 }}>
                    <a href={href(`/schools/${s.id}`)}>{s.name}</a>
                  </div>
                  <div className="small">
                    <a href={href(`/areas/${slugify(s.area)}`)}>{s.area}</a>
                  </div>
                </div>
                <button className="btn btnTiny" type="button" onClick={() => remove(s.id)} aria-label={`${t('actions.remove')} ${s.name}`}>
                  {t('actions.remove')}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="small" style={{ marginTop: 12 }}>
            {t('search.tipCompareToggle')}
          </p>
        )}
      </div>

      {selected.length >= 2 ? (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="sectionHead">
            <h2 style={{ margin: 0 }}>{t('search.sideBySide')}</h2>
            <a className="sectionLink" href={compareUrl} aria-label={t('search.shareableCompareLink')}>
              {t('actions.shareThisView')}
            </a>
          </div>

          <div className="compareTableWrap" style={{ marginTop: 14 }}>
            <table className="compareTable">
              <thead>
                <tr>
                  <th scope="col">{t('search.field')}</th>
                  {selected.map((s) => (
                    <th key={s.id} scope="col">
                      <a href={href(`/schools/${s.id}`)}>{s.name}</a>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">{t('search.area')}</th>
                  {selected.map((s) => (
                    <td key={s.id}>
                      <a href={href(`/areas/${slugify(s.area)}`)}>{s.area}</a>
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row">{t('search.type')}</th>
                  {selected.map((s) => (
                    <td key={s.id}>{s.type ?? '—'}</td>
                  ))}
                </tr>
                <tr>
                  <th scope="row">{t('search.ages')}</th>
                  {selected.map((s) => (
                    <td key={s.id}>
                      {typeof s.age_min === 'number' && typeof s.age_max === 'number' ? `${s.age_min}–${s.age_max}` : t('search.notListed')}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row">{t('search.curriculum')}</th>
                  {selected.map((s) => (
                    <td key={s.id}>
                      {(s.curriculum_tags ?? []).length ? (s.curriculum_tags ?? []).slice(0, 8).join(', ') : t('search.notListed')}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row">{t('search.budget')}</th>
                  {selected.map((s) => (
                    <td key={s.id}>{s.budget_category ?? '—'}</td>
                  ))}
                </tr>
                <tr>
                  <th scope="row">{t('search.feesLabel')}</th>
                  {selected.map((s) => (
                    <td key={s.id}>
                      {s.fees?.display ?? t('search.contactSchool')}
                      {s.fees?.status === 'estimate' ? <span className="pill">{t('search.estimate')}</span> : null}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row">{t('search.interest')}</th>
                  {selected.map((s) => (
                    <td key={s.id}>
                      <SchoolInterestButton schoolName={s.name} className="btn btnTiny" />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="inlineLinks" style={{ marginTop: 14 }}>
            <a className="btn" href={href('/fees')}>
              {t('search.feesOverview')}
            </a>
            <a className="btn" href={href('/schools')}>
              {t('actions.browseSchools')}
            </a>
            <a className="btn btnPrimary" href={href('/contact')}>
              {t('nav.cta')}
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
