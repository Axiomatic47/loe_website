// src/data/homeContent.ts — the home page's editorial case registry.
//
// SHARED between the vite Index page and the Next.js app/page.tsx — update
// docket status lines HERE and both renderers stay in sync (same pattern as
// caseLanding.ts). Document counts are derived from content data by each
// renderer, not stored here.

export interface FeaturedCaseConfig {
  caption: string;
  court: string;
  caseNo: string;
  judge: string;
  defendants: string;
  operative: string;
  deadline: string;
  href: string;
  operativeHref: string;
}

export interface CaseStripEntry {
  caption: string;
  court: string;
  caseNo: string;
  status: string;
  href: string;
  matchTitle: string;
}

export const FEATURED_CASE: FeaturedCaseConfig = {
  caption: "Kirchner v. Johnson, et al.",
  court: "United States District Court for the District of Columbia",
  caseNo: "No. 1:25-cv-02735-ACR",
  judge: "Hon. Ana C. Reyes",
  defendants:
    "the Speaker of the House, the President, the Attorney General, the FCC Chairman, the U.S. House of Representatives, Anthropic, OpenAI, Apple, Comcast, and METR",
  operative: "Third Amended Complaint (Doc. 51), filed April 30, 2026",
  deadline:
    "All defendants moved to dismiss on July 15, 2026; Plaintiff’s opposition is due August 28, 2026.",
  href: "/kirchner-v-johnson", // case landing page
  operativeHref: "/kirchner-v-johnson/51", // straight to the TAC
};

/** Homepage academic-articles shelf (owner direction 2026-08-22: the
 *  homepage features the articles; the cases stay as the status strip).
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

export const CASE_STRIP: CaseStripEntry[] = [
  {
    caption: "Kirchner v. Johnson, et al.",
    court: "U.S. District Court, D.D.C.",
    caseNo: "1:25-cv-02735-ACR",
    status: "Active — motion-to-dismiss briefing underway",
    href: "/kirchner-v-johnson",
    matchTitle: "johnson",
  },
  {
    caption: "Kirchner v. Ellison",
    court: "U.S. District Court, D. Minn.",
    caseNo: "0:26-cv-00726 · refiled 0:26-cv-02594",
    status: "Refiled action dismissed August 20, 2026; appeal summarily affirmed June 25, 2026",
    href: "/kirchner-v-ellison",
    matchTitle: "ellison",
  },
  {
    caption: "Kirchner v. Acosta",
    court: "U.S. District Court, S.D. Fla.",
    caseNo: "9:26-cv-80296-DMM",
    status: "Dismissed without prejudice — motion to amend pending",
    href: "/kirchner-v-acosta",
    matchTitle: "acosta",
  },
];
