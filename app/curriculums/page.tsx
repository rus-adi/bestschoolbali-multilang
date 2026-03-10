import { getAllCurriculums } from "../../lib/taxonomy";
import type { Metadata } from "next";
import CurriculumsPageContent from "../../components/CurriculumsPageContent";

export const dynamic = "error";

export const metadata: Metadata = {
  title: "Curriculums in Bali",
  description: "Explore schools by curriculum approach (IB, Cambridge, Montessori, and more).",
  alternates: { canonical: "https://bestschoolbali.com/curriculums" },
};

export default function CurriculumsPage({ locale = "en" }: { locale?: string }) {
  const tags = getAllCurriculums(locale);
  return <CurriculumsPageContent tags={tags} />;
}
