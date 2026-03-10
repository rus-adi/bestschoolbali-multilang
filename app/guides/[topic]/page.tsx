import type { Metadata } from "next";
import { GUIDE_TOPICS, getGuideTopic } from "../../../lib/guideTopics";
import { slugify } from "../../../lib/slug";
import GuideTopicPageContent from "./GuideTopicPageContent";

const SITE_URL = "https://bestschoolbali.com";

export const dynamicParams = false;
export const dynamic = "error";

type GuideTopicPageProps = {
  params: { topic: string };
};

export function generateStaticParams(): { topic: string }[] {
  return GUIDE_TOPICS.map((t) => ({ topic: t.slug }));
}

export function generateMetadata({ params }: GuideTopicPageProps): Metadata {
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

export default function GuideTopicPage({ params }: GuideTopicPageProps) {
  return <GuideTopicPageContent params={params} />;
}
