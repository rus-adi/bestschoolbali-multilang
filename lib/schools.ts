import fs from "fs";
import path from "path";
import { DEFAULT_LOCALE, isLocale, type Locale } from "./i18n/locales";

export type FeeStatus = "estimate" | "listed";

export type Fees = {
  display: string;
  currency?: "IDR";
  unit?: "year" | "month";
  min?: number;
  max?: number;
  status?: FeeStatus;
};

export type School = {
  id: string;
  name: string;
  logo?: string | null;
  area: string;
  areas?: string[];
  type?: string;

  map_query?: string;

  curriculum_tags?: string[];
  age_min?: number | null;
  age_max?: number | null;

  fees?: Fees;
  budget_category?: string;

  summary?: string;
  highlights?: string[];

  /** Long-form narrative profile in Markdown */
  profile_md?: string;

  details?: {
    curriculum?: string;
    address?: string;
    phone?: string;
    email?: string;
  };

  /** Short, anonymized notes collected from families (optional). */
  parent_perspectives?: Array<{
    quote: string;
    label: string;
    is_example?: boolean;
    /** Optional local video clip path (e.g. "/videos/parents/<id>-1.mp4"). */
    video?: string;
  }>;

  /** Optional verification/paid placement fields (for future monetization). */
  verification?: {
    status: "unverified" | "verified";
    last_verified?: string;
  };
  sponsorship?: {
    sponsored?: boolean;
    featured_rank?: number;
  };
};

type SchoolsFile = {
  site?: {
    name?: string;
    domain?: string;
    generated?: string;
    notes?: string;
    author?: string;
  };
  schools: School[];
};

type SchoolsOverlayFile = {
  schools?: Record<string, Partial<School>>;
};

const SCHOOLS_PATH = path.join(process.cwd(), "data", "schools.json");

function normalizeLocale(locale?: string | Locale): Locale {
  return isLocale(locale) ? locale : DEFAULT_LOCALE;
}

function deepMergeSchool(base: School, overlay?: Partial<School>): School {
  if (!overlay) return base;
  return {
    ...base,
    ...overlay,
    details: {
      ...(base.details ?? {}),
      ...(overlay.details ?? {}),
    },
  };
}

function getOverlayById(locale: Locale): Record<string, Partial<School>> {
  const overlayPath = path.join(process.cwd(), "data", "i18n", locale, "schools.json");
  if (!fs.existsSync(overlayPath)) return {};

  const raw = fs.readFileSync(overlayPath, "utf8");
  const parsed = JSON.parse(raw) as SchoolsOverlayFile;
  return parsed.schools ?? {};
}

export function getAllSchools(locale: string | Locale = DEFAULT_LOCALE): School[] {
  const raw = fs.readFileSync(SCHOOLS_PATH, "utf8");
  const parsed = JSON.parse(raw) as SchoolsFile;
  const schools = Array.isArray(parsed) ? (parsed as unknown as School[]) : (parsed.schools ?? []);

  const normalized = normalizeLocale(locale);
  if (normalized === DEFAULT_LOCALE) {
    return schools.slice().sort((a, b) => a.name.localeCompare(b.name));
  }

  const overlayById = getOverlayById(normalized);
  return schools
    .map((school) => deepMergeSchool(school, overlayById[school.id]))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getSchoolBySlug(slug: string, locale: string | Locale = DEFAULT_LOCALE): School | null {
  const all = getAllSchools(locale);
  return all.find((s) => s.id === slug) ?? null;
}

export function getFeaturedSchool(locale: string | Locale = DEFAULT_LOCALE): School | null {
  // Keep this stable for marketing; change the ID whenever you want a new featured school.
  return getSchoolBySlug("green-school-bali", locale) ?? (getAllSchools(locale)[0] ?? null);
}
