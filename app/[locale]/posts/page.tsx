import type { Metadata } from "next";
import PostsIndexView from "../../../components/PostsIndexView";
import { isLocale, type Locale } from "../../../lib/i18n/locales";
import { localizeMetadata } from "../../../lib/seo/i18n";
import { generateLocaleStaticParams } from '../../../lib/i18n/staticParams';

export const dynamic = "error";

export function generateStaticParams() {
  return generateLocaleStaticParams();
}

const baseMetadata: Metadata = {
  title: "Guides",
  description: "Practical guides for choosing a school in Bali: tours, fees, curriculums, and family logistics.",
};

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  return localizeMetadata(baseMetadata, params.locale as Locale, "/posts", {
    noindex: params.locale !== "en",
  });
}

export default function LocalizedPostsIndexPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) {
    return null;
  }

  return <PostsIndexView locale={params.locale as Locale} />;
}

