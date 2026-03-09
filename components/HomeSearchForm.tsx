'use client';

import { useLocaleHref, useT } from './I18nProvider';

export default function HomeSearchForm({
  areas,
  tags,
  budgets,
}: {
  areas: string[];
  tags: string[];
  budgets: string[];
}) {
  const t = useT();
  const href = useLocaleHref();

  return (
    <form className="heroSearchCard" action={href('/schools')} method="GET">
      <div className="searchGrid">
        <div className="searchField">
          <div className="searchLabel">
            <span className="searchLabelIcon" aria-hidden="true">
              ⌄
            </span>
            {t('homeSearch.area')}
          </div>
          <select className="select" name="area" defaultValue="">
            <option value="">{t('homeSearch.chooseArea')}</option>
            {areas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <div className="searchField">
          <div className="searchLabel">
            <span className="searchLabelIcon" aria-hidden="true">
              ⌁
            </span>
            {t('homeSearch.curriculum')}
          </div>
          <select className="select" name="tag" defaultValue="">
            <option value="">{t('homeSearch.selectCurriculum')}</option>
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>

        <div className="searchField">
          <div className="searchLabel">
            <span className="searchLabelIcon" aria-hidden="true">
              $
            </span>
            {t('homeSearch.budget')}
          </div>
          <select className="select" name="budget" defaultValue="">
            <option value="">{t('homeSearch.selectBudget')}</option>
            {budgets.map((budget) => (
              <option key={budget} value={budget}>
                {budget}
              </option>
            ))}
          </select>
        </div>

        <button className="btn btnPrimary searchBtn" type="submit">
          {t('homeSearch.submit')}
        </button>
      </div>
    </form>
  );
}
