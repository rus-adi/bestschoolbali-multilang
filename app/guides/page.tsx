import type { Metadata } from "next";
import GuidesHubContent from "../../components/GuidesHubContent";

const SITE_URL = "https://bestschoolbali.com";

export const dynamic = "error";

export const metadata: Metadata = {
  title: "Guides for choosing a school in Bali",
  description:
    "Practical guides for parents comparing international schools in Bali — admissions, fees, curriculum, and area shortlists.",
  alternates: { canonical: `${SITE_URL}/guides` },
};

export default function GuidesHubPage() {
  return <GuidesHubContent />;
}
