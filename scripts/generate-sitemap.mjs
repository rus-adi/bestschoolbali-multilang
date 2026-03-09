import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://bestschoolbali.com';
const LOCALES = ['en', 'nl', 'de', 'es', 'fr', 'ru', 'zh', 'ko', 'ja', 'ar'];
const DEFAULT_LOCALE = 'en';

function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .trim()
    .replace(/\s*\/\s*/g, '-')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function uniq(arr) {
  return Array.from(new Set(arr.filter(Boolean)));
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function readJson(file) {
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function listPostSlugs(postsDir) {
  if (!fs.existsSync(postsDir)) return [];
  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith('.md') && f.toLowerCase() !== 'readme.md');
  return files.map((f) => f.replace(/\.md$/, ''));
}

function xmlEscape(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function localizedUrl(locale, route) {
  if (route === '/') return `${SITE_URL}/${locale}/`;
  return `${SITE_URL}/${locale}${route}`;
}

function buildUrlset(routes, lastmod) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ];

  for (const route of routes) {
    lines.push('  <url>');
    lines.push(`    <loc>${xmlEscape(localizedUrl(DEFAULT_LOCALE, route))}</loc>`);
    lines.push(`    <lastmod>${lastmod}</lastmod>`);

    for (const locale of LOCALES) {
      lines.push(
        `    <xhtml:link rel="alternate" hreflang="${locale}" href="${xmlEscape(localizedUrl(locale, route))}" />`,
      );
    }

    lines.push(
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${xmlEscape(localizedUrl(DEFAULT_LOCALE, route))}" />`,
    );
    lines.push('  </url>');
  }

  lines.push('</urlset>');
  return lines.join('\n') + '\n';
}

const root = process.cwd();
const dataPath = path.join(root, 'data', 'schools.json');
const postsDir = path.join(root, 'posts');
const publicDir = path.join(root, 'public');
const outPath = path.join(publicDir, 'sitemap.xml');

const parsed = readJson(dataPath);
const schools = Array.isArray(parsed) ? parsed : parsed?.schools ?? [];

const schoolIds = uniq(schools.map((s) => s?.id).filter(Boolean));

const allAreas = [];
for (const s of schools) {
  if (Array.isArray(s?.areas) && s.areas.length) {
    for (const a of s.areas) allAreas.push(a);
  } else if (s?.area) {
    allAreas.push(s.area);
  }
}
const areaSlugs = uniq(allAreas).map(slugify);

const curriculumSlugs = uniq(schools.flatMap((s) => s?.curriculum_tags ?? [])).map(slugify);
const budgetSlugs = uniq(schools.map((s) => s?.budget_category ?? '')).map(slugify).filter(Boolean);
const typeSlugs = uniq(schools.map((s) => s?.type ?? '')).map(slugify).filter(Boolean);

const postSlugs = uniq([...listPostSlugs(postsDir), ...listPostSlugs(path.join(postsDir, 'en'))]);

const areaComparePairs = [
  'canggu-vs-ubud',
  'canggu-vs-sanur',
  'ubud-vs-sanur',
  'canggu-vs-bukit-region',
  'sanur-vs-bukit-region',
  'ubud-vs-bukit-region',
];

const ageBands = ['early-years', 'primary', 'secondary'];
const guideTopics = [
  'getting-started',
  'fees-and-budgets',
  'admissions',
  'curriculum',
  'areas-and-lifestyle',
  'relocation',
];

const staticRoutes = [
  '/',
  '/schools',
  '/areas',
  '/curriculums',
  '/types',
  '/budget',
  '/fees',
  '/fees/estimate',
  '/methodology',
  '/for-schools',
  '/for-schools/pricing',
  '/compare',
  '/compare/areas',
  '/ages',
  '/guides',
  '/posts',
  '/contact',
  '/privacy',
  '/terms',
];

const routes = [];
for (const r of staticRoutes) routes.push(r);
for (const id of schoolIds) routes.push(`/schools/${id}`);
for (const slug of areaSlugs) routes.push(`/areas/${slug}`);
for (const slug of curriculumSlugs) routes.push(`/curriculums/${slug}`);
for (const slug of budgetSlugs) routes.push(`/budget/${slug}`);
for (const slug of ageBands) routes.push(`/ages/${slug}`);
for (const slug of typeSlugs) routes.push(`/types/${slug}`);
for (const slug of areaComparePairs) routes.push(`/compare/areas/${slug}`);
for (const slug of postSlugs) routes.push(`/posts/${slug}`);
for (const slug of guideTopics) routes.push(`/guides/${slug}`);

const uniqueRoutes = uniq(routes).sort();

if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(outPath, buildUrlset(uniqueRoutes, todayISO()), 'utf8');
console.log(`Generated multilingual sitemap with ${uniqueRoutes.length} canonical routes → ${outPath}`);