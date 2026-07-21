// scripts/generate-nav-manifest.mjs
// Generates src/data/navManifest.json — the tiny dataset the Header's
// Research/Evidence dropdown menus need (title + canonical URL + section
// count per composition). This exists so the Header (rendered on EVERY page)
// never has to load the full content corpus just to draw two menus.
//
// Ordering mirrors the store's per-collection order (featured DESC, then
// title ASC) so menus match the collection grids.
// Runs inside `npm run build` (after validate-content); committed output.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'src', 'data', 'navManifest.json');

const NAV_COLLECTIONS = ['manuscript', 'data'];

function loadCollection(collection) {
  const dir = join(ROOT, 'content', collection);
  const comps = [];
  for (const file of readdirSync(dir).filter(f => f.endsWith('.json'))) {
    const data = JSON.parse(readFileSync(join(dir, file), 'utf8'));
    const sections = Array.isArray(data.sections) ? data.sections : [];
    if (sections.length === 0) continue;
    const slug = data.slug || basename(file, '.json');
    const firstSectionSlug = sections[0]?.slug || 'section-1';
    comps.push({
      title: data.title || 'Untitled',
      slug,
      url: `/composition/${collection}/${slug}/${firstSectionSlug}`,
      sectionCount: sections.length,
      featured: Boolean(sections[0]?.featured),
    });
  }
  comps.sort((a, b) => {
    if (a.featured !== b.featured) return b.featured ? 1 : -1;
    return a.title.localeCompare(b.title);
  });
  // `featured` is ordering-only; don't ship it.
  return comps.map(({ featured: _featured, ...rest }) => rest);
}

const manifest = Object.fromEntries(
  NAV_COLLECTIONS.map(c => [c, loadCollection(c)]),
);

writeFileSync(OUT, JSON.stringify(manifest, null, 2) + '\n');
console.log(
  `✓ Wrote src/data/navManifest.json — ${NAV_COLLECTIONS.map(
    c => `${c}: ${manifest[c].length}`,
  ).join(', ')}`,
);
