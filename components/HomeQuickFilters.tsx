'use client';

import { useLocaleHref, useT } from './I18nProvider';

const truncateLabel = (text: string, max = 18) =>
  text.length > max ? `${text.slice(0, Math.max(0, max - 3)).trimEnd()}...` : text;

export default function HomeQuickFilters() {
  const t = useT();
  const href = useLocaleHref();
  const chips = [
    { key: 'home.chipRow.internationalSchools', href: '/schools?q=International', icon: '◎' },
    { key: 'home.chipRow.natureSchool', href: '/schools?tag=Indonesian', icon: '⊙' },
    { key: 'home.chipRow.montessoriIb', href: '/schools?tag=Montessori', icon: '◈' },
    { key: 'home.chipRow.affordablePremium', href: '/schools?budget=Budget', icon: '◍' },
  ] as const;

  return (
    <div className="chipRow" aria-label={t('home.chipRow.label')}>
      {chips.map((chip) => {
        const full = t(chip.key);
        return (
          <a key={chip.key} className="chip" href={href(chip.href)} title={full}>
            <span className="chipIcon" aria-hidden="true">{chip.icon}</span>
            <span className="chipText">{truncateLabel(full)}</span>
          </a>
        );
      })}
    </div>
  );
}

