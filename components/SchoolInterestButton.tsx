'use client';

import { buildSchoolInterestUrl } from '../lib/forms/schoolInterest';
import { useT } from './I18nProvider';

type Props = {
  schoolName: string;
  className?: string;
  labelKey?: 'actions.shareInterest' | 'actions.contactAboutSchool';
};

export default function SchoolInterestButton({
  schoolName,
  className = 'btn btnPrimary',
  labelKey = 'actions.shareInterest',
}: Props) {
  const t = useT();
  const href = buildSchoolInterestUrl(schoolName);

  return (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer">
      {t(labelKey)}
    </a>
  );
}
