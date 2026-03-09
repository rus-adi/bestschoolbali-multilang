import type { ReactNode } from 'react';
import type { School } from '../lib/schools';
import T from './T';
import SchoolInterestButton from './SchoolInterestButton';
import { getSchoolLogo } from '../lib/schoolLogo';
import SchoolLogoImage from './SchoolLogoImage';

type Props = {
  school: School;
  meta?: ReactNode;
  feeText?: ReactNode;
};

export default function SchoolListCard({ school, meta, feeText }: Props) {
  const schoolImg = getSchoolLogo(school);

  return (
    <div className="card schoolCard schoolCardWithActions">
      <a className="schoolCardMedia schoolCardMediaLink" href={`/schools/${school.id}`} aria-label={school.name}>
        <SchoolLogoImage src={schoolImg} schoolName={school.name} alt={`${school.name} logo`} loading="lazy" />
      </a>
      <div className="schoolCardBody">
        <div className="schoolCardTitle">
          <a href={`/schools/${school.id}`}>{school.name}</a>
          {school.verification?.status === 'verified' ? (
            <span className="pill">
              <T k="common.verified" />
            </span>
          ) : null}
          {school.sponsorship?.sponsored ? (
            <span className="pill pillSponsored">
              <T k="common.sponsored" />
            </span>
          ) : null}
        </div>
        {meta ? <div className="small">{meta}</div> : null}
        <div className="small" style={{ marginTop: 6 }}>
          <strong>
            <T k="school.feesLabel" />:
          </strong>{' '}
          {feeText ?? school.fees?.display ?? <T k="school.contactSchool" />}
          {school.fees?.status === 'estimate' ? (
            <span className="pill">
              <T k="school.estimate" />
            </span>
          ) : null}
        </div>
      </div>
      <div className="schoolCardActions">
        <a className="btn" href={`/schools/${school.id}`}>
          <T k="actions.view" />
        </a>
        <SchoolInterestButton schoolName={school.name} />
      </div>
    </div>
  );
}
