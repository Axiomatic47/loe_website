// scripts/sync-archives.mjs — publish the primary-source research archives.
//
// PDF-first: the reviewer-facing documents are the docx-converter PDF exports
// (<archive>/docx_exports/pdfs/*.pdf); markdown working files stay in
// work_station and are NOT published. Only docs with a PDF are listed.
//
// For each archive this copies: leaf images (membranes/folios) → leaves/,
// document PDFs → pdfs/, the SHA-256 fixity list, and (opt-in) crops/. It then
// writes manifest.json for the /research/:archiveId pages.
//
// MANUAL-RUN ONLY. Reads from ~/Git/work_station, which does not exist on
// Netlify — never wire this into `npm run build`. Run locally, review, commit.
//
//   npm run sync-archives              # all archives, no crops
//   npm run sync-archives -- --crops   # also copy crops/ trees (large)
//
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const EM = '/Users/everest/Git/work_station/research_library/1_Central Library/2_English Materials';
const OUT = join(__dirname, '..', 'public', 'uploads', 'research');
const WITH_CROPS = process.argv.includes('--crops');

const pad3range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => String(a + i).padStart(3, '0'));

// Per-archive source config. classify(stem) → {kind:'index'|'transcription', leaves, span} | null (= working paper)
const ARCHIVES = [
  {
    id: 'stac-8-203-38',
    src: join(EM, '02_STAC_8_203_38'),
    ref: 'STAC 8/203/38',
    title: 'Lloyd v. Barker (Star Chamber, 1607)',
    dated: 'Trinity term, 5 Jac. I (1607)',
    source: 'The National Archives (UK), Kew — series STAC 8 (Star Chamber Proceedings, James I)',
    leafRe: /^8368179_STAC_8_203_38_(\d{3})\.jpg$/,
    classify(stem) {
      let m;
      if ((m = stem.match(/^_WORKING_(\d{3})_LINE_INDEX$/))) return { kind: 'index', leaves: [m[1]] };
      if ((m = stem.match(/^_WORKING_(\d{3})_TRANSCRIPTION$/))) return { kind: 'transcription', leaves: [m[1]], span: m[1] };
      if ((m = stem.match(/^_WORKING_[A-Z]+_DEPOSITION_(\d{3})[LR]?-(\d{3})([LR])?$/)))
        return { kind: 'transcription', leaves: pad3range(+m[1], +m[2]), span: `${m[1]}–${m[2]}${m[3] || ''}` };
      return null;
    },
  },
  {
    id: 'hls-ms149-floyd',
    src: join(EM, '01_HLS_MS149_Floyd_ff81r-83v'),
    ref: 'HLS MS 149, ff. 81r–83v',
    title: 'Floyd v. Barker — the second account (Star Chamber, 1607)',
    dated: 'Pasch. 5 Jac. I (1607)',
    source: 'Harvard Law School Library, Historical & Special Collections — HLS MS 149 (Star Chamber Collection, 1607–1623)',
    leafRe: /^ms149_(f\d{2}[rv])\.jpg$/,
    classify(stem) {
      let m;
      if ((m = stem.match(/^_WORKING_MS149_(f\d{2}[rv])_LINE_INDEX$/))) return { kind: 'index', leaves: [m[1]] };
      if ((m = stem.match(/^_WORKING_MS149_(f\d{2}[rv])_TRANSCRIPTION$/))) return { kind: 'transcription', leaves: [m[1]], span: m[1] };
      return null;
    },
  },
];

const mdTitle = (archiveSrc, stem) => {
  // titles come from the sibling working .md's first heading, when present
  const mdPath = join(archiveSrc, `${stem}.md`);
  if (existsSync(mdPath)) {
    const m = readFileSync(mdPath, 'utf8').match(/^#\s+(.+)$/m);
    if (m) return m[1].trim();
  }
  return stem.replace(/^_+/, '').replace(/_/g, ' ').trim();
};

for (const A of ARCHIVES) {
  console.log(`\n=== ${A.id} ===`);
  if (!existsSync(A.src)) {
    console.error(`  source missing: ${A.src} — SKIPPED (path moved again?)`);
    continue;
  }
  const dst = join(OUT, A.id);
  // fresh leaves/ + pdfs/ so removed source files disappear; crops/ preserved
  for (const d of ['leaves', 'pdfs']) {
    rmSync(join(dst, d), { recursive: true, force: true });
    mkdirSync(join(dst, d), { recursive: true });
  }
  mkdirSync(join(dst, 'crops'), { recursive: true });

  // fixity
  const fixity = {};
  const fixityFile = join(A.src, '_FIXITY_SHA256_SOURCES.txt');
  if (existsSync(fixityFile)) {
    for (const line of readFileSync(fixityFile, 'utf8').split('\n')) {
      const m = line.trim().match(/^([0-9a-f]{64})\s+(\S+)$/);
      if (m) fixity[m[2]] = m[1];
    }
    copyFileSync(fixityFile, join(dst, '_FIXITY_SHA256_SOURCES.txt'));
  }

  // leaves
  const leaves = {};
  for (const f of readdirSync(A.src).sort()) {
    const m = f.match(A.leafRe);
    if (!m) continue;
    copyFileSync(join(A.src, f), join(dst, 'leaves', f));
    leaves[m[1]] = { id: m[1], image: `leaves/${f}`, sha256: fixity[f] || null, docs: [] };
  }
  console.log(`  leaves: ${Object.keys(leaves).length} copied`);

  // document PDFs (the published, reviewer-facing artifacts)
  const pdfDir = join(A.src, 'docx_exports', 'pdfs');
  const workingPapers = [];
  const pdfs = existsSync(pdfDir) ? readdirSync(pdfDir).filter((f) => f.endsWith('.pdf')).sort() : [];
  for (const f of pdfs) {
    copyFileSync(join(pdfDir, f), join(dst, 'pdfs', f));
    const stem = f.replace(/\.pdf$/, '');
    const entry = { title: mdTitle(A.src, stem), pdf: `pdfs/${f}` };
    const c = A.classify(stem);
    if (c) {
      for (const id of c.leaves) {
        if (leaves[id]) leaves[id].docs.push({ kind: c.kind, span: c.span, ...entry });
      }
    } else {
      workingPapers.push(entry);
    }
  }
  console.log(`  pdfs: ${pdfs.length} copied (${workingPapers.length} working papers)`);

  // crops (opt-in; index whatever is present in the destination)
  if (WITH_CROPS && existsSync(join(A.src, 'crops'))) {
    cpSync(join(A.src, 'crops'), join(dst, 'crops'), { recursive: true });
    console.log('  crops: full tree copied (--crops)');
  }
  const cropIndex = {};
  const walk = (dir, rel = '') => {
    if (!existsSync(dir)) return;
    for (const e of readdirSync(dir)) {
      const p = join(dir, e);
      if (statSync(p).isDirectory()) walk(p, rel ? `${rel}/${e}` : e);
      else if (/\.jpe?g$/i.test(e)) cropIndex[e.replace(/\.jpe?g$/i, '')] = `crops/${rel ? rel + '/' : ''}${e}`;
    }
  };
  walk(join(dst, 'crops'));

  // manifest
  const leafList = Object.values(leaves);
  writeFileSync(
    join(dst, 'manifest.json'),
    JSON.stringify(
      {
        archive: { id: A.id, ref: A.ref, title: A.title, dated: A.dated, source: A.source, pieces: leafList.length },
        leaves: leafList,
        workingPapers,
        crops: { count: Object.keys(cropIndex).length, index: cropIndex },
      },
      null,
      2
    ) + '\n'
  );

  for (const l of leafList) {
    const idx = l.docs.some((d) => d.kind === 'index') ? 'index' : '—';
    const tr = l.docs.filter((d) => d.kind === 'transcription').map((d) => d.span).join(', ') || 'no transcription';
    console.log(`    ${l.id}: ${idx} · ${tr}`);
  }
}

console.log('\nNOTE: review, then commit public/uploads/research/. Crops are opt-in via --crops.');
