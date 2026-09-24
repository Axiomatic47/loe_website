// app/books/review-server.ts — build-time readers for the reviewed books
// (server only: node:fs). The manifests and the linked text are written by
// scripts/import-books.mjs; nothing here is fetched at runtime.
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

/** the book's version log, newest first (content/versions/<slug>.json; none = no menu) */
export function readVersions(slug: string): BookVersion[] {
  const file = path.join(process.cwd(), 'content', 'versions', `${slug}.json`);
  if (!fs.existsSync(file)) return [];
  const v = (JSON.parse(fs.readFileSync(file, 'utf8')) as { versions: BookVersion[] }).versions ?? [];
  return [...v].sort((a, b) => b.version - a.version);
}

/** the book's text with the citation units wrapped as `cite:` links */
export function readBookText(slug: string): string | null {
  const file = path.join(TEXT_DIR, `${slug}.md`);
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
}
