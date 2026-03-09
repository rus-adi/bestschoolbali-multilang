import { getPostBySlug } from "../lib/posts";
import { localizeHref, type Locale } from "../lib/i18n/locales";
import { remark } from "remark";
import html from "remark-html";
import { getAllAreas, getAllCurriculums } from "../lib/taxonomy";
import { getAllSchools } from "../lib/schools";
import { slugify } from "../lib/slug";
import { sortSchoolsForMarketplace } from "../lib/sort";
import JsonLd from "./JsonLd";
import SchoolListCard from "./SchoolListCard";
import T from "./T";

const SITE_URL = "https://bestschoolbali.com";

async function renderMarkdown(md: string) {
  const result = await remark().use(html).process(md);
  return result.toString();
}

function uniqBy<T>(items: T[], key: (t: T) => string) {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    const k = key(item);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(item);
  }
  return out;
}

function href(pathname: string, locale?: Locale) {
  return locale ? localizeHref(pathname, locale) : pathname;
}

function localizeHtmlLinks(sourceHtml: string, locale?: Locale) {
  if (!locale) return sourceHtml;
  return sourceHtml.replace(/href="(\/[^"]*)"/g, (_match, value) => `href="${href(value, locale)}"`);
}

function buildDirectoryShortcuts(tags: string[], locale?: Locale) {
  const areas = getAllAreas();
  const curriculums = getAllCurriculums();

  const areaMap = new Map(areas.map((a) => [a.name.toLowerCase(), a] as const));
  const curriculumMap = new Map(curriculums.map((c) => [c.slug, c] as const));

  const areaLinks = uniqBy(
    tags
      .map((t) => areaMap.get(String(t).toLowerCase()))
      .filter(Boolean)
      .map((a) => ({ name: a!.name, slug: a!.slug })),
    (a) => a.slug,
  );

  const curriculumLinks = uniqBy(
    tags
      .map((t) => curriculumMap.get(slugify(t)))
      .filter(Boolean)
      .map((c) => ({ name: c!.tag, slug: c!.slug })),
    (c) => c.slug,
  );

  const wantsFees = tags.some((t) => /fees|budget|cost/i.test(String(t)));
  const wantsAdmissions = tags.some((t) => /admissions|documents|timeline/i.test(String(t)));
  const wantsAreas = areaLinks.length > 0 || tags.some((t) => /commute|area/i.test(String(t)));

  const quickLinks: Array<{ labelKey: string; href: string }> = [
    { labelKey: "search.schoolDirectory", href: "/schools" },
    { labelKey: "search.areas", href: "/areas" },
    { labelKey: "search.curriculums", href: "/curriculums" },
  ];

  if (wantsFees) {
    quickLinks.push({ labelKey: "search.feesOverview", href: "/fees" });
    quickLinks.push({ labelKey: "search.budgetBands", href: "/budget" });
  }

  if (wantsAdmissions) {
    quickLinks.push({ labelKey: "posts.admissionsGuide", href: "/posts/admissions-timeline-and-documents" });
  }

  if (wantsAreas) {
    quickLinks.push({ labelKey: "posts.areaComparisons", href: "/compare/areas" });
  }

  quickLinks.push({ labelKey: "posts.getGuidance", href: "/contact" });

  return {
    areaLinks,
    curriculumLinks,
    quickLinks: uniqBy(quickLinks.map((item) => ({ ...item, href: href(item.href, locale) })), (x) => x.href),
  };
}

function recommendSchoolsForPost(opts: {
  areaLinks: Array<{ name: string; slug: string }>;
  curriculumLinks: Array<{ name: string; slug: string }>;
}) {
  const all = getAllSchools();
  const base = sortSchoolsForMarketplace(all);
  const baseOrder = new Map(base.map((s, idx) => [s.id, idx] as const));

  const areaNames = new Set(opts.areaLinks.map((a) => a.name));
  const curriculumSlugs = new Set(opts.curriculumLinks.map((c) => c.slug));

  const scored = all
    .map((s) => {
      let score = 0;

      const areas = s.areas?.length ? s.areas : [s.area];
      if (areas.some((a) => areaNames.has(a))) score += 3;

      const schoolCurrSlugs = (s.curriculum_tags ?? []).map((t) => slugify(t));
      if (schoolCurrSlugs.some((slug) => curriculumSlugs.has(slug))) score += 3;

      return { s, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (baseOrder.get(a.s.id) ?? 9999) - (baseOrder.get(b.s.id) ?? 9999);
    });

  return scored.slice(0, 6).map((x) => x.s);
}

export default async function PostDetailView({
  slug,
  locale,
}: {
  slug: string;
  locale?: Locale;
}) {
  const post = getPostBySlug(slug, locale);
  const contentHtml = localizeHtmlLinks(await renderMarkdown(post.content), locale);

  const articleUrl = href(`/posts/${post.slug}`, locale);
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}${articleUrl}`,
    },
    image: post.image ? `${SITE_URL}${post.image}` : `${SITE_URL}/img/banners/blog.webp`,
    publisher: {
      "@type": "Organization",
      "@id": `${SITE_URL}#organization`,
      name: "Best School Bali",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/img/brand/logo.webp`,
      },
    },
  };

  const heroImg = post.image ?? "/img/banners/blog.webp";
  const tags = (post.tags ?? []).map((t) => String(t).trim()).filter(Boolean);

  const shortcuts = buildDirectoryShortcuts(tags, locale);
  const suggestedSchools = recommendSchoolsForPost({
    areaLinks: shortcuts.areaLinks,
    curriculumLinks: shortcuts.curriculumLinks,
  });

  return (
    <article className="container">
      <JsonLd data={articleSchema} />
      <div className="inlineLinks" style={{ marginTop: 18 }}>
        <a className="btn" href={href("/guides", locale)}>
          <T k="posts.backToGuides" />
        </a>
        <a className="btn" href={href("/schools", locale)}>
          <T k="posts.browseSchools" />
        </a>
        <a className="btn" href={href("/fees", locale)}>
          <T k="posts.feesGuide" />
        </a>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <h1>{post.title}</h1>
        <div className="small">
          {post.date}
          {post.category ? ` · ${post.category}` : ""}
        </div>

        {tags.length ? (
          <div className="tagRow" style={{ marginTop: 10 }}>
            {tags.slice(0, 6).map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
          </div>
        ) : null}

        <div className="postHero" aria-hidden="true" style={{ marginTop: 14 }}>
          <img src={heroImg} alt="" loading="lazy" />
        </div>

        <div style={{ marginTop: 16 }} dangerouslySetInnerHTML={{ __html: contentHtml }} />
      </div>

      <div className="grid" style={{ marginTop: 16 }}>
        <div className="card">
          <h2 style={{ marginTop: 0 }}><T k="posts.directoryShortcutsTitle" /></h2>
          <p className="small" style={{ marginTop: 0 }}>
            <T k="posts.directoryShortcutsBody" />
          </p>

          {shortcuts.areaLinks.length ? (
            <>
              <div className="small" style={{ marginTop: 10 }}>
                <strong><T k="search.areas" /></strong>
              </div>
              <div className="tagRow" style={{ marginTop: 8 }}>
                {shortcuts.areaLinks.map((a) => (
                  <a key={a.slug} className="tag" href={href(`/areas/${a.slug}`, locale)}>
                    {a.name}
                  </a>
                ))}
              </div>
            </>
          ) : null}

          {shortcuts.curriculumLinks.length ? (
            <>
              <div className="small" style={{ marginTop: 12 }}>
                <strong><T k="search.curriculums" /></strong>
              </div>
              <div className="tagRow" style={{ marginTop: 8 }}>
                {shortcuts.curriculumLinks.map((c) => (
                  <a key={c.slug} className="tag" href={href(`/curriculums/${c.slug}`, locale)}>
                    {c.name}
                  </a>
                ))}
              </div>
            </>
          ) : null}

          <div className="inlineLinks" style={{ marginTop: 12 }}>
            {shortcuts.quickLinks.slice(0, 5).map((l) => (
              <a key={l.href} className="btn" href={l.href}>
                <T k={l.labelKey} />
              </a>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0 }}><T k="posts.suggestedProfilesTitle" /></h2>
          <p className="small" style={{ marginTop: 0 }}>
            <T k="posts.suggestedProfilesBody" />
          </p>

          {suggestedSchools.length ? (
            <div className="grid" style={{ marginTop: 12 }}>
              {suggestedSchools.map((s) => (
                <SchoolListCard
                  key={s.id}
                  school={s}
                  meta={
                    <>
                      <a href={href(`/areas/${slugify(s.area)}`, locale)}>{s.area}</a>
                      {s.type ? ` · ${s.type}` : ""}
                    </>
                  }
                />
              ))}
            </div>
          ) : (
            <p className="small" style={{ marginTop: 0 }}>
              <T k="posts.browseDirectoryFallback" />
            </p>
          )}

          <div className="inlineLinks" style={{ marginTop: 12 }}>
            <a className="btn" href={href("/schools", locale)}>
              <T k="actions.openDirectory" />
            </a>
            <a className="btn" href={href("/compare", locale)}>
              <T k="footer.compare" />
            </a>
            <a className="btn btnPrimary" href={href("/contact", locale)}>
              <T k="posts.getGuidance" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
