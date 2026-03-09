import fs from 'fs';
import path from 'path';

const POSTS_DIR = path.join(process.cwd(), 'posts');
const EN_DIR = path.join(POSTS_DIR, 'en');
const LOCALES = ['nl', 'de', 'es', 'fr', 'ru', 'zh', 'ko', 'ja', 'ar'];

function listMd(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.md') && f.toLowerCase() !== 'readme.md');
}

function normalize(text) {
  return text.replace(/\r\n/g, '\n').trim();
}

const enFiles = listMd(EN_DIR);
let hasIssue = false;

for (const locale of LOCALES) {
  const localeDir = path.join(POSTS_DIR, locale);
  const missing = [];
  const identical = [];

  for (const file of enFiles) {
    const enPath = path.join(EN_DIR, file);
    const lcPath = path.join(localeDir, file);

    if (!fs.existsSync(lcPath)) {
      missing.push(file);
      continue;
    }

    const en = normalize(fs.readFileSync(enPath, 'utf8'));
    const lc = normalize(fs.readFileSync(lcPath, 'utf8'));

    if (en === lc) {
      identical.push(file);
    }
  }

  if (missing.length || identical.length) {
    hasIssue = true;
    console.log(`\n[${locale}]`);
    if (missing.length) console.log(`  Missing   (${missing.length}): ${missing.join(', ')}`);
    if (identical.length) console.log(`  Untranslated (${identical.length}): ${identical.join(', ')}`);
  } else {
    console.log(`[${locale}] OK`);
  }
}

if (hasIssue) {
  console.log('\nTranslation check failed: some localized post files are missing or still identical to English.');
  process.exit(1);
}

console.log('\nAll localized post files exist and differ from English source.');
