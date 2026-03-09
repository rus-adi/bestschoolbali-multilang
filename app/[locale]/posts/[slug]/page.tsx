import type { Metadata } from "next";
import { getAllPostSlugs, getPostBySlug, hasPostTranslation } from "../../../../lib/posts";
import PostDetailView from "../../../../components/PostDetailView";
import { isLocale, LOCALES, type Locale } from "../../../../lib/i18n/locales";
import { notFound } from "next/navigation";
import { localizeMetadata } from "../../../../lib/seo/i18n";

const SITE_URL = "https://bestschoolbali.com";

export const dynamicParams = false;
export const dynamic = "error";

export function generateStaticParams(): Array<{ locale: string; slug: string }> {
  return LOCALES.flatMap((locale) =>
    getAllPostSlugs(locale).filter((slug) => hasPostTranslation(slug, locale)).map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};

  if (!hasPostTranslation(params.slug, params.locale)) return {};
  const post = getPostBySlug(params.slug, params.locale);
  const title = post.title;
  const description = post.excerpt ?? "Guides for choosing a school in Bali.";
  const image = post.image ? `${SITE_URL}${post.image}` : `${SITE_URL}/img/banners/blog.webp`;

  const base: Metadata = {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image }],
      url: `${SITE_URL}/posts/${post.slug}`,
    },
  };

  return localizeMetadata(base, params.locale as Locale, `/posts/${post.slug}`, {
    noindex: params.locale !== "en",
  });
}

export default function LocalizedPostPage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  if (!isLocale(params.locale)) {
    return null;
  }

  if (!hasPostTranslation(params.slug, params.locale)) notFound();
  return <PostDetailView slug={params.slug} locale={params.locale as Locale} />;
}
