// scripts/lib/content-model.mjs
// Shared content-model helpers for the descriptive-URL pipeline.
//
// Canonical URL scheme (Phase 1):
//   constitutional                       -> /<caseSlug>/<sectionSlug>
//   manuscript | data | copyright        -> /composition/<collection>/<compositionSlug>/<sectionSlug>
//
// Slugs are DATA: they live in the content JSON (top-level `slug` per composition,
// `slug` per section) and are produced by scripts/enrich-content-slugs.mjs using the
// rules in this module. Consumers (sitemap, freeze) read slugs from the data — they
// do NOT re-derive positional indices.
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(__dirname, '..', '..');

export const READING_COLLECTIONS = ['manuscript', 'data', 'constitutional', 'copyright'];
export const ALL_COLLECTIONS = ['constitutional', 'manuscript', 'data', 'copyright', 'timeline', 'map'];

// Explicit constitutional case slugs (filenames carry zz/zzz sort prefixes we drop).
export const CONSTITUTIONAL_SLUGS = {
  'kirchner-v-johnson-case-documents.json': 'kirchner-v-johnson',
  'kirchner-v-ellison-case-documents.json': 'kirchner-v-ellison',
  'zz-kirchner-v-acosta-case-documents.json': 'kirchner-v-acosta',
  'zzz-scotus-amicus-trump-v-barbara.json': 'scotus-amicus',
};

// pdf_file -> bare basename, extension stripped, lowercased.
function pdfBase(pdfFile) {
  return basename(pdfFile || '').replace(/\.[^.]+$/, '').toLowerCase();
}

// Strip leading zeros on each hyphen-delimited segment that is purely numeric.
// "01" -> "1", "2594-01-02" -> "2594-1-2", "8cir-brief" -> "8cir-brief".
function stripLeadingZerosPerSegment(s) {
  return s
    .split('-')
    .map((seg) => (/^\d+$/.test(seg) ? String(parseInt(seg, 10)) : seg))
    .join('-');
}

// Leading integer of a string, zeros stripped: "01_petition" -> "1", "17_motion" -> "17".
function leadingNumber(s) {
  const m = s.match(/^0*(\d+)/);
  return m ? m[1] : null;
}

/**
 * slugifyTitle(s): lowercase, ASCII-fold, non-alnum -> '-', collapse/trim '-', cap ~60 chars.
 */
export function slugifyTitle(s) {
  const out = String(s == null ? '' : s)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip combining diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, ''); // re-trim in case the 60-char cut landed mid-separator
  return out;
}

/**
 * Composition slug (top-level `slug`).
 * - constitutional: explicit case slug map.
 * - everything else: filename minus `.json`.
 */
export function deriveCompositionSlug(collection, filename) {
  if (collection === 'constitutional' && CONSTITUTIONAL_SLUGS[filename]) {
    return CONSTITUTIONAL_SLUGS[filename];
  }
  return filename.replace(/\.json$/, '');
}

/**
 * deriveSectionSlug(collection, compositionSlug, section, index, usedSet)
 * index is 1-based. usedSet is mutated to guarantee uniqueness within the composition;
 * on collision, append "-2", "-3", ... deterministically in array order.
 */
export function deriveSectionSlug(collection, compositionSlug, section, index, usedSet) {
  let slug;

  if (collection === 'constitutional') {
    const b = pdfBase(section.pdf_file);
    if (compositionSlug === 'kirchner-v-johnson') {
      slug = b; // basenames used as-is, lowercased ("51-6", "mo-stay", "69")
    } else if (compositionSlug === 'kirchner-v-ellison') {
      slug = stripLeadingZerosPerSegment(b); // "01"->"1", "2594-01-02"->"2594-1-2", "8cir-brief" unchanged
    } else if (compositionSlug === 'kirchner-v-acosta' || compositionSlug === 'scotus-amicus') {
      slug = leadingNumber(b) || b; // "01_petition"->"1" ... "17_..."->"17"; "01_amicus_brief"->"1"
    } else {
      slug = b;
    }
  } else {
    const src = section.title || section.description || '';
    slug = src ? slugifyTitle(src) : '';
  }

  if (!slug) slug = `section-${index}`;

  // Deterministic collision suffixing within the composition scope.
  let candidate = slug;
  let n = 2;
  while (usedSet.has(candidate)) {
    candidate = `${slug}-${n}`;
    n += 1;
  }
  usedSet.add(candidate);
  return candidate;
}

/**
 * Mutate `data` in place: set top-level `slug` and (where a sections[] array exists)
 * a `slug` on every section. Deterministic + idempotent (re-run recomputes identical
 * slugs and preserves field/array order). Returns `data`.
 */
export function enrichComposition(collection, filename, data) {
  data.slug = deriveCompositionSlug(collection, filename);
  if (Array.isArray(data.sections)) {
    const used = new Set();
    data.sections.forEach((section, i) => {
      section.slug = deriveSectionSlug(collection, data.slug, section, i + 1, used);
    });
  }
  return data;
}

/**
 * loadCollection(collection): parsed JSON files (each with a `filename` property).
 * Read-only convenience for sitemap/freeze; do NOT write these objects back (they
 * carry the synthetic `filename` field). Files are read in sorted-name order.
 */
export function loadCollection(collection) {
  const dir = join(ROOT, 'content', collection);
  let files;
  try {
    files = readdirSync(dir).filter((f) => f.endsWith('.json'));
  } catch {
    return [];
  }
  files.sort();
  const out = [];
  for (const filename of files) {
    const data = JSON.parse(readFileSync(join(dir, filename), 'utf8'));
    out.push(Object.assign({}, data, { filename }));
  }
  return out;
}

/**
 * legacySort(comps): the historical featured-then-title ordering.
 *
 * LEGACY FREEZE ONLY — this reproduces the positional enumeration the old
 * generate-sitemap.mjs / compositionLoader.ts used to mint URLs. It is used exactly
 * once, by scripts/freeze-legacy-urls.mjs, to map every old positional URL to its
 * descriptive successor. NEVER use this ordering to mint new URLs.
 */
export function legacySort(comps) {
  const keyed = comps.map((c) => {
    const hasSections = Array.isArray(c.sections) && c.sections.length > 0;
    return {
      comp: c,
      title: c.title || c.name || 'Untitled',
      featured: hasSections ? Boolean(c.sections[0].featured) : false,
    };
  });
  keyed.sort((a, b) => {
    if (a.featured !== b.featured) return b.featured ? 1 : -1;
    return a.title.localeCompare(b.title);
  });
  return keyed.map((x) => x.comp);
}
