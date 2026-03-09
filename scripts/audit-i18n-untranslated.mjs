import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function flatten(node, prefix = '', out = {}) {
  if (Array.isArray(node)) {
    node.forEach((v, i) => flatten(v, `${prefix}[${i}]`, out));
    return out;
  }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      flatten(v, prefix ? `${prefix}.${k}` : k, out);
    }
    return out;
  }
  out[prefix] = node;
  return out;
}

function compareAgainstEnglish(basePath, targetPath) {
  const base = flatten(readJson(basePath));
  const target = flatten(readJson(targetPath));
  const identical = [];
  const missing = [];
  const empty = [];

  for (const [k, v] of Object.entries(base)) {
    if (!(k in target)) {
      missing.push(k);
      continue;
    }
    const tv = target[k];
    if (typeof v === 'string' && typeof tv === 'string') {
      if (tv.trim() === '') empty.push(k);
      if (tv === v) identical.push(k);
    }
  }
  return { identical, missing, empty };
}

function auditLocales() {
  const localesDir = path.join(ROOT, 'locales');
  const files = fs.readdirSync(localesDir).filter((f) => f.endsWith('.json')).sort();
  const base = path.join(localesDir, 'en.json');
  return files
    .filter((f) => !['en.json', 'ar.json'].includes(f))
    .map((f) => {
      const r = compareAgainstEnglish(base, path.join(localesDir, f));
      return { file: `locales/${f}`, ...r };
    });
}

function auditDataI18n() {
  const base = path.join(ROOT, 'data/i18n/en/schools.json');
  const baseDir = path.join(ROOT, 'data/i18n');
  const langs = fs.readdirSync(baseDir).filter((l) => fs.statSync(path.join(baseDir, l)).isDirectory()).sort();
  return langs
    .filter((l) => !['en', 'ar'].includes(l))
    .map((l) => {
      const r = compareAgainstEnglish(base, path.join(ROOT, `data/i18n/${l}/schools.json`));
      return { file: `data/i18n/${l}/schools.json`, ...r };
    });
}

const localeRows = auditLocales();
const dataRows = auditDataI18n();

const lines = [];
lines.push('# i18n untranslated audit');
lines.push('');
lines.push('## /locales (vs en.json, excluding ar.json)');
lines.push('');
for (const row of localeRows) {
  lines.push(`- ${row.file}: identical=${row.identical.length}, missing=${row.missing.length}, empty=${row.empty.length}`);
}
lines.push('');
lines.push('## /data/i18n (vs data/i18n/en/schools.json, excluding ar)');
lines.push('');
for (const row of dataRows) {
  lines.push(`- ${row.file}: identical=${row.identical.length}, missing=${row.missing.length}, empty=${row.empty.length}`);
}

fs.mkdirSync(path.join(ROOT, 'reports'), { recursive: true });
const out = path.join(ROOT, 'reports/i18n-untranslated-audit.md');
fs.writeFileSync(out, `${lines.join('\n')}\n`);

console.log(`Wrote ${path.relative(ROOT, out)}`);
