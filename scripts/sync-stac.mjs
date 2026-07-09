// scripts/sync-stac.mjs — publish the STAC 8/203/38 working archive to the site.
//
// Copies membrane images + working markdown documents (and optionally crops)
// from the work_station research library into public/uploads/research/…, and
// writes a manifest.json the archive pages consume.
//
// MANUAL-RUN ONLY. This script reads from ~/Git/work_station, which does not
// exist on Netlify — it must never be wired into `npm run build`. Run it
// locally when you want to publish the current state of the transcriptions,
// review, then commit the changed files.
//
//   npm run sync-stac            # membranes + docs + fixity (re-run anytime)
//   npm run sync-stac -- --crops # ALSO copy crops/ (~950 jpgs, ~367 MB) — opt-in
//
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync, copyFileSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = '/Users/everest/Git/work_station/research_library/1_Central Library/1_Case Law/Immunity Case Law/English Materials/STAC_8_203_38';
const DST = join(__dirname, '..', 'public', 'uploads', 'research', 'stac-8-203-38');
const WITH_CROPS = process.argv.includes('--crops');

if (!existsSync(SRC)) {
  console.error(`source not found: ${SRC}\n(this script is local-only; do not run on CI)`);
  process.exit(1);
}
for (const d of ['membranes', 'docs', 'crops']) mkdirSync(join(DST, d), { recursive: true });

// ---------------------------------------------------------------- membranes
const fixity = {};
const fixityFile = join(SRC, '_FIXITY_SHA256_SOURCES.txt');
if (existsSync(fixityFile)) {
  for (const line of readFileSync(fixityFile, 'utf8').split('\n')) {
    const m = line.trim().match(/^([0-9a-f]{64})\s+(\S+)$/);
    if (m) fixity[m[2]] = m[1];
  }
  copyFileSync(fixityFile, join(DST, 'docs', '_FIXITY_SHA256_SOURCES.txt'));
}

const membraneImgs = readdirSync(SRC).filter((f) => /^8368179_STAC_8_203_38_\d{3}\.jpg$/.test(f)).sort();
for (const f of membraneImgs) copyFileSync(join(SRC, f), join(DST, 'membranes', f));
console.log(`membranes: ${membraneImgs.length} copied`);

// --------------------------------------------------------------------- docs
const firstHeading = (p) => {
  const m = readFileSync(p, 'utf8').match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : basename(p);
};

const mdFiles = readdirSync(SRC).filter((f) => f.endsWith('.md'));
for (const f of mdFiles) copyFileSync(join(SRC, f), join(DST, 'docs', f));
console.log(`docs: ${mdFiles.length} markdown files copied`);

// classify docs → membranes
const membranes = {};
for (const img of membraneImgs) {
  const id = img.match(/_(\d{3})\.jpg$/)[1];
  membranes[id] = {
    id,
    image: `membranes/${img}`,
    sha256: fixity[img] || null,
    lineIndex: null,
    transcriptions: [],
  };
}

const workingPapers = [];
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => String(a + i).padStart(3, '0'));

for (const f of mdFiles) {
  const title = firstHeading(join(SRC, f));
  const entry = { file: `docs/${f}`, title };
  let m;
  if ((m = f.match(/^_WORKING_(\d{3})_LINE_INDEX\.md$/))) {
    if (membranes[m[1]]) membranes[m[1]].lineIndex = entry;
  } else if ((m = f.match(/^_WORKING_(\d{3})_TRANSCRIPTION\.md$/))) {
    if (membranes[m[1]]) membranes[m[1]].transcriptions.push({ ...entry, span: m[1] });
  } else if ((m = f.match(/^_WORKING_[A-Z]+_DEPOSITION_(\d{3})[LR]?-(\d{3})([LR])?\.md$/))) {
    // deposition compilations span several membranes (e.g. 001-003L, 003R-007)
    const span = `${m[1]}–${m[2]}${m[3] || ''}`;
    for (const id of range(parseInt(m[1], 10), parseInt(m[2], 10))) {
      if (membranes[id]) membranes[id].transcriptions.push({ ...entry, span });
    }
  } else {
    workingPapers.push(entry);
  }
}

// -------------------------------------------------------------------- crops
if (WITH_CROPS) {
  cpSync(join(SRC, 'crops'), join(DST, 'crops'), { recursive: true });
  console.log('crops: full tree copied (--crops)');
}
// Index whatever is present in the destination (crops may be synced selectively).
const cropIndex = {};
const walk = (dir, rel = '') => {
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, rel ? `${rel}/${e}` : e);
    else if (/\.jpe?g$/i.test(e)) cropIndex[e.replace(/\.jpe?g$/i, '')] = `crops/${rel ? rel + '/' : ''}${e}`;
  }
};
walk(join(DST, 'crops'));
console.log(`crop index: ${Object.keys(cropIndex).length} images available on site`);

// ----------------------------------------------------------------- manifest
const manifest = {
  archive: {
    ref: 'STAC 8/203/38',
    title: 'Lloyd v. Barker (Star Chamber, 1607)',
    dated: 'Trinity term, 5 Jac. I (1607)',
    source: 'The National Archives (UK), Kew — series STAC 8 (Star Chamber Proceedings, James I)',
    pieces: membraneImgs.length,
  },
  membranes: Object.values(membranes),
  workingPapers,
  crops: { count: Object.keys(cropIndex).length, index: cropIndex },
};
writeFileSync(join(DST, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

const status = Object.values(membranes)
  .map((mb) => `  ${mb.id}: ${mb.lineIndex ? 'index' : '—'} · ${mb.transcriptions.length ? mb.transcriptions.map((t) => t.span).join(', ') : 'no transcription'}`)
  .join('\n');
console.log(`\nmanifest written. membrane coverage:\n${status}`);
console.log(`\nworking papers: ${workingPapers.length}`);
console.log('\nNOTE: review then commit public/uploads/research/stac-8-203-38/. Crops are opt-in via --crops (~367 MB).');
