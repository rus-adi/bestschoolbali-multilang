import type { School } from "./schools";

const PLACEHOLDER_SIZE = 256;

export function getSchoolLogoPlaceholder(name: string): string {
  const encodedName = encodeURIComponent(name || "School");
  return `https://ui-avatars.com/api/?name=${encodedName}&size=${PLACEHOLDER_SIZE}&background=random`;
}

export function getSchoolLogo(school: Pick<School, "id" | "name" | "logo">): string {
  const id = typeof school.id === "string" ? school.id.trim() : "";
  if (id) return `/img/schools/${id}.webp`;

  const logo = typeof school.logo === "string" ? school.logo.trim() : "";
  if (logo) return logo;
  return getSchoolLogoPlaceholder(school.name || "School");
}
