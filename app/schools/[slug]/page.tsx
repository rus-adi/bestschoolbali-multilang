import type { Metadata } from "next";
import { getAllSchools, getSchoolBySlug } from "../../../lib/schools";
import { slugify } from "../../../lib/slug";
import { bannerForAreaName } from "../../../lib/banners";
import JsonLd from "../../../components/JsonLd";
import AddToCompareButton from "../../../components/AddToCompareButton";
import SchoolInterestButton from "../../../components/SchoolInterestButton";
import SchoolListCard from "../../../components/SchoolListCard";
import T from "../../../components/T";
import SchoolLogoImage from "../../../components/SchoolLogoImage";
import { AGE_BANDS } from "../../../lib/ages";
import { remark } from "remark";
import html from "remark-html";
import { recommendGuides } from "../../../lib/posts";
import { getAreaComparisonPairs } from "../../../lib/areaComparisons";
import { getSchoolLogo } from "../../../lib/schoolLogo";
import { isLocale, localizeHref, type Locale } from "../../../lib/i18n/locales";

export const dynamicParams = false;
export const dynamic = "error";

const SITE_URL = "https://bestschoolbali.com";

export function generateStaticParams(): { slug: string }[] {
  return getAllSchools().map((s) => ({ slug: s.id }));
}

export function generateMetadata({ params, locale = "en" }: { params: { slug: string }; locale?: string }): Metadata {
  const school = getSchoolBySlug(params.slug, locale);
  if (!school) {
    return {
      title: "School not found",
      robots: { index: false, follow: false },
    };
  }

  const title = `${school.name} — School in ${school.area}, Bali`;
  const description =
    school.summary ??
    `View key facts, fees, curriculum, and admissions notes for ${school.name} in ${school.area}, Bali.`;

  const heroImage = `${SITE_URL}${bannerForAreaName(school.area)}`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/schools/${school.id}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/schools/${school.id}`,
      images: [{ url: heroImage }],
    },
  };
}

async function renderMarkdown(md: string) {
  type TocItem = { level: number; text: string; id: string };

  const toc: TocItem[] = [];
  const used = new Map<string, number>();

  // Build a deterministic ToC from markdown headings.
  const lines = String(md ?? "").split("\n");
  for (const line of lines) {
    const m = /^(#{2,4})\s+(.+)$/.exec(line.trim());
    if (!m) continue;
    const level = m[1].length;
    const text = m[2].replace(/\s+#+\s*$/, "").trim();
    if (!text) continue;
    const base = slugify(text);
    const prev = used.get(base) ?? 0;
    used.set(base, prev + 1);
    const id = prev === 0 ? base : `${base}-${prev + 1}`;
    toc.push({ level, text, id });
  }

  const result = await remark().use(html).process(md);
  let htmlStr = result.toString();

  // Inject ids into h2–h4 tags in the same order.
  let idx = 0;
  htmlStr = htmlStr.replace(/<h([2-4])>(.*?)<\/h\1>/g, (match, lvl, inner) => {
    const entry = toc[idx];
    if (!entry) return match;
    idx += 1;
    return `<h${lvl} id="${entry.id}">${inner}</h${lvl}>`;
  });

  return { html: htmlStr, toc };
}

function relatedSchools(currentId: string, locale = "en") {
  const all = getAllSchools(locale);
  const current = all.find((s) => s.id === currentId);
  if (!current) return [];

  const currentTags = new Set(current.curriculum_tags ?? []);

  const scored = all
    .filter((s) => s.id !== currentId)
    .map((s) => {
      let score = 0;
      if (s.area === current.area) score += 3;
      for (const t of s.curriculum_tags ?? []) {
        if (currentTags.has(t)) score += 2;
      }
      if (s.budget_category && s.budget_category === current.budget_category) score += 1;
      if (s.type && current.type && s.type === current.type) score += 1;
      return { s, score };
    })
    .sort((a, b) => b.score - a.score || a.s.name.localeCompare(b.s.name));

  return scored.slice(0, 6).map((x) => x.s);
}

export default async function SchoolPage({ params, locale = "en" }: { params: { slug: string }; locale?: string }) {
  const localeValue: Locale = isLocale(locale) ? locale : "en";
  const href = (path: string) => localizeHref(path, localeValue);

  const school = getSchoolBySlug(params.slug, locale);
  if (!school) return <div className="container"><T k="common.notFound" /></div>;

  const areaSlug = slugify(school.area);
  const banner = bannerForAreaName(school.area);
  const schoolImage = getSchoolLogo(school);
  const typeSlug = school.type ? slugify(school.type) : null;
  const budgetSlug = school.budget_category ? slugify(school.budget_category) : null;

  const ageBands =
    school.age_min != null && school.age_max != null
      ? AGE_BANDS.filter((b) => school.age_min! <= b.max && school.age_max! >= b.min)
      : [];

  const mapUrl = school.map_query
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(school.map_query)}`
    : null;

  const profile = school.profile_md ? await renderMarkdown(school.profile_md) : null;
  const profileHtml = profile?.html ?? null;
  const toc = profile?.toc ?? [];
  const similar = relatedSchools(school.id, locale);

  const otherAreas = Array.from(new Set(similar.map((s) => s.area).filter((a) => a && a !== school.area))).slice(0, 3);
  const comparePairs = getAreaComparisonPairs().filter(
    (p) =>
      (p.a === school.area && otherAreas.includes(p.b)) ||
      (p.b === school.area && otherAreas.includes(p.a)),
  );

  const guides = recommendGuides({
    locale,
    area: school.area,
    curriculumTags: school.curriculum_tags ?? [],
    budget: school.budget_category,
    limit: 3,
  });

  const crumbs = [
    { name: "Home", item: SITE_URL },
    { name: "Schools", item: `${SITE_URL}/schools` },
    { name: "Areas", item: `${SITE_URL}/areas` },
    { name: school.area, item: `${SITE_URL}/areas/${areaSlug}` },
    { name: school.name, item: `${SITE_URL}/schools/${school.id}` },
  ];

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: c.name,
      item: c.item,
    })),
  };

  const faqItems = [
    {
      id: "curriculum",
      qKey: "school.factsCurriculum",
      a:
        school.curriculum_tags?.length
          ? school.curriculum_tags.join(", ")
          : school.details?.curriculum || null,
    },
    {
      id: "ages",
      qKey: "school.factsAges",
      a:
        school.age_min != null && school.age_max != null
          ? `${school.age_min}–${school.age_max}`
          : null,
    },
    {
      id: "fees",
      qKey: "school.feesLabel",
      a: school.fees?.display ?? null,
    },
    {
      id: "type",
      qKey: "school.factsType",
      a: school.type ?? null,
    },
    {
      id: "address",
      qKey: "school.factsAddress",
      a: school.details?.address ?? null,
    },
  ].filter((f) => Boolean(f.a));

  const schoolJsonLd = {
    "@context": "https://schema.org",
    "@type": "School",
    "@id": `${SITE_URL}/schools/${school.id}#school`,
    name: school.name,
    url: `${SITE_URL}/schools/${school.id}`,
    description: school.summary ?? undefined,
    image: `${SITE_URL}${schoolImage}`,
    areaServed: school.area,
    telephone: school.details?.phone ?? undefined,
    email: school.details?.email ?? undefined,
    address: school.details?.address
      ? {
          "@type": "PostalAddress",
          streetAddress: school.details.address,
          addressLocality: school.area,
          addressRegion: "Bali",
          addressCountry: "ID",
        }
      : undefined,
    additionalProperty: [
      school.age_min != null && school.age_max != null
        ? { "@type": "PropertyValue", name: "Age range", value: `${school.age_min}–${school.age_max}` }
        : null,
      school.curriculum_tags?.length
        ? { "@type": "PropertyValue", name: "Curriculum", value: school.curriculum_tags.join(", ") }
        : null,
      school.fees?.display
        ? { "@type": "PropertyValue", name: "Annual fees", value: school.fees.display }
        : null,
      school.budget_category
        ? { "@type": "PropertyValue", name: "Budget band", value: school.budget_category }
        : null,
    ].filter(Boolean),
  };

  const claimUrl = href(`/claim/${school.id}`);
  const feedbackUrl = href(`/parent-feedback/${school.id}`);
  const whatsappGuidance = `https://wa.me/6285285408220?text=${encodeURIComponent(
    `Hi — can you help me shortlist schools? I’m looking at ${school.name} in ${school.area}.`,
  )}`;

  return (
    <div className="container">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <a href={href('/')}><T k="nav.home" /></a>
        <span aria-hidden="true">/</span>
        <a href={href('/schools')}><T k="nav.schools" /></a>
        <span aria-hidden="true">/</span>
        <a href={href(`/areas/${areaSlug}`)}>{school.area}</a>
        <span aria-hidden="true">/</span>
        <span>{school.name}</span>
      </nav>

      <div className="schoolHero" style={{ marginTop: 12 }}>
        <img src={banner} alt="" aria-hidden="true" />
        <div className="schoolHeroOverlay">
          <div className="schoolHeroContent">
            <SchoolLogoImage className="schoolHeroIcon" src={schoolImage} schoolName={school.name} alt={`${school.name} logo`} />
            <div>
              <h1 style={{ margin: 0 }}>
                {school.name}
                {school.verification?.status === "verified" ? <span className="pill"><T k="common.verified" /></span> : null}
                {school.sponsorship?.sponsored ? <span className="pill pillSponsored"><T k="common.sponsored" /></span> : null}
              </h1>
              <div className="small" style={{ color: "rgba(255,255,255,0.88)" }}>
                <a href={href(`/areas/${areaSlug}`)} style={{ color: "inherit", textDecoration: "underline" }}>
                  {school.area}
                </a>
                {school.type ? (
                  <>
                    {" "}·{" "}
                    <a href={href(`/types/${typeSlug}`)} style={{ color: "inherit", textDecoration: "underline" }}>
                      {school.type}
                    </a>
                  </>
                ) : (
                  ""
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="kv">
          <div className="small">
            <strong><T k="school.feesLabel" /></strong>
          </div>
          <div>
            {school.fees?.display ?? <T k="school.callForFees" />}
            {school.fees?.status === "estimate" ? <span className="pill"><T k="school.estimate" /></span> : null}
          </div>

          {school.budget_category ? (
            <>
              <div className="small">
                <strong><T k="school.factsBudget" /></strong>
              </div>
              <div>
                <a href={href(`/budget/${budgetSlug}`)}>{school.budget_category}</a>
              </div>
            </>
          ) : null}

          {school.type ? (
            <>
              <div className="small">
                <strong><T k="school.factsType" /></strong>
              </div>
              <div>
                <a href={href(`/types/${typeSlug}`)}>{school.type}</a>
              </div>
            </>
          ) : null}

          {school.age_min != null && school.age_max != null ? (
            <>
              <div className="small">
                <strong><T k="school.factsAges" /></strong>
              </div>
              <div>
                {school.age_min}–{school.age_max}
                {ageBands.length ? (
                  <div className="tagRow" style={{ marginTop: 8 }}>
                    {ageBands.map((b) => (
                      <a key={b.slug} className="tag" href={href(`/ages/${b.slug}`)}>
                        {b.name}
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            </>
          ) : null}

          {school.curriculum_tags?.length ? (
            <>
              <div className="small">
                <strong><T k="school.factsCurriculum" /></strong>
              </div>
              <div>
                <div className="tagRow" style={{ marginTop: 0 }}>
                  {school.curriculum_tags.map((t) => (
                    <a key={t} className="tag" href={href(`/curriculums/${slugify(t)}`)}>
                      {t}
                    </a>
                  ))}
                </div>
              </div>
            </>
          ) : null}

          {school.details?.address ? (
            <>
              <div className="small">
                <strong><T k="school.factsAddress" /></strong>
              </div>
              <div>{school.details.address}</div>
            </>
          ) : null}

          <>
            <div className="small">
              <strong><T k="school.interestFormLabel" /></strong>
            </div>
            <div className="small">
              <T k="school.interestHelp" />
            </div>
          </>
        </div>

        <div className="inlineLinks">
          <SchoolInterestButton schoolName={school.name} labelKey="actions.contactAboutSchool" />
          {mapUrl ? (
            <a className="btn" href={mapUrl} target="_blank" rel="noreferrer">
              <T k="school.openInGoogleMaps" />
            </a>
          ) : null}
          <a className="btn" href={whatsappGuidance} rel="nofollow">
            <T k="school.askOnWhatsApp" />
          </a>
          <AddToCompareButton schoolId={school.id} />
        </div>
      </div>

      {school.summary ? <p style={{ marginTop: 16 }}>{school.summary}</p> : null}

      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}><T k="school.parentPerspectivesHeading" /></h2>
        <p className="small" style={{ marginTop: 0 }}><T k="school.parentPerspectivesIntro" /></p>
        {school.parent_perspectives?.length ? (
          <>
            <div className="quoteGrid">
              {school.parent_perspectives.slice(0, 6).map((q, idx) => (
                <figure key={idx} className="quoteCard">
                  <blockquote>{q.quote}</blockquote>
                  <figcaption className="small">
                    — {q.label}
                  </figcaption>
                </figure>
              ))}
            </div>
            <div className="inlineLinks" style={{ marginTop: 10 }}>
              <a className="btn" href={feedbackUrl}>
                <T k="school.shareAnotherNote" /> <span aria-hidden="true">→</span>
              </a>
            </div>
          </>
        ) : (
          <>
            <p className="small" style={{ marginTop: 0 }}>
              <T k="school.parentPerspectivesEmpty" />
            </p>
            <div className="inlineLinks" style={{ marginTop: 10 }}>
              <a className="btn btnPrimary" href={feedbackUrl}>
                <T k="school.shareParentNote" /> <span aria-hidden="true">→</span>
              </a>
            </div>
          </>
        )}
      </div>

      {school.highlights?.length ? (
        <div className="card" style={{ marginTop: 16 }}>
          <h2 style={{ marginTop: 0 }}><T k="school.quickNotesHeading" /></h2>
          <ul>
            {school.highlights.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {guides.length ? (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="sectionHead">
            <h2 style={{ margin: 0 }}><T k="school.recommendedGuidesHeading" /></h2>
            <a className="sectionLink" href={href('/posts')}>
              <T k="school.viewAllGuides" />
            </a>
          </div>
          <div className="grid" style={{ marginTop: 14 }}>
            {guides.map((g) => (
              <div key={g.slug} className="card soft">
                <h3 style={{ marginTop: 0 }}>
                  <a href={href(`/posts/${g.slug}`)}>{g.title}</a>
                </h3>
                <div className="small">{g.excerpt}</div>
                <div className="inlineLinks" style={{ marginTop: 10 }}>
                  <a className="btn btnLink" href={href(`/posts/${g.slug}`)}>
                    <T k="home.readMore" /> <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {profileHtml ? (
        <div className="card" style={{ marginTop: 16 }}>
          <h2 style={{ marginTop: 0 }}><T k="school.inDepthProfileHeading" /></h2>
          {toc.length >= 2 ? (
            <div className="tocCard">
              <div className="small" style={{ marginTop: 0 }}>
                <strong><T k="school.onThisPage" /></strong>
              </div>
              <ul className="tocList">
                {toc.map((t) => (
                  <li key={t.id} className={`tocLevel${t.level}`}>
                    <a href={`#${t.id}`}>{t.text}</a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="markdown" dangerouslySetInnerHTML={{ __html: profileHtml }} />
          <p className="small" style={{ marginBottom: 0 }}>
            <T k="school.photosPlaceholderNote" />
          </p>
        </div>
      ) : null}

      {similar.length ? (
        <div className="card" style={{ marginTop: 16 }}>
          <h2 style={{ marginTop: 0 }}><T k="school.similarSchoolsHeading" /></h2>
          <div className="grid">
            {similar.map((s) => (
              <SchoolListCard
                key={s.id}
                school={s}
                meta={
                  <>
                    <a href={href(`/areas/${slugify(s.area)}`)}>{s.area}</a>
                    {s.type ? ` · ${s.type}` : ''}
                  </>
                }
              />
            ))}
          </div>
        </div>
      ) : null}

      {otherAreas.length ? (
        <div className="card" style={{ marginTop: 16 }}>
          <h2 style={{ marginTop: 0 }}><T k="school.areasFamiliesAlsoConsiderHeading" /></h2>
          <p className="small" style={{ marginTop: 0 }}>
            <T k="school.areasFamiliesAlsoConsiderIntro" />
          </p>
          <div className="tagRow" style={{ marginTop: 10 }}>
            {otherAreas.map((a) => (
              <a key={a} className="tag" href={href(`/areas/${slugify(a)}`)}>
                {a}
              </a>
            ))}
          </div>

          {comparePairs.length ? (
            <>
              <div className="small" style={{ marginTop: 12 }}>
                <strong><T k="school.areaComparisonsHeading" /></strong>
              </div>
              <div className="tagRow" style={{ marginTop: 8 }}>
                {comparePairs.map((p) => {
                  const other = p.a === school.area ? p.b : p.a;
                  return (
                    <a key={p.slug} className="tag" href={href(`/compare/areas/${p.slug}`)}>
                      {school.area} <T k="common.vs" /> {other}
                    </a>
                  );
                })}
              </div>
            </>
          ) : null}

          <div className="inlineLinks" style={{ marginTop: 12 }}>
            <a className="btn" href={href('/areas')}>
              <T k="school.browseAllAreas" />
            </a>
            <a className="btn" href={href('/compare/areas')}>
              <T k="school.compareAreas" />
            </a>
          </div>
        </div>
      ) : null}


      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}><T k="school.faqHeading" /></h2>
        <div className="faqList">
          {faqItems.map((f) => (
            <details key={f.id} className="faqItem">
              <summary><T k={f.qKey} /></summary>
              <div className="faqAnswer">
                <p style={{ marginTop: 0 }}>{f.a}</p>
                {f.id === "address" && mapUrl ? (
                  <p style={{ marginTop: 0 }}>
                    <T k="school.mapLinkLabel" />: <a href={mapUrl} target="_blank" rel="noreferrer"><T k="school.googleMaps" /></a>
                  </p>
                ) : null}
              </div>
            </details>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}><T k="school.claimUpgradeHeading" /></h2>
        <p style={{ marginTop: 0 }}>
          <T k="school.claimUpgradeIntro" />
        </p>
        <div className="inlineLinks">
          <a className="btn btnPrimary" href={claimUrl}>
            <T k="school.claimThisProfile" /> <span aria-hidden="true">→</span>
          </a>
          <a className="btn" href={href('/for-schools/pricing')}>
            <T k="school.listingUpgrades" />
          </a>
        </div>
      </div>

      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={schoolJsonLd} />
    </div>
  );
}
