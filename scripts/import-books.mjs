#!/usr/bin/env node
// scripts/import-books.mjs — the REVIEW MODE feed for a book published from the
// owner's research library (owner 2026-09-15: "port review mode to
// lawsofexistence.com and publish both books there, complete as on
// kirchner.ink"). A port of ink_site's import-local-works + import-review-links
// (same lane, same contracts, same on-disk layout so the drafters'
// check_links.py joins either site unchanged).
//
//   node scripts/import-books.mjs <slug>     # one book — REQUIRED (the two lanes move independently)
//
// It reads the drafter's join — the lane's `_INDEX.tsv`, `_SOURCES.tsv`,
// `_BOOK.json`, `_FIXITY_SHA256.txt`, `_CONTEXT/_FIXITY_SHA256.txt`,
// `_WEB/overlay.json` — PLAIN TSV split on tabs only, columns BY HEADER NAME,
// and writes
//
//   1. content/books/<slug>.md — the book with its working header stripped, its
//      leading H1 removed, the `[^^id]` endnotes made standard `[^id]`
//      footnotes, and every citation UNIT in a note wrapped as a markdown link
//      `[unit text](cite:<note>/<seq>)` (BookText turns a `cite:` href into the
//      review pane's data-cite anchor);
//   2. public/uploads/research/<id>/sources/<KEY>/<file> — the PUBLIC-DOMAIN
//      extracts (one PDF per cited page), sha-checked against the lane's
//      fixity; rights are judged PER ROW (per page), never per unit;
//      public/uploads/research/<id>/context/<KEY>/<file> — the reading copies
//      (multi-page, public-domain only), LINEARIZED with qpdf so pdf.js paints
//      the first page from the first byte range; `_SERVED.json` beside the
//      files maps lane sha → served sha;
//      public/uploads/research/<id>/book.pdf (+ book_linked.pdf) — the render
//      the overlay's boxes are bound to, linearized the same way;
//   3. content/review/<slug>.json (+ public/review/<slug>.<hash12>.json, the copy the
//      browser fetches) — the manifest: units in book order with
//      their pages, boxes, sources, rights and verified flags; a unit the lane
//      could not cut, or could cut but must not publish, is carried with its
//      status so the page shows the citation MARKED, never silently dropped.
//
// REFUSALS come before any write: a book whose sha256 differs from the lane's
// `_BOOK.json`, an overlay built from another book or bound to a render that is
// missing or differs, an extract or context file named by the index but absent
// on disk, a deploy-fatal file name (# or ?). Two independent rights gates
// assert the on-disk set == the public-domain rows of the index (extra 0,
// missing 0) or abort. The book file and the lane are never written. Idempotent.
// Not part of the build (the lane is not on the build host): run it on the
// drafter's "lane at <sha>" signal, review `git diff`, commit.
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, statSync, readdirSync, unlinkSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, resolve, dirname, basename } from 'node:path';
import { homedir } from 'node:os';
import { execFileSync } from 'node:child_process';

const ROOT = resolve(new URL('..', import.meta.url).pathname);

// the leaf-url gate's caches: archive manifests and served-PDF page counts (pdfinfo, homebrew poppler)
const archiveManifests = new Map();
const pdfPageCounts = new Map();
function checkLeafUrl(url, key) {
  const m = url.match(/^\/research\/([^/]+)\/leaf\/([^/#?]+)(?:#(.*))?$/);
  if (!m) return; // an https catalogue record, or another path of this site — not a leaf link
  const [, archiveId, leafId, frag] = m;
  if (!archiveManifests.has(archiveId)) {
    const f = join(ROOT, 'public', 'uploads', 'research', archiveId, 'manifest.json');
    archiveManifests.set(archiveId, existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : null);
  }
  const am = archiveManifests.get(archiveId);
  if (!am) throw new Error(`${key}: url ${url} names archive '${archiveId}', which this site does not serve — nothing written`);
  const leaf = am.leaves.find((l) => l.id === leafId);
  if (!leaf) throw new Error(`${key}: url ${url} names leaf '${leafId}', which ${archiveId}'s manifest does not list — nothing written`);
  if (!frag) return;
  const pm = frag.match(/(?:^|&)page=(\d+)(?:&|$)/);
  if (!pm) throw new Error(`${key}: url ${url} carries a fragment that is not page=N — nothing written`);
  const page = Number(pm[1]);
  const doc = leaf.docs.find((d) => d.kind === 'edition');
  if (!doc) throw new Error(`${key}: url ${url} asks for page ${page} but leaf ${leafId} serves no edition document — nothing written`);
  const pdfPath = join(ROOT, 'public', 'uploads', 'research', archiveId, doc.pdf);
  if (!pdfPageCounts.has(pdfPath)) {
    const out = execFileSync('pdfinfo', [pdfPath], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    pdfPageCounts.set(pdfPath, Number((out.match(/^Pages:\s+(\d+)/m) || [])[1]) || 0);
  }
  const pages = pdfPageCounts.get(pdfPath);
  if (page < 1 || page > pages) throw new Error(`${key}: url ${url} asks for page ${page} but ${basename(doc.pdf)} has ${pages} pages — nothing written`);
}
const LIB = join(homedir(), 'Git', 'work_station', 'research_library', '2_Academic Articles');

/** one entry per reviewed book; `slug` and `id` are the site's (src/data/books.ts) — the same as kirchner.ink's */
const REVIEWS = [
  {
    slug: 'the-subjects-unanswered-plea',
    id: 'immunity-book',
    book: join(LIB, '11_Immunity and Standing Doctrine Geneology', 'BOOK', 'A_RESTORATIVE_AND_COMPARATIVE_HISTORY_OF_SOVEREIGN_ABSOLUTE_AND_QUALIFIED_IMMUNITY.md'),
    lane: join(LIB, '11_Immunity and Standing Doctrine Geneology', 'BOOK', 'Pinned Citation Extracts'),
  },
  {
    slug: 'the-holy-seed',
    id: 'holy-seed',
    book: join(LIB, '13_Fall of Babylon and Jewish Identity', 'BOOK', 'THE_HOLY_SEED.md'),
    lane: join(LIB, '13_Fall of Babylon and Jewish Identity', 'BOOK', 'Pinned Citation Extracts'),
  },
  {
    // the third book (owner 2026-09-15, via drafter 60f85bca); slug = the drafter's lane.conf placeholder, confirmed
    slug: 'a-restorative-reading-of-genesis-1-3',
    id: 'genesis-1-3',
    book: join(LIB, '14_Restorative Reading of Genesis 1-3', 'BOOK', 'A_Restorative_Reading_of_Genesis_1-3.md'),
    lane: join(LIB, '14_Restorative Reading of Genesis 1-3', 'BOOK', 'Pinned Citation Extracts'),
  },
  {
    // the fourth title (owner 2026-09-16, via drafter 60f85bca): an ARTICLE, its lane beside it (no BOOK/ folder);
    // slug = kirchner.ink's existing address for the article (/work/madisonian-test), one slug across both sites
    slug: 'madisonian-test',
    id: 'madisonian-test',
    book: join(LIB, '2_Madisonian Separation of Powers Test Article', 'DRAFT_Madisonian_Separation_of_Powers_Test.md'),
    lane: join(LIB, '2_Madisonian Separation of Powers Test Article', 'Pinned Citation Extracts'),
  },
];

const PUBLISHABLE = new Set(['public-domain']);
/** the register's per-WORK fields the card shows (lane contract 2026-09-16, drafter 8a96daa3's _REGISTER.tsv);
    never shelf_path / sha256 / notes — those are the library's own */
const WORK_FIELDS = ['full_citation', 'short_form', 'type', 'author', 'title', 'container', 'publisher', 'place', 'year', 'edition', 'isbn', 'issn', 'doi',
  'full_work_url', 'full_work_url_kind', 'volume_url', 'holder', 'holder_url', 'preferred_citation', 'preferred_citation_source', 'rights', 'rights_statement', 'rights_source_url', 'licence'];
const CUT = new Set(['CUT', 'CUT_FIRST', 'CUT_CASE']);
const sha256 = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');
// PLAIN TSV (the data seat's contract): split on tabs only — no quoting, no
// field carries a tab or newline; five units open with a quote mark and a
// csv-style reader would swallow them
const tsv = (file) => {
  const [head, ...rows] = readFileSync(file, 'utf8').split('\n').filter((l) => l.length);
  const cols = head.split('\t');
  return rows.map((r) => {
    const cells = r.split('\t');
    return Object.fromEntries(cols.map((c, i) => [c, cells[i] ?? '']));
  });
};
const readFixity = (file, into) => {
  if (!existsSync(file)) return;
  for (const l of readFileSync(file, 'utf8').split('\n')) {
    const m = /^([0-9a-f]{64})\s+\*?(.+)$/.exec(l.trim());
    if (m) into[m[2]] = m[1];
  }
};
// Netlify rejects a deploy whose file names carry # or ? (validate-content's gate, 2026-08-23)
const deployable = (rel) => !/[#?]/.test(rel);

/** printed-page label from the pin kind and the extract's suffix letter */
const pinLabel = (kind, pin, file, status, sourceKey) => {
  // an item-level catalogue record (status EXTERNAL, pinkind item): the pin IS the holder's preferred citation, printed as written
  if (kind === 'item' || status === 'EXTERNAL') return pin || '';
  const suf = file ? /_([a-z])[^_/]*\.pdf$/.exec(file)?.[1] : null;
  if (sourceKey === 'POLLARD_1911') return `1611 facsimile p. ${pin}`; // the reprint's PDF page: the 1611 is unpaginated
  // owner rule 2026-09-15: a case cited by its first page means the WHOLE case — the lane cuts every page of
  // the case (CUT_CASE rows follow the CUT_FIRST row); the first page is labelled as the case's beginning
  if (status === 'CUT_FIRST') return pin ? `case begins, p. ${pin}` : 'case begins';
  if (kind === 'col') return `col. ${pin}`;
  if (kind === 'folio' || suf === 'f') return `f. ${pin}`;
  if (kind === 'memb' || suf === 'm') return `m. ${pin.replace(/^0+/, '')}`;
  if (kind === 'sig' || suf === 's') return `sig. ${pin}`;
  return pin ? `p. ${pin}` : '';
};

const escapeLinkText = (t) => t.replace(/([[\]])/g, '\\$1');

function stripHeader(md) {
  // the working header is one HTML comment before the title; the academic converter drops it the same way
  let s = md.replace(/^\uFEFF/, '');
  if (s.startsWith('<!--')) {
    // the comment closes on a line of its own; an inline '-->' in the header text is not the close
    const m = /^-->[ \t]*$/m.exec(s);
    if (m) s = s.slice(m.index + m[0].length);
  }
  s = s.replace(/^\s+/, '');
  const lines = s.split('\n');
  if (/^#\s/.test(lines[0] ?? '')) lines.shift();
  return lines.join('\n').replace(/^\s+/, '');
}

// The served copy of a MULTI-PAGE file is linearized (qpdf) so pdf.js can paint the first page from
// the first byte range instead of downloading the whole file; content and page count are unchanged,
// bytes and sha differ from the lane's. `_SERVED.json` maps served path → {source: lane sha, served
// sha} so a re-run copies only what moved. Single-page extracts (the audit copies) stay byte-identical.
function linearizeInto(src, dst, laneSha, served) {
  const key = dst.split('/uploads/')[1];
  const rec = served[key];
  if (rec && rec.source === laneSha && existsSync(dst) && sha256(dst) === rec.served) return rec.served;
  mkdirSync(dirname(dst), { recursive: true });
  try {
    execFileSync('qpdf', ['--linearize', '--object-streams=generate', src, dst], { stdio: ['ignore', 'ignore', 'pipe'] });
  } catch (e) {
    // qpdf exits 3 on warnings with the output written; anything else is a real failure
    if (!(e.status === 3 && existsSync(dst))) throw new Error(`qpdf failed on ${basename(src)}: ${e.stderr?.toString().slice(0, 200) || e.message}`);
  }
  const got = sha256(dst);
  served[key] = { source: laneSha, served: got };
  return got;
}

const listPdfs = (d, rel = '', out = []) => {
  if (!existsSync(d)) return out;
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const f = join(d, e.name), r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) listPdfs(f, r, out); else if (r.endsWith('.pdf')) out.push(r);
  }
  return out;
};

function importOne(cfg) {
  const t0 = Date.now();
  if (!existsSync(cfg.book)) throw new Error(`book missing: ${cfg.book}`);
  if (!existsSync(cfg.lane)) throw new Error(`lane missing: ${cfg.lane}`);
  const raw = readFileSync(cfg.book, 'utf8');
  const bookSha = createHash('sha256').update(raw).digest('hex');

  // ---- the lane ---------------------------------------------------------------
  const rows = tsv(join(cfg.lane, '_INDEX.tsv'));
  const sources = Object.fromEntries(tsv(join(cfg.lane, '_SOURCES.tsv')).map((s) => [s.key, s]));
  // the works register (lane contract 2026-09-16): one row per cited WORK; only `is_work` Y rows are ever pointed at.
  // Split on tabs only — one field opens with a straight quote, which a CSV reader would swallow.
  const registerFile = join(cfg.lane, '_REGISTER.tsv');
  const register = new Map();
  if (existsSync(registerFile)) {
    const [hdr, ...body] = readFileSync(registerFile, 'utf8').replace(/^\uFEFF/, '').split('\n').filter((l) => l.length).map((l) => l.split('\t'));
    for (const cells of body) { const row = Object.fromEntries(hdr.map((h, i) => [h, cells[i] ?? ''])); if (row.is_work === 'Y' && row.id) register.set(row.id, row); }
  }
  const bookJson = join(cfg.lane, '_BOOK.json');
  if (!existsSync(bookJson)) throw new Error('the lane has no _BOOK.json — nothing written');
  const bookMeta = JSON.parse(readFileSync(bookJson, 'utf8'));
  if (!bookMeta.sha256) throw new Error('_BOOK.json names no sha256 — nothing written');
  if (bookMeta.sha256 !== bookSha) throw new Error(`the lane was built from another book: _BOOK.json ${bookMeta.sha256.slice(0, 12)} ≠ book on disk ${bookSha.slice(0, 12)} — wait for the drafter's "lane at" signal; nothing written`);
  const fixity = {};
  readFixity(join(cfg.lane, '_FIXITY_SHA256.txt'), fixity);
  readFixity(join(cfg.lane, '_CONTEXT', '_FIXITY_SHA256.txt'), fixity);
  for (const r of rows) { r.sha256 = fixity[r.extract] ?? ''; r.context_sha = r.context ? (fixity[r.context] ?? '') : ''; }
  const feed = `_INDEX.tsv + _SOURCES.tsv (_BOOK.json ${bookSha.slice(0, 8)})`;

  // every refusal happens HERE, before a byte is written: a lane caught mid-regeneration (index at one
  // book, overlay at another; a render missing or renamed) must leave the site's tree exactly as it was
  const overlayFile = join(cfg.lane, '_WEB', 'overlay.json');
  const overlay = existsSync(overlayFile) ? JSON.parse(readFileSync(overlayFile, 'utf8')) : null;
  if (overlay) {
    if (overlay.book?.sha256 && overlay.book.sha256 !== bookSha) throw new Error(`overlay.json was built from another book: ${overlay.book.sha256.slice(0, 12)} ≠ ${bookSha.slice(0, 12)} — the lane is mid-regeneration; nothing written`);
    const rsrc = join(cfg.lane, '_WEB', basename(overlay.pdf.path));
    if (!existsSync(rsrc)) throw new Error(`overlay.json names a render that is not in the lane: ${basename(overlay.pdf.path)}; nothing written`);
    if (sha256(rsrc) !== overlay.pdf.sha256) throw new Error('the book render on disk is not the one overlay.json was built on; nothing written');
  }
  // THE VERSION LOG (owner 2026-09-24; the procedure in the website-developer and drafter orientations): the
  // lane's _VERSIONS.json is the DRAFTER'S — every field theirs — and is published VERBATIM to
  // content/versions/<slug>.json. The gate is two equalities the lane already keeps (drafter 0b43895f's
  // amendments A–C): the newest entry's `text` == _BOOK.json's sha256 (the COMMITTED book, never the
  // worktree) and its `pdf` == overlay.json's pdf.sha256 (the OWNER'S render, not the served linked copy
  // whose hash moves with every row-only state). A text or render change with no new entry, an entry
  // whose shas are not those, or an incomplete entry is a REFUSED SIGNAL back to the drafter — never a
  // note typed here. A lane that has never carried a log publishes none (the drop-down stays hidden).
  const versionsFile = join(cfg.lane, '_VERSIONS.json');
  const versionsRaw = existsSync(versionsFile) ? readFileSync(versionsFile, 'utf8') : null;
  let versionNewest = null;
  if (versionsRaw) {
    const vlog = JSON.parse(versionsRaw);
    if (vlog.slug && vlog.slug !== cfg.slug) throw new Error(`REFUSED SIGNAL (version gate): _VERSIONS.json is for '${vlog.slug}', this lane is '${cfg.slug}'; nothing written`);
    const list = Array.isArray(vlog.versions) ? vlog.versions : [];
    if (!list.length) throw new Error('REFUSED SIGNAL (version gate): _VERSIONS.json carries no versions; nothing written');
    versionNewest = [...list].sort((a, b) => Number(b.version) - Number(a.version))[0];
    for (const k of ['version', 'date', 'text', 'pdf', 'note']) if (versionNewest[k] === undefined || versionNewest[k] === null || versionNewest[k] === '') throw new Error(`REFUSED SIGNAL (version gate): version ${versionNewest.version ?? '?'} lacks '${k}'; nothing written`);
    // shape (f28bb754's checks on ink, carried so both sites apply one rule): every entry a unique positive
    // integer version, an ISO date, full-hex shas
    const seen = new Set();
    for (const e of list) {
      if (!Number.isInteger(e.version) || e.version < 1 || seen.has(e.version)) throw new Error(`REFUSED SIGNAL (version gate): version '${e.version}' is not a unique positive integer; nothing written`);
      seen.add(e.version);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(e.date))) throw new Error(`REFUSED SIGNAL (version gate): version ${e.version}'s date '${e.date}' is not YYYY-MM-DD; nothing written`);
      for (const k of ['text', 'pdf']) if (!/^[0-9a-f]{64}$/.test(String(e[k]))) throw new Error(`REFUSED SIGNAL (version gate): version ${e.version}'s ${k} is not a full sha256 hex; nothing written`);
    }
    if (versionNewest.text !== bookMeta.sha256) throw new Error(`REFUSED SIGNAL (version gate): the text changed without a new version entry — _BOOK.json ${bookMeta.sha256.slice(0, 12)} ≠ version ${versionNewest.version}'s text ${String(versionNewest.text).slice(0, 12)}; nothing written`);
    if (overlay?.pdf?.sha256 && versionNewest.pdf !== overlay.pdf.sha256) throw new Error(`REFUSED SIGNAL (version gate): the render changed without a new version entry — overlay.json pdf ${overlay.pdf.sha256.slice(0, 12)} ≠ version ${versionNewest.version}'s pdf ${String(versionNewest.pdf).slice(0, 12)}; nothing written`);
  } else if (existsSync(join(ROOT, 'content', 'versions', `${cfg.slug}.json`))) {
    throw new Error('REFUSED SIGNAL (version gate): the site publishes a version log for this book but the lane carries no _VERSIONS.json; nothing written');
  }
  for (const r of rows) {
    if (!PUBLISHABLE.has(r.rights)) continue;
    if (r.extract && CUT.has(r.status)) {
      if (!existsSync(join(cfg.lane, r.extract))) throw new Error(`${r.extract} is named by the index but missing on disk — the lane is mid-write; nothing written`);
      if (!deployable(r.extract)) throw new Error(`${r.extract}: a deployed file name cannot contain # or ?; nothing written`);
    }
    if (r.context) {
      if (!existsSync(join(cfg.lane, r.context))) throw new Error(`${r.context} is named by the index but missing on disk — the lane is mid-write; nothing written`);
      if (!deployable(r.context)) throw new Error(`${r.context}: a deployed file name cannot contain # or ?; nothing written`);
    }
  }

  // ---- 1. the book: header off, endnotes → footnotes, units wrapped -------
  let md = stripHeader(raw).replace(/\[\^\^([A-Za-z0-9_]+)\]/g, '[^$1]');
  const lines = md.split('\n');
  const defLine = new Map(); // note id → line index
  lines.forEach((l, i) => { const m = /^\[\^([A-Za-z0-9_]+)\]:/.exec(l); if (m) defLine.set(m[1], i); });

  // units: one per (note, seq); a unit cited across a range has several pages
  const units = new Map();
  for (const r of rows) {
    if (r.status === 'SKIP' || !r.text) continue;
    const key = `${r.note}/${r.seq}`;
    let u = units.get(key);
    if (!u) {
      u = { id: key, note: r.note, seq: Number(r.seq), line: Number(r.line) || 0, text: r.text, cls: r.cls, status: r.status, rights: r.rights || sources[r.source_key]?.rights || '', source: r.source_key || null, pages: [],
        start: r.unit_start === '' || r.unit_start == null ? null : Number(r.unit_start), end: r.unit_end === '' || r.unit_end == null ? null : Number(r.unit_end) };
      units.set(key, u);
    }
    // the cited WORK(S) (register contract, refined 2026-09-16): the unit carries `works` = the distinct ids of ALL its
    // live rows in row order (a NO_PIN row yields no page chip to carry a second work, so the unit must); `work` = the first
    if (r.work) {
      if (!register.has(r.work)) throw new Error(`${key}: work '${r.work}' is not an is_work row of _REGISTER.tsv — the lane is mid-write; nothing written`);
      if (!u.work) u.work = r.work;
      (u.works ??= []); if (!u.works.includes(r.work)) u.works.push(r.work);
    }
    if (r.extract && CUT.has(r.status)) {
      const kind = sources[r.source_key]?.pinkind || 'page';
      // verified: Y = the page number was read on the page · N = placed by the run's offset · '-' = a verso with nothing to read.
      // rights and source are PER PAGE: a unit matched by several sources carries rows from each, and
      // only the page's own rights decide whether it is published
      u.pages.push({ pin: r.pin, label: pinLabel(kind, r.pin, r.extract, r.status, r.source_key), extract: r.extract, source: r.source_key, rights: r.rights || sources[r.source_key]?.rights || '',
        verified: r.verified === 'Y' ? true : r.verified === '-' ? null : false, sha256: r.sha256 || null, ...(r.status === 'CUT_FIRST' ? { begins: true } : {}),
        ...(r.context ? { ctx: { extract: r.context, page: Number(r.context_page) || 1, sha256: r.context_sha || null } } : {}),
        // the index's `url` (lane contract 2026-09-15): the site's own leaf page for a held membrane / folio —
        // the chip links there (the image with its transcript tab) instead of dead-ending on "held"
        ...(r.url ? { url: r.url } : {}), ...(r.work ? { work: r.work } : {}) });
    } else if (r.status === 'EXTERNAL' && r.url) {
      // a catalogue record the book cites (lane contract 2026-09-15): nothing is held in the lane — no extract,
      // rights `external-link` — the chip carries the holder's own record as its link and the pin as its label
      u.pages.push({ pin: r.pin, label: pinLabel('item', r.pin, '', r.status, r.source_key), extract: '', source: r.source_key, rights: r.rights || sources[r.source_key]?.rights || 'external-link',
        verified: null, sha256: null, url: r.url, ...(r.work ? { work: r.work } : {}) });
    }
  }

  // LEAF-URL GATE (f28bb754's rule, carried 2026-09-21): a chip url of this site's leaf-page form must name a leaf the
  // archive's manifest lists, and its #page=N must be a page the leaf's served edition PDF has — a fragment on a leaf
  // with no edition, or past the PDF's last page, would open nothing; refuse naming the row, nothing written
  for (const u of units.values()) for (const p of u.pages) if (p.url) checkLeafUrl(p.url, `${u.note}/${u.seq}`);

  const counts = { wrapped: 0, unwrappable: 0, noDef: 0, published: 0, held: 0, uncut: 0 };
  const warnings = [];
  // group by note, locate every unit, rebuild the note line
  const byNote = new Map();
  for (const u of units.values()) (byNote.get(u.note) ?? byNote.set(u.note, []).get(u.note)).push(u);
  for (const [note, us] of byNote) {
    const li = defLine.get(note);
    if (li === undefined) { counts.noDef += us.length; warnings.push(`${note}: no definition in the book`); continue; }
    const head = lines[li].match(/^\[\^[A-Za-z0-9_]+\]:\s?/)[0];
    const body = lines[li].slice(head.length);
    const spans = [];
    let cursor = 0;
    for (const u of us.sort((a, b) => a.seq - b.seq)) {
      if (u.pages.length === 0 && !u.source) { counts.uncut += 1; continue; } // nothing to open and nothing to name
      if (/\]\(|<https?:/.test(u.text)) { counts.unwrappable += 1; warnings.push(`${u.id}: unit contains a link`); continue; }
      let at = body.indexOf(u.text, cursor);
      if (at < 0) at = body.indexOf(u.text); // out of order in the note
      if (at < 0 && u.start != null && body.slice(u.start, u.end) === u.text) at = u.start; // the lane's offsets
      if (at < 0) { counts.unwrappable += 1; warnings.push(`${u.id}: text not found in note (${u.text.slice(0, 50)}…)`); continue; }
      spans.push({ at, len: u.text.length, u });
      cursor = at + u.text.length;
    }
    spans.sort((a, b) => a.at - b.at);
    let out = '', pos = 0;
    for (const s of spans) {
      if (s.at < pos) { counts.unwrappable += 1; warnings.push(`${s.u.id}: overlaps the previous unit`); continue; }
      out += body.slice(pos, s.at) + `[${escapeLinkText(s.u.text)}](cite:${s.u.id})`;
      pos = s.at + s.len;
      s.u.wrapped = true;
      counts.wrapped += 1;
    }
    out += body.slice(pos);
    lines[li] = head + out;
  }
  md = lines.join('\n').trimEnd() + '\n';

  const uploads = join(ROOT, 'public', 'uploads', 'research', cfg.id);
  const servedFile = join(uploads, '_SERVED.json');
  const served = existsSync(servedFile) ? JSON.parse(readFileSync(servedFile, 'utf8')) : {};

  // ---- 2. the extracts: public-domain only, sha-checked ------------------
  const outDir = join(uploads, 'sources');
  mkdirSync(outDir, { recursive: true });
  const copied = new Set();
  let bytes = 0, copiedNew = 0, kept = 0;
  const wanted = new Set();
  for (const u of units.values()) {
    for (const p of u.pages) {
      if (!p.extract || !PUBLISHABLE.has(p.rights)) { p.file = null; continue; }
      const src = join(cfg.lane, p.extract);
      const rel = p.extract.split('/').map(encodeURIComponent).join('/');
      const dst = join(outDir, p.extract);
      wanted.add(p.extract);
      if (!copied.has(p.extract)) {
        const srcSha = sha256(src);
        if (p.sha256 && p.sha256 !== srcSha) throw new Error(`${p.extract}: sha256 on disk ${srcSha.slice(0, 12)} ≠ fixity ${p.sha256.slice(0, 12)} — the lane is mid-write`);
        p.sha256 = srcSha;
        if (existsSync(dst) && sha256(dst) === srcSha) kept += 1;
        else { mkdirSync(dirname(dst), { recursive: true }); copyFileSync(src, dst); copiedNew += 1; }
        bytes += statSync(dst).size;
        copied.add(p.extract);
      } else if (!p.sha256) p.sha256 = sha256(src);
      p.file = `/uploads/research/${cfg.id}/sources/${rel}`;
    }
    if (u.pages.some((p) => p.file)) counts.published += 1;
    else if (u.pages.length || u.source) counts.held += 1;
  }
  // the reading copies: one multi-page file per work, shared by its citations; public-domain only, sha-checked, linearized
  const ctxDir = join(uploads, 'context');
  mkdirSync(ctxDir, { recursive: true });
  const ctxCopied = new Set(); let ctxBytes = 0, ctxNew = 0, ctxKept = 0; const ctxWanted = new Set(); const ctxServed = new Map();
  for (const u of units.values()) {
    for (const p of u.pages) {
      if (!p.ctx) continue;
      if (!PUBLISHABLE.has(p.rights)) { p.ctx.file = null; continue; }
      const rel = p.ctx.extract.replace(/^_CONTEXT\//, '');
      const src = join(cfg.lane, p.ctx.extract), dst = join(ctxDir, rel);
      ctxWanted.add(rel);
      if (!ctxCopied.has(rel)) {
        const got = sha256(src);
        if (p.ctx.sha256 && p.ctx.sha256 !== got) throw new Error(`${p.ctx.extract}: sha256 on disk ${got.slice(0, 12)} ≠ fixity ${p.ctx.sha256.slice(0, 12)} — the lane is mid-write`);
        p.ctx.sha256 = got;
        const before = served[dst.split('/uploads/')[1]]?.served;
        const now = linearizeInto(src, dst, got, served);
        if (before === now) ctxKept += 1; else ctxNew += 1;
        ctxServed.set(rel, now);
        ctxBytes += statSync(dst).size; ctxCopied.add(rel);
      } else if (!p.ctx.sha256) p.ctx.sha256 = sha256(src);
      p.ctx.served = ctxServed.get(rel) ?? null;
      p.ctx.bytes = statSync(dst).size; // the served (linearized) size — the viewer fetches small files whole
      p.ctx.file = `/uploads/research/${cfg.id}/context/${rel.split('/').map(encodeURIComponent).join('/')}`;
    }
  }
  // a page the lane no longer cites leaves the site with it
  let ctxRemoved = 0, removed = 0;
  for (const rel of listPdfs(ctxDir)) if (!ctxWanted.has(rel)) { unlinkSync(join(ctxDir, rel)); ctxRemoved += 1; }
  for (const rel of listPdfs(outDir)) if (!wanted.has(rel)) { unlinkSync(join(outDir, rel)); removed += 1; }
  // second, independent gates (the data seat's rule, 2026-09-14): the files on disk must equal the set
  // of `extract` / `context` values over index rows whose rights column reads public-domain — derived
  // from the ROWS, not from the units. A mismatch aborts.
  const ctxExpected = new Set(rows.filter((r) => r.context && PUBLISHABLE.has(r.rights)).map((r) => r.context.replace(/^_CONTEXT\//, '')));
  const ctxOnDisk = listPdfs(ctxDir);
  const ctxExtra = ctxOnDisk.filter((f) => !ctxExpected.has(f)), ctxMissing = [...ctxExpected].filter((f) => !ctxOnDisk.includes(f));
  if (ctxExtra.length || ctxMissing.length) throw new Error(`rights gate (context): ${ctxExtra.length} extra (${ctxExtra.slice(0, 5).join(', ')}), ${ctxMissing.length} missing — manifest not written`);
  const expected = new Set(rows.filter((r) => r.extract && CUT.has(r.status) && PUBLISHABLE.has(r.rights)).map((r) => r.extract));
  const onDisk = listPdfs(outDir);
  const extra = onDisk.filter((f) => !expected.has(f)), missing = [...expected].filter((f) => !onDisk.includes(f));
  if (extra.length || missing.length) throw new Error(`rights gate: ${extra.length} file(s) on the site are not public-domain rows of the index (${extra.slice(0, 5).join(', ')}) and ${missing.length} expected file(s) are missing — manifest not written`);

  // ---- 2b. the book as a PDF with the citation boxes ----
  // _WEB/overlay.json binds a render of the book (sha256) to boxes over each citation unit's lines,
  // PyMuPDF coordinates: PDF points, origin top-left.
  let pdf = null; const boxes = new Map(); let markers = [];
  if (overlay) {
    const o = overlay;
    const src = join(cfg.lane, '_WEB', basename(o.pdf.path));
    const got = o.pdf.sha256; // verified above
    const dst = join(uploads, 'book.pdf');
    const bookServed = linearizeInto(src, dst, got, served);
    let linked = null;
    if (o.pdf.linked?.path) {
      const lsrc = join(cfg.lane, '_WEB', basename(o.pdf.linked.path));
      if (existsSync(lsrc) && sha256(lsrc) === o.pdf.linked.sha256) {
        const ldst = join(uploads, 'book_linked.pdf');
        const linkedServed = linearizeInto(lsrc, ldst, o.pdf.linked.sha256, served);
        linked = { file: `/uploads/research/${cfg.id}/book_linked.pdf`, sha256: o.pdf.linked.sha256, served: linkedServed };
      } else warnings.push('overlay.json names a linked copy that is missing or differs — download stays the plain render');
    }
    // the render's date: the lane names it in the file (…_YYYY-MM-DD…), else the file's mtime — shown on the
    // page beside the text's import date so a render that lags the text is visible, not silent
    const dateInName = /(\d{4}-\d{2}-\d{2})/.exec(basename(o.pdf.path))?.[1];
    const rendered = dateInName || statSync(src).mtime.toISOString().slice(0, 10);
    pdf = { file: `/uploads/research/${cfg.id}/book.pdf`, sha256: got, served: bookServed, bytes: statSync(dst).size, pages: o.pdf.pages, producer: o.pdf.producer || '', origin: o.pdf.origin || 'top-left, PDF points', rendered, renderName: basename(o.pdf.path), linked };
    for (const b of o.units) {
      const parts = [{ page: b.page, rects: b.rects }];
      if (b.tail) parts.push({ page: b.tail.page, rects: b.tail.rects });
      boxes.set(`${b.note}/${b.seq}`, { parts, approx: !!b.approx });
    }
    markers = (o.markers || []).map((m) => ({ note: m.note, page: m.page, rect: m.rect }));
    counts.boxed = [...units.values()].filter((u) => u.wrapped && boxes.has(u.id)).length;
    counts.unboxed = [...units.values()].filter((u) => u.wrapped && !boxes.has(u.id)).map((u) => u.id);
  }
  for (const k of Object.keys(served)) if (!existsSync(join(ROOT, 'public', 'uploads', k))) delete served[k];
  writeFileSync(servedFile, JSON.stringify(served) + '\n');

  // ---- 3. the manifest + the text ---------------------------------------------------------
  const order = [...units.values()].filter((u) => u.wrapped).sort((a, b) => a.line - b.line || a.seq - b.seq).map((u) => u.id);
  const usedSources = new Set([...units.values()].filter((u) => u.wrapped).flatMap((u) => [u.source, ...u.pages.map((p) => p.source)]).filter(Boolean));
  const manifest = {
    $comment: 'Generated by scripts/import-books.mjs from the research library\'s Pinned Citation Extracts lane — do not hand-edit; re-run the script.',
    slug: cfg.slug,
    id: cfg.id,
    generated: new Date().toISOString(),
    feed,
    book: { file: basename(cfg.book), sha256: bookSha, bytes: Buffer.byteLength(raw), ...(bookMeta.git_blob ? { commit: bookMeta.git_blob } : {}) },
    rightsRule: 'Only public-domain pages are published; every other citation is marked as held in the library.',
    pdf,
    markers,
    // the works the manifest's units cite, from the register (only those; the card reads full_citation,
    // full_work_url (+ kind), volume_url, preferred_citation, rights_statement, licence, holder)
    works: Object.fromEntries([...new Set([...units.values()].flatMap((u) => [u.work, ...(u.works ?? []), ...u.pages.map((p) => p.work)]).filter(Boolean))].sort().map((id) => {
      const row = register.get(id);
      return [id, Object.fromEntries(WORK_FIELDS.filter((f) => row[f]).map((f) => [f, row[f]]))];
    })),
    sources: Object.fromEntries([...usedSources].sort().map((k) => {
      const s = sources[k] ?? {};
      return [k, { title: s.title || k, rights: s.rights || '', pinkind: s.pinkind || 'page', ...(s.holder_url ? { holderUrl: s.holder_url } : {}) }];
    })),
    units: order.map((id) => {
      const u = units.get(id);
      return {
        // slim: this JSON travels to the reader's browser with the page
        id: u.id, note: u.note, seq: u.seq, source: u.source, status: u.status, rights: u.rights, ...(u.work ? { work: u.work } : {}), ...(u.works?.length ? { works: u.works } : {}),
        pages: u.pages.map((p) => ({ label: p.label, file: p.file, verified: p.verified, sha256: p.sha256, source: p.source, rights: p.rights, ...(p.begins ? { begins: true } : {}), ...(p.url ? { url: p.url } : {}), ...(p.work ? { work: p.work } : {}),
          ...(p.ctx?.file ? { context: { file: p.ctx.file, page: p.ctx.page, sha256: p.ctx.sha256, served: p.ctx.served, bytes: p.ctx.bytes } } : {}) })),
        ...(boxes.has(u.id) ? { box: boxes.get(u.id) } : {}),
      };
    }),
  };
  // The manifest is served to the browser as its own hashed, immutable JSON (public/review/<slug>.<hash>.json),
  // fetched by the review page — never inlined in the page's HTML (inlined, the immunity book's 2.4 MB manifest
  // rode in every page load). content/review/<slug>.json keeps the full manifest for the build (counts, static
  // params) plus `publicUrl`/`publicBytes`. An older hash of the same slug is removed.
  const body = JSON.stringify(manifest);
  const hash = createHash('sha256').update(body).digest('hex').slice(0, 12);
  const pubDir = join(ROOT, 'public', 'review');
  mkdirSync(pubDir, { recursive: true });
  for (const f of readdirSync(pubDir)) if (f.startsWith(`${cfg.slug}.`) && f.endsWith('.json') && f !== `${cfg.slug}.${hash}.json`) unlinkSync(join(pubDir, f));
  writeFileSync(join(pubDir, `${cfg.slug}.${hash}.json`), body + '\n');
  manifest.publicUrl = `/review/${cfg.slug}.${hash}.json`;
  manifest.publicBytes = Buffer.byteLength(body);
  mkdirSync(join(ROOT, 'content', 'review'), { recursive: true });
  mkdirSync(join(ROOT, 'content', 'books'), { recursive: true });
  writeFileSync(join(ROOT, 'content', 'review', `${cfg.slug}.json`), JSON.stringify(manifest) + '\n');
  writeFileSync(join(ROOT, 'content', 'books', `${cfg.slug}.md`), md);
  if (versionsRaw) {
    mkdirSync(join(ROOT, 'content', 'versions'), { recursive: true });
    writeFileSync(join(ROOT, 'content', 'versions', `${cfg.slug}.json`), versionsRaw); // the drafter's file, byte for byte
  }

  const pageLinks = manifest.units.reduce((n, u) => n + u.pages.filter((p) => p.file).length, 0);
  console.log(`import-books: ${cfg.slug} ← ${feed}`);
  console.log(`  book ${basename(cfg.book)} sha256 ${bookSha.slice(0, 16)}…  ${lines.length} lines, ${defLine.size} notes`);
  if (versionNewest) console.log(`  versions: ${JSON.parse(versionsRaw).versions.length} in the lane's log — version ${versionNewest.version} (${versionNewest.date}) is current; text and render match; published verbatim`);
  { const ids = new Set(); let uw = 0; for (const u of units.values()) { if (u.work) uw += 1; for (const w of [u.work, ...(u.works ?? []), ...u.pages.map((p) => p.work)]) if (w) ids.add(w); } if (ids.size) console.log(`  works: ${ids.size} register works cited by ${uw} of ${units.size} units (register ${register.size} works)`); }
  { let n = 0, ext = 0; for (const u of units.values()) for (const p of u.pages) { if (p.url) { n += 1; if (/^https?:\/\//i.test(p.url)) ext += 1; } } /* an https url = a holder's record; a path = this site's leaf */ if (n) console.log(`  links: ${n} page chips carry a url (${n - ext} leaf pages on this site, ${ext} external catalogue records)`); }
  console.log(`  units: ${counts.wrapped} wrapped (${counts.published} open a published page, ${counts.held} marked held/uncut), ${counts.uncut} without a source left plain, ${counts.unwrappable} unwrappable, ${counts.noDef} with no definition`);
  if (pdf) console.log(`  book PDF: ${basename(pdf.file)} ${pdf.pages} pp. ${(pdf.bytes / 1e6).toFixed(1)} MB sha256 ${pdf.sha256.slice(0, 12)}… (${pdf.producer})${pdf.linked ? ' + linked copy' : ''}; boxes on ${counts.boxed} units, ${counts.unboxed.length} wrapped units without a box${counts.unboxed.length ? ': ' + counts.unboxed.join(', ') : ''}; ${markers.length} markers`);
  else console.log('  book PDF: none (no _WEB/overlay.json in the lane) — the review pane falls back to the rendered text');
  console.log(`  reading copies: ${ctxCopied.size} public-domain context documents (${(ctxBytes / 1e6).toFixed(1)} MB, linearized) — ${ctxNew} written, ${ctxKept} kept, ${ctxRemoved} removed; ${[...units.values()].reduce((n, u) => n + u.pages.filter((p) => p.ctx?.file).length, 0)} page links open in context`);
  console.log(`  manifest: ${manifest.publicUrl} (${(manifest.publicBytes / 1e6).toFixed(2)} MB, fetched by the page)`);
  console.log(`  pages: ${copied.size} public-domain extracts (${(bytes / 1e6).toFixed(1)} MB) — ${copiedNew} copied, ${kept} kept, ${removed} removed; ${pageLinks} page links`);
  for (const w of warnings) console.log(`  ! ${w}`);
  console.log(`  ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}

const only = process.argv[2];
if (!only) {
  console.error('import-books: a slug is required (the two lanes move independently): ' + REVIEWS.map((r) => r.slug).join(' | '));
  process.exit(2);
}
const cfg = REVIEWS.find((r) => r.slug === only);
if (!cfg) { console.error(`import-books: no book matched ${only}`); process.exit(2); }
try { importOne(cfg); } catch (e) { console.error(`import-books: ${cfg.slug}: ${e.message}`); process.exit(1); }
