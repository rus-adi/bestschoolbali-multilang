import type { Metadata } from "next";
import { GUIDE_TOPICS, getGuideTopic, getPostsForTopic } from "../../../lib/guideTopics";
import T from "../../../components/T";
import { slugify } from "../../../lib/slug";
import JsonLd from "../../../components/JsonLd";

const SITE_URL = "https://bestschoolbali.com";

export const dynamicParams = false;
export const dynamic = "error";

export function generateStaticParams(): { topic: string }[] {
  return GUIDE_TOPICS.map((t) => ({ topic: t.slug }));
}

export function generateMetadata({ params }: { params: { topic: string } }): Metadata {
  const slug = slugify(params.topic);
  const topic = getGuideTopic(slug);
  const title = topic ? `${topic.name} — Guides` : "Guides";
  const description = topic
    ? topic.description
    : "Guides for parents comparing international schools in Bali.";
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/guides/${slug}` },
  };
}

export default function GuideTopicPage({ params, locale = "en" }: { params: { topic: string }; locale?: string }) {
  const slug = slugify(params.topic);
  const topic = getGuideTopic(slug);
  const posts = getPostsForTopic(slug);

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
        <a className="btn" href="/guides">
          <T k="posts.backToGuides" />
        </a>
        <a className="btn" href="/schools">
          <T k="guides.browseSchools" />
        </a>
        <a className="btn btnPrimary" href="/contact">
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
          <a className="btn" href="/areas">
            <T k="search.areas" />
          </a>
          <a className="btn" href="/curriculums">
            <T k="search.curriculums" />
          </a>
          <a className="btn" href="/types">
            <T k="schoolsPage.browseTypeHeading" />
          </a>
          <a className="btn" href="/budget">
            <T k="search.budgetBands" />
          </a>
          <a className="btn" href="/fees">
            <T k="search.feesOverview" />
          </a>
        </div>
      </div>
    </main>
  );
}
