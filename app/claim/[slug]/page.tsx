import type { Metadata } from "next";
import { getAllSchools, getSchoolBySlug } from "../../../lib/schools";
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
  const title = `Claim profile: ${name}`;
  return {
    title,
    description: `Claim or upgrade the profile for ${name} on Best School Bali.`,
    robots: { index: false, follow: false },
    alternates: { canonical: `${SITE_URL}/claim/${params.slug}` },
  };
}

export default function ClaimPage({ params }: { params: { slug: string } }) {
  const school = getSchoolBySlug(params.slug);
  if (!school) return <div className="container"><T k="common.notFound" /></div>;

  const message = `Hi Best School Bali — I’d like to claim and update the profile for ${school.name} (${school.area}).`;
  const wa = `https://wa.me/6285285408220?text=${encodeURIComponent(message)}`;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Schools", item: `${SITE_URL}/schools` },
      { "@type": "ListItem", position: 3, name: school.name, item: `${SITE_URL}/schools/${school.id}` },
      { "@type": "ListItem", position: 4, name: "Claim", item: `${SITE_URL}/claim/${school.id}` },
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
        <span><T k="claimPage.breadcrumbLabel" /></span>
      </nav>

      <section className="hero" style={{ marginTop: 12 }}>
        <div className="heroInner">
          <div>
            <h1><T k="claimPage.heroTitle" /></h1>
            <p className="small" style={{ marginTop: 6 }}>
              <T k="claimPage.heroSubtitleLead" /> <strong>{school.name}</strong> <T k="claimPage.heroSubtitleTail" />
            </p>
          </div>
          <div className="heroMedia" aria-hidden="true">
            <img src="/img/banners/contact.webp" alt="" />
          </div>
        </div>
      </section>

      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}><T k="claimPage.whatYouCanUpdateHeading" /></h2>
        <ul style={{ marginBottom: 0 }}>
          <li><T k="claimPage.itemFees" /></li>
          <li><T k="claimPage.itemAdmissions" /></li>
          <li><T k="claimPage.itemCurriculum" /></li>
          <li><T k="claimPage.itemPhotos" /></li>
          <li><T k="claimPage.itemVerifiedFeatured" /></li>
        </ul>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}><T k="claimPage.contactHeading" /></h2>
        <p style={{ marginTop: 0 }}>
          <T k="claimPage.contactIntro" />
        </p>
        <div className="inlineLinks" style={{ marginTop: 10, marginBottom: 0 }}>
          <a className="btn btnPrimary" href={wa} rel="nofollow">
            <T k="claimPage.messageWhatsApp" /> <span aria-hidden="true">→</span>
          </a>
          <a className="btn" href="/for-schools/pricing">
            <T k="claimPage.listingUpgrades" />
          </a>
        </div>
      </div>

      <JsonLd data={breadcrumbJsonLd} />
    </div>
  );
}
