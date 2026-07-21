// Temporary testimony curation console — apply recorded decisions.
// DRY RUN by default; pass --execute to actually move/delete + regenerate.
//
// publish -> move dir to testimonies/<Set>/          (renders on the site)
// queue   -> move dir to testimony_queue/<Set> queue/ (parked, not rendered)
// remove  -> delete dir from the working tree
//            (git history still holds it until the separate, owner-gated purge)
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import {
  REPO_ROOT,
  PUBLISHED_ROOT,
  QUEUE_ROOT,
  queueDirName,
  scanAll,
  testimonyAbsPath,
  loadDecisions,
} from './lib.mjs';

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

// ---- 1. Build the plan -----------------------------------------------------
const decisions = loadDecisions();
const { sets } = scanAll();
const plan = { publish: [], queue: [], remove: [], noop: 0 };

for (const set of Object.values(sets)) {
  for (const t of [...set.published, ...set.queued]) {
    const d = decisions[t.key];
    if (!d) continue;
    if (d === 'remove') plan.remove.push(t);
    else if (d === 'publish' && t.location !== 'published') plan.publish.push(t);
    else if (d === 'queue' && t.location !== 'queued') plan.queue.push(t);
    else plan.noop++;
  }
}

// Published dirs still carrying the exihibits/ typo count as pending work:
// their exhibit images are silently missing from the live compositions.
const typoFixes = [];
if (fs.existsSync(PUBLISHED_ROOT)) {
  for (const setDir of fs.readdirSync(PUBLISHED_ROOT, { withFileTypes: true })) {
    if (!setDir.isDirectory()) continue;
    for (const tDir of fs.readdirSync(path.join(PUBLISHED_ROOT, setDir.name), { withFileTypes: true })) {
      if (tDir.isDirectory() && fs.existsSync(path.join(PUBLISHED_ROOT, setDir.name, tDir.name, 'exihibits'))) {
        typoFixes.push(path.join(PUBLISHED_ROOT, setDir.name, tDir.name));
      }
    }
  }
}

log(`Testimony curation apply — ${EXECUTE ? 'EXECUTE' : 'DRY RUN (pass --execute to act)'}`);
log(`Decisions: ${Object.keys(decisions).length} recorded, ${plan.noop} already satisfied`);
log(`Published dirs with exihibits/ typo (exhibits currently missing from site): ${typoFixes.length}\n`);

if (!plan.publish.length && !plan.queue.length && !plan.remove.length && !typoFixes.length) {
  log('Nothing to do.');
  process.exit(0);
}

// ---- 2. Moves and removals -------------------------------------------------
for (const t of plan.publish) {
  const src = testimonyAbsPath(t);
  const dest = path.join(PUBLISHED_ROOT, t.baseSet, t.dirname);
  act(`publish: ${t.key}`);
  // The processor only searches fixed subdir names; fix the known typo so
  // exhibits are not silently skipped once published.
  const typo = path.join(src, 'exihibits');
  if (fs.existsSync(typo)) {
    act(`  rename exihibits/ -> exhibits/ in ${t.dirname}`);
    if (EXECUTE) fs.renameSync(typo, path.join(src, 'exhibits'));
  }
  moveDir(src, dest);
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

// Normalize the exihibits/ typo across ALL published testimonies (not just
// this run's publishes) — the processor regenerates every composition below,
// and these dirs' images have been silently skipped until now.
for (const tPath of typoFixes) {
  act(`fix typo: ${path.relative(REPO_ROOT, tPath)}/exihibits -> exhibits`);
  if (EXECUTE) fs.renameSync(path.join(tPath, 'exihibits'), path.join(tPath, 'exhibits'));
}

pruneEmptySetDirs();

if (!EXECUTE) {
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
const PROCESSOR_NAME_RE = /_(root|exhibit|exhibits|screenshot|image|attachment|evidence)_\d{12,14}_/;
const referenced = new Set();
const contentRoot = path.join(REPO_ROOT, 'content');
(function collect(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) collect(p);
    else if (entry.name.endsWith('.json')) {
      const text = fs.readFileSync(p, 'utf-8');
      for (const m of text.matchAll(/\/uploads\/data\/([^"\\]+)/g)) referenced.add(m[1]);
    }
  }
})(contentRoot);

let pruned = 0;
if (fs.existsSync(UPLOADS_DATA)) {
  for (const f of fs.readdirSync(UPLOADS_DATA)) {
    if (PROCESSOR_NAME_RE.test(f) && !referenced.has(f)) {
      fs.rmSync(path.join(UPLOADS_DATA, f));
      pruned++;
    }
  }
}
log(`  pruned ${pruned} stale uploaded image(s)`);

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
