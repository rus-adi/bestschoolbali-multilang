import { getAllPosts, getGuideCategories, hasPostTranslation } from "../lib/posts";
import type { Locale } from "../lib/i18n/locales";
import { localizeHref } from "../lib/i18n/locales";
import T from "./T";

function href(pathname: string, locale?: Locale) {
  return locale ? localizeHref(pathname, locale) : pathname;
}

export default function PostsIndexView({ locale }: { locale?: Locale }) {
  const allPosts = getAllPosts(locale);
  const posts = locale === "en" ? allPosts : allPosts.filter((p) => hasPostTranslation(p.slug, locale));

  const categoryCounts = new Map<string, number>();
  for (const p of posts) {
    const c = (p.category ?? "").trim();
    if (!c) continue;
    categoryCounts.set(c, (categoryCounts.get(c) ?? 0) + 1);
  }
  const categories = Array.from(categoryCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  const groups = new Map<string, typeof posts>();
  for (const p of posts) {
    const key = (p.category ?? "Guides").trim() || "Guides";
    const list = groups.get(key) ?? [];
    list.push(p);
    groups.set(key, list);
  }

  const orderedKeys = Array.from(groups.keys()).sort((a, b) => a.localeCompare(b));

  return (
    <div className="container" id="top">
      <section className="hero">
        <div className="heroInner">
          <div>
            <h1><T k="posts.indexTitle" /></h1>
            <p className="small metaRow">
              <T k="posts.indexSubtitle" />
            </p>
          </div>
          <div className="heroMedia" aria-hidden="true">
            <img src="/img/banners/blog.webp" alt="" />
          </div>
        </div>
      </section>

      {categories.length ? (
        <div className="card sectionGrid">
          <div className="sectionHead sectionHeadTight">
            <h2 className="cardTitleReset"><T k="posts.browseByTopic" /></h2>
            <a className="sectionLink" href={href("/schools", locale)}>
              <T k="posts.browseSchools" />
            </a>
          </div>
          <div className="tagRow tagRowTight">
            {categories.map((c) => (
              <a key={c.name} className="tag" href={`#${encodeURIComponent(c.name)}`}>
                {c.name} <span className="small">({c.count})</span>
              </a>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid sectionGrid">
        {orderedKeys.map((key) => {
          const group = groups.get(key) ?? [];
          return (
            <section className="card" key={key} id={encodeURIComponent(key)}>
              <div className="sectionHead">
                <h2 className="cardTitleReset">{key}</h2>
                <div className="small">{group.length} <T k="posts.articleCountLabel" values={{ count: group.length }} /></div>
              </div>
              <div className="grid sectionGrid">
                {group.map((p) => (
                  <a key={p.slug} className="card postCardLink flowCompact" href={href(`/posts/${p.slug}`, locale)}>
                    <div className="postCardTitle">{p.title}</div>
                    <div className="small metaRow">
                      {p.excerpt}
                    </div>
                    <div className="small">
                      {p.date}
                    </div>
                  </a>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
