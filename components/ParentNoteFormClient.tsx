"use client";

import * as React from "react";
import { useT } from "./I18nProvider";

type SchoolLite = {
  id: string;
  name: string;
  area: string;
};

const WHATSAPP_NUMBER = "62111111";

function buildWhatsAppUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function safeTrim(v: string) {
  return String(v ?? "").trim();
}

function cleanLines(lines: Array<string | null | undefined>) {
  return lines
    .map((l) => safeTrim(String(l ?? "")))
    .filter(Boolean)
    .join("\n");
}

export default function ParentNoteFormClient({ school }: { school: SchoolLite }) {
  const [relationship, setRelationship] = React.useState("Parent");
  const [childContext, setChildContext] = React.useState("");
  const [note, setNote] = React.useState("");
  const [consent, setConsent] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const t = useT();

  const message = React.useMemo(() => {
    return cleanLines([
      `Parent note submission — ${school.name} (${school.area})`,
      "",
      `Relationship: ${relationship}`,
      childContext ? `Child age/grade (broad): ${childContext}` : null,
      "",
      "Quote (anonymous):",
      note ? note : "(write 1–3 short sentences)",
      "",
      consent ? "Consent: Yes — ok to publish anonymously" : "Consent: Not confirmed yet",
      "",
      "Please remove any personal identifiers before publishing (names, phone numbers, private details).",
    ]);
  }, [school.name, school.area, relationship, childContext, note, consent]);

  function openWhatsApp() {
    const url = buildWhatsAppUrl(message);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      // ignore
    }
  }

  const disabled = !safeTrim(note) || !consent;

  return (
    <div>
      <div className="small" style={{ marginTop: 0 }}>
        {t("parentFeedback.intro")}
      </div>

      <div className="formGrid" style={{ marginTop: 14 }}>
        <div>
          <label className="small">{t("parentFeedback.relationship")}</label>
          <select className="select" value={relationship} onChange={(e) => setRelationship(e.target.value)}>
            <option>{t("parentFeedback.parent")}</option>
            <option>{t("parentFeedback.guardian")}</option>
            <option>{t("parentFeedback.formerParent")}</option>
            <option>{t("parentFeedback.alumniFamily")}</option>
          </select>
        </div>
        <div>
          <label className="small">{t("parentFeedback.childContext")}</label>
          <input
            className="input"
            value={childContext}
            onChange={(e) => setChildContext(e.target.value)}
            placeholder={t("parentFeedback.childContextPlaceholder")}
          />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label className="small">{t("parentFeedback.noteLabel")}</label>
          <textarea
            className="textarea"
            rows={5}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("parentFeedback.notePlaceholder")}
          />
          <div className="small muted" style={{ marginTop: 8 }}>
            {t("parentFeedback.tip")}
          </div>
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label className="checkboxRow">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span className="small">
              {t("parentFeedback.consent")}
            </span>
          </label>
        </div>
      </div>

      <div className="formActions">
        <button type="button" className="btn btnPrimary" onClick={openWhatsApp} disabled={disabled}>
          {t("actions.sendWhatsApp")} <span aria-hidden="true">→</span>
        </button>
        <button type="button" className="btn" onClick={copyMessage}>
          {copied ? t("actions.copied") : t("actions.copyMessage")}
        </button>
      </div>

      <p className="small formNote">
        {t("parentFeedback.noServerSubmit")}
      </p>
    </div>
  );
}
