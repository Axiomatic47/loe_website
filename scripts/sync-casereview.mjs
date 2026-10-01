#!/usr/bin/env node
// scripts/sync-casereview.mjs — the Studio's Case Review window, vendored byte for byte.
//
//   node scripts/sync-casereview.mjs --check          # the files under public/ match VENDOR.json and its pdf.js pin (every build)
//   node scripts/sync-casereview.mjs --check --source # …and VENDOR.json matches the Studio checkout at its recorded commit:
//                                                     #    the blobs, the fixture's `pdfjs` section, and the Studio harness run there
//   node scripts/sync-casereview.mjs --sync           # copy from the Studio checkout at its HEAD, rewrite VENDOR.json (pin included)
//
// The site never edits these files: the Studio (~/Git/ourstudio) is the source of every rule; a change lands there
// first and syncs out. `--check` needs nothing but this repo (Netlify runs it); `--source` and `--sync` need the
// Studio checkout (STUDIO_DIR, default ~/Git/ourstudio) and run on the device only.
//
// THE PIN (studio-spec fbf555d9's R2, 2026-10-01; frontend-developer a168bcf6's b5539b95): the Studio fixture
// tests/fixtures/casereview_fold.json carries a `pdfjs` section — version, sha256 of pdf.min.mjs and the worker, the
// standard fonts by name and digest. The Studio's harness asserts it against ui/lib/pdfjs; this script asserts the
// same section against the vendored copy, so drift fails the build on either side. An upgrade is ONE Studio patch
// moving the pin and the files together.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const RECORD = path.join(PUBLIC, 'casereview', 'vendor', 'VENDOR.json');
const FIXTURE = 'tests/fixtures/casereview_fold.json';
const FONTS_DIR = 'lib/pdfjs/standard_fonts';
const STUDIO = process.env.STUDIO_DIR || path.join(os.homedir(), 'Git', 'ourstudio');
const args = new Set(process.argv.slice(2));

const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
const read = (p) => fs.readFileSync(p);
const fail = (msg) => { console.error(`sync-casereview: ${msg}`); process.exit(1); };
const short = (h) => String(h || '').slice(0, 8);

function loadRecord() { return JSON.parse(fs.readFileSync(RECORD, 'utf8')); }
function git(...a) { return execFileSync('git', ['-C', STUDIO, ...a], { encoding: 'buffer', maxBuffer: 64 << 20 }); }
function needStudio() { if (!fs.existsSync(path.join(STUDIO, '.git'))) fail(`no Studio checkout at ${STUDIO} (set STUDIO_DIR)`); }

/** The vendored files and the pin against the record alone (no Studio needed). */
function check(rec) {
  let bad = 0;
  for (const [rel, f] of Object.entries(rec.files)) {
    const p = path.join(PUBLIC, rel);
    if (!fs.existsSync(p)) { console.error(`  missing  ${rel}`); bad++; continue; }
    const h = sha256(read(p));
    if (h !== f.sha256) { console.error(`  DRIFT    ${rel}\n           on disk ${h}\n           record  ${f.sha256}`); bad++; }
    else console.log(`  ok       ${rel}`);
  }
  for (const rel of Object.keys(rec.shims || {})) {
    if (!fs.existsSync(path.join(PUBLIC, rel))) { console.error(`  missing  ${rel} (a shim the window imports)`); bad++; }
    else console.log(`  shim     ${rel}`);
  }
  const pin = rec.pdfjs_pin || {};
  if (!pin.version || !pin.files) { console.error('  NO PIN   VENDOR.json carries no pdfjs_pin — run --sync from the Studio checkout'); return bad + 1; }
  for (const [name, digest] of Object.entries(pin.files)) {
    const rel = `lib/pdfjs/${name}`;
    const p = path.join(PUBLIC, rel);
    const h = fs.existsSync(p) ? sha256(read(p)) : null;
    if (h !== digest) { console.error(`  PIN      ${rel}: the fixture pins ${short(digest)}…, on disk ${h ? short(h) + '…' : 'missing'}`); bad++; }
    else console.log(`  pin      ${rel} = ${short(digest)}… (pdf.js ${pin.version})`);
  }
  const fontsDir = path.join(PUBLIC, FONTS_DIR);
  const fonts = pin.standard_fonts || {};
  let fontsOk = 0;
  for (const [name, digest] of Object.entries(fonts)) {
    const p = path.join(fontsDir, name);
    const h = fs.existsSync(p) ? sha256(read(p)) : null;
    if (h !== digest) { console.error(`  PIN      ${FONTS_DIR}/${name}: pinned ${short(digest)}…, on disk ${h ? short(h) + '…' : 'missing'}`); bad++; }
    else fontsOk++;
  }
  console.log(`  pin      ${FONTS_DIR}/ — ${fontsOk} of ${Object.keys(fonts).length} standard fonts by digest`);
  return bad;
}

/** The record against the Studio checkout at the recorded commit: the blobs, the fixture's pin, the harness. */
function checkSource(rec) {
  needStudio();
  let bad = 0;
  const c = rec.source.commit;
  for (const [rel, f] of Object.entries(rec.files)) {
    let blob;
    try { blob = git('show', `${c}:${f.from}`); }
    catch { console.error(`  no blob  ${f.from} at ${short(c)}`); bad++; continue; }
    const h = sha256(blob);
    if (h !== f.sha256) { console.error(`  RECORD≠SOURCE ${rel}: the Studio blob at ${short(c)} is ${h}`); bad++; }
    else console.log(`  source   ${rel} = ${f.from} @ ${short(c)}`);
  }
  // the fixture's pin at the recorded commit must be the record's pin
  let fx = null;
  try { fx = JSON.parse(git('show', `${c}:${FIXTURE}`).toString('utf8')).pdfjs || null; } catch { fx = null; }
  if (!fx) { console.error(`  no pin   ${FIXTURE} at ${short(c)} carries no pdfjs section`); bad++; }
  else {
    const same = JSON.stringify({ v: fx.version, f: fx.files, s: fx.standard_fonts }) === JSON.stringify({ v: rec.pdfjs_pin.version, f: rec.pdfjs_pin.files, s: rec.pdfjs_pin.standard_fonts });
    if (!same) { console.error(`  PIN≠FIXTURE the record's pdfjs_pin is not the fixture's section at ${short(c)} — run --sync`); bad++; }
    else console.log(`  fixture  ${FIXTURE} @ ${short(c)}: the pin is the record's (pdf.js ${fx.version}, ${Object.keys(fx.standard_fonts || {}).length} fonts)`);
  }
  // the Studio's harness, in the Studio checkout — its pins cover the vendored copy by blob identity (a168bcf6's rule:
  // the harness reads the whole ui tree by relative path; it runs where it lives, never against a rewritten path)
  const head = git('rev-parse', 'HEAD').toString().trim();
  if (head === c) {
    try {
      const out = execFileSync('node', ['tests/js/casereview_test.harness.mjs'], { cwd: STUDIO, encoding: 'utf8', maxBuffer: 64 << 20 });
      const last = out.trim().split('\n').pop();
      console.log(`  harness  ${last} (in ${STUDIO} @ ${short(head)})`);
    } catch (e) { console.error(`  HARNESS  failed in the Studio checkout:\n${String(e.stdout || e.message).trim().split('\n').slice(-6).map(l => '           ' + l).join('\n')}`); bad++; }
  } else {
    const touching = git('log', '--oneline', `${c}..HEAD`, '--', ...Object.values(rec.files).map(f => f.from), ...Object.values(rec.dirs || {}).map(d => d.from), FIXTURE).toString().trim();
    console.log(`  harness  not run: the Studio HEAD is ${short(head)}, the record ${short(c)} — the blobs above cover the copy by identity`);
    if (touching) console.log(`  NOTE     the Studio has newer commits touching the vendored files or the fixture (a sync is a decision, not a drift):\n${touching.split('\n').map(l => '           ' + l).join('\n')}`);
  }
  return bad;
}

/** Copy from the Studio at its HEAD; rewrite the record and the pin. */
function sync(rec) {
  needStudio();
  const srcs = [...Object.values(rec.files).map(f => f.from), ...Object.values(rec.dirs || {}).map(d => d.from), FIXTURE];
  const dirty = git('status', '--porcelain', '--', ...srcs).toString().trim();
  if (dirty) fail(`the Studio's vendored sources have uncommitted changes — commit them in the Studio first:\n${dirty}`);
  const head = git('rev-parse', 'HEAD').toString().trim();
  const changed = git('log', '-1', '--format=%H', '--', ...srcs).toString().trim();
  for (const [rel, f] of Object.entries(rec.files)) {
    const src = path.join(STUDIO, f.from), dst = path.join(PUBLIC, rel);
    const buf = read(src);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.writeFileSync(dst, buf);
    const h = sha256(buf);
    console.log(`  ${h === f.sha256 ? 'same    ' : 'UPDATED '} ${rel}`);
    f.sha256 = h;
  }
  for (const [rel, d] of Object.entries(rec.dirs || {})) {
    const src = path.join(STUDIO, d.from), dst = path.join(PUBLIC, rel);
    fs.rmSync(dst, { recursive: true, force: true });
    fs.cpSync(src, dst, { recursive: true });
    console.log(`  copied   ${rel}/ (${fs.readdirSync(dst).length} files)`);
  }
  const fx = JSON.parse(fs.readFileSync(path.join(STUDIO, FIXTURE), 'utf8')).pdfjs;
  if (!fx) fail(`${FIXTURE} carries no pdfjs section — the pin is missing in the Studio`);
  rec.pdfjs_pin = { note: rec.pdfjs_pin && rec.pdfjs_pin.note, version: fx.version, files: fx.files, standard_fonts: fx.standard_fonts, why: fx.why };
  for (const f of Object.values(rec.files)) if (f.version) f.version = fx.version;
  rec.source.commit = head;
  rec.source.files_last_changed = changed;
  rec.source.vendored = new Date().toISOString();
  fs.writeFileSync(RECORD, JSON.stringify(rec, null, 2) + '\n');
  console.log(`  record   ${path.relative(ROOT, RECORD)} → ${short(head)}`);
}

const rec = loadRecord();
if (args.has('--sync')) { sync(rec); console.log('synced; run --check --source to prove the record'); process.exit(0); }
let bad = check(rec);
if (args.has('--source')) bad += checkSource(rec);
if (bad) fail(`${bad} problem(s) — the vendored files are not the Studio's (see above); run --sync from the Studio checkout, never edit them here`);
console.log(`vendored Case Review window is the Studio's at ${short(rec.source.commit)} (pdf.js ${rec.pdfjs_pin.version})`);
