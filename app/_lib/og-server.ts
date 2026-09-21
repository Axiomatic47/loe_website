// app/_lib/og-server.ts — the page's social card (server only: node:fs at build).
// scripts/build_og_images.py writes one 1200×630 JPEG per page under public/og/<key>.jpg (owner
// 2026-09-21: the STAC page shows its first membrane, the HLS page its first folio, an article its first
// page); a page whose card is missing keeps the site's default /og-image.png. Keys, as the script names them:
//   research-<archiveId> · research-<archiveId>-<leafId> · books-<slug> · article-<compositionSlug>-<sectionSlug>
import fs from 'node:fs';
import path from 'node:path';

export const DEFAULT_OG = '/og-image.png';

/** the card's site path when it exists, else the default */
export function ogCard(key: string): string {
  const rel = `/og/${key}.jpg`;
  return fs.existsSync(path.join(process.cwd(), 'public', rel)) ? rel : DEFAULT_OG;
}

/** openGraph + twitter image blocks for a page's generateMetadata */
export function ogImages(key: string, alt: string) {
  const url = ogCard(key);
  return {
    openGraph: { images: [{ url, width: 1200, height: 630, alt }] },
    twitter: { card: 'summary_large_image' as const, images: [url] },
  };
}
