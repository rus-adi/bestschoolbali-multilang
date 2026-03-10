import type { Metadata } from "next";
import { getAllSchools } from "../../lib/schools";
import T from "../../components/T";
import { getAllAreas, getAllBudgets, getAllCurriculums } from "../../lib/taxonomy";
import GuidanceFormClient from "../../components/GuidanceFormClient";

export const dynamic = "error";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get free guidance shortlisting schools in Bali, or claim and upgrade a school profile.",
  alternates: { canonical: "https://bestschoolbali.com/contact" },
  openGraph: {
    title: "Contact | Best School Bali",
    description: "Ask for help shortlisting schools, or claim and upgrade a school profile.",
    url: "https://bestschoolbali.com/contact",
    images: [{ url: "https://bestschoolbali.com/img/banners/contact.webp" }],
  },
};

export default function ContactPage({ locale = "en" }: { locale?: string }) {
  const schools = getAllSchools(locale);
  const schoolsLite = schools.map((s) => ({ id: s.id, name: s.name, area: s.area }));

  const areas = getAllAreas(locale).map((a) => a.name);
  const curriculums = getAllCurriculums(locale).map((t) => t.tag);
  const budgets = getAllBudgets(locale).map((b) => b.name);

  return (
    <div className="container">
      <section className="hero">
        <div className="heroInner">
          <div>
            <h1><T k="nav.contact" /></h1>
            <p className="small" style={{ marginTop: 6 }}>
              <T k="guidanceForm.parentHelp" />
            </p>
          </div>
          <div className="heroMedia" aria-hidden="true">
            <img src="/img/banners/contact.webp" alt="" />
          </div>
        </div>
      </section>

      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}><T k="actions.messageWhatsApp" /></h2>
        <GuidanceFormClient areas={areas} curriculums={curriculums} budgets={budgets} schools={schoolsLite} />
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}><T k="actions.sendWhatsApp" /></h2>
        <p className="small" style={{ marginTop: 0 }}>
          <T k="guidanceForm.schoolHelp" />
        </p>
        <p style={{ marginBottom: 0 }}>
          <a className="btn btnPrimary" href="https://wa.me/6285285408220" rel="nofollow">
            WhatsApp +62 852-8540-8220
          </a>
        </p>
      </div>

      <p className="small" style={{ marginTop: 16 }}>
        <T k="guidanceForm.messageOpensWhatsApp" />
      </p>
    </div>
  );
}
