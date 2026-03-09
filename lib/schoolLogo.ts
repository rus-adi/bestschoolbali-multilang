import type { School } from "./schools";

const PLACEHOLDER_SIZE = 256;

export function getSchoolLogo(school: Pick<School, "name" | "logo">): string {
  const logo = typeof school.logo === "string" ? school.logo.trim() : "";
  if (logo) {
    return logo;
  }

  const encodedName = encodeURIComponent(school.name || "School");
  return `https://ui-avatars.com/api/?name=${encodedName}&size=${PLACEHOLDER_SIZE}&background=random`;
}
