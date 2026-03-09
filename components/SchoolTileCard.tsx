import type { School } from '../lib/schools';
import T from './T';
import SchoolInterestButton from './SchoolInterestButton';
import { getSchoolLogo } from '../lib/schoolLogo';
import SchoolLogoImage from './SchoolLogoImage';

type Props = {
  school: School;
  tileBadges?: string[];
};

export default function SchoolTileCard({ school, tileBadges = [] }: Props) {
  return (
    <div className="schoolTileCard">
      <a className="schoolTile" href={`/schools/${school.id}`}>
        <SchoolLogoImage src={getSchoolLogo(school)} schoolName={school.name} alt={`${school.name} logo`} loading="lazy" />
        <div className="schoolTileShade" aria-hidden="true" />
        <div className="schoolTileContent">
          <div className="schoolTileTitle">{school.name}</div>
          <div className="schoolTileMeta">
            {school.area}
            {school.type ? ` · ${school.type}` : ''}
          </div>
          {tileBadges.length ? (
            <div className="schoolTilePills" aria-label="School tags">
              {tileBadges.map((badge) => (
                <span key={badge} className={`schoolTilePill${badge === 'Sponsored' ? ' schoolTilePillSponsored' : ''}`}>
                  {badge === 'Sponsored' ? <T k="common.sponsored" /> : badge}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </a>
      <div className="schoolTileActions">
        <SchoolInterestButton schoolName={school.name} />
      </div>
    </div>
  );
}
