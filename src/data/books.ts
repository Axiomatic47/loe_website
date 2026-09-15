// src/data/books.ts — the books published in REVIEW MODE under /books/<slug>
// (owner 2026-09-15: "port review mode to lawsofexistence.com and publish both
// books there"). Presentation copy only; the text and the cited pages come
// from the research library through scripts/import-books.mjs, which writes
// content/books/<slug>.md and content/review/<slug>.json and copies the
// public-domain pages to public/uploads/research/<id>/.
//
// Slugs and upload ids are the ones kirchner.ink uses for the same books, so
// the drafters' coverage check (check_links.py) joins either site unchanged.

export interface BookRecord {
  slug: string;
  /** public/uploads/research/<id>/ */
  id: string;
  title: string;
  subtitle: string;
  /** ISO date of the site entry */
  date: string;
  venue: string;
  /** the book's own words — its abstract or conclusion */
  blurb: string;
  /** the research-library collection it belongs to (shown as an eyebrow) */
  collection: string;
}

export const BOOKS: BookRecord[] = [
  {
    slug: 'the-subjects-unanswered-plea',
    id: 'immunity-book',
    title: "The Subject's Unanswered Plea",
    subtitle: 'A Restorative and Comparative History of Immunity',
    date: '2026-09-15',
    venue: 'Book · working draft',
    blurb:
      'The case that founded official immunity was a documented miscarriage of justice, a death by drowning recast as murder, a conviction on examinations taken down in a language the witnesses did not speak, and a court that answered the surviving kinsman’s sworn complaint against the trial judge by defacing it. Six Parts put the question the decree reserved to every order that has answered it, cited at the page.',
    collection: 'Immunity',
  },
  {
    slug: 'the-holy-seed',
    id: 'holy-seed',
    title: 'The Holy Seed',
    subtitle: 'The Fall of Babylon and the Making of Jewish Identity',
    date: '2026-09-15',
    venue: 'Book · working draft',
    blurb:
      'Ezra 9:2 calls the returned exiles “the holy seed” and says they have mingled it with the peoples of the lands. The phrase occurs nowhere else in the Hebrew Bible in that sense, and within a generation of its first use the community at Jerusalem had put away its foreign wives and their children and had begun to keep its membership by written pedigree. This book asks where the idiom and the programme came from.',
    collection: 'The Holy Seed',
  },
];

export const bookBySlug = (slug: string) => BOOKS.find((b) => b.slug === slug) ?? null;
