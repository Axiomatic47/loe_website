// src/lib/open-readings.ts — server-side loader for the Open Readings data
// (content/readings/<collection>.json + <collection>.answers.json).
//
// Owner direction 2026-09-08 (plan: agent_notes/_shared/20260908_open_readings_
// build_plan.md §2). Rules enforced here, not only in the validator:
//   - `collation_ref` is INTERNAL: stripped before anything leaves this module,
//     so it can never reach a page or the client bundle;
//   - status is DERIVED: open → answered (≥1 published answer) → resolved
//     (the item carries a `resolution`); never stored on the item;
//   - answers files carry published answers only (validator refuses contact
//     fields); this loader joins them by item id.
// Build-time only (fs): import from server components / generateStaticParams.
import fs from 'fs';
import path from 'path';

export type Legibility = 'readable' | 'uncertain' | 'illegible-at-this-resolution';
export type ReadingStatus = 'open' | 'answered' | 'resolved';

export interface ReadingSource {
  kind: 'archive' | 'external';
  /** kind=archive: our published archive + leaf */
  archiveId?: string;
  leafId?: string;
  /** kind=external: the holder's page for the folio */
  href?: string;
  holder?: string;
}
export interface ReadingLicence {
  name: string;
  attribution: string;
  href?: string;
  /** false → no crop is cut or served; the item links to the holder only */
  republish: boolean;
}
export interface ReadingText {
  text: string;
  lang: string;
  ref?: string;
  edition?: string;
  page?: string | number | null;
}
export interface ReadingResolution {
  decision: string;
  date: string;
  rests_on?: string[];
}
export interface OpenReading {
  id: string;
  collection: string;
  shelfmark: string;
  leaf: string;
  line: string | number;
  source: ReadingSource;
  image: { url: string; sha256: string; note?: string };
  region: { x: number; y: number; w: number; h: number };
  zoom: number;
  transcription: ReadingText;
  comparison: ReadingText;
  question: string;
  context?: string;
  legibility: Legibility;
  language: string;
  licence: ReadingLicence;
  created: string;
  resolution?: ReadingResolution;
}
export interface PublishedAnswer {
  item_id: string;
  letter: 'A' | 'B' | 'C' | 'D';
  reading?: string;
  note?: string;
  reader: { display: string; credentials_summary?: string };
  published: string;
  ack?: boolean;
}
export interface ReadingWithState extends OpenReading {
  status: ReadingStatus;
  answers: PublishedAnswer[];
  /** crop path under /uploads/readings/, or null when the licence forbids republication */
  crop: string | null;
}
export interface ReadingsCollection {
  id: string;
  title: string;
  description?: string;
  holder?: string;
  licence?: ReadingLicence;
  items: ReadingWithState[];
}

const ROOT = path.join(process.cwd(), 'content', 'readings');
const CROPS_PUBLIC = '/uploads/readings';

function readJson<T>(p: string): T | null {
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf-8')) as T;
}

/** Collection ids = item files present (answers files are `<id>.answers.json`). */
export function listReadingCollections(): string[] {
  if (!fs.existsSync(ROOT)) return [];
  return fs
    .readdirSync(ROOT)
    .filter(f => f.endsWith('.json') && !f.startsWith('_') && !f.endsWith('.answers.json') && !f.endsWith('.meta.json'))
    .map(f => f.replace(/\.json$/, ''))
    .sort();
}

interface RawFile {
  _generated?: unknown;
  items: (OpenReading & { collation_ref?: string })[];
}
interface MetaFile {
  title?: string;
  description?: string;
  holder?: string;
  licence?: ReadingLicence;
}

export function loadReadingsCollection(id: string): ReadingsCollection | null {
  const raw = readJson<RawFile>(path.join(ROOT, `${id}.json`));
  if (!raw?.items) return null;
  const answers = readJson<{ answers: PublishedAnswer[] }>(path.join(ROOT, `${id}.answers.json`))?.answers ?? [];
  const meta = readJson<MetaFile>(path.join(ROOT, `${id}.meta.json`)) ?? {};
  const byItem = new Map<string, PublishedAnswer[]>();
  for (const a of answers) {
    if (!byItem.has(a.item_id)) byItem.set(a.item_id, []);
    byItem.get(a.item_id)!.push(a);
  }
  const items: ReadingWithState[] = raw.items.map(it => {
    const { collation_ref: _internal, ...pub } = it; // stripped: internal collation pointer
    void _internal;
    const mine = (byItem.get(it.id) ?? []).slice().sort((a, b) => a.published.localeCompare(b.published));
    const status: ReadingStatus = it.resolution ? 'resolved' : mine.length ? 'answered' : 'open';
    const crop = it.licence?.republish === false ? null : `${CROPS_PUBLIC}/${id}/${it.id}.jpg`;
    return { ...pub, status, answers: mine, crop };
  });
  const first = items[0];
  return {
    id,
    title: meta.title ?? (first ? `${first.shelfmark} — open readings` : id),
    description: meta.description,
    holder: meta.holder ?? first?.source.holder,
    licence: meta.licence ?? first?.licence,
    items,
  };
}

export function loadAllReadings(): ReadingsCollection[] {
  return listReadingCollections()
    .map(loadReadingsCollection)
    .filter((c): c is ReadingsCollection => !!c);
}

export function findReading(collection: string, id: string): { collection: ReadingsCollection; item: ReadingWithState; index: number } | null {
  const c = loadReadingsCollection(collection);
  if (!c) return null;
  const index = c.items.findIndex(i => i.id === id);
  if (index < 0) return null;
  return { collection: c, item: c.items[index], index };
}

/** Readers who consented to acknowledgement, with the items they answered. */
export function loadAcknowledgements(): { display: string; credentials_summary?: string; items: { collection: string; id: string; shelfmark: string }[] }[] {
  const out = new Map<string, { display: string; credentials_summary?: string; items: { collection: string; id: string; shelfmark: string }[] }>();
  for (const c of loadAllReadings()) {
    for (const it of c.items) {
      for (const a of it.answers) {
        if (!a.ack || a.reader.display.toLowerCase() === 'anonymous reader') continue;
        const key = `${a.reader.display}|${a.reader.credentials_summary ?? ''}`;
        if (!out.has(key)) out.set(key, { display: a.reader.display, credentials_summary: a.reader.credentials_summary, items: [] });
        out.get(key)!.items.push({ collection: c.id, id: it.id, shelfmark: it.shelfmark });
      }
    }
  }
  return [...out.values()].sort((a, b) => a.display.localeCompare(b.display));
}
