// src/data/homeContent.ts — the home page's editorial content registry.
//
// SHARED between the vite Index page and the Next.js app/page.tsx — update
// HERE and both renderers stay in sync (same pattern as caseLanding.ts).
// The featured-case dossier and three-case strip were removed 2026-08-22/23
// (owner direction: the homepage features the academic articles; per-case
// editorial content lives on in caseLanding.ts for the case pages).

/** Homepage academic-articles shelf (owner direction 2026-08-22/23: the
 *  homepage features the articles).
 *  Slugs resolve against the manuscript collection at build time — counts
 *  and links are derived, only the blurbs are editorial. */
export interface ArticleShelfEntry {
  slug: string;
  blurb: string;
}

/** Homepage archives strip (owner direction 2026-08-23, published with the
 *  TNA reproduction licence in hand): the two primary-source Star Chamber
 *  archives, linking to their /research/<id> pages. Editorial copy here;
 *  leaf counts derive from the archive manifests where the renderer can. */
export interface ArchiveShelfEntry {
  id: string;
  ref: string;
  title: string;
  detail: string;
  blurb: string;
}

export const ARCHIVE_SHELF: ArchiveShelfEntry[] = [
  {
    id: 'stac-8-203-38',
    ref: 'STAC 8/203/38',
    title: 'Lloyd v. Barker (Star Chamber, 1607)',
    detail: 'The National Archives (UK), Kew · Trinity term, 5 Jac. I (1607)',
    blurb:
      'The original Star Chamber proceedings — leaf images reproduced by permission of The National Archives, with diplomatic transcriptions, line indexes, and working papers.',
  },
  {
    id: 'hls-ms149-floyd',
    ref: 'HLS MS 149, ff. 81r–83v',
    title: 'Floyd v. Barker — the second account (Star Chamber, 1607)',
    detail: 'Harvard Law School Library · Pasch. 5 Jac. I (1607)',
    blurb:
      'The second manuscript account of the case behind judicial immunity — folio images courtesy of Harvard Law School Library, with line indexes and working papers.',
  },
];

/** The lead card — The Codified Democratic Order composition. */
export const ARTICLE_LEAD: ArticleShelfEntry = {
  slug: 'codified-democratic-order',
  blurb:
    'The framework’s constitutional architecture: the Fundamental Laws of Supremacism and Egalitarianism, the Madisonian separation-of-powers compliance test, and their application to active conflicts.',
};

/** The grid — individual CDO articles (section slugs within the lead
 *  composition; owner direction 2026-08-29: purely Codified Democratic
 *  Order). The four FEATURED papers read in full in the Featured Works
 *  stream below, so the grid carries four structural articles that are
 *  not otherwise on the page. */
export const CDO_ARTICLE_CARDS: ArticleShelfEntry[] = [
  {
    slug: 'the-fundamental-laws-of-supremacism-and-egalitarianism',
    blurb:
      'The axioms of the framework: supremacism and egalitarianism as the two organizing laws of political order.',
  },
  {
    // section slugs are data, capped at 60 chars by the enrich step
    slug: 'the-madisonian-separation-of-powers-objective-compliance-tes',
    blurb:
      'An objective compliance test for separation-of-powers structures — whether a constitution actually checks power.',
  },
  {
    slug: 'the-ratification-protocol-a-two-stage-architecture-for-membe',
    blurb: 'A two-stage architecture for member commitment to the codified order.',
  },
  {
    slug: 'the-board-of-peace-an-operational-anatomy-of-usurpation-at-t',
    blurb: 'An operational anatomy of usurpation at the international level.',
  },
];

