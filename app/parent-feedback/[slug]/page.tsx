import type { Metadata } from "next";
import { getAllSchools, getSchoolBySlug } from "../../../lib/schools";
import { slugify } from "../../../lib/slug";
import { bannerForAreaName } from "../../../lib/banners";
import ParentNoteFormClient from "../../../components/ParentNoteFormClient";
import JsonLd from "../../../components/JsonLd";
import T from "../../../components/T";

export const dynamicParams = false;
export const dynamic = "error";

const SITE_URL = "https://bestschoolbali.com";

export function generateStaticParams(): { slug: string }[] {
  return getAllSchools().map((s) => ({ slug: s.id }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const school = getSchoolBySlug(params.slug);
  const name = school?.name ?? "School";
  const title = `Parent perspectives for ${name}`;
  const description = `Share a short, anonymized parent note about ${name}. We publish only anonymous, helpful notes.`;
  return {
    title,
    description,
    robots: { index: false, follow: false },
    alternates: { canonical: `${SITE_URL}/parent-feedback/${params.slug}` },
  };
}

export default function ParentFeedbackPage({ params }: { params: { slug: string } }) {
  const school = getSchoolBySlug(params.slug);
  if (!school) return <div className="container"><T k="common.notFound" /></div>;

  const areaSlug = slugify(school.area);
  const banner = bannerForAreaName(school.area);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Schools", item: `${SITE_URL}/schools` },
      { "@type": "ListItem", position: 3, name: school.name, item: `${SITE_URL}/schools/${school.id}` },
      { "@type": "ListItem", position: 4, name: "Parent note", item: `${SITE_URL}/parent-feedback/${school.id}` },
    ],
  };

  return (
    <div className="container">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <a href="/"><T k="nav.home" /></a>
        <span aria-hidden="true">/</span>
        <a href="/schools"><T k="nav.schools" /></a>
        <span aria-hidden="true">/</span>
        <a href={`/schools/${school.id}`}>{school.name}</a>
        <span aria-hidden="true">/</span>
        <span><T k="parentFeedbackPage.breadcrumbLabel" /></span>
      </nav>

      <section className="hero" style={{ marginTop: 12 }}>
        <div className="heroInner">
          <div>
            <h1><T k="parentFeedbackPage.heroTitle" /></h1>
            <p className="small" style={{ marginTop: 6 }}>
              <T k="parentFeedbackPage.heroSubtitleLead" /> <strong>{school.name}</strong>.
            </p>
          </div>
          <div className="heroMedia" aria-hidden="true">
            <img src={banner} alt="" />
          </div>
        </div>
      </section>

      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}><T k="parentFeedbackPage.guidelinesHeading" /></h2>
        <ul style={{ marginBottom: 0 }}>
          <li><T k="parentFeedbackPage.guidelineOne" /></li>
          <li><T k="parentFeedbackPage.guidelineTwo" /></li>
          <li><T k="parentFeedbackPage.guidelineThree" /></li>
        </ul>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}><T k="parentFeedbackPage.submitHeading" /></h2>
        <ParentNoteFormClient school={{ id: school.id, name: school.name, area: school.area }} />
      </div>

      <p className="small" style={{ marginTop: 16 }}>
        <T k="parentFeedbackPage.browseOtherLead" values={{ area: school.area }} /> <a href={`/areas/${areaSlug}`}><T k="parentFeedbackPage.viewAreaSchools" values={{ area: school.area }} /></a>.
      </p>

      <JsonLd data={breadcrumbJsonLd} />
    </div>
  );
}
