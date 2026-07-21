// scripts/generate-next-redirects.mjs — compile the data-dependent legacy URL
// grammars into scripts/data/next-redirects.json for next.config.ts.
//
// Covers what public/_redirects + the vite client resolvers handled beyond the
// frozen positional map (legacy-routes.json, consumed separately):
//   1. /<case>/section/<n>            → canonical slug URL (index → slug)
//   2. /kirchner-v-trump/section/<n>  → the Johnson equivalent
//   3. doc-alias spellings of case doc ids: zero-padded segments and the
//      historical "doc" prefix ("doc51", "doc01-02", "051" …)
//   4. Acosta legacy arithmetic deep links: /kirchner-v-acosta/<N>-<A> →
//      section (N + A) — unpadded pairs, as the old app's own links emitted
//   5. /composition/memorandum → /composition/manuscript
//
// Deterministic: re-run after content changes (adds/renames of sections).
//   node scripts/generate-next-redirects.mjs
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadCollection, CONSTITUTIONAL_SLUGS, ROOT } from './lib/content-model.mjs';

const CASE_SLUG_VALUES = Object.values(CONSTITUTIONAL_SLUGS);

function sectionUrlFor(caseSlug, slug) {
  return `/${caseSlug}/${slug}`;
}

// Pad each all-numeric hyphen segment to two digits ("1" → "01", "51-6" → "51-06").
function pad2PerSegment(s) {
  return s
    .split('-')
    .map(seg => (/^\d+$/.test(seg) ? seg.padStart(2, '0') : seg))
    .join('-');
}

const redirects = [];
const seen = new Set();
function add(source, destination) {
  if (source === destination) return;
  if (seen.has(source)) return;
  seen.add(source);
  redirects.push({ source, destination });
}

const constitutional = loadCollection('constitutional');

for (const comp of constitutional) {
  const caseSlug = comp.slug;
  if (!CASE_SLUG_VALUES.includes(caseSlug)) continue;
  const sections = Array.isArray(comp.sections) ? comp.sections : [];

  sections.forEach((section, i) => {
    const canonical = sectionUrlFor(caseSlug, section.slug);

    // 1./2. index-form section URLs
    add(`/${caseSlug}/section/${i + 1}`, canonical);
    if (caseSlug === 'kirchner-v-johnson') {
      add(`/kirchner-v-trump/section/${i + 1}`, canonical);
    }

    // 3. doc-alias spellings — the "doc" prefix historically only preceded a
    // digit (vite normalizeDocId: /^doc(?=\d)/), so skip it for named slugs.
    const padded = pad2PerSegment(section.slug);
    const aliases = [padded];
    if (/^\d/.test(section.slug)) aliases.push(`doc${section.slug}`, `doc${padded}`);
    for (const alias of aliases) {
      if (alias !== section.slug) add(`/${caseSlug}/${alias}`, canonical);
    }
  });

  // 4. Acosta legacy arithmetic deep links: N-A → section (N + A)
  if (caseSlug === 'kirchner-v-acosta') {
    for (let n = 1; n <= sections.length; n++) {
      for (let a = 1; a <= sections.length; a++) {
        const target = sections[n + a - 1];
        if (!target) continue;
        add(`/${caseSlug}/${n}-${a}`, sectionUrlFor(caseSlug, target.slug));
      }
    }
  }
}

// 5. Old collection alias
add('/composition/memorandum', '/composition/manuscript');

const outPath = join(ROOT, 'scripts', 'data', 'next-redirects.json');
writeFileSync(outPath, JSON.stringify(redirects, null, 2) + '\n');
console.log(`✓ Wrote scripts/data/next-redirects.json — ${redirects.length} rules`);
