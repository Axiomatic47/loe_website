// app/casereview/review-link.ts — THE HOST TABLE of the Case Review window on this site, and the bridge between the
// site's per-document reader pages (/<caseSlug>/<docket slug>) and the window: which cases are hosted in review mode,
// how each is keyed, which registry id a docket slug is, and the deep link that opens the window on it.
// Server only (node:fs): reads the bundle the importer wrote (public/casereview/…/data), never the lane.
//
// Two cases on one host (agreed by name 55339aa7 ⇄ f28bb754, 2026-10-10; the owner's word of 2026-10-09: the MN case
// gets the same architecture as the DDC one): the DEFAULT case keeps its bundle at public/casereview/data/ and bare API
// rules; any other case's bundle sits at public/casereview/<slug>/data/ and its API rules are keyed on the query the
// window sends when the page URL carries ?projroot=<slug> — the `root` below, the case SLUG, never a path. A case is
// hosted in review mode ONLY while its bundle exists on disk: a row here with no bundle changes nothing (the landing
// dossier stays), and the day the importer lands the bundle the page flips. Nothing here is a fact about a case.
import fs from 'node:fs';
import path from 'node:path';

export const DEFAULT_CASE = 'kirchner-v-johnson';

export type CaseReviewHost = {
  /** the window's root token for this case (null for the default case: bare rules, no query) */
  root: string | null;
  /** the head row: caption halves, the docket number and the court, as this site prints them */
  caption: readonly [string, string];
  caseNo: string;
  court: string;
};

export const CASE_REVIEW_HOSTS: Record<string, CaseReviewHost> = {
  'kirchner-v-johnson': { root: null, caption: ['Kirchner', 'Johnson'], caseNo: 'No. 1:25-cv-02735-ACR', court: 'D.D.C.' },
  'kirchner-v-ellison': { root: 'kirchner-v-ellison', caption: ['Kirchner', 'Ellison'], caseNo: 'No. 0:26-cv-02594-LMP-DJF', court: 'D. Minn. · 8th Cir. No. 26-1615' },
};

/** the bundle directory of a case, as the importer lays it out */
export function dataDir(caseSlug: string): string {
  return path.join(process.cwd(), 'public', ...(caseSlug === DEFAULT_CASE ? ['casereview', 'data'] : ['casereview', caseSlug, 'data']));
}

/** the host entry of a case, or null when the case is not hosted in review mode or its bundle is not on disk */
export function caseReviewHost(caseSlug: string): CaseReviewHost | null {
  const h = CASE_REVIEW_HOSTS[caseSlug];
  if (!h) return null;
  return fs.existsSync(path.join(dataDir(caseSlug), '_IMPORT.json')) ? h : null;
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
