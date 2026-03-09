import type { Metadata } from 'next';
import { getAllPosts, getLatestPost } from '../lib/posts';
import { getAllSchools, type School } from '../lib/schools';
import { slugify } from '../lib/slug';
import { getAllBudgets, getAllCurriculums } from '../lib/taxonomy';
import { getSponsoredSchools } from '../lib/sort';
import HomeSearchForm from '../components/HomeSearchForm';
import T from '../components/T';
import SchoolTileCard from '../components/SchoolTileCard';

const SITE_URL = 'https://bestschoolbali.com';

const AREA_THUMBS = new Set(['amed', 'bukit-region', 'canggu', 'canggu-sanur', 'denpasar', 'sanur', 'ubud']);

export const dynamic = 'error';

export const metadata: Metadata = {
  title: 'Best School Bali',
  description:
    'A practical directory for families: compare schools in Bali by area, curriculum, ages, and budget. View fees ranges and admissions notes, then shortlist with confidence.',
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: 'Best School Bali',
    description:
      'Compare schools in Bali by area, curriculum, ages, and budget — with fee ranges, profiles, and practical guidance for parents.',
    url: SITE_URL,
    images: [{ url: `${SITE_URL}/img/banners/hero.webp` }],
  },
};

function uniqueSorted(items: string[]) {
  return Array.from(new Set(items.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function topSchools(all: School[]) {
  const lookup = new Map(all.map((s) => [s.id, s] as const));
  const ids = ['green-school-bali', 'canggu-community-school', 'bali-island-school', 'acs-bali'];
  const picked = ids.map((id) => lookup.get(id)).filter(Boolean) as School[];
  if (picked.length) return picked;
  return all.slice(0, 4);
}

export default function HomePage() {
  const latest = getLatestPost();
  const schools = getAllSchools();
  const posts = getAllPosts();

  const areas = uniqueSorted(schools.map((s) => s.area));
  const areaCounts = new Map<string, number>();
  for (const s of schools) areaCounts.set(s.area, (areaCounts.get(s.area) ?? 0) + 1);

  const tags = getAllCurriculums().map((t) => t.tag);
  const budgets = getAllBudgets().map((b) => b.name);
  const featured = topSchools(schools);
  const sponsored = getSponsoredSchools(schools).slice(0, 4);

  return (
    <div>
      <section className="homeHero">
        <div className="container">
          <div className="homeHeroInner">
            <div className="heroContent">
              <h1 className="homeHeroTitle">
                <T k="home.heroTitleLead" /> <span className="accent"><T k="home.heroTitleAccent" /></span>{' '}
                <T k="home.heroTitleTail" />
              </h1>
              <p className="homeHeroSubtitle">
                <T k="home.heroSubtitle" />
              </p>

              <div className="heroBadges" aria-label="Highlights">
                <div className="badgePill">
                  <span className="badgeIcon" aria-hidden="true">✓</span>
                  <T k="home.badgeVerified" />
                </div>
                <div className="badgePill">
                  <span className="badgeIcon" aria-hidden="true">★</span>
                  <T k="home.badgeParents" />
                </div>
                <div className="badgePill">
                  <span className="badgeIcon" aria-hidden="true">☎</span>
                  <T k="home.badgeGuidance" />
                </div>
              </div>

              <HomeSearchForm areas={areas} tags={tags} budgets={budgets} />
            </div>

            <div className="homeHeroMedia" aria-hidden="true">
              <img src="/img/hero/home-hero.webp" alt="" />
            </div>
          </div>

          <div className="chipRow" aria-label="Quick filters">
            <a className="chip" href="/schools?q=International">
              <span className="chipIcon" aria-hidden="true">◎</span>
              <T k="home.quickFilterInternational" />
            </a>
            <a className="chip" href="/schools?tag=Indonesian">
              <span className="chipIcon" aria-hidden="true">⊙</span>
              <T k="home.quickFilterLocal" />
            </a>
            <a className="chip" href="/schools?tag=Montessori">
              <span className="chipIcon" aria-hidden="true">◈</span>
              <T k="home.quickFilterMontessoriIb" />
            </a>
            <a className="chip" href="/schools?budget=Budget">
              <span className="chipIcon" aria-hidden="true">◍</span>
              <T k="home.quickFilterAffordable" />
            </a>
          </div>
        </div>
      </section>

      {sponsored.length ? (
        <section className="section">
          <div className="container">
            <div className="sectionHead">
              <h2><T k="home.sponsoredHeading" /></h2>
              <a className="sectionLink" href="/methodology">
                <T k="home.sponsoredLink" /> <span aria-hidden="true">→</span>
              </a>
            </div>

            <div className="tileGrid">
              {sponsored.map((s) => (
                <SchoolTileCard
                  key={s.id}
                  school={s}
                  tileBadges={['Sponsored', ...(s.budget_category ? [s.budget_category] : []), ...((s.curriculum_tags ?? []).slice(0, 1))]}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="section">
        <div className="container">
          <div className="sectionHead">
            <h2><T k="home.topHeading" /></h2>
            <a className="sectionLink" href="/schools">
              <T k="home.topLink" /> <span aria-hidden="true">→</span>
            </a>
          </div>

          <div className="tileGrid">
            {featured.map((s) => (
              <SchoolTileCard
                key={s.id}
                school={s}
                tileBadges={[...(s.budget_category ? [s.budget_category] : []), ...((s.curriculum_tags ?? []).slice(0, 2))]}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="sectionHead">
            <h2><T k="home.areasHeading" /></h2>
            <a className="sectionLink" href="/areas">
              <T k="home.areasLink" /> <span aria-hidden="true">→</span>
            </a>
          </div>

          <div className="areaScroller">
            {areas.map((a) => {
              const slug = slugify(a);
              const count = areaCounts.get(a) ?? 0;
              const thumb = AREA_THUMBS.has(slug) ? `/img/areas/${slug}.webp` : '/img/banners/hero.webp';
              return (
                <a key={a} className="areaTile" href={`/areas/${slug}`}>
                  <img src={thumb} alt="" loading="lazy" />
                  <div className="areaTileBody">
                    <div className="areaTileTitle">{a}</div>
                    <div className="areaTileMeta">
                      <T k="home.schoolsCount" values={{ count }} />
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="sectionHead">
            <h2><T k="home.feesHeading" /></h2>
            <a className="sectionLink" href="/fees">
              <T k="home.feesLink" /> <span aria-hidden="true">→</span>
            </a>
          </div>

          <div className="grid" style={{ marginTop: 14 }}>
            <div className="card">
              <h3 style={{ marginTop: 0 }}><T k="home.feesCardBrowseBudgetTitle" /></h3>
              <p className="small" style={{ marginTop: 0 }}>
                <T k="home.feesCardBrowseBudgetBody" />
              </p>
              <a className="btn btnLink" href="/budget">
                <T k="home.feesCardBrowseBudgetAction" /> <span aria-hidden="true">→</span>
              </a>
            </div>
            <div className="card">
              <h3 style={{ marginTop: 0 }}><T k="home.feesCardBrowseTypeTitle" /></h3>
              <p className="small" style={{ marginTop: 0 }}>
                <T k="home.feesCardBrowseTypeBody" />
              </p>
              <a className="btn btnLink" href="/types">
                <T k="home.feesCardBrowseTypeAction" /> <span aria-hidden="true">→</span>
              </a>
            </div>
            <div className="card">
              <h3 style={{ marginTop: 0 }}><T k="home.feesCardFeeNotesTitle" /></h3>
              <p className="small" style={{ marginTop: 0 }}>
                <T k="home.feesCardFeeNotesBody" />
              </p>
              <a className="btn btnLink" href="/fees/estimate">
                <T k="home.feesCardFeeNotesAction" /> <span aria-hidden="true">→</span>
              </a>
            </div>
            <div className="card">
              <h3 style={{ marginTop: 0 }}><T k="home.feesCardMethodologyTitle" /></h3>
              <p className="small" style={{ marginTop: 0 }}>
                <T k="home.feesCardMethodologyBody" />
              </p>
              <a className="btn btnLink" href="/methodology">
                <T k="home.feesCardMethodologyAction" /> <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="sectionHead">
            <h2><T k="home.guideHeading" /></h2>
            <a className="sectionLink" href="/posts">
              <T k="home.guideLink" /> <span aria-hidden="true">→</span>
            </a>
          </div>

          {!latest ? (
            <p className="small"><T k="home.noPosts" /></p>
          ) : (
            <div className="grid" style={{ marginTop: 14 }}>
              <div className="card">
                <h3 style={{ marginTop: 0 }}>
                  <a href={`/posts/${latest.slug}`}>{latest.title}</a>
                </h3>
                <div className="small">{latest.date}</div>
                <p>{latest.excerpt}</p>
                <a className="btn btnLink" href={`/posts/${latest.slug}`}>
                  <T k="home.readMore" /> <span aria-hidden="true">→</span>
                </a>
              </div>

              <div className="card">
                <h3 style={{ marginTop: 0 }}><T k="home.morePosts" /></h3>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {posts.slice(0, 5).map((p) => (
                    <li key={p.slug} style={{ marginBottom: 8 }}>
                      <a href={`/posts/${p.slug}`}>{p.title}</a>
                      <div className="small">{p.date}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
