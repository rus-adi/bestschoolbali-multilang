import { getAllAreas } from "../../lib/taxonomy";
import T from "../../components/T";
import type { Metadata } from "next";

export const dynamic = "error";

export const metadata: Metadata = {
  title: "Areas in Bali",
  description: "Browse schools by area in Bali and open profiles to compare curriculum, ages, and fees.",
  alternates: { canonical: "https://bestschoolbali.com/areas" },
};

const AREA_THUMBS = new Set([
  "amed",
  "bukit-region",
  "canggu",
  "canggu-sanur",
  "denpasar",
  "sanur",
  "ubud",
]);

export default function AreasPage({ locale = "en" }: { locale?: string }) {
  const areas = getAllAreas(locale);

  return (
    <div className="container">
      <section className="hero">
        <div className="heroInner">
          <div>
            <h1><T k="nav.areas" /></h1>
            <p className="small" style={{ marginTop: 6 }}>
              <T k="schoolsPage.heroSubtitle" />
            </p>
          </div>
          <div className="heroMedia" aria-hidden="true">
            <img src="/img/banners/hero.webp" alt="" />
          </div>
        </div>
      </section>

      <div className="areaScroller" style={{ marginTop: 16 }}>
        {areas.map((a) => {
          const slug = a.slug;
          const count = a.count;
          const thumb = AREA_THUMBS.has(slug) ? `/img/areas/${slug}.webp` : "/img/banners/hero.webp";
          return (
            <a key={a.name} className="areaTile" href={`/areas/${slug}`}>
              <img src={thumb} alt="" loading="lazy" />
              <div className="areaTileBody">
                <div className="areaTileTitle">{a.name}</div>
                <div className="areaTileMeta"><T k="home.schoolsCount" values={{ count }} /></div>
              </div>
            </a>
          );
        })}
      </div>

      <div className="grid" style={{ marginTop: 16 }}>
        <div className="card">
          <h2 style={{ marginTop: 0 }}><T k="schoolsPage.browseBudgetHeading" /></h2>
          <p className="small" style={{ marginTop: 0 }}>
            <T k="schoolsPage.browseBudgetIntro" />
          </p>
          <a className="btn btnLink" href="/budget">
            <T k="schoolsPage.viewBudgetBands" /> <span aria-hidden="true">→</span>
          </a>
        </div>
        <div className="card">
          <h2 style={{ marginTop: 0 }}><T k="schoolsPage.browseTypeHeading" /></h2>
          <p className="small" style={{ marginTop: 0 }}>
            <T k="schoolsPage.browseTypeIntro" />
          </p>
          <a className="btn btnLink" href="/types">
            <T k="schoolsPage.browseSchoolTypes" /> <span aria-hidden="true">→</span>
          </a>
        </div>
        <div className="card">
          <h2 style={{ marginTop: 0 }}><T k="schoolsPage.feesGuideHeading" /></h2>
          <p className="small" style={{ marginTop: 0 }}>
            <T k="schoolsPage.feesGuideIntro" />
          </p>
          <div className="inlineLinks">
            <a className="btn" href="/fees">
              <T k="schoolsPage.feesOverview" />
            </a>
            <a className="btn" href="/fees/estimate">
              <T k="schoolsPage.feeNotes" />
            </a>
          </div>
        </div>
      </div>

      <p className="small" style={{ marginTop: 16 }}>
        <T k="schoolsPage.feesDisclaimer" />
      </p>
    </div>
  );
}
