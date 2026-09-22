// src/lib/research-archive.ts — research-archive manifest types + pure
// helpers, SHARED by both renderers (vite views fetch the manifest at
// runtime; the Next pages read it from public/ at build). Extracted from
// src/views/ResearchArchive.tsx, which re-exports for compatibility.

export interface ArchiveDoc {
  /** transcript = the site author's per-leaf working transcript; index = line index; transcription = a
      working span; edition = the professional verification transcription (Christopher Whittick, 2026) */
  kind: "transcript" | "index" | "transcription" | "edition";
  span?: string;
  title: string;
  pdf: string;
  /** the document's author when it is not the site author (an edition) */
  author?: string;
  /** the credit line as the author asked for it, rendered wherever the document is shown */
  credit?: string;
  /** sha256 of the served PDF, verified against the library's fixity file at sync time */
  sha256?: string;
  /** the PDF page (1-based) where THIS leaf's text begins in a document that spans several leaves —
      from the library's page map (05_Whittick Edition/_PAGE_MAP.tsv, the manuscript seat's table);
      absent = the document opens at its first page */
  page?: number;
}
export interface ArchiveLeafEntry {
  id: string;
  image: string;
  /** downscaled grid tile (~600px max side), generated at sync time; falls back to `image` */
  thumb?: string;
  /** web-sized display rendition (~2000px), generated only when the original is oversized — the full-resolution original stays at `image` */
  web?: string;
  /** byte size of the original image (drives the full-resolution download label) */
  imageBytes?: number;
  sha256: string | null;
  /** rights-holder-preferred credit line for the leaf image, when published */
  credit?: string | null;
  docs: ArchiveDoc[];
}
export interface ArchiveManifest {
  archive: { id: string; ref: string; title: string; dated: string; source: string; pieces: number };
  /** leaf-image licensing state; absent/false ⇒ placeholders are being shown */
  images?: {
    published: boolean;
    rightsHolder?: string;
    rightsNote?: string;
    /** downloads-and-reuse posture line (licensee's licence ≠ a visitor's republication licence) */
    reuseNote?: string;
    creditUrl?: string;
  };
  leaves: ArchiveLeafEntry[];
  workingPapers: Array<{ title: string; pdf: string }>;
  crops: { count: number; index: Record<string, string> };
}

/** What the site PUBLISHES of a leaf's documents (owner 2026-09-18, all three sites): the EDITION only —
    Christopher Whittick's professional verification transcription, which replaced the owner's own
    per-leaf transcripts here (owner 2026-09-15 had published those until it arrived). The owner's
    transcripts, the line indexes, the working spans and the working papers stay in the library as the
    working stratum and are not served. */
export const PUBLISHED_KINDS: ReadonlySet<string> = new Set(['edition']);
export const publishedDocs = (leaf: ArchiveLeafEntry): ArchiveDoc[] => leaf.docs.filter((d) => PUBLISHED_KINDS.has(d.kind));

/** lower-case only the first letter of a credit line for mid-sentence use — the author's name keeps its case */
export const creditInline = (credit: string) => credit.charAt(0).toLowerCase() + credit.slice(1);

export const imagesPublished = (m: ArchiveManifest | null) => m?.images?.published === true;

export const archiveBase = (id: string) => `/uploads/research/${id}`;

export const leafStatus = (leaf: ArchiveLeafEntry): string =>
  publishedDocs(leaf).length ? 'Verification transcription' : 'Image — transcription to follow';

// Diplomatic conventions shared by the working documents (see the archives'
// markdown formatting guide).
export const CONVENTIONS: Array<[string, string]> = [
  ["[?]", "uncertain reading"],
  ["[…] / [__]", "supplied / illegible"],
  ["^word^", "interlineation (inserted above the line)"],
  ["~~text~~", "scribal strike-through"],
  ["«or»", "in-line insertion"],
  ["|", "cut at a half-column tile edge"],
  ["⟦4B: …⟧", "editorial fold-in note from a later verification pass"],
];
