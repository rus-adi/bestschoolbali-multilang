import { getAllSchools, type School } from "./schools";
import { slugify } from "./slug";

export type AreaEntry = {
  name: string;
  slug: string;
  count: number;
};

export type CurriculumEntry = {
  tag: string;
  slug: string;
  count: number;
};

export type BudgetEntry = {
  name: string;
  slug: string;
  count: number;
};

export type TypeEntry = {
  name: string;
  slug: string;
  count: number;
};

function uniqSorted(items: string[]) {
  return Array.from(new Set(items.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

type Bucket = { count: number; variants: Map<string, number> };

const STATIC_AREA_ALIASES: Array<{ slug: string; name: string }> = [
  { slug: "canggu-sanur", name: "Canggu / Sanur" },
];

function pickDisplay(bucket?: Bucket, fallback = "") {
  if (!bucket) return fallback;
  let display = fallback;
  let best = -1;
  for (const [variant, c] of bucket.variants.entries()) {
    if (c > best || (c === best && variant.length < display.length)) {
      best = c;
      display = variant;
    }
  }
  return display;
}

function mergeBuckets(values: string[]) {
  const buckets = new Map<string, Bucket>();
  for (const raw of values) {
    const value = String(raw ?? "").trim();
    if (!value) continue;
    const slug = slugify(value);
    const bucket = buckets.get(slug) ?? { count: 0, variants: new Map<string, number>() };
    bucket.count += 1;
    bucket.variants.set(value, (bucket.variants.get(value) ?? 0) + 1);
    buckets.set(slug, bucket);
  }
  return buckets;
}

export function getAllAreas(locale = "en"): AreaEntry[] {
  const canonicalSchools = getAllSchools("en");
  const localizedSchools = getAllSchools(locale);

  const canonicalValues = canonicalSchools.flatMap((s) => (s.areas?.length ? s.areas : [s.area])).filter(Boolean);
  const localizedValues = localizedSchools.flatMap((s) => (s.areas?.length ? s.areas : [s.area])).filter(Boolean);

  const canonical = mergeBuckets(canonicalValues);
  const localized = mergeBuckets(localizedValues);

  const entries: AreaEntry[] = Array.from(canonical.entries()).map(([slug, bucket]) => ({
    slug,
    count: bucket.count,
    name: pickDisplay(localized.get(slug), pickDisplay(bucket, slug)),
  }));

  for (const alias of STATIC_AREA_ALIASES) {
    if (!entries.some((entry) => entry.slug === alias.slug)) {
      entries.push({ ...alias, count: 0 });
    }
  }

  return entries.sort((a, b) => a.name.localeCompare(b.name));
}

export function resolveAreaSlug(slug: string, locale = "en"): string | null {
  const match = getAllAreas(locale).find((a) => a.slug === slug);
  return match?.name ?? null;
}

export function schoolsInArea(areaName: string, locale = "en"): School[] {
  const schools = getAllSchools(locale);
  const areaSlug = slugify(areaName);
  return schools.filter((s) => {
    const list = s.areas?.length ? s.areas : [s.area];
    return list.some((a) => slugify(String(a ?? "")) === areaSlug);
  });
}

export function getAllCurriculums(locale = "en"): CurriculumEntry[] {
  const canonicalSchools = getAllSchools("en");
  const localizedSchools = getAllSchools(locale);

  const canonical = mergeBuckets(canonicalSchools.flatMap((s) => s.curriculum_tags ?? []));
  const localized = mergeBuckets(localizedSchools.flatMap((s) => s.curriculum_tags ?? []));

  const entries: CurriculumEntry[] = Array.from(canonical.entries()).map(([slug, bucket]) => ({
    slug,
    count: bucket.count,
    tag: pickDisplay(localized.get(slug), pickDisplay(bucket, slug)),
  }));

  return entries.sort((a, b) => a.tag.localeCompare(b.tag));
}

export function resolveCurriculumSlug(slug: string, locale = "en"): string | null {
  const match = getAllCurriculums(locale).find((t) => t.slug === slug);
  return match?.tag ?? null;
}

export function schoolsWithCurriculum(tag: string, locale = "en"): School[] {
  const schools = getAllSchools(locale);
  const tagSlug = slugify(tag);
  return schools.filter((s) => (s.curriculum_tags ?? []).some((t) => slugify(t) === tagSlug));
}

export function schoolsWithCurriculumSlug(slug: string, locale = "en"): School[] {
  const schools = getAllSchools(locale);
  return schools.filter((s) => (s.curriculum_tags ?? []).some((t) => slugify(t) === slug));
}

export function getAllBudgets(locale = "en"): BudgetEntry[] {
  const canonicalSchools = getAllSchools("en");
  const localizedSchools = getAllSchools(locale);

  const canonical = mergeBuckets(canonicalSchools.map((s) => String(s.budget_category ?? "").trim()));
  const localized = mergeBuckets(localizedSchools.map((s) => String(s.budget_category ?? "").trim()));

  const preferredOrder = ["budget", "mid-range", "premium", "luxury"];

  const entries: BudgetEntry[] = Array.from(canonical.entries()).map(([slug, bucket]) => ({
    slug,
    count: bucket.count,
    name: pickDisplay(localized.get(slug), pickDisplay(bucket, slug)),
  }));

  return entries.sort((a, b) => {
    const ai = preferredOrder.indexOf(a.slug);
    const bi = preferredOrder.indexOf(b.slug);
    if (ai === -1 && bi === -1) return a.name.localeCompare(b.name);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

export function resolveBudgetSlug(slug: string, locale = "en"): string | null {
  const match = getAllBudgets(locale).find((b) => b.slug === slug);
  return match?.name ?? null;
}

export function schoolsInBudget(budgetName: string, locale = "en"): School[] {
  const schools = getAllSchools(locale);
  const budgetSlug = slugify(budgetName);
  return schools.filter((s) => slugify(String(s.budget_category ?? "")) === budgetSlug);
}

export function schoolsInBudgetSlug(slug: string, locale = "en"): School[] {
  const name = resolveBudgetSlug(slug, locale);
  return name ? schoolsInBudget(name, locale) : [];
}

export function getAllTypes(locale = "en"): TypeEntry[] {
  const canonicalSchools = getAllSchools("en");
  const localizedSchools = getAllSchools(locale);

  const canonical = mergeBuckets(canonicalSchools.map((s) => String(s.type ?? "").trim()));
  const localized = mergeBuckets(localizedSchools.map((s) => String(s.type ?? "").trim()));

  const entries: TypeEntry[] = Array.from(canonical.entries()).map(([slug, bucket]) => ({
    slug,
    count: bucket.count,
    name: pickDisplay(localized.get(slug), pickDisplay(bucket, slug)),
  }));

  return entries.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function resolveTypeSlug(slug: string, locale = "en"): string | null {
  const match = getAllTypes(locale).find((t) => t.slug === slug);
  return match?.name ?? null;
}

export function schoolsInType(typeName: string, locale = "en"): School[] {
  const schools = getAllSchools(locale);
  const typeSlug = slugify(typeName);
  return schools.filter((s) => slugify(String(s.type ?? "")) === typeSlug);
}

export function schoolsInTypeSlug(slug: string, locale = "en"): School[] {
  const schools = getAllSchools(locale);
  return schools.filter((s) => slugify(String(s.type ?? "")) === slug);
}
