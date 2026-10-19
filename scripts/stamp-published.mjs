// scripts/stamp-published.mjs — when did each version of a reviewed book reach the LIVE site?
// (ported from kirchner.ink e15c37f, f28bb754; the same script on both sites)
//
// The lane's _VERSIONS.json dates a version's COMPLETION (the drafter's date). Publication is the
// owner's integration of device/macbook → main (Netlify deploys main), so a version's publish date
// is the date, in the owner's zone, of the first main commit whose content/versions/<slug>.json
// carries it (owner 2026-09-26: "while they were all completed on the said dates, none were
// published until September 26, which is information that needs to be available to the reviewer").
// This script reads that from main's first-parent history and writes
// content/versions/<slug>.published.json — the site's own record beside the lane's log, never
// inside it. Run it after every integration (the deploy), then commit. A version absent from the
// record has not been published; a production build dates such a version by the commit it is
// building (readVersions in app/books/review-server.ts), so the live site is never behind the record.
//
//   node scripts/stamp-published.mjs [slug …] [--ref origin/main] [--check] [--live <sha> [--note "<why>"]]
//
// A recorded date is never rewritten (the record is history); a disagreement with main's history
// is printed, not applied. --check writes nothing and exits 1 when the record is behind main.
//
// --live <sha>: the first main commit whose DEPLOY reached the site after a run of failed ones. The
// default dates a version by the first main commit that carried it, which is the deploy only when
// that deploy succeeded; from 2026-10-01 10:29 to 2026-10-18 19:56 CDT every deploy of main failed
// (a CRLF-stripped PDF, then a 1.7 GB server function) and the live site stayed at the deploy of
// 1 Oct, so the versions those commits carried first reached readers with 7defaa9 on 18 Oct. Given
// --live, a NEW version whose first carrier is an ancestor of <sha> other than <sha> itself is
// stamped at <sha>'s date and sha, with `carried` (the first main commit, the default's answer) and
// `note` (the --note text). A later run without --live reads such an entry as agreeing with main.
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIR = join(ROOT, 'content', 'versions');
const TZ = 'America/Chicago';

const argv = process.argv.slice(2);
const refAt = argv.indexOf('--ref');
const REF = refAt >= 0 ? argv[refAt + 1] : 'origin/main';
const CHECK = argv.includes('--check');
const liveAt = argv.indexOf('--live');
const LIVE = liveAt >= 0 ? argv[liveAt + 1] : null;
const noteAt = argv.indexOf('--note');
const NOTE = noteAt >= 0 ? argv[noteAt + 1] : null;
const VALUED = new Set(['--ref', '--live', '--note']);
const slugs = argv.filter((a, i) => !a.startsWith('--') && !VALUED.has(argv[i - 1]));

const git = (...a) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8' });
const localDate = (iso) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso));
const byNumber = (a, b) => Number(a[0]) - Number(b[0]);

try { git('rev-parse', '--verify', '--quiet', `${REF}^{commit}`); } catch {
  console.error(`stamp-published: no such ref ${REF} — fetch it first (git fetch origin main)`);
  process.exit(2);
}
let live = null; // { sha, full, date } — the commit that actually deployed, when --live names one
if (LIVE) {
  let full;
  try { full = git('rev-parse', '--verify', '--quiet', `${LIVE}^{commit}`).trim(); } catch {
    console.error(`stamp-published: --live ${LIVE}: no such commit`); process.exit(2);
  }
  try { git('merge-base', '--is-ancestor', full, REF); } catch {
    console.error(`stamp-published: --live ${LIVE} is not on ${REF}'s history`); process.exit(2);
  }
  live = { sha: full.slice(0, 7), full, date: localDate(git('log', '-1', '--format=%cI', full).trim()) };
}
const isAncestor = (a, b) => { try { git('merge-base', '--is-ancestor', a, b); return true; } catch { return false; } };

const logs = existsSync(DIR) ? readdirSync(DIR).filter((f) => f.endsWith('.json') && !f.endsWith('.published.json')).map((f) => f.slice(0, -5)) : [];
const targets = slugs.length ? slugs : logs;
let behind = 0;
for (const slug of targets) {
  const rel = `content/versions/${slug}.json`;
  const logFile = join(DIR, `${slug}.json`);
  const out = join(DIR, `${slug}.published.json`);
  if (!existsSync(logFile)) { console.error(`stamp-published: ${slug}: no ${rel}`); process.exitCode = 2; continue; }
  const prev = existsSync(out) ? JSON.parse(readFileSync(out, 'utf8')) : null;
  const record = { ...(prev?.published ?? {}) };

  // main's first-parent history of the log, oldest first: the first commit carrying a version publishes it
  const history = git('log', '--first-parent', '--reverse', '--format=%H%x09%cI', REF, '--', rel).trim();
  const found = {};
  for (const line of history ? history.split('\n') : []) {
    const [sha, committed] = line.split('\t');
    let versions;
    try { versions = JSON.parse(git('show', `${sha}:${rel}`)).versions ?? []; } catch { continue; } // the log absent at that commit
    for (const v of versions) {
      const k = String(v.version);
      if (!(k in found)) found[k] = { date: localDate(committed), commit: sha.slice(0, 7) };
    }
  }

  const added = [];
  const disagree = [];
  for (const [k, f] of Object.entries(found).sort(byNumber)) {
    if (!(k in record)) {
      // a carrier whose deploy failed: the version reached the site with --live's commit
      const relive = live && f.commit !== live.sha && isAncestor(f.commit, live.full);
      record[k] = relive ? { date: live.date, commit: live.sha, carried: f.commit, ...(NOTE ? { note: NOTE } : {}) } : f;
      added.push(relive ? `${k} (live ${live.sha}, carried ${f.commit})` : k);
    }
    else if ((record[k].carried ?? record[k].commit) !== f.commit || (!record[k].carried && record[k].date !== f.date)) disagree.push(`v${k}: recorded ${record[k].date} (${record[k].commit}), ${REF} says ${f.date} (${f.commit})`);
  }
  const current = JSON.parse(readFileSync(logFile, 'utf8')).versions.map((v) => String(v.version));
  const unpublished = current.filter((k) => !(k in record));

  const summary = [
    `${slug}: ${Object.keys(record).length} published`,
    added.length ? `+${added.length} stamped (v${added.join(', v')})` : 'nothing new',
    unpublished.length ? `not yet published: v${unpublished.join(', v')}` : 'every version in the log is published',
  ].join('; ');
  for (const d of disagree) console.warn(`stamp-published: ${slug}: DISAGREEMENT, not applied — ${d}`);
  if (added.length) {
    if (CHECK) { behind += 1; console.log(`${summary} — record behind ${REF} (--check: nothing written)`); continue; }
    const doc = {
      $comment: `Generated by scripts/stamp-published.mjs from ${REF}'s first-parent history: per version, the date (${TZ}) and short sha of the first main commit that carried it in ${rel} — the owner's integration, which is the deploy when its build and upload succeed (an entry with 'carried' names that first commit while date/commit are the later commit whose deploy reached the site, --live, and 'note' says why). The site's record, never the lane's; a recorded date is never rewritten. Do not hand-edit; re-run the script after each integration.`,
      slug,
      tz: TZ,
      published: Object.fromEntries(Object.entries(record).sort(byNumber)),
    };
    writeFileSync(out, `${JSON.stringify(doc, null, 2)}\n`);
    console.log(`${summary} → ${rel.replace(/\.json$/, '.published.json')}`);
  } else {
    console.log(summary);
  }
}
if (CHECK && behind) process.exit(1);
