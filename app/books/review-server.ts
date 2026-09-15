// app/books/review-server.ts — build-time readers for the reviewed books
// (server only: node:fs). The manifests and the linked text are written by
// scripts/import-books.mjs; nothing here is fetched at runtime.
import fs from 'node:fs';
import path from 'node:path';
import type { ReviewManifest } from '@/lib/review';
import { BOOKS, type BookRecord } from '@/data/books';

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

/** the book's text with the citation units wrapped as `cite:` links */
export function readBookText(slug: string): string | null {
  const file = path.join(TEXT_DIR, `${slug}.md`);
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
}
