// Revert the publish-all pass to the ORIGINALLY PUBLISHED set (owner
// direction 2026-07-21: "only those testimonies which were originally
// published are selected for curation. Hold all others").
//
// A package is ORIGINAL iff testimonies/<Set>/<Pkg> has tracked files at
// git HEAD — the corpus the live site was built from. Everything else now
// sitting under testimonies/ goes back where it came from:
//   - tracked at HEAD under testimony_queue/  -> its exact queue path
//   - otherwise                               -> the gitignored inbox (flat)
// (Never the tracked queue for inbox-origin material — the inbox model.)
// Their 'publish' decisions flip to 'queue' (= HOLD), so the console shows
// hold state and a future `testimonies:apply --execute` moves nothing.
//
// DRY RUN by default; --execute moves, rewrites decisions, regenerates the
// compositions, deletes stale set compositions, and prunes orphan uploads
// (same logic as apply.mjs).
import fs from 'fs';
import path from 'path';
import { execFileSync, spawnSync } from 'child_process';
import {
  REPO_ROOT,
  PUBLISHED_ROOT,
  QUEUE_ROOT,
  INBOX_ROOT,
  DECISIONS_PATH,
  queueDirName,
} from './lib.mjs';

const EXECUTE = process.argv.includes('--execute');
const CONTENT_DATA = path.join(REPO_ROOT, 'content', 'data');
const UPLOADS_DATA = path.join(REPO_ROOT, 'public', 'uploads', 'data');
const act = (s) => console.log(`${EXECUTE ? '  [do]  ' : '  [plan]'} ${s}`);

// ---- origin sets from git HEAD ----------------------------------------------
function headPrefixes(root) {
  const out = new Set();
  const raw = execFileSync('git', ['ls-tree', '-r', '-z', '--name-only', 'HEAD', '--', root], {
    cwd: REPO_ROOT,
  }).toString();
  for (const p of raw.split('\0')) {
    const parts = p.split('/');
    if (parts.length >= 3) out.add(`${parts[1]}/${parts[2]}`);
  }
  return out;
}
const originalPublished = headPrefixes('testimonies');
const queueTracked = headPrefixes('testimony_queue');

// ---- plan the moves ----------------------------------------------------------
const plan = { kept: 0, toQueue: [], toInbox: [] };
for (const setDir of fs.readdirSync(PUBLISHED_ROOT, { withFileTypes: true })) {
  if (!setDir.isDirectory()) continue;
  for (const pkg of fs.readdirSync(path.join(PUBLISHED_ROOT, setDir.name), { withFileTypes: true })) {
    if (!pkg.isDirectory()) continue;
    const key = `${setDir.name}/${pkg.name}`;
    if (originalPublished.has(key)) {
      plan.kept++;
      continue;
    }
    const src = path.join(PUBLISHED_ROOT, setDir.name, pkg.name);
    const qSet = queueDirName(setDir.name);
    if (queueTracked.has(`${qSet}/${pkg.name}`)) {
      plan.toQueue.push({ key, src, dest: path.join(QUEUE_ROOT, qSet, pkg.name) });
    } else {
      plan.toInbox.push({ key, src, dest: path.join(INBOX_ROOT, pkg.name) });
    }
  }
}

console.log(`Hold-non-original — ${EXECUTE ? 'EXECUTE' : 'DRY RUN (pass --execute to act)'}`);
console.log(`Original (HEAD-tracked) packages kept published: ${plan.kept}`);
console.log(`Revert to queue (queue-origin): ${plan.toQueue.length}`);
console.log(`Revert to inbox (inbox-origin): ${plan.toInbox.length}\n`);

const collisions = [...plan.toQueue, ...plan.toInbox].filter((m) => fs.existsSync(m.dest));
if (collisions.length) {
  console.error(`ABORT — ${collisions.length} destination(s) already exist:`);
  for (const c of collisions) console.error(`  ${c.dest}`);
  process.exit(1);
}

for (const m of plan.toQueue) act(`queue  <- ${m.key}`);
for (const m of plan.toInbox) act(`inbox  <- ${m.key}`);

// ---- decisions: hold everything that is not original -------------------------
const state = JSON.parse(fs.readFileSync(DECISIONS_PATH, 'utf-8'));
let flips = 0;
for (const [key, val] of Object.entries(state.decisions)) {
  if (val === 'publish' && !originalPublished.has(key)) {
    state.decisions[key] = 'queue';
    flips++;
  }
}
console.log(`\nDecision flips publish -> queue (hold): ${flips}`);

if (!EXECUTE) {
  console.log('\nDry run only. Re-run with --execute to act.');
  process.exit(0);
}

// ---- execute: moves ----------------------------------------------------------
for (const m of [...plan.toQueue, ...plan.toInbox]) {
  fs.mkdirSync(path.dirname(m.dest), { recursive: true });
  fs.renameSync(m.src, m.dest);
}
for (const entry of fs.readdirSync(PUBLISHED_ROOT, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const p = path.join(PUBLISHED_ROOT, entry.name);
  if (fs.readdirSync(p).filter((f) => f !== '.DS_Store').length === 0) {
    act(`remove empty set dir: ${path.relative(REPO_ROOT, p)}`);
    fs.rmSync(p, { recursive: true, force: true });
  }
}
fs.writeFileSync(DECISIONS_PATH, JSON.stringify(state, null, 2) + '\n');
console.log('decisions written');

// ---- regenerate compositions (same sequence as apply.mjs) --------------------
console.log('\nRegenerating testimony compositions (ultimateTestimonyProcessor)...');
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
console.log('  processor completed');

// stale set compositions
const liveSetFiles = new Set(
  fs
    .readdirSync(PUBLISHED_ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => `${e.name.toLowerCase().replace(/\s+/g, '-')}-testimonies-enhanced.json`),
);
for (const f of fs.readdirSync(CONTENT_DATA)) {
  if (!f.endsWith('-testimonies-enhanced.json')) continue;
  if (!liveSetFiles.has(f)) {
    act(`delete stale composition: content/data/${f}`);
    fs.rmSync(path.join(CONTENT_DATA, f));
  }
}

// prune unreferenced processor/auth uploads (verbatim apply.mjs logic)
const PROCESSOR_NAME_RE = /_[a-z0-9-]+_\d{12,14}_/;
const AUTH_NAME_RE = /_auth_/;
const referenced = new Set();
(function collect(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) collect(p);
    else if (entry.name.endsWith('.json')) {
      const text = fs.readFileSync(p, 'utf-8');
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
})(path.join(REPO_ROOT, 'content'));

let pruned = 0;
if (fs.existsSync(UPLOADS_DATA)) {
  for (const f of fs.readdirSync(UPLOADS_DATA)) {
    if ((PROCESSOR_NAME_RE.test(f) || AUTH_NAME_RE.test(f)) && !referenced.has(f)) {
      fs.rmSync(path.join(UPLOADS_DATA, f));
      pruned++;
    }
  }
}
console.log(`  pruned ${pruned} stale uploaded file(s)`);

console.log(`
Done. Follow-ups:
  1. npm run generate-sitemap && npm run generate-nav-manifest
  2. npm run build / build:next   (gates)
  3. integrity check: every /uploads/data ref resolves on disk`);
