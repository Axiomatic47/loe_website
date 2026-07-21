// scripts/validate-content.mjs
// Build gate: fails (exit 1) if the content collections are not slug-complete and
// internally consistent. Wired first in `npm run build`.
//
// Shape-aware:
//   - Reading collections (constitutional, manuscript, data, copyright): require a
//     title, a non-empty sections[] array, a top-level slug, a slug on every section,
//     composition-slug uniqueness within the collection, and section-slug uniqueness
//     within the composition.
//   - timeline / map: no sections[] / no title guaranteed — validate what's actually
//     present: JSON parses, a top-level slug exists, and slugs are unique per collection.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, ALL_COLLECTIONS, READING_COLLECTIONS } from './lib/content-model.mjs';

const errors = [];

function isNonEmptyString(v) {
  return typeof v === 'string' && v.length > 0;
}

for (const collection of ALL_COLLECTIONS) {
  const dir = join(ROOT, 'content', collection);
  let files;
  try {
    files = readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
  } catch {
    continue;
  }

  const compositionSlugs = new Map(); // slug -> filename (uniqueness within collection)
  const routed = READING_COLLECTIONS.includes(collection);

  for (const filename of files) {
    const rel = `${collection}/${filename}`;
    let data;
    try {
      data = JSON.parse(readFileSync(join(dir, filename), 'utf8'));
    } catch (e) {
      errors.push(`${rel}: does not parse as JSON (${e.message})`);
      continue;
    }

    // Top-level slug (all six collections).
    if (!isNonEmptyString(data.slug)) {
      errors.push(`${rel}: missing top-level "slug"`);
    } else if (compositionSlugs.has(data.slug)) {
      errors.push(
        `${rel}: composition slug "${data.slug}" collides with ${compositionSlugs.get(data.slug)}`,
      );
    } else {
      compositionSlugs.set(data.slug, filename);
    }

    if (routed) {
      if (!isNonEmptyString(data.title)) {
        errors.push(`${rel}: missing "title"`);
      }
      if (!Array.isArray(data.sections) || data.sections.length === 0) {
        errors.push(`${rel}: "sections" must be a non-empty array`);
        continue;
      }
      const sectionSlugs = new Map(); // slug -> section index
      data.sections.forEach((section, i) => {
        if (!isNonEmptyString(section.slug)) {
          errors.push(`${rel} section[${i}]: missing "slug"`);
        } else if (sectionSlugs.has(section.slug)) {
          errors.push(
            `${rel} section[${i}]: slug "${section.slug}" collides with section[${sectionSlugs.get(section.slug)}]`,
          );
        } else {
          sectionSlugs.set(section.slug, i);
        }
      });
    } else {
      // timeline / map: validate the shape that is actually present.
      if (Array.isArray(data.sections) && data.sections.length === 0) {
        errors.push(`${rel}: has an empty "sections" array`);
      }
      if (Array.isArray(data.events) && data.events.length === 0) {
        errors.push(`${rel}: has an empty "events" array`);
      }
      // Sanity: file is a non-empty object.
      try {
        if (statSync(join(dir, filename)).size === 0) errors.push(`${rel}: empty file`);
      } catch {
        /* ignore */
      }
    }
  }
}

if (errors.length > 0) {
  console.error(`content validation FAILED — ${errors.length} problem(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log('content validation PASSED — all six collections slug-complete and consistent.');
