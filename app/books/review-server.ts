// app/books/review-server.ts — build-time readers for the reviewed books
// (server only: node:fs). The manifests and the linked text are written by
// scripts/import-books.mjs; nothing here is fetched at runtime.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import type { BookVersion, EditionMap, ReviewManifest } from '@/lib/review';
import { BOOKS, type BookRecord } from '@/data/books';
import { RESEARCH_ARCHIVES } from '@/data/researchArchives';
import { archiveBase, publishedDocs } from '@/lib/research-archive';
import { readArchiveManifest } from '../research/manifest-server';

const REVIEW_DIR = path.join(process.cwd(), 'content', 'review');
const TEXT_DIR = path.join(process.cwd(), 'content', 'books');

/** the books whose import has landed (content/review/<slug>.json + content/books/<slug>.md) */
export function publishedBooks(): BookRecord[] {
  return BOOKS.filter((b) => fs.existsSync(path.join(REVIEW_DIR, `${b.slug}.json`)) && fs.existsSync(path.join(TEXT_DIR, `${b.slug}.md`)));
}

export function readReview(slug: string): ReviewManifest | null {
  const file = path.join(REVIEW_DIR, `${slug}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8')) as ReviewManifest;
}

/** every archive leaf that serves an EDITION (a professional transcription), keyed `${archiveId}/${leafId}` — the
    review pane opens a held page's transcription at its leaf's page when the chip links to that leaf (owner 2026-09-21) */
export function editionLeaves(): EditionMap {
  const out: EditionMap = {};
  for (const [archiveId, cfg] of Object.entries(RESEARCH_ARCHIVES)) {
    const m = readArchiveManifest(archiveId);
    if (!m || m.images?.published !== true) continue;
    for (const leaf of m.leaves) {
      const doc = publishedDocs(leaf).find((d) => d.kind === 'edition');
      if (!doc) continue;
      out[`${archiveId}/${leaf.id}`] = {
        archiveId, leafId: leaf.id, leafLabel: cfg.leafLabel, leafUrl: `/research/${archiveId}/leaf/${leaf.id}`,
        pdf: `${archiveBase(archiveId)}/${doc.pdf}`, sha256: doc.sha256 ?? null, page: doc.page ?? 1,
        title: doc.title, credit: doc.credit ?? '', author: doc.author,
        image: `${archiveBase(archiveId)}/${leaf.web ?? leaf.image}`, imageCredit: leaf.credit ?? null,
      };
    }
  }
  return out;
}

const OWNER_TZ = 'America/Chicago';
const localDate = (iso: string) => new Intl.DateTimeFormat('en-CA', { timeZone: OWNER_TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso));

/** the date, in the owner's zone, of the commit this build is building — on a production build (Netlify sets
    CONTEXT=production) that commit is the deploy, so a version the publish record does not carry yet is published
    by it (the build clock when git is unavailable; null outside a production build) */
let deployDay: string | null | undefined;
function deployDate(): string | null {
  if (process.env.CONTEXT !== 'production') return null;
  if (deployDay !== undefined) return deployDay;
  try { deployDay = localDate(execFileSync('git', ['log', '-1', '--format=%cI'], { cwd: process.cwd(), encoding: 'utf8' }).trim()); }
  catch { deployDay = localDate(new Date().toISOString()); }
  return deployDay;
}

type PublishRecord = Record<string, { date: string; commit: string }>;

/** the book's version log, newest first (content/versions/<slug>.json; none = no menu), each version carrying
    its publish date from content/versions/<slug>.published.json (scripts/stamp-published.mjs: the first main
    commit that carried it — the owner's integration, the deploy) — owner 2026-09-26: completion and
    publication are two dates, and the reviewer sees both */
export function readVersions(slug: string): BookVersion[] {
  const dir = path.join(process.cwd(), 'content', 'versions');
  const file = path.join(dir, `${slug}.json`);
  if (!fs.existsSync(file)) return [];
  const v = (JSON.parse(fs.readFileSync(file, 'utf8')) as { versions: BookVersion[] }).versions ?? [];
  const recFile = path.join(dir, `${slug}.published.json`);
  const record: PublishRecord = fs.existsSync(recFile) ? (JSON.parse(fs.readFileSync(recFile, 'utf8')) as { published?: PublishRecord }).published ?? {} : {};
  return [...v].sort((a, b) => b.version - a.version).map((x) => {
    const rec = record[String(x.version)];
    if (rec) return { ...x, published: rec.date, publishedBy: rec.commit };
    const day = deployDate();
    return day ? { ...x, published: day, publishedBy: 'this deploy' } : x;
  });
}

/** the book's text with the citation units wrapped as `cite:` links */
export function readBookText(slug: string): string | null {
  const file = path.join(TEXT_DIR, `${slug}.md`);
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
}
