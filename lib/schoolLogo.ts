import type { School } from "./schools";

const PLACEHOLDER_SIZE = 256;

function getInitials(name: string): string {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) return "S";
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "S";
}

function extractMarkdownUrl(value: string): string {
  const trimmed = value.trim();
  const markdownMatch = trimmed.match(/^\[[^\]]*\]\((https?:\/\/[^)]+)\)$/i);
  if (markdownMatch?.[1]) return markdownMatch[1].trim();
  return trimmed;
}

export function getSchoolLogoPlaceholder(name: string): string {
  const initials = encodeURIComponent(getInitials(name || "School"));
  return `https://ui-avatars.com/api/?name=${initials}&size=${PLACEHOLDER_SIZE}&background=random`;
}

export function getSchoolLogo(school: Pick<School, "name" | "logo">): string {
  const rawLogo = typeof school.logo === "string" ? school.logo : "";
  const logo = rawLogo ? extractMarkdownUrl(rawLogo) : "";
  if (logo) return logo;
  return getSchoolLogoPlaceholder(school.name || "School");
}
