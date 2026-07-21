// scripts/normalize-testimony-packages.mjs — bring testimony packages to the
// standard layout (see scripts/lib/testimony-package.mjs) and report chain
// completeness. DRY RUN by default.
//
//   node scripts/normalize-testimony-packages.mjs             # plan: published + queue
//   node scripts/normalize-testimony-packages.mjs --inbox     # + the local staging inbox
//   node scripts/normalize-testimony-packages.mjs --apply     # act + write manifest.json
//
// manifest.json is only written for tracked roots (published/queue) — inbox
// packages get theirs when the curation console publishes them.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { normalizePackage, writeManifest, chainPresence } from './lib/testimony-package.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const APPLY = process.argv.includes('--apply');
const INBOX = process.argv.includes('--inbox');

const roots = [
  { dir: path.join(ROOT, 'testimonies'), label: 'published', manifest: true },
  { dir: path.join(ROOT, 'testimony_queue'), label: 'queued', manifest: true },
  ...(INBOX
    ? [{ dir: path.join(ROOT, 'Chronological Testimonies'), label: 'inbox', manifest: false, flat: true }]
    : []),
];

let pkgCount = 0;
let actionCount = 0;
const allWarnings = [];
const chainGaps = [];

function handlePackage(pkgPath, writeManifests) {
  pkgCount++;
  const rel = path.relative(ROOT, pkgPath);
  const { actions, warnings } = normalizePackage(pkgPath, { execute: APPLY });
  if (actions.length) {
    console.log(`${APPLY ? '[do]  ' : '[plan]'} ${rel}`);
    for (const a of actions) console.log(`         ${a}`);
    actionCount += actions.length;
  }
  for (const w of warnings) allWarnings.push(`${rel}: ${w}`);

  if (writeManifests && APPLY) writeManifest(pkgPath, { execute: true });

  const chain = chainPresence(pkgPath);
  const missing = Object.entries(chain).filter(([, ok]) => !ok).map(([k]) => k);
  if (missing.length) chainGaps.push(`${rel}: missing ${missing.join(', ')}`);
}

for (const root of roots) {
  if (!fs.existsSync(root.dir)) continue;
  for (const entry of fs.readdirSync(root.dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const p = path.join(root.dir, entry.name);
    if (root.flat) {
      // inbox: packages sit directly at the root
      handlePackage(p, root.manifest);
    } else {
      // published/queue: <Set>/<Package>
      for (const pkg of fs.readdirSync(p, { withFileTypes: true })) {
        if (pkg.isDirectory()) handlePackage(path.join(p, pkg.name), root.manifest);
      }
    }
  }
}

console.log(`\n${APPLY ? 'Applied' : 'Planned'} ${actionCount} action(s) across ${pkgCount} package(s).`);
if (APPLY) console.log('manifest.json written for published + queued packages.');

if (allWarnings.length) {
  console.log(`\n⚠ ${allWarnings.length} warning(s) — need a human decision, nothing was touched:`);
  for (const w of allWarnings) console.log(`  - ${w}`);
}
if (chainGaps.length) {
  console.log(`\n⚠ ${chainGaps.length} package(s) with an INCOMPLETE authentication chain:`);
  for (const g of chainGaps) console.log(`  - ${g}`);
}
if (!APPLY) console.log('\nDry run only. Re-run with --apply to act.');
