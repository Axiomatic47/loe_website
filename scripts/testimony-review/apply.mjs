// Temporary testimony curation console — apply recorded decisions.
// DRY RUN by default; pass --execute to actually move/delete + regenerate.
//
// publish -> move dir to testimonies/<Set>/          (renders on the site)
// queue   -> move dir to testimony_queue/<Set> queue/ (parked, not rendered)
// remove  -> delete dir from the working tree
//            (git history still holds it until the separate, owner-gated purge)
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { spawnSync } from 'child_process';
import {
  REPO_ROOT,
  PUBLISHED_ROOT,
  QUEUE_ROOT,
  queueDirName,
  scanAll,
  testimonyAbsPath,
  loadState,
} from './lib.mjs';
import { normalizePackage, writeManifest } from '../lib/testimony-package.mjs';

const EXECUTE = process.argv.includes('--execute');
const CONTENT_DATA = path.join(REPO_ROOT, 'content', 'data');
const UPLOADS_DATA = path.join(REPO_ROOT, 'public', 'uploads', 'data');

const log = (s) => console.log(s);
const act = (s) => console.log(`${EXECUTE ? '  [do]  ' : '  [plan]'} ${s}`);

function moveDir(src, dest) {
  if (path.resolve(src) === path.resolve(dest)) return;
  if (fs.existsSync(dest)) throw new Error(`destination already exists: ${dest}`);
  if (EXECUTE) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.renameSync(src, dest);
  }
}

function pruneEmptySetDirs() {
  for (const root of [PUBLISHED_ROOT, QUEUE_ROOT]) {
    if (!fs.existsSync(root)) continue;
    for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const p = path.join(root, entry.name);
      const contents = fs.readdirSync(p).filter((f) => f !== '.DS_Store');
      if (contents.length === 0) {
        act(`remove empty set dir: ${path.relative(REPO_ROOT, p)}`);
        if (EXECUTE) fs.rmSync(p, { recursive: true, force: true });
      }
    }
  }
}

// The processor reads only TOP-LEVEL .md. For a dir whose markdown is all
// nested: hoist a copy to the top — the single unique document if the nested
// copies dedupe to one, else the owner's chosen primary. Returns null when
// OK, or a blocking reason string.
function ensureRootMd(t, src, primaries) {
  if (t.hasRootMd) return null;
  const nested = t.mdFiles.filter((f) => f.includes('/'));
  if (!nested.length) return 'no markdown at all';
  let pick = primaries[t.key] || null;
  if (!pick) {
    const byHash = new Map();
    for (const f of nested) {
      const h = crypto.createHash('sha256').update(fs.readFileSync(path.join(src, f))).digest('hex');
      if (!byHash.has(h)) byHash.set(h, f);
    }
    if (byHash.size === 1) pick = nested[0];
    else return `has ${byHash.size} distinct nested .md files — pick a primary in the console`;
  }
  const destName = path.basename(pick);
  act(`  hoist primary md: ${pick} -> ${destName}`);
  if (EXECUTE) fs.copyFileSync(path.join(src, pick), path.join(src, destName));
  return null;
}

// ---- 1. Build the plan -----------------------------------------------------
const { decisions, primaries } = loadState();
const { sets } = scanAll();
const plan = { publish: [], queue: [], remove: [], noop: 0 };
const blocked = [];

for (const set of Object.values(sets)) {
  for (const t of [...set.published, ...set.queued, ...(set.inbox || [])]) {
    const d = decisions[t.key];
    if (!d) continue;
    if (d === 'remove') plan.remove.push(t);
    else if (d === 'publish' && t.location !== 'published') plan.publish.push(t);
    // 'queue' on an INBOX item means HOLD: it stays in the gitignored local
    // inbox. Moving it into testimony_queue/ would put unpublished material
    // into the public repo's tracking — exactly what the inbox model avoids.
    else if (d === 'queue' && t.location === 'published') plan.queue.push(t);
    else plan.noop++;
  }
}

// Normalization pre-pass over ALL published packages (standard layout: typo
// fix, mnt/data hoist, Original/ -> original/). Runs (and on --execute, acts)
// before the moves so a normalize-only invocation still does useful work.
const normResults = [];
if (fs.existsSync(PUBLISHED_ROOT)) {
  for (const setDir of fs.readdirSync(PUBLISHED_ROOT, { withFileTypes: true })) {
    if (!setDir.isDirectory()) continue;
    for (const tDir of fs.readdirSync(path.join(PUBLISHED_ROOT, setDir.name), { withFileTypes: true })) {
      if (!tDir.isDirectory()) continue;
      const tPath = path.join(PUBLISHED_ROOT, setDir.name, tDir.name);
      const norm = normalizePackage(tPath, { execute: EXECUTE });
      if (norm.actions.length || norm.warnings.length) normResults.push({ tPath, ...norm });
    }
  }
}
const normActionCount = normResults.reduce((n, r) => n + r.actions.length, 0);

log(`Testimony curation apply — ${EXECUTE ? 'EXECUTE' : 'DRY RUN (pass --execute to act)'}`);
log(`Decisions: ${Object.keys(decisions).length} recorded, ${plan.noop} already satisfied`);
log(`Published packages needing layout normalization: ${normResults.length} (${normActionCount} action(s))\n`);

if (!plan.publish.length && !plan.queue.length && !plan.remove.length && !normActionCount) {
  log('Nothing to do.');
  process.exit(0);
}

// ---- 2. Moves and removals -------------------------------------------------
for (const t of plan.publish) {
  const src = testimonyAbsPath(t);
  const dest = path.join(PUBLISHED_ROOT, t.baseSet, t.dirname);
  act(`publish: ${t.key}`);
  const blockReason = ensureRootMd(t, src, primaries);
  if (blockReason) {
    blocked.push({ key: t.key, reason: blockReason });
    act(`  BLOCKED (not moved): ${blockReason}`);
    continue;
  }
  // Bring the package to the standard layout before it goes live (typo fix,
  // mnt/data hoist, Original/ -> original/ — see scripts/lib/testimony-package.mjs).
  const norm = normalizePackage(src, { execute: EXECUTE });
  for (const a of norm.actions) act(`  ${a}`);
  for (const w of norm.warnings) act(`  ⚠ ${w}`);
  moveDir(src, dest);
  if (EXECUTE) writeManifest(dest, { execute: true });
}

for (const t of plan.queue) {
  const src = testimonyAbsPath(t);
  const dest = path.join(QUEUE_ROOT, queueDirName(t.baseSet), t.dirname);
  act(`queue (unpublish): ${t.key}`);
  moveDir(src, dest);
}

for (const t of plan.remove) {
  const src = testimonyAbsPath(t);
  act(`REMOVE from working tree: ${t.key} (${t.location})`);
  if (EXECUTE) fs.rmSync(src, { recursive: true, force: true });
}

// Report the normalization pre-pass (it already acted under --execute) and,
// on execute, refresh every published package's manifest.json so the
// processor links fresh hashes below.
for (const r of normResults) {
  act(`normalize: ${path.relative(REPO_ROOT, r.tPath)}`);
  for (const a of r.actions) act(`  ${a}`);
  for (const w of r.warnings) act(`  ⚠ ${w}`);
}
if (EXECUTE && fs.existsSync(PUBLISHED_ROOT)) {
  for (const setDir of fs.readdirSync(PUBLISHED_ROOT, { withFileTypes: true })) {
    if (!setDir.isDirectory()) continue;
    for (const tDir of fs.readdirSync(path.join(PUBLISHED_ROOT, setDir.name), { withFileTypes: true })) {
      if (!tDir.isDirectory()) continue;
      writeManifest(path.join(PUBLISHED_ROOT, setDir.name, tDir.name), { execute: true });
    }
  }
  log('  manifest.json refreshed for all published packages');
}

pruneEmptySetDirs();

const reportBlocked = () => {
  if (!blocked.length) return;
  log(`\n⚠ ${blocked.length} publish decision(s) BLOCKED — nothing moved for these:`);
  for (const b of blocked) log(`  - ${b.key}: ${b.reason}`);
};

if (!EXECUTE) {
  reportBlocked();
  log('\nDry run only. Re-run with:  npm run testimonies:apply -- --execute');
  process.exit(0);
}

// ---- 3. Regenerate compositions ---------------------------------------------
log('\nRegenerating testimony compositions (ultimateTestimonyProcessor)...');
const gen = spawnSync('node', ['scripts/ultimateTestimonyProcessor.js'], {
  cwd: REPO_ROOT,
  stdio: ['ignore', 'pipe', 'pipe'],
  encoding: 'utf-8',
});
if (gen.status !== 0) {
  console.error(gen.stdout);
  console.error(gen.stderr);
  throw new Error('ultimateTestimonyProcessor failed — inspect output above');
}
log('  processor completed');

// ---- 4. Delete compositions for sets with no published testimonies ----------
const liveSetFiles = new Set(
  fs.existsSync(PUBLISHED_ROOT)
    ? fs
        .readdirSync(PUBLISHED_ROOT, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => `${e.name.toLowerCase().replace(/\s+/g, '-')}-testimonies-enhanced.json`)
    : [],
);
for (const f of fs.readdirSync(CONTENT_DATA)) {
  if (!f.endsWith('-testimonies-enhanced.json')) continue;
  if (!liveSetFiles.has(f)) {
    act(`delete stale composition: content/data/${f}`);
    fs.rmSync(path.join(CONTENT_DATA, f));
  }
}

// ---- 5. Prune unreferenced processor-copied uploads -------------------------
// Each processor run re-copies images under fresh timestamps; anything matching
// the processor naming pattern but referenced by NO content JSON is stale.
const PROCESSOR_NAME_RE = /_[a-z0-9-]+_\d{12,14}_/;
// Auth-chain copies use stable `<package>_auth_<name>` filenames (no
// timestamp); one goes stale only when its package is renamed/unpublished.
const AUTH_NAME_RE = /_auth_/;
const referenced = new Set();
const contentRoot = path.join(REPO_ROOT, 'content');
(function collect(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) collect(p);
    else if (entry.name.endsWith('.json')) {
      const text = fs.readFileSync(p, 'utf-8');
      // References appear two ways: raw filenames in JSON "src" fields, and
      // URL-encoded, ')'-terminated targets inside markdown links (the
      // Authentication Materials tables). Record every plausible reading.
      for (const m of text.matchAll(/\/uploads\/data\/([^"\\]+)/g)) {
        referenced.add(m[1]);
        const cut = m[1].split(')')[0];
        referenced.add(cut);
        try {
          referenced.add(decodeURIComponent(cut));
        } catch {
          /* not a URI-encoded reference */
        }
      }
    }
  }
})(contentRoot);

let pruned = 0;
if (fs.existsSync(UPLOADS_DATA)) {
  for (const f of fs.readdirSync(UPLOADS_DATA)) {
    if ((PROCESSOR_NAME_RE.test(f) || AUTH_NAME_RE.test(f)) && !referenced.has(f)) {
      fs.rmSync(path.join(UPLOADS_DATA, f));
      pruned++;
    }
  }
}
log(`  pruned ${pruned} stale uploaded image(s)`);

reportBlocked();

log(`
Done. Follow-ups:
  1. npm run build      (validates content, regenerates sitemap + nav manifest)
  2. git status         (review moves/deletes/regenerated JSON)
  3. commit on preview  (owner-gated push, as always)
Notes:
  - removed/unpublished testimonies: frozen legacy 301s now land on 404 (correct
    for withdrawn content).
  - 'remove' cleared the working tree only; git history retains the files until
    the owner-gated filter-repo purge.`);
