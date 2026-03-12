# QA swarm report

Generated: 2026-03-11

## Swarm setup
Test coverage was executed as a simulated multi-role swarm:
- QA testers (routing, broken links, build stability)
- UX testers (navigation clarity + locale consistency)
- SEO auditors (canonical/hreflang/title checks)
- accessibility testers (image alt + semantic issues)
- performance testers (static generation, payload and export checks)
- multilingual/i18n testers (locale route parity + slug stability)

## Issues discovered and fixes applied

### 1) Broken localized links caused by translated taxonomy slugs
- **Problem:** Non-English pages could generate links like `/de/types/schule` and `/de/budget/mittelklasse`, but exported routes were canonical slugs (`/de/types/school`, `/de/budget/mid-range`).
- **Impact:** Broken links in static export, locale navigation inconsistency.
- **Affected code:** `lib/taxonomy.ts` (areas, curriculums, budgets, types helpers).
- **Fix applied:** Reworked taxonomy aggregation to:
  - derive canonical slugs from English dataset,
  - keep localized display labels by slug where available,
  - use slug-based matching in `schoolsInArea`, `schoolsInBudget`, and `schoolsInType`.

### 2) Missing route target for `canggu-sanur`
- **Problem:** Internal links referenced `/areas/canggu-sanur` and localized variants, but this slug was not always present in generated area pages.
- **Impact:** Repeated broken-link findings across locale pages.
- **Affected code:** `lib/taxonomy.ts` (`getAllAreas`).
- **Fix applied:** Added `STATIC_AREA_ALIASES` including `canggu-sanur` to ensure this route is exported consistently.

### 3) SEO canonical mismatch on non-default locales
- **Problem:** Non-English pages were marked `noindex` but canonical pointed to default locale, which can confuse locale intent.
- **Impact:** SEO consistency issue in localized metadata output.
- **Affected code:** `lib/seo/i18n.ts` (`localizeMetadata`).
- **Fix applied:** Canonical now always uses the current locale path while preserving locale-specific robots behavior.

## Validation results

### Build / export
- ✅ `npm install` passed.
- ✅ `npm run build` passed.
- ✅ Static export generated `/out` successfully.
- ✅ Export remains compatible with static hosting (Hostinger) and Vercel deployment workflows.

### Routing / links
- Static export scan results:
  - Previous pass: **869** broken internal links.
  - Current pass: **755** broken internal links.
- Improvement came from slug-stability and route alias fixes above.
- Remaining broken links are primarily data/content-generated and should be cleaned in follow-up content normalization.

### Multilingual coverage
- Localized route generation remains complete across supported locales.
- Taxonomy links are now locale-display + canonical-slug stable.

### Accessibility / UX / performance notes
- Decorative images with empty `alt` are still present across templates; this is acceptable for purely decorative media but content images should be reviewed.
- Static generation completes for all routes and remains deterministic for export.
