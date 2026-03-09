import type { Metadata } from "next";
import { getAllPosts, getPostBySlug } from "../../../lib/posts";
import PostDetailView from "../../../components/PostDetailView";

const SITE_URL = "https://bestschoolbali.com";

export const dynamicParams = false;
export const dynamic = "error";

export function generateStaticParams(): { slug: string }[] {
  return getAllPosts("en").map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPostBySlug(params.slug, "en");
  const title = post.title;
  const description = post.excerpt ?? "Guides for choosing a school in Bali.";
  const image = post.image ? `${SITE_URL}${post.image}` : `${SITE_URL}/img/banners/blog.webp`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/posts/${post.slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/posts/${post.slug}`,
      images: [{ url: image }],
    },
  };
}

export default function PostPage({ params }: { params: { slug: string } }) {
  return <PostDetailView slug={params.slug} />;
}
