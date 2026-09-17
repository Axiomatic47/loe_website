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
    venue: 'Book · pre-publishing edition',
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
  {
    // the third book in review mode (owner 2026-09-15, via drafter 60f85bca); slug and id as the lane names them
    slug: 'a-restorative-reading-of-genesis-1-3',
    id: 'genesis-1-3',
    title: 'A Restorative Reading of Genesis 1–3',
    subtitle: 'The Creation Narrative in the Hebrew and Its Versions',
    date: '2026-09-15',
    venue: 'Book · working draft',
    blurb:
      'This book began with one word in one verse: the “now” that opens the second chapter’s account of the making of man, read against the six days of the first, and the question whether the second chapter continued the first or went back over it. It is a reading, of three chapters of one book, and not a history of their interpretation. It is restorative because it restores the text’s own order against the versions that rearranged it, and its own words against the versions that dispersed them; and the versions are not obstacles between the reader and the text but witnesses, each faithful somewhere and unfaithful somewhere else.',
    collection: 'Genesis 1–3',
  },
  {
    // the fourth title in review mode (owner 2026-09-16, via drafter 60f85bca): an article; renders only once
    // its lane has been imported (publishedBooks reads content/review)
    slug: 'the-madisonian-separation-of-powers-test',
    id: 'madisonian-test',
    title: 'The Madisonian Separation of Powers Objective Compliance Test',
    subtitle: 'Recovering Constitutional Structure Through Textual Analysis',
    date: '2026-09-16',
    venue: 'Article · working draft',
    blurb:
      'For 239 years the United States has lacked an objective legal definition of a separation-of-powers violation. This Article recovers what Madison actually wrote: he used “distribution”, not “separation”; “balance” and “check” are sequential operations, not synonyms; and non-delegation is not a separate doctrine. From that framework it derives a six-step compliance test any court can apply without policy judgment, validates it against 36 Supreme Court decisions across 154 years, and recovers the equity standing needed to enforce it.',
    collection: 'Constitutional structure',
  },
];

export const bookBySlug = (slug: string) => BOOKS.find((b) => b.slug === slug) ?? null;
