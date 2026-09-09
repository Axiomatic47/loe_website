#!/usr/bin/env node
// scripts/readings-moderate.mjs — moderate Open Readings answers (Netlify Forms
// → content/readings/<collection>.answers.json).
//
// Plan: agent_notes/_shared/20260908_open_readings_build_plan.md §11 (P6).
//
//   npm run readings:moderate                 interactive: walk the new submissions
//   npm run readings:moderate -- --list       print the new submissions, decide nothing
//   npm run readings:moderate -- --publish <id> | --author-only <id> | --reject <id>
//   npm run readings:moderate -- --commit     after deciding: commit + push device branch
//   npm run readings:moderate -- --fixture <file.json>   read submissions from a local
//                                             file (Netlify shape) instead of the API
//
// Auth: NETLIFY_AUTH_TOKEN in the environment, or a line `NETLIFY_AUTH_TOKEN=…` in
// ~/.config/loe_website/netlify.env. The token is the owner's Personal Access Token
// (Netlify → User settings → Applications → New access token). It is never written
// anywhere by this script and must never be committed.
//
// What leaves this script: ONLY the fields the site publishes — item_id, letter,
// reading (C), note, reader.display, reader.credentials_summary, published, ack.
// The reader's contact and the submission's ip stay in the terminal and in the
// Netlify dashboard. `scripts/validate-readings.mjs` runs after every write and
// refuses any contact-like key; a failed validation restores the previous file.
//
// Decisions are remembered in .cache/readings-moderation.json (gitignored) so a
// rejected probe never re-appears and nothing is published twice.

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(ROOT, 'content', 'readings');
const LEDGER = join(ROOT, '.cache', 'readings-moderation.json');
const FORM_NAME = 'open-reading';
const API = 'https://api.netlify.com/api/v1';
const DEVICE_BRANCH = 'device/macbook';
const INTEGRATE_NOTE = '/Users/everest/Git/midesk/tools/integrate_note.py';

// ---------------------------------------------------------------- arguments
const argv = process.argv.slice(2);
const flag = name => argv.includes(`--${name}`);
const opt = name => { const i = argv.indexOf(`--${name}`); return i >= 0 ? argv[i + 1] : undefined; };
const opts = name => argv.flatMap((a, i) => (a === `--${name}` && argv[i + 1] ? [argv[i + 1]] : []));

const LIST = flag('list');
const COMMIT = flag('commit');
const FIXTURE = opt('fixture');
const SITE = opt('site') || process.env.NETLIFY_SITE_NAME || '';
const DECIDE = [
  ...opts('publish').map(id => ({ id, decision: 'published' })),
  ...opts('author-only').map(id => ({ id, decision: 'author_only' })),
  ...opts('reject').map(id => ({ id, decision: 'rejected' })),
];

// ---------------------------------------------------------------- helpers
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }; // local date: what the owner's clock reads
const on = v => v === 'on' || v === true || v === 'true';
const clean = v => (typeof v === 'string' ? v.trim() : '');
const die = (msg, code = 1) => { console.error(`readings-moderate: ${msg}`); process.exit(code); };
const readJson = p => JSON.parse(readFileSync(p, 'utf8'));
const writeJson = (p, v) => writeFileSync(p, JSON.stringify(v, null, 2) + '\n');

function loadToken() {
  if (process.env.NETLIFY_AUTH_TOKEN) return process.env.NETLIFY_AUTH_TOKEN.trim();
  const envFile = join(homedir(), '.config', 'loe_website', 'netlify.env');
  if (existsSync(envFile)) {
    for (const line of readFileSync(envFile, 'utf8').split('\n')) {
      const m = line.match(/^\s*(?:export\s+)?NETLIFY_AUTH_TOKEN\s*=\s*["']?([^"'\s]+)["']?\s*$/);
      if (m) return m[1];
    }
  }
  return null;
}

function loadLedger() {
  if (!existsSync(LEDGER)) return { decisions: {} };
  try { return readJson(LEDGER); } catch { die(`${LEDGER} is unparsable — fix or remove it`); }
}
function saveLedger(l) { mkdirSync(dirname(LEDGER), { recursive: true }); writeJson(LEDGER, l); }

/** item index: item_id → { collection, item } across every collection file */
function loadItems() {
  const idx = new Map();
  if (!existsSync(CONTENT)) return idx;
  for (const f of readdirSync(CONTENT)) {
    if (!f.endsWith('.json') || f.endsWith('.answers.json') || f.endsWith('.meta.json')) continue;
    const collection = f.replace(/\.json$/, '');
    const data = readJson(join(CONTENT, f));
    for (const item of Array.isArray(data) ? data : (data.items ?? [])) idx.set(item.id, { collection, item });
  }
  return idx;
}

// ---------------------------------------------------------------- Netlify
async function api(path, token) {
  const res = await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'loe-website readings-moderate' } });
  if (res.status === 401) die('Netlify refused the token (401). Create a Personal Access Token under Netlify → User settings → Applications and export NETLIFY_AUTH_TOKEN.');
  if (!res.ok) die(`Netlify API ${path} → ${res.status} ${res.statusText}`);
  return res.json();
}

async function fetchSubmissions(token) {
  const sites = await api('/sites?per_page=100', token);
  let site;
  if (SITE) site = sites.find(s => s.name === SITE || s.url?.includes(SITE) || s.custom_domain === SITE);
  if (!site) {
    // the site that carries the form: probe each site's forms for `open-reading`
    const carriers = [];
    for (const s of sites) {
      const forms = await api(`/sites/${s.id}/forms`, token);
      const f = forms.find(x => x.name === FORM_NAME);
      if (f) carriers.push({ site: s, form: f });
    }
    if (carriers.length === 0) die(`no site under this token has a form named "${FORM_NAME}" (sites seen: ${sites.map(s => s.name).join(', ') || 'none'})`);
    if (carriers.length > 1) die(`several sites carry "${FORM_NAME}": ${carriers.map(c => c.site.name).join(', ')} — pass --site <name>`);
    const [{ site: s, form }] = carriers;
    return { site: s, form, submissions: await allSubmissions(form.id, token) };
  }
  const forms = await api(`/sites/${site.id}/forms`, token);
  const form = forms.find(x => x.name === FORM_NAME);
  if (!form) die(`site ${site.name} has no form named "${FORM_NAME}" — Netlify Forms is enabled per site; deploy once after enabling it`);
  return { site, form, submissions: await allSubmissions(form.id, token) };
}

async function allSubmissions(formId, token) {
  const out = [];
  for (let page = 1; page < 50; page++) {
    const batch = await api(`/forms/${formId}/submissions?per_page=100&page=${page}`, token);
    out.push(...batch);
    if (batch.length < 100) break;
  }
  return out;
}

// ---------------------------------------------------------------- normalise
/** Netlify submission → the fields the moderation needs. Contact stays here (terminal) only. */
function normalise(s, items) {
  const d = s.data ?? {};
  const item_id = clean(d.item_id);
  const known = items.get(item_id);
  const anonymous = on(d.anonymous);
  const name = clean(d.name);
  const credentials = clean(d.credentials);
  return {
    id: s.id,
    created: s.created_at ?? '',
    item_id,
    collection: known?.collection ?? clean(d.collection),
    item: known?.item ?? null,
    letter: clean(d.letter).toUpperCase(),
    reading: clean(d.reading),
    note: clean(d.note).slice(0, 1000),
    name, credentials,
    contact: on(d.no_contact) ? '' : clean(d.contact),
    no_contact: on(d.no_contact),
    publish_choice: clean(d.publish_choice) === 'author_only' ? 'author_only' : 'publish',
    anonymous,
    credentials_public: on(d.credentials_public),
    ack_consent: on(d.ack_consent),
    page: clean(d.page),
    display: anonymous || !name ? 'anonymous reader' : name,
    credentials_summary: !anonymous && on(d.credentials_public) && credentials ? credentials : undefined,
  };
}

function problems(x) {
  const p = [];
  if (!x.item) p.push(`unknown item_id "${x.item_id}"`);
  if (!['A', 'B', 'C', 'D'].includes(x.letter)) p.push(`letter "${x.letter}" is not A–D`);
  if (x.letter === 'C' && !x.reading) p.push('letter C without a reading');
  return p;
}

function show(x, i, n) {
  const q = x.item?.question ?? '(item not in the content files)';
  console.log(`\n[${i}/${n}] submission ${x.id}   ${x.created}`);
  console.log(`  item      ${x.collection}/${x.item_id}${x.item ? `   ${x.item.shelfmark} ${x.item.leaf ?? ''} l.${x.item.line ?? '?'}` : ''}`);
  console.log(`  question  ${q}`);
  console.log(`  letter    ${x.letter}${x.letter === 'C' ? `   reading: ${x.reading}` : ''}`);
  if (x.note) console.log(`  note      ${x.note.replace(/\s+/g, ' ')}`);
  console.log(`  reader    ${x.display}${x.anonymous ? ' (asked for anonymity)' : ''}`);
  if (x.credentials) console.log(`  creds     ${x.credentials}${x.credentials_public ? '  (may be shown)' : '  (NOT for publication)'}`);
  console.log(`  contact   ${x.contact || (x.no_contact ? '— asked not to be contacted' : '— none given')}   [terminal only, never published]`);
  console.log(`  wishes    ${x.publish_choice === 'author_only' ? 'AUTHOR ONLY — must not be published' : 'may be published'} · acknowledgement ${x.ack_consent ? 'yes' : 'no'}`);
  const p = problems(x);
  if (p.length) console.log(`  !! ${p.join('; ')}`);
}

// ---------------------------------------------------------------- publish
function appendAnswer(x) {
  const file = join(CONTENT, `${x.collection}.answers.json`);
  const before = existsSync(file) ? readFileSync(file, 'utf8') : null;
  const data = before ? JSON.parse(before) : { answers: [] };
  const answers = Array.isArray(data) ? data : data.answers;
  const entry = {
    item_id: x.item_id,
    letter: x.letter,
    ...(x.letter === 'C' ? { reading: x.reading } : {}),
    ...(x.note ? { note: x.note } : {}),
    reader: { display: x.display, ...(x.credentials_summary ? { credentials_summary: x.credentials_summary } : {}) },
    published: today(),
    ack: x.ack_consent,
  };
  answers.push(entry);
  writeJson(file, Array.isArray(data) ? answers : data);
  const v = spawnSync(process.execPath, [join(ROOT, 'scripts', 'validate-readings.mjs')], { stdio: 'pipe', encoding: 'utf8' });
  if (v.status !== 0) {
    if (before === null) rmSync(file, { force: true }); else writeFileSync(file, before);
    console.error(v.stdout + v.stderr);
    die(`validation refused the answer for ${x.item_id}; the answers file was restored`);
  }
  return { file, entry };
}

// ---------------------------------------------------------------- git
function git(...args) {
  const r = spawnSync('git', ['-C', ROOT, ...args], { encoding: 'utf8' });
  if (r.status !== 0) die(`git ${args.join(' ')} failed:\n${r.stderr || r.stdout}`);
  return r.stdout.trim();
}

function commitAndPush(files, summary) {
  const branch = git('rev-parse', '--abbrev-ref', 'HEAD');
  if (branch !== DEVICE_BRANCH) die(`on ${branch}; the answers commit belongs on ${DEVICE_BRANCH} (agents never push main)`);
  for (const f of files) git('add', '--', f);
  const staged = git('diff', '--cached', '--name-only');
  if (!staged) { console.log('nothing staged — no commit'); return null; }
  git('commit', '-m', `Open Readings: publish ${summary}`, '--', ...files);
  const sha = git('rev-parse', '--short', 'HEAD');
  const push = spawnSync('git', ['-C', ROOT, 'push', 'origin', DEVICE_BRANCH], { encoding: 'utf8' });
  if (push.status !== 0) {
    console.error(push.stderr);
    console.error(`push rejected — run: git merge --no-edit origin/${DEVICE_BRANCH} && git push origin ${DEVICE_BRANCH}`);
  } else console.log(`pushed ${DEVICE_BRANCH} (${sha})`);
  if (existsSync(INTEGRATE_NOTE)) {
    const para = `Open Readings answers published: ${summary}. The moderation tool (scripts/readings-moderate.mjs) read the reader's submission from Netlify Forms, the owner decided publish, and the published fields only (letter, reading, note, credited name, date) were appended to the collection's answers file; the readings validator ran and refused nothing. Contact details stay in the Netlify dashboard and never entered the repository. Integrating this makes the answer visible on the item page and, where the reader agreed, on the acknowledgements page.`;
    const r = spawnSync('python3', [INTEGRATE_NOTE, '--repo', ROOT, para], { encoding: 'utf8' });
    console.log((r.stdout + r.stderr).trim());
  }
  return sha;
}

// ---------------------------------------------------------------- main
async function main() {
  const items = loadItems();
  const ledger = loadLedger();

  let raw;
  if (FIXTURE) raw = readJson(FIXTURE);
  else {
    const token = loadToken();
    if (!token) die('no NETLIFY_AUTH_TOKEN — export it, or write NETLIFY_AUTH_TOKEN=… to ~/.config/loe_website/netlify.env (Netlify → User settings → Applications → New access token). Nothing to read without it.');
    const { site, form, submissions } = await fetchSubmissions(token);
    console.log(`site ${site.name} · form ${form.name} · ${submissions.length} submission(s) in the dashboard`);
    raw = submissions;
  }

  const all = raw.map(s => normalise(s, items)).sort((a, b) => a.created.localeCompare(b.created));
  const fresh = all.filter(x => !ledger.decisions[x.id]);
  const decided = all.length - fresh.length;
  console.log(`${fresh.length} new · ${decided} already decided (ledger ${LEDGER.replace(ROOT + '/', '')})`);

  const made = []; // {x, decision}
  const touched = new Set();

  const record = (x, decision) => {
    if (decision === 'published') {
      if (x.publish_choice === 'author_only') { console.log(`  refused: the reader asked for author-only. Use author-only instead.`); return false; }
      const p = problems(x);
      if (p.length) { console.log(`  refused: ${p.join('; ')}`); return false; }
      const { file } = appendAnswer(x);
      touched.add(file.replace(ROOT + '/', ''));
    }
    ledger.decisions[x.id] = { decision, date: today(), item_id: x.item_id, collection: x.collection };
    saveLedger(ledger);
    made.push({ x, decision });
    console.log(`  → ${decision}`);
    return true;
  };

  if (DECIDE.length) {
    for (const { id, decision } of DECIDE) {
      const x = all.find(s => s.id === id || s.id.startsWith(id));
      if (!x) die(`no submission with id ${id}`);
      if (ledger.decisions[x.id]) { console.log(`${x.id}: already ${ledger.decisions[x.id].decision} on ${ledger.decisions[x.id].date} — unchanged`); continue; }
      show(x, 1, 1);
      record(x, decision);
    }
  } else if (LIST || !process.stdin.isTTY) {
    fresh.forEach((x, i) => show(x, i + 1, fresh.length));
    if (!LIST && fresh.length) console.log('\n(not a terminal — decide with --publish/--author-only/--reject <id>)');
  } else {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const ask = q => new Promise(res => rl.question(q, a => res(a.trim().toLowerCase())));
    for (const [i, x] of fresh.entries()) {
      show(x, i + 1, fresh.length);
      const choices = x.publish_choice === 'author_only' ? '[a]uthor-only · [r]eject · [s]kip' : '[p]ublish · [a]uthor-only · [r]eject · [s]kip';
      for (;;) {
        const a = await ask(`  ${choices}: `);
        if (a === 's' || a === '') { console.log('  skipped'); break; }
        if (a === 'p' && record(x, 'published')) break;
        if (a === 'a' && record(x, 'author_only')) break;
        if (a === 'r' && record(x, 'rejected')) break;
        if (a === 'q') { rl.close(); return finish(made, touched); }
      }
    }
    rl.close();
  }
  return finish(made, touched);
}

function finish(made, touched) {
  if (made.length) {
    console.log('\nTRANSCRIBER SUMMARY (contact-free — for the collation file):');
    for (const { x, decision } of made) {
      console.log(`  ${x.collection}/${x.item_id} · ${x.letter}${x.letter === 'C' ? ` "${x.reading}"` : ''} · ${decision}` +
        `${decision === 'published' ? ` · by ${x.display}${x.credentials_summary ? ` (${x.credentials_summary})` : ''}` : ''}` +
        `${x.note ? ` · note: ${x.note.replace(/\s+/g, ' ').slice(0, 200)}` : ''} · ${x.created.slice(0, 10)}`);
    }
  }
  const published = made.filter(m => m.decision === 'published');
  if (touched.size) {
    const summary = `${published.length} answer(s) on ${[...new Set(published.map(m => m.x.item_id))].join(', ')}`;
    if (COMMIT) commitAndPush([...touched], summary);
    else console.log(`\nanswers written to ${[...touched].join(', ')} — re-run with --commit (or commit them yourself) and integrate via the Studio card.`);
  } else if (COMMIT) console.log('\nnothing published this run — no commit.');
}

main().catch(e => die(e.stack || String(e)));
