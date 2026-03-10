import type { Metadata } from "next";
import { getAllPosts, hasPostTranslation } from "../../lib/posts";
import T from "../../components/T";
import { getGuideTopicsWithCounts } from "../../lib/guideTopics";

const SITE_URL = "https://bestschoolbali.com";

export const dynamic = "error";

export const metadata: Metadata = {
  title: "Guides for choosing a school in Bali",
  description:
    "Practical guides for parents comparing international schools in Bali — admissions, fees, curriculum, and area shortlists.",
  alternates: { canonical: `${SITE_URL}/guides` },
};

export default function GuidesHubPage({ locale = "en" }: { locale?: string }) {
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
          <a className="btn" href="/schools">
            <T k="guides.browseSchools" />
          </a>
          <a className="btn" href="/areas">
            <T k="guides.browseAreas" />
          </a>
          <a className="btn" href="/curriculums">
            <T k="guides.browseCurriculums" />
          </a>
          <a className="btn" href="/fees">
            <T k="guides.feesOverview" />
          </a>
          <a className="btn btnPrimary" href="/contact">
            <T k="guides.getGuidance" />
          </a>
        </div>
      </div>

      <div className="grid" style={{ marginTop: 16 }}>
        <section className="card">
          <h2 style={{ marginTop: 0 }}><T k="posts.browseByTopic" /></h2>
          <p className="small" style={{ marginTop: 0 }}>
            <T k="posts.directoryShortcutsBody" />
          </p>
          <div className="grid" style={{ marginTop: 12 }}>
            {topics.map((t) => (
              <a key={t.slug} className="card" href={`/guides/${t.slug}`}>
                <div style={{ fontWeight: 800 }}>{t.name}</div>
                <div className="small" style={{ marginTop: 6 }}>
                  {t.description}
                </div>
                <div className="small" style={{ marginTop: 10 }}>
                  {t.count} <T k="posts.articleCountLabel" values={{ count: t.count }} />
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="card">
          <h2 style={{ marginTop: 0 }}><T k="guides.title" /></h2>
          <p className="small" style={{ marginTop: 0 }}>
            <T k="posts.suggestedProfilesBody" />
          </p>

          <div className="grid" style={{ marginTop: 12 }}>
            {posts.slice(0, 8).map((p) => (
              <a key={p.slug} className="card" href={`/posts/${p.slug}`}>
                <div style={{ fontWeight: 800 }}>{p.title}</div>
                <div className="small" style={{ marginTop: 6 }}>
                  {p.excerpt}
                </div>
                <div className="small" style={{ marginTop: 10 }}>
                  {p.date}
                  {p.category ? ` · ${p.category}` : ""}
                </div>
              </a>
            ))}
          </div>

          <div className="inlineLinks" style={{ marginTop: 12 }}>
            <a className="btn" href="/posts">
              <T k="guides.viewAllPosts" />
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
