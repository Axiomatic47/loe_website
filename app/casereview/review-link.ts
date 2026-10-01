// app/casereview/review-link.ts — the bridge between the site's per-document reader pages (/kirchner-v-johnson/<docket
// slug>) and the Case Review window: which registry id a docket slug is, and the deep link that opens the window on it.
// Server only (node:fs): reads the bundle the importer wrote (public/casereview/data), never the lane.
import fs from 'node:fs';
import path from 'node:path';

type FilesManifest = Record<string, { path: string | null }>;
type ImportStamp = { default_doc?: string | null; registry_version?: string | null; documents?: number; tables?: number; imported?: string; host_policy?: { serve_groups: string[]; not_hosted_here: number } | null };

const DATA = () => path.join(process.cwd(), 'public', 'casereview', 'data');

let bySlug: Map<string, string> | undefined;
/** docket slug (the served file's stem: "74", "51-54", "mo-stay") → registry id ("DDC-074") */
function slugMap(): Map<string, string> {
  if (bySlug) return bySlug;
  bySlug = new Map();
  try {
    const files = JSON.parse(fs.readFileSync(path.join(DATA(), 'files.json'), 'utf8')) as FilesManifest;
    for (const [id, f] of Object.entries(files)) {
      const m = f.path && /\/([^/]+)\.pdf$/.exec(f.path);
      if (m) bySlug.set(m[1], id);
    }
  } catch { /* no bundle: no links */ }
  return bySlug;
}

/** the Case Review deep link for a per-document page, or null when the document is not in the served bundle */
export function reviewHref(caseSlug: string, docSlug: string): string | null {
  if (caseSlug !== 'kirchner-v-johnson') return null;
  const id = slugMap().get(docSlug);
  return id ? `/${caseSlug}?casereview=doc=${encodeURIComponent(id)}` : null;
}

/** the importer's stamp (the default document, the registry version, the host policy) */
export function readImportStamp(): ImportStamp {
  try { return JSON.parse(fs.readFileSync(path.join(DATA(), '_IMPORT.json'), 'utf8')) as ImportStamp; }
  catch { return {}; }
}
