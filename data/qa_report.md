# QA report

Generated: 2026-03-11

## Scope
Repository-wide QA refresh covering:
- routing and locale export behavior
- translation key coverage
- form integration consistency
- static link and asset integrity
- accessibility/UX/SEO spot checks

## Routing validation
- ✅ Localized static routes are generated for all supported locales (`en`, `nl`, `de`, `es`, `fr`, `ru`, `zh`, `ko`, `ja`, `ar`) via shared locale static params.
- ✅ Localized dynamic routes now combine locale + segment params during static generation, preventing root-language fallback behavior on exported pages.
- ✅ `npm run build` succeeds and pre-renders localized routes such as `/en/schools`, `/zh/schools`, and locale-specific detail pages.
- ✅ `npm run dev` serves localized routes correctly after making `next.config.js` output mode environment-aware for development.

## Translation coverage
- ✅ Locale JSON key structure is now aligned across all language files.
- ✅ Missing translation keys were backfilled from English values and marked with `[EN fallback]`.
- ✅ Post-fix verification reports `missing total 0` across locale JSON files.

## Form integration
- ✅ Centralized school inquiry form URL is defined in `lib/forms/schoolInterest.ts`.
- ✅ "Share Interest" and "Contact About This School" flows use the shared form builder.
- ✅ Canonical form URL in use: `https://forms.gle/pzrQT9VDd2j3sBN6A`.
- ✅ No placeholder tokens (`FORM_ID`, `SCHOOL_FIELD_ID`) found in repository scan.

## Broken links / missing assets
Static export scan (`out/`):
- ⚠️ Internal links checked: 3,466 HTML files scanned.
- ⚠️ Potential broken internal links detected: 909.
  - Most are localized slug mismatches (e.g. links to localized path variants that are not exported for translated slugs).
- ✅ Missing static assets referenced by HTML: 0.

## Accessibility findings
- ⚠️ Multiple `<img>` elements use empty `alt=""` in content sections.
  - Some are decorative and acceptable.
  - Some content images may benefit from descriptive `alt` text for screen readers.

## UX consistency findings
- ✅ Locale-aware navigation/header/footer links are generated through locale-aware href handling.
- ⚠️ Remaining UX inconsistency risk: some localized content still points to non-localized derived links where translated slugs are unavailable.

## SEO metadata findings
- ✅ Locale pages emit locale-aware canonical + hreflang metadata.
- ⚠️ Duplicate `<title>` values remain common across locale variants (expected for translated/canonicalized shared templates), but should be reviewed for priority landing pages if unique per-locale title strategy is desired.

## Build and deployment readiness
- ✅ `npm install` passed.
- ✅ `npm run build` passed.
- ✅ Static export directory `out/` is generated and suitable for static hosting.
- ✅ Exported output is compatible with Vercel static deployment and Hostinger static hosting (upload `out/` contents).
