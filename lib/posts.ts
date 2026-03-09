import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { DEFAULT_LOCALE, isLocale, type Locale } from "./i18n/locales";

export type PostMeta = {
  slug: string;
  title: string;
  date: string; // YYYY-MM-DD
  excerpt: string;

  /** Optional content grouping for a "Guides" hub UI. */
  category?: string;
  tags?: string[];

  /** Optional hero image path (public/...), used for previews. */
  image?: string;
};

export type Post = PostMeta & {
  content: string;
};

const POSTS_DIR = path.join(process.cwd(), "posts");

type PostFrontmatter = {
  title: string;
  date: string;
  excerpt: string;
  category?: string;
  tags?: string[];
  image?: string;
};

function assertFrontmatter(data: any, slug: string): asserts data is PostFrontmatter {
  if (!data?.title || !data?.date || !data?.excerpt) {
    throw new Error(`Missing required frontmatter fields in post: ${slug}`);
  }
}

function byDateDesc(a: PostMeta, b: PostMeta) {
  return b.date.localeCompare(a.date);
}

function normalizeLocale(locale?: string | null): Locale {
  const candidate = locale ?? undefined;
  return isLocale(candidate) ? candidate : DEFAULT_LOCALE;
}

function listMarkdownSlugs(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((filename) => filename.endsWith(".md") && filename.toLowerCase() !== "readme.md")
    .map((filename) => filename.replace(/\.md$/, ""));
}

function uniq<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

function getLocaleDir(locale: Locale) {
  return path.join(POSTS_DIR, locale);
}

function getCandidatePaths(slug: string, locale: Locale): string[] {
  const candidates = [
    path.join(getLocaleDir(locale), `${slug}.md`),
  ];

  if (locale !== DEFAULT_LOCALE) {
    candidates.push(path.join(getLocaleDir(DEFAULT_LOCALE), `${slug}.md`));
  }

  candidates.push(path.join(POSTS_DIR, `${slug}.md`));

  return uniq(candidates);
}

function readPostFile(fullPath: string, slug: string): Post {
  const raw = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(raw);
  assertFrontmatter(data, slug);
  return {
    slug,
    title: String(data.title),
    date: String(data.date),
    excerpt: String(data.excerpt),
    category: data.category ? String(data.category) : undefined,
    tags: Array.isArray(data.tags) ? data.tags.map((t: any) => String(t)) : undefined,
    image: data.image ? String(data.image) : undefined,
    content,
  };
}

export function getAllPostSlugs(locale: string | Locale = DEFAULT_LOCALE): string[] {
  const normalized = normalizeLocale(locale);
  const slugs = uniq([
    ...listMarkdownSlugs(getLocaleDir(normalized)),
    ...listMarkdownSlugs(getLocaleDir(DEFAULT_LOCALE)),
    ...listMarkdownSlugs(POSTS_DIR),
  ]);
  return slugs.sort((a, b) => a.localeCompare(b));
}

export function getAllPosts(locale: string | Locale = DEFAULT_LOCALE): PostMeta[] {
  const normalized = normalizeLocale(locale);
  const posts: PostMeta[] = getAllPostSlugs(normalized)
    .map((slug) => {
      const post = getPostBySlug(slug, normalized);
      return {
        slug: post.slug,
        title: post.title,
        date: post.date,
        excerpt: post.excerpt,
        category: post.category,
        tags: post.tags,
        image: post.image,
      };
    })
    .sort(byDateDesc);

  return posts;
}

export function getLatestPost(locale: string | Locale = DEFAULT_LOCALE): PostMeta | null {
  const all = getAllPosts(locale);
  return all.length ? all[0] : null;
}

export function hasPostTranslation(slug: string, locale: string | Locale = DEFAULT_LOCALE): boolean {
  const normalized = normalizeLocale(locale);
  return fs.existsSync(path.join(getLocaleDir(normalized), `${slug}.md`));
}

export function getPostBySlug(slug: string, locale: string | Locale = DEFAULT_LOCALE): Post {
  const normalized = normalizeLocale(locale);

  for (const fullPath of getCandidatePaths(slug, normalized)) {
    if (fs.existsSync(fullPath)) {
      return readPostFile(fullPath, slug);
    }
  }

  throw new Error(`Post not found: ${slug}`);
}

export function getGuideCategories(locale: string | Locale = DEFAULT_LOCALE): Array<{ name: string; count: number }> {
  const posts = getAllPosts(locale);
  const counts = new Map<string, number>();
  for (const p of posts) {
    const c = (p.category ?? "").trim();
    if (!c) continue;
    counts.set(c, (counts.get(c) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/**
 * Simple, deterministic guide recommendations.
 * (Static-export friendly — no tracking, no personalization.)
 */
export function recommendGuides(opts: {
  area?: string;
  curriculumTags?: string[];
  budget?: string;
  limit?: number;
  locale?: string | Locale;
}): PostMeta[] {
  const posts = getAllPosts(opts.locale);
  const limit = opts.limit ?? 3;

  const picks: string[] = [];
  picks.push("choose-a-school");
  picks.push("school-fees-in-bali");
  picks.push("admissions-timeline-and-documents");

  const area = (opts.area ?? "").toLowerCase();
  if (area.includes("canggu") || area.includes("ubud")) {
    picks.push("canggu-vs-ubud-for-families");
  }

  const tags = (opts.curriculumTags ?? []).map((t) => String(t).toLowerCase());
  if (tags.some((t) => t.includes("ib") || t.includes("cambridge") || t.includes("british"))) {
    picks.push("ib-vs-british-vs-cambridge");
  }

  const budget = (opts.budget ?? "").toLowerCase();
  if (budget.includes("lux")) {
    picks.push("school-fees-in-bali");
  }

  const bySlug = new Map(posts.map((p) => [p.slug, p] as const));
  const unique = Array.from(new Set(picks)).map((s) => bySlug.get(s)).filter(Boolean) as PostMeta[];

  if (unique.length >= limit) return unique.slice(0, limit);

  const extras = posts.filter((p) => !unique.some((u) => u.slug === p.slug));
  return unique.concat(extras.slice(0, Math.max(0, limit - unique.length)));
}
