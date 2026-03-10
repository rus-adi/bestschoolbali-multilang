import { getAllPosts, hasPostTranslation } from "../lib/posts";
import { getGuideTopicsWithCounts } from "../lib/guideTopics";
import T from "./T";
import { isLocale, localizeHref, type Locale } from "../lib/i18n/locales";

export default function GuidesHubContent({ locale = "en" }: { locale?: string }) {
  const localeValue: Locale = isLocale(locale) ? locale : "en";
  const href = (path: string) => localizeHref(path, localeValue);

  const topics = getGuideTopicsWithCounts(locale);
  const allPosts = getAllPosts(locale);
  const posts = locale === "en" ? allPosts : allPosts.filter((p) => hasPostTranslation(p.slug, locale));

  return (
    <main className="container" style={{ paddingTop: 22 }}>
      <div className="card">
        <h1 style={{ marginTop: 0 }}><T k="guides.title" /></h1>
        <p className="small" style={{ marginTop: 8 }}>
          <T k="guides.hubSubtitle" />
        </p>

        <div className="inlineLinks" style={{ marginTop: 12 }}>
          <a className="btn" href={href('/schools')}><T k="guides.browseSchools" /></a>
          <a className="btn" href={href('/areas')}><T k="guides.browseAreas" /></a>
          <a className="btn" href={href('/curriculums')}><T k="guides.browseCurriculums" /></a>
          <a className="btn" href={href('/fees')}><T k="guides.feesOverview" /></a>
          <a className="btn btnPrimary" href={href('/contact')}><T k="guides.getGuidance" /></a>
        </div>
      </div>

      <div className="grid" style={{ marginTop: 16 }}>
        <section className="card">
          <h2 style={{ marginTop: 0 }}><T k="posts.browseByTopic" /></h2>
          <p className="small" style={{ marginTop: 0 }}><T k="posts.directoryShortcutsBody" /></p>
          <div className="grid" style={{ marginTop: 12 }}>
            {topics.map((t) => (
              <a key={t.slug} className="card" href={href(`/guides/${t.slug}`)}>
                <div style={{ fontWeight: 800 }}>{t.name}</div>
                <div className="small" style={{ marginTop: 6 }}>{t.description}</div>
                <div className="small" style={{ marginTop: 10 }}>
                  {t.count} <T k="posts.articleCountLabel" values={{ count: t.count }} />
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="card">
          <h2 style={{ marginTop: 0 }}><T k="guides.title" /></h2>
          <p className="small" style={{ marginTop: 0 }}><T k="posts.suggestedProfilesBody" /></p>
          <div className="grid" style={{ marginTop: 12 }}>
            {posts.slice(0, 8).map((p) => (
              <a key={p.slug} className="card" href={href(`/posts/${p.slug}`)}>
                <div style={{ fontWeight: 800 }}>{p.title}</div>
                <div className="small" style={{ marginTop: 6 }}>{p.excerpt}</div>
                <div className="small" style={{ marginTop: 10 }}>
                  {p.date}
                  {p.category ? ` · ${p.category}` : ""}
                </div>
              </a>
            ))}
          </div>
          <div className="inlineLinks" style={{ marginTop: 12 }}>
            <a className="btn" href={href('/posts')}><T k="guides.viewAllPosts" /></a>
          </div>
        </section>
      </div>
    </main>
  );
}
