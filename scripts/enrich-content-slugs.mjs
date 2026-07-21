// scripts/enrich-content-slugs.mjs
// One-shot (idempotent) enrichment: writes a `slug` onto every composition (top level)
// and every section, for all six content collections, using the rules in
// scripts/lib/content-model.mjs.
//
// Two write strategies, chosen by shape so the diff stays commit-grade:
//   - Reading collections (constitutional, manuscript, data, copyright): these are
//     URL-routed and carry sections[] that need per-section slugs. They are
//     re-serialized to canonical 2-space JSON + trailing newline (the repo's style).
//   - timeline + map: not URL-routed and carry no sections[]. Only a top-level slug
//     is inserted, via byte-preserving string insertion, so their hand-formatting
//     (inline arrays, float literals like 76.0) is left untouched.
//
// Re-running is a no-op (no diff): reading files re-serialize identically; map/timeline
// files already carry the correct top-level slug and are skipped.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  ROOT,
  ALL_COLLECTIONS,
  READING_COLLECTIONS,
  enrichComposition,
  deriveCompositionSlug,
} from './lib/content-model.mjs';

const report = {};

for (const collection of ALL_COLLECTIONS) {
  const dir = join(ROOT, 'content', collection);
  let files;
  try {
    files = readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
  } catch {
    continue;
  }

  let compositions = 0;
  let sections = 0;
  let skipped = 0;

  for (const filename of files) {
    const filePath = join(dir, filename);
    const raw = readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);

    if (READING_COLLECTIONS.includes(collection)) {
      enrichComposition(collection, filename, data);
      sections += Array.isArray(data.sections) ? data.sections.length : 0;
      writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
    } else {
      // Byte-preserving top-level slug insertion for map/timeline.
      const slug = deriveCompositionSlug(collection, filename);
      if (Object.prototype.hasOwnProperty.call(data, 'slug') && data.slug === slug) {
        skipped += 1;
      } else {
        const inserted = raw.replace(/^\{\n/, `{\n  "slug": ${JSON.stringify(slug)},\n`);
        if (inserted === raw) {
          throw new Error(`Could not insert slug into ${collection}/${filename} (unexpected header)`);
        }
        writeFileSync(filePath, inserted);
      }
    }
    compositions += 1;
  }

  report[collection] = { compositions, sections, skipped };
}

console.log('Enriched content slugs:');
for (const collection of ALL_COLLECTIONS) {
  const r = report[collection];
  if (!r) continue;
  const routed = READING_COLLECTIONS.includes(collection);
  console.log(
    `  ${collection}: ${r.compositions} composition(s), ${r.sections} section slug(s)` +
      (routed ? '' : ` (top-level slug only; ${r.skipped} already-correct skipped)`),
  );
}
