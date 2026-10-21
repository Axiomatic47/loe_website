// app/casereview/review-link.ts — THE HOST TABLE of the Case Review window on this site, and the bridge between the
// site's per-document reader pages (/<caseSlug>/<docket slug>) and the window: which lanes are hosted in review mode,
// how each is keyed, which registry id a docket slug is, and the deep link that opens the window on it.
// Server only (node:fs): reads the bundle the importer wrote (public/casereview/…/data), never the lane.
//
// THE TABLE IS DATA (the review-mode standard R4, 2026-10-21; studio-spec 699a9f2a's frame, the owner's § 6): public/
// casereview/hosts.json, in the EXACT shape of the Studio's GET /api/casereview/cases answer ({project_root, cases:
// [{name, case_root, case, version, current}]} — api/deck/casereview.py lane_cases) with the site's fields added per
// row and nothing renamed. The importer UPSERTS the registry half of a row at every import (name, case_root, case,
// version, built, imported) and never touches the site's hand-set words (route, kind, composition, caption, docket,
// court, title, back, default_doc); the same file is served at /api/casereview/cases by rewrite, so the window's head
// row and lane picker read one shape on both hosts. A new lane is one JSON row; no code.
//
// Two bundles on one host (agreed by name 55339aa7 ⇄ f28bb754, 2026-10-10): the DEFAULT bundle (the row whose `root`
// is null) keeps public/casereview/data/ and bare API rules; any other row's bundle sits at public/casereview/<name>/
// data/ and its API rules are keyed on the query the window sends when the host passes `root` — the row's NAME (the
// slug), never a path. A lane is hosted in review mode ONLY while its bundle exists on disk: a row with no bundle
// changes nothing (the landing dossier stays), and the day the importer lands the bundle the page flips. A row whose
// `composition` is null and whose bundle is on disk is a LANE PAGE (app/[caseSlug]/page.tsx): the head row and the
// window, nothing else — the owner's D5 (the lane page first; per-article pages when an article is published).
import fs from 'node:fs';
import path from 'node:path';

export type CaseReviewHost = {
  /** the slug: the route segment, the keyed root token and the bundle directory (public/casereview/<name>/data) */
  name: string;
  /** the Studio's fields, written by the importer from the bundle: the registry's case sentence and version */
  case_root: string;
  case: string | null;
  version: string | null;
  built?: string | null;
  current?: boolean;
  /** the window's root token for this lane (null for the default bundle: bare rules, no query) */
  root: string | null;
  /** the site's route to the lane ("/kirchner-v-johnson"); hand-set, defaults to /<name> */
  route: string;
  /** case: a constitutional case (the head row prints caption v. caption); lane: any other reviewed set (articles, books) */
  kind: 'case' | 'lane';
  /** the constitutional composition whose case page hosts the window, or null → the lane page */
  composition: string | null;
  /** the head row's words as this site prints them (until R3 moves the head row into the window) */
  caption?: readonly [string, string];
  docket?: string;
  court?: string;
  title?: string;
  back?: { href: string; label: string };
  /** the document the page opens when the URL names none; null → the importer's word, then the newest served table */
  default_doc?: string | null;
  /** the importer's stamp for the row: when, how many, what publishes */
  imported?: { at: string; documents?: number; tables?: number; rows?: number; publication?: Record<string, number>; vendored_studio_commit?: string | null } | null;
};

type HostsFile = { project_root?: string; cases?: CaseReviewHost[] };

const HOSTS_FILE = path.join(process.cwd(), 'public', 'casereview', 'hosts.json');

let tableCache: CaseReviewHost[] | null = null;
/** the host table as hosts.json carries it ([] when the file is absent); route and kind filled from the name when a row lacks them */
export function hostTable(): CaseReviewHost[] {
  if (tableCache) return tableCache;
  let rows: CaseReviewHost[] = [];
  try {
    const f = JSON.parse(fs.readFileSync(HOSTS_FILE, 'utf8')) as HostsFile;
    rows = (f.cases ?? []).filter((r) => r && typeof r.name === 'string' && r.name).map((r) => ({
      ...r,
      case_root: r.case_root ?? r.name,
      root: r.root === undefined ? r.name : r.root,
      route: r.route ?? `/${r.name}`,
      kind: r.kind === 'case' ? 'case' : 'lane',
      composition: r.composition ?? null,
    }));
  } catch { /* no table: nothing is hosted in review mode */ }
  tableCache = rows;
  return rows;
}

/** the row whose bundle is the default one (bare rules), or null */
export function defaultHost(): CaseReviewHost | null {
  return hostTable().find((r) => r.root === null) ?? null;
}

/** the slug of the default bundle — the row with root null; the DDC case on this site, kept as a constant for callers */
export const DEFAULT_CASE = 'kirchner-v-johnson';

/** the rows by slug, as the former code table read */
export function hostsBySlug(): Record<string, CaseReviewHost> {
  return Object.fromEntries(hostTable().map((r) => [r.name, r]));
}

/** the bundle directory of a case, as the importer lays it out */
export function dataDir(caseSlug: string): string {
  // statically scoped to public/casereview: with 'public' as the last literal segment the tracer's pattern matched
  // every file under public/ (16,284 at 2026-10-16); the bundles are build-time inputs and public/** is excluded
  // from the handler's trace in next.config.ts, so the narrower pattern changes nothing but the sweep.
  // The default bundle is the row whose root is null (the DDC case on this site); every other row's is keyed by name.
  const row = hostsBySlug()[caseSlug];
  const bare = row ? row.root === null : caseSlug === DEFAULT_CASE;   // a row with root null IS the default bundle; no table → the constant
  return path.join(process.cwd(), 'public', 'casereview', ...(bare ? ['data'] : [caseSlug, 'data']));
}

/** the host row of a lane, or null when the lane is not in the table or its bundle is not on disk */
export function caseReviewHost(caseSlug: string): CaseReviewHost | null {
  const h = hostsBySlug()[caseSlug];
  if (!h) return null;
  return fs.existsSync(path.join(dataDir(caseSlug), '_IMPORT.json')) ? h : null;
}

/** every row whose bundle is on disk — the lanes this build hosts in review mode */
export function hostedLanes(): CaseReviewHost[] {
  return hostTable().filter((r) => fs.existsSync(path.join(dataDir(r.name), '_IMPORT.json')));
}

type FilesManifest = Record<string, { path: string | null }>;
type ImportStamp = { default_doc?: string | null; registry_version?: string | null; documents?: number; tables?: number; imported?: string; host_policy?: { serve_groups: string[]; not_hosted_here: number } | null };

const bySlug = new Map<string, Map<string, string>>();
/** per case: docket slug (the served file's stem: "74", "51-54", "mo-stay") → registry id ("DDC-074") */
function slugMap(caseSlug: string): Map<string, string> {
  const have = bySlug.get(caseSlug);
  if (have) return have;
  const m = new Map<string, string>();
  try {
    const files = JSON.parse(fs.readFileSync(path.join(dataDir(caseSlug), 'files.json'), 'utf8')) as FilesManifest;
    for (const [id, f] of Object.entries(files)) {
      const mm = f.path && /\/([^/]+)\.pdf$/.exec(f.path);
      if (!mm) continue;
      m.set(mm[1], id);
      // this site's Minnesota files are zero-padded (2594-01-01.pdf) while their reader pages are not (/kirchner-v-ellison/2594-1-1):
      // the stem with every numeric segment unpadded is registered too, so either spelling finds the row
      const bare = mm[1].split('-').map(seg => /^\d+$/.test(seg) ? String(+seg) : seg).join('-');
      if (bare !== mm[1] && !m.has(bare)) m.set(bare, id);
    }
  } catch { /* no bundle: no links */ }
  bySlug.set(caseSlug, m);
  return m;
}

/** the Case Review deep link for a per-document page, or null when the case is not hosted or the document is not in its bundle */
export function reviewHref(caseSlug: string, docSlug: string): string | null {
  if (!caseReviewHost(caseSlug)) return null;
  const id = slugMap(caseSlug).get(docSlug);
  return id ? `/${caseSlug}?casereview=doc=${encodeURIComponent(id)}` : null;
}

/** the document the page opens when the URL names none — the one skin decision the Studio leaves to its host: the
 *  importer's word first (the newest Filings main with a link table); when it names none (a case whose only tables
 *  are on unfiled documents — the MN lane opened on the open letter), the newest SERVED document with a link table,
 *  by filed date then registry order; null when nothing is served with a table (the window then opens nothing, as
 *  the Studio does). Read from the bundle, never the lane. */
export function defaultDocFor(caseSlug: string): string | null {
  const row = hostsBySlug()[caseSlug];
  if (row?.default_doc) return row.default_doc;
  const stamp = readImportStamp(caseSlug);
  if (stamp.default_doc) return stamp.default_doc;
  try {
    const docs = JSON.parse(fs.readFileSync(path.join(dataDir(caseSlug), 'docs.json'), 'utf8')) as {
      docs: { id: string; publish?: string; filed?: string | null }[]; links?: Record<string, { rows?: number }>;
    };
    const iso = (f?: string | null) => { const m = /^(\d\d)\/(\d\d)\/(\d\d)$/.exec(f || ''); return m ? `20${m[3]}-${m[1]}-${m[2]}` : (f || ''); };
    const withTable = docs.docs.map((d, i) => ({ d, i })).filter(({ d }) => d.publish === 'serve' && (docs.links?.[d.id]?.rows ?? 0) > 0);
    withTable.sort((a, b) => iso(b.d.filed).localeCompare(iso(a.d.filed)) || a.i - b.i);
    return withTable[0]?.d.id ?? null;
  } catch { return null; }
}

/** the importer's stamp for a case (the default document, the registry version, the host policy) */
export function readImportStamp(caseSlug: string = DEFAULT_CASE): ImportStamp {
  try { return JSON.parse(fs.readFileSync(path.join(dataDir(caseSlug), '_IMPORT.json'), 'utf8')) as ImportStamp; }
  catch { return {}; }
}
