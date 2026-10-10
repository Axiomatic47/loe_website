#!/usr/bin/env node
// scripts/casereview-mn-name-map.mjs — the MN case's host NAME MAP for scripts/import-casereview.mjs (`--name-map`), a
// lawsofexistence.com fact, not the lane's: this site already holds the Minnesota docket under
// public/uploads/constitutional/pdfs/minnesota/ in its own names — zero-padded and docket-prefixed (2594-01-01.pdf,
// 2594-19.pdf), the closed first case 0:26-cv-00726 as 1.pdf, 19.pdf, the Eighth Circuit appeal as 8cir-brief.pdf …
// The importer's `--names docket` rule would name MN2594-019 "19.pdf", which is the CLOSED case's Doc 19 on this site,
// and the importer overwrites a same-named file whose sha is not the row's. So the MN names are keyed by SHA256:
//
//   1. a registry row whose sha256 matches a file already under public/uploads/constitutional/pdfs/ (any depth) maps
//      to THAT file — the 52 docket and appeal files this site carries, and the case-law rows shared with the DDC
//      registry already under pdfs/ (no duplicate PDF);
//   2. a docket row with no file yet (a filing this site has never carried) takes this site's convention:
//      ECF N → minnesota/2594-NN.pdf, ECF N-M → minnesota/2594-NN-MM.pdf (two digits, as the files on disk);
//   3. every other row is left to the importer's default (the registry id's safe name under --uploads-dir).
//
// The map's values are paths RELATIVE TO --uploads-dir (the importer joins `${UPLOADS_URL}/${hostName(d)}`), so this map
// is run with `--uploads-dir uploads/constitutional/pdfs` and the values carry the `minnesota/` prefix — one uploads
// root, two layouts, no collision.
//
//   node scripts/casereview-mn-name-map.mjs --from <export dir | lane dir with docs.json> [--out scripts/casereview-name-map-mn.json]
//
// Read-only on the registry and the files; writes the JSON map only. Reports the three classes and refuses a map in
// which two rows would share a file.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const opt = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const FROM = opt('--from', null);
const OUT = path.resolve(ROOT, opt('--out', path.join('scripts', 'casereview-name-map-mn.json')));
const PDFS = path.join(ROOT, 'public', 'uploads', 'constitutional', 'pdfs');
const fail = (m) => { console.error(`casereview-mn-name-map: ${m}`); process.exit(1); };
if (!FROM) fail('--from <dir holding docs.json> is required');

const docsPath = path.join(FROM, 'docs.json');
if (!fs.existsSync(docsPath)) fail(`no docs.json under ${FROM}`);
const reg = JSON.parse(fs.readFileSync(docsPath, 'utf8'));
const docs = Array.isArray(reg) ? reg : reg.docs;

// every PDF under pdfs/ by sha (the files this site serves today)
const bySha = new Map();
const walk = (dir, rel) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name), r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) walk(p, r);
    else if (e.name.toLowerCase().endsWith('.pdf')) {
      const h = crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
      if (!bySha.has(h)) bySha.set(h, r);
    }
  }
};
walk(PDFS, '');

const ecf = /^ECF\s+(\d+)(?:-(\d+))?$/;
const pad = (n) => String(+n).padStart(2, '0');
const map = {};
const counts = { matched: 0, convention: 0, left: 0 };
const matched = [], convention = [];
for (const d of docs) {
  const have = d.sha256 && bySha.get(d.sha256);
  if (have) { map[d.id] = have; counts.matched++; matched.push(`${d.id} → ${have}`); continue; }
  const m = ecf.exec(String(d.label || '').trim());
  if (m && /^MN2594-/.test(String(d.id))) {
    map[d.id] = `minnesota/2594-${pad(m[1])}${m[2] ? `-${pad(m[2])}` : ''}.pdf`;
    counts.convention++; convention.push(`${d.id} → ${map[d.id]}`); continue;
  }
  counts.left++;
}
// no two rows on one file
const seen = new Map();
for (const [id, f] of Object.entries(map)) {
  if (seen.has(f)) fail(`two rows would share ${f}: ${seen.get(f)} and ${id}`);
  seen.set(f, id);
}
// a convention name must not already exist with another row's bytes
for (const [id, f] of Object.entries(map)) {
  const p = path.join(PDFS, f);
  if (convention.some(c => c.startsWith(`${id} `)) && fs.existsSync(p)) fail(`${id} would take ${f}, which exists with other bytes — name it by hand`);
}
fs.writeFileSync(OUT, JSON.stringify(map, null, 2) + '\n');
console.log(`${docs.length} rows: ${counts.matched} matched to a file on this site by sha, ${counts.convention} new docket files by this site's convention, ${counts.left} left to the importer's default name`);
for (const l of convention) console.log(`  new   ${l}`);
console.log(`map written: ${path.relative(ROOT, OUT)} (${Object.keys(map).length} entries)`);
