// app/books/[slug]/page.tsx — a reviewed book opens STRAIGHT into review mode
// (owner 2026-09-14/15): its PDF beside the pages it cites. The rendered text
// is one click away at /books/<slug>/text. Params enumerate from the imported
// manifests at build; an unimported slug 404s (dynamicParams=false).
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { bookBySlug } from '@/data/books';
import { publishedUnits } from '@/lib/review';
import { publishedBooks, readBookText, readReview } from '../review-server';
import { ReviewBody } from '../_components/ReviewBody';
import { BookText } from '../_components/BookText';

export const dynamicParams = false;
export function generateStaticParams() {
  return publishedBooks().map((b) => ({ slug: b.slug }));
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const b = bookBySlug((await params).slug);
  if (!b) return { robots: { index: false, follow: false } };
  return {
    title: `${b.title} — review mode`,
    description: `${b.title}: ${b.subtitle}. The book beside the pages it cites, one citation at a time.`,
    alternates: { canonical: `/books/${b.slug}` },
    openGraph: { title: `${b.title} — review mode`, description: b.blurb, type: 'book' },
  };
}

export default async function BookReviewPage({ params }: Params) {
  const { slug } = await params;
  const b = bookBySlug(slug);
  const manifest = b ? readReview(slug) : null;
  const text = b ? readBookText(slug) : null;
  if (!b || !manifest || !text) notFound();
  // the book pane is the book's PDF whenever the lane has emitted the overlay; the rendered text
  // is the fallback pane only, so it travels to the browser only when it will be shown (the
  // immunity book's text is 880 KB — as RSC payload it tripled the page)
  return (
    <ReviewBody book={{ slug: b.slug, title: b.title, subtitle: b.subtitle, venue: b.venue }} manifest={manifest} published={publishedUnits(manifest).length}>
      {manifest.pdf ? null : <BookText bare citeBase="">{text}</BookText>}
    </ReviewBody>
  );
}
