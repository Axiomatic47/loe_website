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

export const ARTICLE_SHELF: ArticleShelfEntry[] = [
  {
    slug: 'codified-democratic-order',
    blurb:
      'The framework’s constitutional architecture: the Fundamental Laws of Supremacism and Egalitarianism, the Madisonian separation-of-powers compliance test, and their application to active conflicts.',
  },
  {
    slug: 'unified-mathematical-model',
    blurb: 'The unified mathematical framework for consciousness, ethics, and reality.',
  },
  {
    slug: 'transcendental-method-for-substrate-independent-consciousness-recognition',
    blurb:
      'A transcendental method for substrate-independent consciousness recognition — the argument, comparative analysis against existing theories, and testing protocols.',
  },
  {
    slug: 'laws-of-existence-foundational-exhibits',
    blurb: 'The Fundamental Laws in formal logic, with falsification attempts.',
  },
  {
    slug: 'abrahamic-faith-reconciliation-thesis',
    blurb: 'The egalitarian foundations of Abrahamic tradition — a reconciliation thesis.',
  },
];

