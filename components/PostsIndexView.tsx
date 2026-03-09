import { getAllPosts, getGuideCategories } from "../lib/posts";
import type { Locale } from "../lib/i18n/locales";
import { localizeHref } from "../lib/i18n/locales";
import T from "./T";

function href(pathname: string, locale?: Locale) {
  return locale ? localizeHref(pathname, locale) : pathname;
}

export default function PostsIndexView({ locale }: { locale?: Locale }) {
  const posts = getAllPosts(locale);
  const categories = getGuideCategories(locale);

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
            <p className="small" style={{ marginTop: 6 }}>
              <T k="posts.indexSubtitle" />
            </p>
          </div>
          <div className="heroMedia" aria-hidden="true">
            <img src="/img/banners/blog.webp" alt="" />
          </div>
        </div>
      </section>

      {categories.length ? (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="sectionHead" style={{ marginBottom: 10 }}>
            <h2 style={{ margin: 0 }}><T k="posts.browseByTopic" /></h2>
            <a className="sectionLink" href={href("/schools", locale)}>
              <T k="posts.browseSchools" />
            </a>
          </div>
          <div className="tagRow" style={{ marginTop: 0 }}>
            {categories.map((c) => (
              <a key={c.name} className="tag" href={`#${encodeURIComponent(c.name)}`}>
                {c.name} <span className="small">({c.count})</span>
              </a>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid" style={{ marginTop: 16 }}>
        {orderedKeys.map((key) => {
          const group = groups.get(key) ?? [];
          return (
            <section className="card" key={key} id={encodeURIComponent(key)}>
              <div className="sectionHead">
                <h2 style={{ margin: 0 }}>{key}</h2>
                <div className="small">{group.length} <T k="posts.articleCountLabel" values={{ count: group.length }} /></div>
              </div>
              <div className="grid" style={{ marginTop: 12 }}>
                {group.map((p) => (
                  <a key={p.slug} className="card" href={href(`/posts/${p.slug}`, locale)}>
                    <div style={{ fontWeight: 800 }}>{p.title}</div>
                    <div className="small" style={{ marginTop: 6 }}>
                      {p.excerpt}
                    </div>
                    <div className="small" style={{ marginTop: 10 }}>
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
