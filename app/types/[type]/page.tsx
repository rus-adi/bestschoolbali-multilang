import type { Metadata } from "next";
import { getAllTypes, resolveTypeSlug, schoolsInTypeSlug } from "../../../lib/taxonomy";
import { slugify } from "../../../lib/slug";
import JsonLd from "../../../components/JsonLd";
import SchoolListCard from "../../../components/SchoolListCard";
import { recommendGuides } from "../../../lib/posts";
import T from "../../../components/T";
import { sortSchoolsForMarketplace } from "../../../lib/sort";
import { getMessages } from "../../../lib/i18n/getMessages";
import { isLocale, localizeHref, type Locale } from "../../../lib/i18n/locales";

export const dynamicParams = false;
export const dynamic = "error";

const SITE_URL = "https://bestschoolbali.com";

type TypeDetailPageProps = {
  params: { type: string };
  locale?: string;
};

function getByPath(messages: Record<string, unknown>, key: string): unknown {
  return key.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, messages);
}

function applyValues(template: string, values?: Record<string, string | number>) {
  if (!values) return template;
  return template.replace(/\{(.*?)\}/g, (_, key) => String(values[key] ?? `{${key}}`));
}

async function createTranslator(locale: string) {
  const en = await getMessages("en");
  const local = isLocale(locale) ? await getMessages(locale as Locale) : en;

  return (key: string, fallback: string, values?: Record<string, string | number>) => {
    const localized = getByPath(local, key);
    if (typeof localized === "string") return applyValues(localized, values);

    const english = getByPath(en, key);
    if (typeof english === "string") return applyValues(english, values);

    return applyValues(fallback, values);
  };
}

export function generateStaticParams(): { type: string }[] {
  return getAllTypes().map((t) => ({ type: t.slug }));
}

export async function generateMetadata({ params, locale = "en" }: TypeDetailPageProps): Promise<Metadata> {
  const t = await createTranslator(locale);
  const name = resolveTypeSlug(params.type, locale) ?? params.type;
  const title = t("typesDetail.meta.title", "{typeName} schools in Bali", { typeName: name });
  const description = t(
    "typesDetail.meta.description",
    "Browse {typeName} options in Bali. Compare areas, ages, curriculum tags, and fee ranges, then open school profiles for admissions notes.",
    { typeName: name.toLowerCase() },
  );

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/types/${params.type}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/types/${params.type}`,
      images: [{ url: `${SITE_URL}/img/banners/hero.webp` }],
    },
  };
}

function formatIdr(n: number) {
  try {
    return new Intl.NumberFormat("id-ID").format(n);
  } catch {
    return String(n);
  }
}

function topCounts(items: string[], limit = 6): Array<{ name: string; count: number }> {
  const counts = new Map<string, number>();
  for (const raw of items) {
    const v = String(raw ?? "").trim();
    if (!v) continue;
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, limit);
}

export default async function TypeDetailPage({ params, locale = "en" }: TypeDetailPageProps) {
  const t = await createTranslator(locale);
  const activeLocale: Locale = isLocale(locale) ? locale : "en";
  const href = (path: string) => localizeHref(path, activeLocale);

  const typeName = resolveTypeSlug(params.type, locale);
  if (!typeName) return <div className="container"><T k="common.notFound" /></div>;

  const schools = sortSchoolsForMarketplace(schoolsInTypeSlug(params.type, locale));

  const feeMins = schools.map((s) => s.fees?.min).filter((n): n is number => typeof n === "number");
  const feeMaxs = schools.map((s) => s.fees?.max).filter((n): n is number => typeof n === "number");
  const minFee = feeMins.length ? Math.min(...feeMins) : null;
  const maxFee = feeMaxs.length ? Math.max(...feeMaxs) : null;

  const agesMin = schools.map((s) => s.age_min).filter((n): n is number => typeof n === "number");
  const agesMax = schools.map((s) => s.age_max).filter((n): n is number => typeof n === "number");
  const minAge = agesMin.length ? Math.min(...agesMin) : null;
  const maxAge = agesMax.length ? Math.max(...agesMax) : null;

  const topAreas = topCounts(schools.map((s) => s.area), 6);
  const topCurriculums = topCounts(schools.flatMap((s) => s.curriculum_tags ?? []), 8);
  const topBudgets = topCounts(schools.map((s) => s.budget_category ?? ""), 3);

  const guides = recommendGuides({
    locale,
    curriculumTags: topCurriculums.map((x) => x.name).slice(0, 3),
    budget: topBudgets[0]?.name,
    limit: 3,
  });

  const faqItems = [
    {
      q: t("typesDetail.faq.q1", "What does \"{typeName}\" mean in Bali?", { typeName }),
      a: t(
        "typesDetail.faq.a1",
        "Type labels are a browsing shortcut. Schools sometimes use different wording, so confirm the curriculum, language of instruction, and grade coverage directly with admissions.",
      ),
    },
    {
      q: t("typesDetail.faq.q2", "How do we shortlist {typeName} options?", { typeName: typeName.toLowerCase() }),
      a: t(
        "typesDetail.faq.a2",
        "Start with commute/area, then confirm ages/grades and curriculum pathway. Finally compare total first-year cost so quotes are apples-to-apples.",
      ),
    },
    {
      q: t("typesDetail.faq.q3", "Should we browse by type or use the directory filters first?"),
      a: t(
        "typesDetail.faq.a3",
        "Use type labels for quick browsing, then switch to the directory if you want to filter by multiple criteria (area + curriculum + budget).",
      ),
    },
    {
      q: t("typesDetail.faq.q4", "Can you help us choose between a few schools?"),
      a: t(
        "typesDetail.faq.a4",
        "Yes. Share your area, child’s age, and a couple of priorities and we’ll help you shortlist and draft the admissions questions to send.",
      ),
    },
  ];

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: t("nav.home", "Home"), item: SITE_URL },
      { "@type": "ListItem", position: 2, name: t("nav.types", "Types"), item: `${SITE_URL}${href("/types")}` },
      { "@type": "ListItem", position: 3, name: typeName, item: `${SITE_URL}${href(`/types/${params.type}`)}` },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: schools.slice(0, 200).map((s, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: `${SITE_URL}${href(`/schools/${s.id}`)}`,
      name: s.name,
    })),
  };

  return (
    <div className="container">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <a href={href("/")}>{t("nav.home", "Home")}</a>
        <span aria-hidden="true">/</span>
        <a href={href("/types")}>{t("nav.types", "Types")}</a>
        <span aria-hidden="true">/</span>
        <span>{typeName}</span>
      </nav>

      <section className="hero" style={{ marginTop: 12 }}>
        <div className="heroInner">
          <div>
            <h1>{t("typesDetail.hero.title", "{typeName} schools in Bali", { typeName })}</h1>
            <p className="small" style={{ marginTop: 6 }}>
              {schools.length} {schools.length === 1 ? t("typesDetail.hero.schoolSingular", "school") : t("typesDetail.hero.schoolPlural", "schools")} {t("typesDetail.hero.listed", "listed.")}
              {minFee && maxFee ? ` ${t("typesDetail.hero.feeRange", "Typical annual ranges span roughly Rp {minFee}–Rp {maxFee}.", { minFee: formatIdr(minFee), maxFee: formatIdr(maxFee) })}` : ""}
              {minAge != null && maxAge != null ? ` ${t("typesDetail.hero.ageRange", "Ages span about {minAge}–{maxAge}.", { minAge, maxAge })}` : ""}
            </p>
          </div>
          <div className="heroMedia" aria-hidden="true">
            <img src="/img/banners/hero.webp" alt="" />
          </div>
        </div>
      </section>

      <div className="grid" style={{ marginTop: 16 }}>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>{t("typesDetail.sections.areas.title", "Where you’ll find these schools")}</h2>
          {topAreas.length ? (
            <div className="tagRow" style={{ marginTop: 0 }}>
              {topAreas.map((a) => (
                <a key={a.name} className="tag" href={href(`/areas/${slugify(a.name)}`)}>
                  {a.name} ({a.count})
                </a>
              ))}
            </div>
          ) : (
            <p className="small" style={{ marginTop: 0 }}>
              {t("typesDetail.sections.areas.empty", "Area tags aren’t available for these listings.")}
            </p>
          )}
        </div>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>{t("typesDetail.sections.curriculums.title", "Common curriculum tags")}</h2>
          {topCurriculums.length ? (
            <div className="tagRow" style={{ marginTop: 0 }}>
              {topCurriculums.slice(0, 8).map((x) => (
                <a key={x.name} className="tag" href={href(`/curriculums/${slugify(x.name)}`)}>
                  {x.name}
                </a>
              ))}
            </div>
          ) : (
            <p className="small" style={{ marginTop: 0 }}>
              {t("typesDetail.sections.curriculums.empty", "Curriculum tags aren’t listed for these schools.")}
            </p>
          )}
        </div>
      </div>

      <div className="grid" style={{ marginTop: 16 }}>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>{t("typesDetail.sections.budgets.title", "Budget bands")}</h2>
          {topBudgets.length ? (
            <div className="tagRow" style={{ marginTop: 0 }}>
              {topBudgets.map((b) => (
                <a key={b.name} className="tag" href={href(`/budget/${slugify(b.name)}`)}>
                  {b.name} ({b.count})
                </a>
              ))}
            </div>
          ) : (
            <p className="small" style={{ marginTop: 0 }}>
              {t("typesDetail.sections.budgets.empty", "Budget bands aren’t available for these listings.")}
            </p>
          )}

          <div className="inlineLinks" style={{ marginTop: 12 }}>
            <a className="btn" href={href("/budget")}>{t("typesDetail.sections.budgets.browse", "Browse budget")}</a>
            <a className="btn" href={href("/fees")}>{t("typesDetail.sections.budgets.feesOverview", "Fees overview")}</a>
          </div>
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>{t("typesDetail.sections.nextSteps.title", "Next steps")}</h2>
          <p className="small" style={{ marginTop: 0 }}>
            {t("typesDetail.sections.nextSteps.body", "Once you’ve shortlisted by commute and age range, open 3–5 profiles and compare the full first-year cost.")}
          </p>
          <div className="inlineLinks">
            <a className="btn" href={href("/schools")}>{t("typesDetail.sections.nextSteps.openDirectory", "Open directory")}</a>
            <a className="btn" href={href("/compare")}>{t("typesDetail.sections.nextSteps.compareSchools", "Compare schools")}</a>
            <a className="btn btnPrimary" href={href("/contact")}>{t("typesDetail.sections.nextSteps.freeGuidance", "Get free guidance")}</a>
          </div>
        </div>
      </div>

      <div className="grid" style={{ marginTop: 16 }}>
        {schools.map((s) => (
          <SchoolListCard
            key={s.id}
            school={s}
            meta={
              <>
                <a href={href(`/areas/${slugify(s.area)}`)}>{s.area}</a>
                {s.age_min != null && s.age_max != null ? ` · ${t("typesDetail.card.ages", "Ages {min}–{max}", { min: s.age_min, max: s.age_max })}` : ""}
              </>
            }
          />
        ))}
      </div>

      {guides.length ? (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="sectionHead">
            <h2 style={{ margin: 0 }}>{t("typesDetail.guides.title", "Recommended guides")}</h2>
            <a className="sectionLink" href={href("/posts")}>{t("typesDetail.guides.viewAll", "View all guides")}</a>
          </div>
          <div className="grid" style={{ marginTop: 14 }}>
            {guides.map((g) => (
              <div key={g.slug} className="card soft">
                <h3 style={{ marginTop: 0 }}>
                  <a href={href(`/posts/${g.slug}`)}>{g.title}</a>
                </h3>
                <div className="small">{g.excerpt}</div>
                <a className="btn btnLink" href={href(`/posts/${g.slug}`)}>
                  {t("typesDetail.guides.read", "Read")} <span aria-hidden="true">→</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>{t("typesDetail.faqHeading", "FAQ")}</h2>
        <div className="faqList">
          {faqItems.map((f) => (
            <details key={f.q} className="faqItem">
              <summary>{f.q}</summary>
              <div className="faqAnswer">
                <p style={{ marginTop: 0 }}>{f.a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>

      <div className="grid" style={{ marginTop: 16 }}>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>{t("typesDetail.footer.moreFilters.title", "Want to filter further?")}</h2>
          <p className="small" style={{ marginTop: 0 }}>
            {t("typesDetail.footer.moreFilters.body", "Use the directory to combine area + curriculum + budget filters.")}
          </p>
          <div className="inlineLinks">
            <a className="btn" href={href("/schools")}>{t("typesDetail.footer.moreFilters.openDirectory", "Open directory")}</a>
            <a className="btn" href={href("/areas")}>{t("search.areas", "Areas")}</a>
            <a className="btn" href={href("/curriculums")}>{t("search.curriculums", "Curriculums")}</a>
          </div>
        </div>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>{t("typesDetail.footer.shortlist.title", "Need a shortlist?")}</h2>
          <p className="small" style={{ marginTop: 0 }}>
            {t("typesDetail.footer.shortlist.body", "Tell us your child’s age, your area, and a rough budget. We’ll suggest a shortlist and a question list for tours.")}
          </p>
          <a className="btn btnPrimary" href={href("/contact")}>
            {t("typesDetail.footer.shortlist.cta", "Get free guidance")} <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>

      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={faqJsonLd} />
      <JsonLd data={itemListJsonLd} />
    </div>
  );
}
