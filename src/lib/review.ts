// src/lib/review.ts — REVIEW MODE manifest types: a book's citation units and
// the cited pages published beside it (content/review/<slug>.json, written by
// scripts/import-books.mjs from the research library's Pinned Citation
// Extracts lane). Pure types + helpers so client components may import them;
// the JSON is read by app/books/review-server.ts.
//
// The contract is the one kirchner.ink publishes against (its
// src/lib/review.ts, 2026-09-15): the same lane feeds both sites, and the
// drafters' check_links.py joins the lane to either site by this shape.

export interface ReviewPage {
  /** the cited page as a label: "p. 705" · "col. 529" · "f. 81v" · "m. 8" · "sig. E4v" · "first page" */
  label: string;
  /** site path of the one-page PDF, or null when the page is held but not published */
  file: string | null;
  /** true: the page number was read on the cut page · false: placed by the
      run's offset · null: a verso with nothing to read */
  verified: boolean | null;
  sha256: string | null;
  /** the page's own source key and rights — a unit cut from two sources
      (the 1611 facsimile and the Bodleian leaves) has pages of each */
  source: string | null;
  rights: string;
  /** the case's first page — the note cited the case without a pin, so the whole case is served (owner 2026-09-15) */
  begins?: boolean;
  /** the READING COPY (owner rule 2026-09-15): a multi-page PDF of the work — whole when ≤10 pages or a
      whole case, else the cited page with the neighbours its quotation needs — and the cited page's
      1-based position inside it. The pane opens this, scrolled to `page`; `file` above stays the
      hash-verified single-page audit copy. */
  context?: { file: string; page: number; sha256: string | null; served?: string | null; bytes?: number };
  /** where the chip LINKS when the page itself is not served (lane contract 2026-09-15): a site-relative
      path = this site's own leaf page for a held membrane / folio (the image with its transcript tab);
      an https URL = the holder's own catalogue record for a citation that names an item (status EXTERNAL) */
  url?: string;
  /** the register id of the WORK this page cites (lane contract 2026-09-16) — a key of `works` */
  work?: string;
}

/** one cited WORK from the lane's register (_REGISTER.tsv, drafter 8a96daa3): the fields the card shows; empty ones are dropped */
export interface ReviewWork {
  full_citation?: string; short_form?: string; type?: string; author?: string; title?: string; container?: string;
  publisher?: string; place?: string; year?: string; edition?: string; isbn?: string; issn?: string; doi?: string;
  /** the whole work online; `full_work_url_kind` names where (loc-usrep-pdf, internet-archive, cap-static, doi, govinfo, site-archive …) */
  full_work_url?: string; full_work_url_kind?: string; volume_url?: string;
  holder?: string; holder_url?: string;
  preferred_citation?: string; preferred_citation_source?: string;
  rights?: string; rights_statement?: string; rights_source_url?: string; licence?: string;
}

export interface ReviewUnit {
  /** `<note>/<seq>` — the value of the citation link's data-cite */
  id: string;
  note: string;
  seq: number;
  /** source key in `sources`, or null */
  source: string | null;
  /** the lane's status: CUT · CUT_FIRST · UNMAPPED · NO_PIN · NO_SOURCE · EXTERNAL (a catalogue record, linked, nothing held) */
  status: string;
  rights: string;
  /** the register id of the work the unit's first row cites (the badge) */
  work?: string;
  /** every work the unit's live rows cite, distinct, in row order — the card lists them so (contract refinement 2026-09-16) */
  works?: string[];
  pages: ReviewPage[];
  /** where the unit stands in the book's PDF (absent for the units the overlay could not place) */
  box?: ReviewBox;
}

/** a box over one line of a citation unit in the book's PDF — PDF points, origin top-left */
export type Rect = [number, number, number, number];
export interface ReviewBox {
  /** the unit's lines; a unit split across a page break has two parts */
  parts: { page: number; rects: Rect[] }[];
  approx?: boolean;
}
export interface ReviewPdf {
  file: string;
  /** the lane's render (what the overlay is bound to) */
  sha256: string;
  /** the served copy — linearized at import for progressive loading */
  served?: string;
  bytes: number;
  pages: number;
  producer: string;
  origin: string;
  /** the render's date (from the lane's file name, else its mtime) — the PDF can lag the text */
  rendered: string;
  renderName: string;
  /** a copy with the citation links written in as PDF annotations, for download */
  linked: { file: string; sha256: string; served?: string } | null;
}
export interface ReviewMarker { note: string; page: number; rect: Rect }

export interface ReviewSource {
  title: string;
  rights: string;
  pinkind: 'page' | 'col' | 'folio' | 'memb' | 'sig' | string;
  /** the holder's catalogue record, for licence-bound reproductions */
  holderUrl?: string;
}

export interface ReviewManifest {
  slug: string;
  id: string;
  generated: string;
  feed: string;
  book: { file: string; sha256: string; bytes: number; commit?: string; parsed?: string };
  rightsRule: string;
  sources: Record<string, ReviewSource>;
  /** the cited works, by register id (absent on lanes without a register) */
  works?: Record<string, ReviewWork>;
  /** the book as a PDF, bound to the boxes by sha256; null until the lane emits _WEB/overlay.json */
  pdf: ReviewPdf | null;
  /** in-text superscripts that were matched to their note */
  markers: ReviewMarker[];
  /** in book order (definition line, then unit order) */
  units: ReviewUnit[];
  /** the manifest as the browser fetches it: a hashed, immutable JSON under /review/ (import-books.mjs) */
  publicUrl?: string;
  publicBytes?: number;
}

/** what the page ships inline: enough to start the book pane and show the counts while the manifest fetches */
export interface ReviewMeta {
  slug: string;
  publicUrl: string;
  unitCount: number;
  published: number;
  sourceCount: number;
  pdf: ReviewPdf | null;
  book: ReviewManifest['book'];
  generated: string;
  rightsRule: string;
}
export const reviewMeta = (m: ReviewManifest): ReviewMeta => ({
  slug: m.slug, publicUrl: m.publicUrl ?? '', unitCount: m.units.length, published: publishedUnits(m).length,
  sourceCount: Object.keys(m.sources).length, pdf: m.pdf, book: m.book, generated: m.generated, rightsRule: m.rightsRule,
});
/** an empty manifest carrying the pdf, so the book pane starts before the units arrive */
export const stubManifest = (meta: ReviewMeta): ReviewManifest => ({
  slug: meta.slug, id: '', generated: meta.generated, feed: '', book: meta.book, rightsRule: meta.rightsRule,
  sources: {}, works: {}, pdf: meta.pdf, markers: [], units: [],
});

export const RIGHTS_LABEL: Record<string, string> = {
  'public-domain': 'Public domain',
  'in-copyright-owner-use': 'In copyright — held for the author’s own use',
  'licence-bound': 'Licence-bound reproduction',
  'external-link': 'Linked to the holder’s own record — nothing is held in the library',
};
/** where a work's full text lives, from the register's `full_work_url_kind`, in words */
export const WORK_URL_KIND: Record<string, string> = {
  'loc-usrep-pdf': 'Library of Congress, U.S. Reports', 'internet-archive': 'Internet Archive', 'cap-static': 'Caselaw Access Project',
  'doi': 'publisher (DOI)', 'govinfo': 'GovInfo', 'site-archive': 'this site’s archive', 'google-books': 'Google Books', 'hathitrust': 'HathiTrust',
  'catalogue-record': 'catalogue record', 'acquisition-source': 'the source the library acquired it from', 'legislation-gov-uk': 'legislation.gov.uk',
  'uscode-house-gov': 'uscode.house.gov', 'supremecourt-gov-slip': 'Supreme Court slip opinion', 'digital-bodleian': 'Digital Bodleian', 'bailii': 'BAILII',
  'lii': 'Cornell LII', 'ecfr': 'eCFR', 'publisher-open': 'the publisher, open access',
};
/** an https URL opens in a new tab; a site-relative path stays in this one */
export const isExternalUrl = (u: string) => /^https?:\/\//i.test(u);

/** an EDITION served for a membrane / folio of one of this site's archives (Christopher Whittick's verification
    transcription of STAC 8/203/38, 2026-09-18): a held page whose chip links to that leaf opens the transcription
    in the review pane at the leaf's page — not the held card — with the folio image a click away and the leaf page
    (image beside transcription) in a new tab (owner 2026-09-21). Built at build time from the archive manifests. */
export interface EditionLeaf {
  archiveId: string;
  leafId: string;
  leafLabel: string;
  /** this site's leaf page — the image beside the transcription */
  leafUrl: string;
  /** the transcription PDF and the 1-based page where THIS leaf's text begins */
  pdf: string;
  sha256: string | null;
  page: number;
  title: string;
  credit: string;
  author?: string;
  /** the leaf image (the web rendition when the original is oversized) and the holder's credit for it */
  image: string;
  imageCredit?: string | null;
}
/** keyed `${archiveId}/${leafId}` */
export type EditionMap = Record<string, EditionLeaf>;

/** one uploaded version of a book (owner 2026-09-24: a version drop-down in the page footer with concise notes of
    what changed) — content/versions/<slug>.json, newest last in the file */
export interface BookVersion {
  version: number;
  /** ISO date the version landed on the site */
  date: string;
  /** FULL sha256 of the committed book (= _BOOK.json) and of the owner's render (= overlay.json pdf) — the gate's two equalities */
  text?: string;
  pdf?: string;
  note: string;
  /** informational, the drafter's: file names, the RL commit, the lane state */
  book?: string;
  book_commit?: string;
  render?: string;
  lane_state?: string;
}
/** a chip url of this site's leaf-page form, with an optional `page=N` (the citation's exact page in the edition) */
export const leafFromUrl = (url: string | null | undefined): { key: string; page: number | null } | null => {
  if (!url) return null;
  const m = url.match(/^\/research\/([^/]+)\/leaf\/([^/#?]+)(?:[#?].*?\bpage=(\d+))?/);
  return m ? { key: `${m[1]}/${m[2]}`, page: m[3] ? Number(m[3]) : null } : null;
};

/** the units that open a published page */
export const publishedUnits = (m: ReviewManifest) => m.units.filter((u) => u.pages.some((p) => p.file));

/** `#cite=<note>/<seq>[/<page index>]` ⇄ unit id + which of its cited pages (0-based) */
export const citeFromHash = (hash: string): { id: string; page: number } | null => {
  const m = /(?:^|[#&])cite=([A-Za-z0-9_]+\/\d+)(?:\/(\d+))?/.exec(hash);
  return m ? { id: m[1], page: m[2] ? Number(m[2]) : 0 } : null;
};
export const hashForCite = (id: string, page = 0) => (page > 0 ? `#cite=${id}/${page}` : `#cite=${id}`);

/** every PDF URL carries its content hash: the files keep their names across
    renders and re-cuts, so a browser could otherwise serve a cached copy after a deploy */
export const versioned = (file: string, sha: string | null | undefined) => (sha ? `${file}?v=${sha.slice(0, 12)}` : file);
