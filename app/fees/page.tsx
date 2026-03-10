import type { Metadata } from "next";
import { getAllSchools } from "../../lib/schools";
import { getAllBudgets } from "../../lib/taxonomy";
import FeesPageContent from "../../components/FeesPageContent";

export const dynamic = "error";

export const metadata: Metadata = {
  title: "School fees in Bali",
  description:
    "A practical overview of international school fees in Bali — what’s usually included, what costs extra, and how to compare total first-year cost across schools.",
  alternates: { canonical: "https://bestschoolbali.com/fees" },
};

function countByStatus(locale = "en") {
  const schools = getAllSchools(locale);
  let listed = 0;
  let estimate = 0;
  for (const s of schools) {
    if (!s.fees?.status) continue;
    if (s.fees.status === "listed") listed += 1;
    if (s.fees.status === "estimate") estimate += 1;
  }
  return { listed, estimate, total: schools.length };
}

export default function FeesOverviewPage({ locale = "en" }: { locale?: string }) {
  const budgets = getAllBudgets(locale);
  const { listed, estimate, total } = countByStatus(locale);

  return <FeesPageContent budgets={budgets} listed={listed} estimate={estimate} total={total} />;
}
