// src/lib/research-archive.ts — research-archive manifest types + pure
// helpers, SHARED by both renderers (vite views fetch the manifest at
// runtime; the Next pages read it from public/ at build). Extracted from
// src/views/ResearchArchive.tsx, which re-exports for compatibility.

export interface ArchiveDoc {
  /** transcript = the canonical per-leaf transcript; transcription = working assemblies/spans */
  kind: "transcript" | "index" | "transcription";
  span?: string;
  title: string;
  pdf: string;
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

export const imagesPublished = (m: ArchiveManifest | null) => m?.images?.published === true;

export const archiveBase = (id: string) => `/uploads/research/${id}`;

export const leafStatus = (leaf: ArchiveLeafEntry): string => {
  const hasCanon = leaf.docs.some((d) => d.kind === "transcript");
  const hasIndex = leaf.docs.some((d) => d.kind === "index");
  const spans = [...new Set(leaf.docs.filter((d) => d.kind === "transcription").map((d) => d.span))];
  const parts = [];
  if (hasCanon) parts.push("Transcript");
  parts.push(hasIndex ? (hasCanon ? "line index" : "Line index") : "—");
  if (!hasCanon && spans.length) parts.push(`transcribed (${spans.join(", ")})`);
  return parts.join(" · ");
};

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
