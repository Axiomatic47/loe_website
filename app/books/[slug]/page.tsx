// app/books/[slug]/page.tsx — a reviewed book opens STRAIGHT into review mode
// (owner 2026-09-14/15): its PDF beside the pages it cites. The rendered text
// is one click away at /books/<slug>/text. Params enumerate from the imported
// manifests at build; an unimported slug 404s (dynamicParams=false).
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { bookBySlug } from '@/data/books';
import { reviewMeta } from '@/lib/review';
import { editionLeaves, publishedBooks, readBookText, readReview } from '../review-server';
import { ReviewLoader } from '../_components/ReviewLoader';
import { BookText } from '../_components/BookText';
import { ogImages } from '../../_lib/og-server';

export const dynamicParams = false;
export function generateStaticParams() {
  return publishedBooks().map((b) => ({ slug: b.slug }));
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const b = bookBySlug((await params).slug);
  if (!b) return { robots: { index: false, follow: false } };
  // the social card is the book PDF's first page (scripts/build_og_images.py)
  const og = ogImages(`books-${b.slug}`, `${b.title} — the first page`);
  return {
    title: `${b.title} — review mode`,
    description: `${b.title}: ${b.subtitle}. The book beside the pages it cites, one citation at a time.`,
    alternates: { canonical: `/books/${b.slug}` },
    openGraph: { title: `${b.title} — review mode`, description: b.blurb, type: 'book', url: `/books/${b.slug}`, ...og.openGraph },
    twitter: og.twitter,
  };
}

export default async function BookReviewPage({ params }: Params) {
  const { slug } = await params;
  const b = bookBySlug(slug);
  const manifest = b ? readReview(slug) : null;
  const text = b ? readBookText(slug) : null;
  if (!b || !manifest || !text) notFound();
  // The page ships only `reviewMeta` inline (counts + the PDF record): the 2.4 MB citation manifest is
  // fetched by ReviewLoader from its hashed static JSON, and the rendered text travels only when there
  // is no PDF pane to show instead (the immunity book's text is 880 KB — as RSC payload it tripled
  // the page; kirchner.ink measured a 4.2 MB page as the owner's "loads very slowly", 2026-09-15).
  return (
    <ReviewLoader book={{ slug: b.slug, title: b.title, subtitle: b.subtitle, venue: b.venue }} meta={reviewMeta(manifest)} editions={editionLeaves()}>
      {manifest.pdf ? undefined : <BookText bare citeBase="">{text}</BookText>}
    </ReviewLoader>
  );
}
