import { getAllSchools } from "../../lib/schools";
import { sortSchoolsForMarketplace } from "../../lib/sort";
import SchoolSearchClient from "../../components/SchoolSearchClient";
import type { Metadata } from "next";
import JsonLd from "../../components/JsonLd";
import T from "../../components/T";
import { isLocale, localizeHref, type Locale } from "../../lib/i18n/locales";

export const dynamic = "error";

const SITE_URL = "https://bestschoolbali.com";

export const metadata: Metadata = {
  title: "Schools in Bali",
  description: "Search schools in Bali by area, curriculum, ages, and budget. Compare fees and open profiles for admissions notes.",
  alternates: { canonical: `${SITE_URL}/schools` },
  openGraph: {
    title: "Schools in Bali",
    description: "Search and filter Bali schools, then compare fees and curriculum pathways.",
    url: `${SITE_URL}/schools`,
    images: [{ url: `${SITE_URL}/img/banners/canggu.webp` }],
  },
};

export default function SchoolsPage({ locale = "en" }: { locale?: string }) {
  const localeValue: Locale = isLocale(locale) ? locale : "en";
  const href = (path: string) => localizeHref(path, localeValue);

  const schools = sortSchoolsForMarketplace(getAllSchools(localeValue));

  // Avoid sending long profile markdown to the client.
  const schoolsLite = schools.map(({ profile_md, details, highlights, parent_perspectives, ...rest }) => rest);

  const faqItems = [
    {
      qKey: "schoolsPage.faq.q1",
      qDefault: "How do we shortlist schools in Bali?",
      aKey: "schoolsPage.faq.a1",
      aDefault:
        "Start with commute/area, then match age range and curriculum. After that, compare total first-year cost and ask about admissions steps and availability.",
    },
    {
      qKey: "schoolsPage.faq.q2",
      qDefault: "Are the fees exact?",
      aKey: "schoolsPage.faq.a2",
      aDefault:
        "Fees are best-effort annual ranges. Schools can update fees at any time, so always request the latest fee sheet and confirm what’s included.",
    },
    {
      qKey: "schoolsPage.faq.q3",
      qDefault: "What should we ask during a school tour?",
      aKey: "schoolsPage.faq.a3",
      aDefault:
        "Ask about class sizes, language support, learning support options, start dates, and what fees include (registration, uniforms, transport, meals, exams).",
    },
    {
      qKey: "schoolsPage.faq.q4",
      qDefault: "Can you help us choose a shortlist?",
      aKey: "schoolsPage.faq.a4",
      aDefault:
        "Yes. Share your area, your child’s age, and a couple of preferences and we’ll suggest a shortlist plus a simple question list to send to admissions.",
    },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((f) => ({
      "@type": "Question",
      name: f.qDefault,
      acceptedAnswer: { "@type": "Answer", text: f.aDefault },
    })),
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: schools.slice(0, 250).map((s, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: `${SITE_URL}/schools/${s.id}`,
      name: s.name,
    })),
  };

  return (
    <div className="container">
      <section className="hero">
        <div className="heroInner">
          <div>
            <h1><T k="schoolsPage.heroTitle" /></h1>
            <p className="small" style={{ marginTop: 6 }}>
              <T k="schoolsPage.heroSubtitle" />
            </p>
          </div>
          <div className="heroMedia" aria-hidden="true">
            <img src="/img/banners/canggu.webp" alt="" />
          </div>
        </div>
      </section>

      <div className="card" style={{ marginTop: 16 }}>
        <SchoolSearchClient schools={schoolsLite} maxResults={200} showDirectoryLink={false} />
      </div>

      <div className="grid" style={{ marginTop: 16 }}>
        <div className="card">
          <h2 style={{ marginTop: 0 }}><T k="schoolsPage.browseBudgetHeading" /></h2>
          <p className="small" style={{ marginTop: 0 }}>
            <T k="schoolsPage.browseBudgetIntro" />
          </p>
          <a className="btn btnLink" href={href('/budget')}>
            <T k="schoolsPage.viewBudgetBands" /> <span aria-hidden="true">→</span>
          </a>
        </div>
        <div className="card">
          <h2 style={{ marginTop: 0 }}><T k="schoolsPage.browseAgeHeading" /></h2>
          <p className="small" style={{ marginTop: 0 }}>
            <T k="schoolsPage.browseAgeIntro" />
          </p>
          <a className="btn btnLink" href={href('/ages')}>
            <T k="schoolsPage.browseByAge" /> <span aria-hidden="true">→</span>
          </a>
        </div>
        <div className="card">
          <h2 style={{ marginTop: 0 }}><T k="schoolsPage.browseTypeHeading" /></h2>
          <p className="small" style={{ marginTop: 0 }}>
            <T k="schoolsPage.browseTypeIntro" />
          </p>
          <a className="btn btnLink" href={href('/types')}>
            <T k="schoolsPage.browseSchoolTypes" /> <span aria-hidden="true">→</span>
          </a>
        </div>
        <div className="card">
          <h2 style={{ marginTop: 0 }}><T k="schoolsPage.compareToolHeading" /></h2>
          <p className="small" style={{ marginTop: 0 }}>
            <T k="schoolsPage.compareToolIntro" />
          </p>
          <a className="btn btnLink" href={href('/compare')}>
            <T k="schoolsPage.compareSchools" /> <span aria-hidden="true">→</span>
          </a>
        </div>
        <div className="card">
          <h2 style={{ marginTop: 0 }}><T k="schoolsPage.feesGuideHeading" /></h2>
          <p className="small" style={{ marginTop: 0 }}>
            <T k="schoolsPage.feesGuideIntro" />
          </p>
          <div className="inlineLinks">
            <a className="btn" href={href('/fees')}>
              <T k="schoolsPage.feesOverview" />
            </a>
            <a className="btn" href={href('/fees/estimate')}>
              <T k="schoolsPage.feeNotes" />
            </a>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}><T k="schoolsPage.faqHeading" /></h2>
        <div className="faqList">
          {faqItems.map((f) => (
            <details key={f.qKey} className="faqItem">
              <summary><T k={f.qKey} /></summary>
              <div className="faqAnswer">
                <p style={{ marginTop: 0 }}><T k={f.aKey} /></p>
              </div>
            </details>
          ))}
        </div>
      </div>

      <p className="small" style={{ marginTop: 16 }}>
        <T k="schoolsPage.feesDisclaimer" />
      </p>

      <JsonLd data={faqJsonLd} />
      <JsonLd data={itemListJsonLd} />
    </div>
  );
}
