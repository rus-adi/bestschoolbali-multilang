import type { Metadata } from "next";
import { getAllSchools } from "../../lib/schools";
import CompareClient from "../../components/CompareClient";
import JsonLd from "../../components/JsonLd";
import T from "../../components/T";

export const dynamic = "error";

const SITE_URL = "https://bestschoolbali.com";

export const metadata: Metadata = {
  title: "Compare schools",
  description:
    "Compare a few Bali schools side-by-side: fees, ages, curriculum tags, and area. Use it to shortlist, then confirm the latest details with admissions.",
  alternates: { canonical: `${SITE_URL}/compare` },
  openGraph: {
    title: "Compare schools in Bali",
    description:
      "A practical tool for parents: compare schools by fees, ages, curriculum, and area, then jump into profiles for more detail.",
    url: `${SITE_URL}/compare`,
    images: [{ url: `${SITE_URL}/img/banners/hero.webp` }],
  },
};

export default function ComparePage() {
  const schools = getAllSchools();

  // Avoid sending long profile markdown to the client.
  const schoolsLite = schools.map(({ profile_md, details, highlights, parent_perspectives, ...rest }) => rest);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Compare", item: `${SITE_URL}/compare` },
    ],
  };

  const faqItems = [
    {
      q: "What’s the best way to compare schools fairly?",
      a: "Use the same question list for each school. Compare commute, age/grade coverage, curriculum pathway, and total first-year cost (tuition + one-time fees + recurring extras).",
    },
    {
      q: "Are the fees on this site exact?",
      a: "Fees are best-effort ranges. Schools can update pricing at any time. Always request the latest fee sheet and confirm what’s included.",
    },
    {
      q: "How many schools should we shortlist?",
      a: "Most families shortlist 3–5, then do tours close together so the comparisons are fresh.",
    },
    {
      q: "Can you help us choose?",
      a: "Yes. Share your area, your child’s age, and a couple of priorities (curriculum, language support, budget) and we’ll help you shortlist and draft admissions questions.",
    },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="container">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <a href="/"><T k="nav.home" /></a>
        <span aria-hidden="true">/</span>
        <span><T k="footer.compare" /></span>
      </nav>

      <section className="hero" style={{ marginTop: 12 }}>
        <div className="heroInner">
          <div>
            <h1><T k="comparePage.title" /></h1>
            <p className="small" style={{ marginTop: 6 }}>
              <T k="comparePage.subtitle" />
            </p>
          </div>
          <div className="heroMedia" aria-hidden="true">
            <img src="/img/banners/hero.webp" alt="" />
          </div>
        </div>
      </section>

      <CompareClient schools={schoolsLite} />

      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}><T k="comparePage.faq.title" /></h2>
        <div className="faqList">
          {faqItems.map((f, idx) => (
            <details key={f.q} className="faqItem">
              <summary><T k={`comparePage.faq.q${idx + 1}`} /></summary>
              <div className="faqAnswer">
                <p style={{ marginTop: 0 }}><T k={`comparePage.faq.a${idx + 1}`} /></p>
              </div>
            </details>
          ))}
        </div>
      </div>

      <div className="grid" style={{ marginTop: 16 }}>
        <div className="card">
          <h2 style={{ marginTop: 0 }}><T k="comparePage.sections.area.title" /></h2>
          <p className="small" style={{ marginTop: 0 }}>
            <T k="comparePage.sections.area.body" />
          </p>
          <a className="btn btnLink" href="/compare/areas">
            <T k="comparePage.sections.area.cta" /> <span aria-hidden="true">→</span>
          </a>
        </div>
        <div className="card">
          <h2 style={{ marginTop: 0 }}><T k="comparePage.sections.ages.title" /></h2>
          <p className="small" style={{ marginTop: 0 }}>
            <T k="comparePage.sections.ages.body" />
          </p>
          <a className="btn btnLink" href="/ages">
            <T k="comparePage.sections.ages.cta" /> <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>

      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={faqJsonLd} />
    </div>
  );
}
