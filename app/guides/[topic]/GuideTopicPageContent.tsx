import T from "../../../components/T";
import JsonLd from "../../../components/JsonLd";
import { getGuideTopic, getPostsForTopic } from "../../../lib/guideTopics";
import { slugify } from "../../../lib/slug";
import { isLocale, localizeHref, type Locale } from "../../../lib/i18n/locales";

const SITE_URL = "https://bestschoolbali.com";

export default function GuideTopicPageContent({
  params,
  locale = "en",
}: {
  params: { topic: string };
  locale?: string;
}) {
  const localeValue: Locale = isLocale(locale) ? locale : "en";
  const href = (path: string) => localizeHref(path, localeValue);

  const slug = slugify(params.topic);
  const topic = getGuideTopic(slug, locale);
  const posts = getPostsForTopic(slug, locale);

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/guides` },
      { "@type": "ListItem", position: 3, name: topic?.name ?? "Topic", item: `${SITE_URL}/guides/${slug}` },
    ],
  };

  return (
    <main className="container" style={{ paddingTop: 22 }}>
      <JsonLd data={breadcrumb} />

      <div className="inlineLinks" style={{ marginBottom: 12 }}>
        <a className="btn" href={href('/guides')}>
          <T k="posts.backToGuides" />
        </a>
        <a className="btn" href={href('/schools')}>
          <T k="guides.browseSchools" />
        </a>
        <a className="btn btnPrimary" href={href('/contact')}>
          <T k="guides.getGuidance" />
        </a>
      </div>

      <div className="card">
        <h1 style={{ marginTop: 0 }}>{topic?.name ?? <T k="guides.title" />}</h1>
        <p className="small" style={{ marginTop: 8 }}>
          {topic?.description ?? <T k="posts.indexSubtitle" />}
        </p>

        <div className="grid" style={{ marginTop: 12 }}>
          {posts.length ? (
            posts.map((p) => (
              <a key={p.slug} className="card" href={href(`/posts/${p.slug}`)}>
                <div style={{ fontWeight: 800 }}>{p.title}</div>
                <div className="small" style={{ marginTop: 6 }}>
                  {p.excerpt}
                </div>
                <div className="small" style={{ marginTop: 10 }}>
                  {p.date}
                  {p.category ? ` · ${p.category}` : ""}
                </div>
              </a>
            ))
          ) : (
            <div className="small"><T k="home.noPosts" /></div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}><T k="posts.directoryShortcutsTitle" /></h2>
        <p className="small" style={{ marginTop: 0 }}>
          <T k="posts.directoryShortcutsBody" />
        </p>
        <div className="inlineLinks" style={{ marginTop: 12 }}>
          <a className="btn" href={href('/areas')}>
            <T k="search.areas" />
          </a>
          <a className="btn" href={href('/curriculums')}>
            <T k="search.curriculums" />
          </a>
          <a className="btn" href={href('/types')}>
            <T k="schoolsPage.browseTypeHeading" />
          </a>
          <a className="btn" href={href('/budget')}>
            <T k="search.budgetBands" />
          </a>
          <a className="btn" href={href('/fees')}>
            <T k="search.feesOverview" />
          </a>
        </div>
      </div>
    </main>
  );
}
