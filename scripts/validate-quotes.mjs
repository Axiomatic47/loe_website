// scripts/validate-quotes.mjs — build gate for src/data/hero-quotes.json.
//
// The homepage hero rotates these. Rules (owner direction 2026-09-05):
//   - words of OTHERS only — the site author is never quoted here;
//   - verbatim from a public, filed, or public-domain source;
//   - every entry names where in the published work it appears (cited_in);
//   - ids unique; text short enough to read in one glance.
// Fails the build (exit 1) on any violation so a bad submission never ships.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FILE = join(ROOT, 'src', 'data', 'hero-quotes.json');
const REQUIRED = ['id', 'text', 'attribution', 'source', 'cited_in', 'submitted_by', 'added'];
const SELF = /kirchner/i; // the author's own words never rotate here
const MAX_TEXT = 260;
const MIN_TEXT = 20;

const errors = [];
let data;
try {
  data = JSON.parse(readFileSync(FILE, 'utf8'));
} catch (e) {
  console.error(`quotes validation FAILED — cannot read/parse ${FILE}: ${e.message}`);
  process.exit(1);
}
const quotes = Array.isArray(data?.quotes) ? data.quotes : null;
if (!quotes) errors.push('top-level "quotes" must be an array');

const ids = new Set();
for (const [i, q] of (quotes || []).entries()) {
  const where = `quotes[${i}]${q?.id ? ` (${q.id})` : ''}`;
  for (const k of REQUIRED) {
    if (typeof q?.[k] !== 'string' || !q[k].trim()) errors.push(`${where}: "${k}" is required (non-empty string)`);
  }
  if (!q) continue;
  if (q.id && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(q.id)) errors.push(`${where}: id must be lowercase-hyphen slug`);
  if (q.id && ids.has(q.id)) errors.push(`${where}: duplicate id`);
  ids.add(q.id);
  if (typeof q.text === 'string') {
    if (q.text.length < MIN_TEXT) errors.push(`${where}: text shorter than ${MIN_TEXT} chars`);
    if (q.text.length > MAX_TEXT) errors.push(`${where}: text longer than ${MAX_TEXT} chars (${q.text.length})`);
    if (/^[“"']|[”"']$/.test(q.text.trim())) errors.push(`${where}: text must not carry its own quotation marks (the renderer adds them)`);
  }
  if (typeof q.attribution === 'string' && SELF.test(q.attribution)) errors.push(`${where}: attribution names the author — others only`);
  if (q.href !== undefined && (typeof q.href !== 'string' || !q.href.startsWith('/'))) errors.push(`${where}: href must be a site-relative path starting with "/"`);
  if (typeof q.added === 'string' && !/^\d{4}-\d{2}-\d{2}$/.test(q.added)) errors.push(`${where}: added must be YYYY-MM-DD`);
  for (const k of Object.keys(q)) {
    if (![...REQUIRED, 'href'].includes(k)) errors.push(`${where}: unknown field "${k}"`);
  }
}

if (errors.length) {
  console.error('quotes validation FAILED:');
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}
console.log(`quotes validation PASSED — ${quotes.length} hero quote(s).`);
