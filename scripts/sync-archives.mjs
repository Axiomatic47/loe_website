// scripts/sync-archives.mjs — publish the primary-source research archives.
//
// PDF-first: the reviewer-facing documents are the docx-converter PDF exports,
// read from each archive's `pdfPools` (the 2026-07-16 source re-sort moved
// them from a single docx_exports/pdfs into per-section docx/pdfs dirs);
// markdown working files stay in work_station and are NOT published. Only
// docs with a PDF are listed. 04_Whittick Deliverables and
// WHITTICK_DECLARATION are correspondence/work-product and are NEVER pooled.
//
// IMAGE LICENSING (fail-closed, PER ARCHIVE via `imagesLicensed`):
//  - hls-ms149-floyd: LICENSED — Harvard's 2014 PD-reproductions policy + HSC
//    Permission-to-Publish require no application or fee. Basis memo:
//    work_station/research_library/3_Transcription and Translation/
//    01_HLS_MS149_Floyd_ff81r-83v/HLS Publication Rights/HLS_PUBLICATION_RIGHTS_MS149.md
//    (2026-07-13). Credit per HSC convention is baked into each leaf entry.
//  - stac-8-203-38: LICENSED — TNA reproduction licence GRANTED (application
//    order RC8368179, sent 2026-07-13; owner confirmed the licence in hand
//    2026-08-23 and directed publication). Real leaf images replace the
//    placeholders as of that date.
// Unlicensed archives get on-brand SVG placeholders and no crop imagery; the
// manifest records images.published=false so the pages show a licensing notice.
//
//   npm run sync-archives             # licensed archives get real leaves; others placeholders
//   npm run sync-archives -- --crops  # + crop tiles for licensed archives (large)
//
// MANUAL-RUN ONLY. Reads from ~/Git/work_station, which does not exist on
// Netlify — never wire this into `npm run build`. Run locally, review, commit.
//
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

// Downscaled renditions (macOS `sips`, no extra deps — this script is
// manual-run-only on the Mac): every licensed leaf gets a ~600px grid
// thumbnail; leaves whose original exceeds WEB_RENDITION_BYTES also get a
// ~2000px web display rendition (the 45.6 MB STAC m.010 scan was unusable
// inline). Originals are never modified — fixity rows keep verifying.
const THUMB_MAX = 600;
const WEB_MAX = 2000;
const WEB_RENDITION_BYTES = 8_000_000;
function sipsResample(src, dst, maxSide, quality) {
  execFileSync('sips', [
    '--resampleHeightWidthMax', String(maxSide),
    '-s', 'format', 'jpeg',
    '-s', 'formatOptions', String(quality),
    src, '--out', dst,
  ], { stdio: 'pipe' }); // throws on failure — a missing rendition must never ship silently
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = '/Users/everest/Git/work_station/research_library/3_Transcription and Translation';
const OUT = join(__dirname, '..', 'public', 'uploads', 'research');
const WITH_CROPS = process.argv.includes('--crops');

const pad3range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => String(a + i).padStart(3, '0'));

// HLS MS 149 manifest sequence numbers (corpus README table) — part of HSC's
// preferred credit line for each folio.
const MS149_SEQ = { f81r: 166, f81v: 167, f82r: 168, f82v: 169, f83r: 170, f83v: 171 };

// Per-archive source config. classify(stem) →
//   {kind:'transcript'|'index'|'transcription', leaves, span} | null (= working paper)
// 'transcript' = the canonical per-leaf transcript (citation artifact);
// 'transcription' = working assemblies/spans (deposition series etc.).
const KIND_ORDER = { transcript: 0, index: 1, transcription: 2 };
const ARCHIVES = [
  {
    id: 'stac-8-203-38',
    src: join(ROOT, '02_STAC_8_203_38'),
    ref: 'STAC 8/203/38',
    title: 'Lloyd v. Barker (Star Chamber, 1607)',
    dated: 'Trinity term, 5 Jac. I (1607)',
    source: 'The National Archives (UK), Kew — series STAC 8 (Star Chamber Proceedings, James I)',
    rightsHolder: 'The National Archives (UK)',
    imagesLicensed: true, // TNA reproduction licence granted (order RC8368179; owner word 2026-08-23)
    // FLAG (transcriber 2026-08-26, for the owner's push review): RC8368179
    // is the record-COPYING order — the publication instrument is the TNA
    // Image Library web licence the owner concluded on it (owner word
    // 2026-08-23); the note cites the Library licence and names the order
    // only as what it covers.
    rightsNote:
      'Images reproduced by permission of The National Archives (UK) Image Library (web-publication licence; the underlying record copies were supplied under order RC8368179).',
    reuseNote:
      'Full-resolution downloads are provided for private study and non-commercial research; republication of the images requires a licence from The National Archives Image Library. The transcription text is published under the Open Government Licence v3.0 — contains public sector information licensed under the Open Government Licence v3.0; cite the piece as “The National Archives, ref. STAC 8/203/38.”',
    credit: (id) =>
      `The National Archives, Kew, STAC 8/203/38, m. ${parseInt(id, 10)}. Reproduced by permission of The National Archives.`,
    // Transcript pools, FRESH-FIRST (transcriber correction 2026-08-26): the
    // current manuscript-edition exports live in 01_Transcripts/docx/ (the
    // 14:30 generation — legend page, boxed META, banners, OGL rights row);
    // the section-root copies are the SUPERSEDED exhibit-grammar builds and
    // serve only as the M001 slot-holder until the owner's one-click refill
    // regenerates TRANSCRIPT_M001.pdf (earlier pool wins on duplicate names).
    pdfPools: ['01_Transcripts/docx', '01_Transcripts', '02_Line Indexes/docx/pdfs', '03_Working Notes/docx/pdfs', 'docx/pdfs'],
    // Deliberately-published stale generations (each shows ALLOWED-STALE on
    // every sync until its regeneration lands in the content lane):
    allowStale: new Set([
      'TRANSCRIPT_M001.pdf', // current edition pending owner PDF-button refill
      // companions + working papers awaiting re-export after 8/10-8/26 md edits:
      'CORRECTIONS_LOG.pdf', 'QUOTATION_CONCORDANCE.pdf', 'README_FOR_REVIEWERS.pdf',
      'READING_COMPANION_STAC_8_203_38.pdf', '_PRECISION_PASS_LEDGER.pdf',
      'markdown_formatting_guide.pdf',
      '_WORKING_008_LINE_INDEX.pdf', '_WORKING_009_LINE_INDEX.pdf',
      '_WORKING_008_TRANSCRIPTION.pdf', '_WORKING_009_TRANSCRIPTION.pdf',
      '_WORKING_LLOYD_DEPOSITION_003R-007.pdf', '_WORKING_P4C_AUDIT.pdf',
    ]),
    leafLabel: 'Membrane',
    leafRe: /^8368179_STAC_8_203_38_(\d{3})\.jpg$/,
    classify(stem) {
      let m;
      if ((m = stem.match(/^TRANSCRIPT_M(\d{3})$/))) return { kind: 'transcript', leaves: [m[1]] };
      if ((m = stem.match(/^_WORKING_(\d{3})_LINE_INDEX$/))) return { kind: 'index', leaves: [m[1]] };
      if ((m = stem.match(/^_WORKING_(\d{3})_TRANSCRIPTION$/))) return { kind: 'transcription', leaves: [m[1]], span: m[1] };
      if ((m = stem.match(/^_WORKING_[A-Z]+_DEPOSITION_(\d{3})[LR]?-(\d{3})([LR])?$/)))
        return { kind: 'transcription', leaves: pad3range(+m[1], +m[2]), span: `${m[1]}–${m[2]}${m[3] || ''}` };
      return null;
    },
  },
  {
    id: 'hls-ms149-floyd',
    src: join(ROOT, '01_HLS_MS149_Floyd_ff81r-83v'),
    ref: 'HLS MS 149, ff. 81r–83v',
    title: 'Floyd v. Barker — the second account (Star Chamber, 1607)',
    dated: 'Pasch. 5 Jac. I (1607)',
    source: 'Harvard Law School Library, Historical & Special Collections — HLS MS 149 (Star Chamber Collection, 1607–1623)',
    rightsHolder: 'Harvard Law School Library',
    imagesLicensed: true, // Harvard 2014 PD policy + HSC Permission to Publish — no permission or fee required
    rightsNote:
      'Reproduced under Harvard Library’s Policy on Access to Digital Reproductions of Works in the Public Domain (2014) and HSC’s Permission to Publish policy — no permission or fee required.',
    reuseNote:
      'Full-resolution downloads are provided freely — the folios reproduce Harvard Law School Library’s open digital reproductions of public-domain material; credit as shown on each folio.',
    creditUrl: 'https://nrs.lib.harvard.edu/URN-3:HLS.LIBR:29137268',
    credit: (id) =>
      `Star Chamber collection, 1607–1623, HLS MS 149, fol. ${id.slice(1)}, Seq. ${MS149_SEQ[id]}, Harvard Law School Library, Historical & Special Collections`,
    pdfPools: ['02_Line Indexes/docx/pdfs', '03_Working Notes/docx/pdfs', 'docx/pdfs'],
    // published-but-stale generations awaiting content-lane re-export:
    allowStale: new Set([
      'READING_COMPANION_ff81r-83v.pdf', 'README.pdf', 'README_FOR_REVIEWERS.pdf',
      'markdown_formatting_guide.pdf', '_WORKING_MS149_SURVEY_AND_LEDGER.pdf',
    ]),
    leafLabel: 'Folio',
    leafRe: /^ms149_(f\d{2}[rv])\.jpg$/,
    classify(stem) {
      let m;
      if ((m = stem.match(/^_WORKING_MS149_(f\d{2}[rv])_LINE_INDEX$/))) return { kind: 'index', leaves: [m[1]] };
      if ((m = stem.match(/^_WORKING_MS149_(f\d{2}[rv])_TRANSCRIPTION$/))) return { kind: 'transcription', leaves: [m[1]], span: m[1] };
      return null;
    },
  },
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// On-brand SVG placeholder shown until the reproduction licence is in hand.
const placeholderSvg = (A, id) => `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200">
  <rect width="900" height="1200" fill="#ECE3CA"/>
  <rect x="24" y="24" width="852" height="1152" fill="none" stroke="#A09173" stroke-width="2"/>
  <g font-family="'Source Serif 4', Georgia, serif" text-anchor="middle" fill="#1C1812">
    <text x="450" y="520" font-size="58" font-weight="600">${esc(A.leafLabel)} ${esc(id)}</text>
    <text x="450" y="572" font-size="26" fill="#463E32">${esc(A.ref)}</text>
    <line x1="330" y1="612" x2="570" y2="612" stroke="#A09173" stroke-width="1.5"/>
    <text x="450" y="668" font-size="30">Image not yet published</text>
    <text x="450" y="710" font-size="24" fill="#463E32">Reproduction licence pending —</text>
    <text x="450" y="742" font-size="24" fill="#463E32">${esc(A.rightsHolder)}</text>
    <text x="450" y="1120" font-size="20" fill="#463E32">Transcription PDFs and source-image fixity hashes remain available.</text>
  </g>
</svg>
`;

const findMd = (searchDirs, stem) => {
  for (const dir of searchDirs) {
    const mdPath = join(dir, `${stem}.md`);
    if (existsSync(mdPath)) return mdPath;
  }
  return null;
};

const mdTitle = (searchDirs, stem) => {
  // titles come from the working .md's first heading — the md sits beside
  // the pdf, one level up, or at the archive root, depending on the pool
  const mdPath = findMd(searchDirs, stem);
  if (mdPath) {
    const m = readFileSync(mdPath, 'utf8').match(/^#\s+(.+)$/m);
    if (m) return m[1].trim();
  }
  return stem.replace(/^_+/, '').replace(/_/g, ' ').trim();
};

// FRESHNESS GATE (transcriber protocol, 2026-08-26): every export carries
// 'sha256 <12hex>' of its source md in the footer. A pooled PDF whose footer
// hash mismatches its md is a SUPERSEDED generation — fatal unless that file
// is deliberately registered in the archive's allowStale set. (The 8/26
// transcript swap shipped a superseded set precisely because nothing
// compared generations.) Requires pdftotext (homebrew poppler).
import { createHash } from 'node:crypto';
function pdfFooterSha12(pdf) {
  const text = execFileSync('pdftotext', [pdf, '-'], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const m = [...text.matchAll(/sha256\s+([0-9a-f]{12})/g)];
  return m.length ? m[m.length - 1][1] : null;
}
function mdSha12(mdPath) {
  return createHash('sha256').update(readFileSync(mdPath)).digest('hex').slice(0, 12);
}

for (const A of ARCHIVES) {
  console.log(`\n=== ${A.id} ===`);
  if (!existsSync(A.src)) {
    console.error(`  source missing: ${A.src} — SKIPPED (path moved again?)`);
    continue;
  }
  const dst = join(OUT, A.id);
  // fresh leaves/ + renditions + pdfs/ so removed source files disappear
  for (const d of ['leaves', 'thumbs', 'web', 'pdfs']) {
    rmSync(join(dst, d), { recursive: true, force: true });
    mkdirSync(join(dst, d), { recursive: true });
  }
  // crop imagery is licence-gated too: clear it unless publishing licensed crops
  if (!(A.imagesLicensed && WITH_CROPS)) rmSync(join(dst, 'crops'), { recursive: true, force: true });
  mkdirSync(join(dst, 'crops'), { recursive: true });

  // fixity (hashes of the source images — publishable pre-commitment even
  // while the images themselves await licence)
  const fixity = {};
  const fixityFile = join(A.src, '_FIXITY_SHA256_SOURCES.txt');
  if (existsSync(fixityFile)) {
    for (const line of readFileSync(fixityFile, 'utf8').split('\n')) {
      const m = line.trim().match(/^([0-9a-f]{64})\s+(\S+)$/);
      if (m) fixity[m[2]] = m[1];
    }
    copyFileSync(fixityFile, join(dst, '_FIXITY_SHA256_SOURCES.txt'));
  }

  // leaves — real images + renditions for licensed archives; placeholders otherwise
  const leaves = {};
  let webCount = 0;
  for (const f of readdirSync(A.src).sort()) {
    const m = f.match(A.leafRe);
    if (!m) continue;
    const id = m[1];
    let image, thumb, web, imageBytes;
    if (A.imagesLicensed) {
      const srcImg = join(A.src, f);
      copyFileSync(srcImg, join(dst, 'leaves', f));
      image = `leaves/${f}`;
      imageBytes = statSync(srcImg).size;
      sipsResample(srcImg, join(dst, 'thumbs', f), THUMB_MAX, 75);
      thumb = `thumbs/${f}`;
      if (imageBytes > WEB_RENDITION_BYTES) {
        sipsResample(srcImg, join(dst, 'web', f), WEB_MAX, 80);
        web = `web/${f}`;
        webCount += 1;
      }
    } else {
      const ph = `placeholder_${id}.svg`;
      writeFileSync(join(dst, 'leaves', ph), placeholderSvg(A, id));
      image = `leaves/${ph}`;
    }
    leaves[id] = {
      id,
      image,
      ...(thumb ? { thumb } : {}),
      ...(web ? { web } : {}),
      ...(imageBytes ? { imageBytes } : {}),
      sha256: fixity[f] || null,
      credit: A.credit ? A.credit(id) : null,
      docs: [],
    };
  }
  console.log(
    `  leaves: ${Object.keys(leaves).length} ${A.imagesLicensed ? `images copied (licensed) + thumbs; ${webCount} web rendition(s) for oversized originals` : 'PLACEHOLDERS written (licence pending)'}`
  );

  // document PDFs (the published, reviewer-facing artifacts) — pooled from
  // the per-section export dirs; a missing pool is loud, an empty total is
  // fatal (it would silently wipe the published set).
  const workingPapers = [];
  let pdfCount = 0;
  let overlaid = 0;
  let allowedStale = 0;
  const staleViolations = [];
  const seenPdf = new Set();
  for (const pool of A.pdfPools) {
    const pdfDir = join(A.src, pool);
    const poolPdfs = existsSync(pdfDir)
      ? readdirSync(pdfDir).filter((x) => x.endsWith('.pdf')).sort()
      : null;
    if (!poolPdfs || poolPdfs.length === 0) {
      // FATAL either way: a renamed/emptied pool must be conformed here
      // deliberately — the 8/26 transcripts move shipped a silent 10-PDF
      // shrink because an existing-but-empty pool only warned.
      console.error(`  FATAL: pool ${poolPdfs ? 'EMPTY' : 'MISSING'}: ${pool} (source re-sorted again? update pdfPools)`);
      process.exit(1);
    }
    // the sibling .md may sit beside the pdf, one level up (docx pools),
    // two levels up (docx/pdfs pools), or at the archive root
    const mdDirs = [...new Set([pdfDir, dirname(pdfDir), pdfDir.replace(/\/docx\/pdfs$/, ''), A.src])];
    for (const f of poolPdfs) {
      if (seenPdf.has(f)) {
        overlaid += 1; // earlier (fresher) pool already supplied this name
        continue;
      }
      seenPdf.add(f);
      const srcPdf = join(pdfDir, f);
      const stem = f.replace(/\.pdf$/, '');
      const mdPath = findMd(mdDirs, stem);
      if (mdPath) {
        const got = pdfFooterSha12(srcPdf);
        const want = mdSha12(mdPath);
        if (got !== want) {
          if (A.allowStale?.has(f)) {
            allowedStale += 1;
            console.log(`    ALLOWED-STALE ${f} (footer ${got} ≠ md ${want}) — registered pending re-export`);
          } else {
            staleViolations.push(`${f} (pool ${pool}: footer ${got} ≠ md ${want})`);
          }
        }
      }
      copyFileSync(srcPdf, join(dst, 'pdfs', f));
      pdfCount += 1;
      const entry = { title: mdTitle(mdDirs, stem), pdf: `pdfs/${f}` };
      const c = A.classify(stem);
      if (c) {
        for (const id of c.leaves) {
          if (leaves[id]) leaves[id].docs.push({ kind: c.kind, span: c.span, ...entry });
        }
      } else {
        workingPapers.push(entry);
      }
    }
  }
  if (staleViolations.length > 0) {
    console.error(`  FATAL: ${staleViolations.length} SUPERSEDED generation(s) not registered in allowStale:`);
    for (const v of staleViolations) console.error(`    - ${v}`);
    console.error('  Swap the pool to the current export, or register the file deliberately.');
    process.exit(1);
  }
  if (pdfCount === 0) {
    console.error(`  FATAL: zero PDFs found across all pools for ${A.id} — aborting before the empty set replaces the published one.`);
    process.exit(1);
  }
  console.log(`  pdfs: ${pdfCount} copied (${workingPapers.length} working papers; ${overlaid} overlaid by earlier pools; ${allowedStale} allowed-stale)`);

  // crops (only for licensed archives, and only on request — large)
  if (A.imagesLicensed && WITH_CROPS && existsSync(join(A.src, 'crops'))) {
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

  // manifest — canonical transcript first, then line index, then working spans
  const leafList = Object.values(leaves);
  for (const l of leafList) l.docs.sort((a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind]);
  writeFileSync(
    join(dst, 'manifest.json'),
    JSON.stringify(
      {
        archive: { id: A.id, ref: A.ref, title: A.title, dated: A.dated, source: A.source, pieces: leafList.length },
        images: {
          published: A.imagesLicensed,
          rightsHolder: A.rightsHolder,
          ...(A.rightsNote ? { rightsNote: A.rightsNote } : {}),
          ...(A.reuseNote ? { reuseNote: A.reuseNote } : {}),
          ...(A.creditUrl ? { creditUrl: A.creditUrl } : {}),
        },
        leaves: leafList,
        workingPapers,
        crops: { count: Object.keys(cropIndex).length, index: cropIndex },
      },
      null,
      2
    ) + '\n'
  );

  for (const l of leafList) {
    const canon = l.docs.some((d) => d.kind === 'transcript') ? 'TRANSCRIPT' : '—';
    const idx = l.docs.some((d) => d.kind === 'index') ? 'index' : '—';
    const tr = l.docs.filter((d) => d.kind === 'transcription').map((d) => d.span).join(', ') || 'no working spans';
    console.log(`    ${l.id}: ${canon} · ${idx} · ${tr}`);
  }
  console.log(`  MODE: ${A.imagesLicensed ? 'REAL IMAGES (licensed)' : 'placeholders — leaf images withheld pending licence'}`);
}

console.log('\nNOTE: review, then commit public/uploads/research/.');
