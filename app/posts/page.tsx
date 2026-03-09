import type { Metadata } from "next";
import PostsIndexView from "../../components/PostsIndexView";

const SITE_URL = "https://bestschoolbali.com";

export const dynamic = "error";

export const metadata: Metadata = {
  title: "Guides",
  description: "Practical guides for choosing a school in Bali: tours, fees, curriculums, and family logistics.",
  alternates: { canonical: `${SITE_URL}/posts` },
  openGraph: {
    title: "Guides",
    description: "Practical guides for choosing a school in Bali: tours, fees, curriculums, and family logistics.",
    url: `${SITE_URL}/posts`,
    images: [{ url: `${SITE_URL}/img/banners/blog.webp` }],
  },
};

export default function PostsIndexPage() {
  return <PostsIndexView />;
}
