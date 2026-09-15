// app/books/[slug]/text/page.tsx — the rendered text of a reviewed book (the
// book itself opens in review mode at /books/<slug>). Its citation links lead
// back into review mode at the cited page.
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Columns } from 'lucide-react';
import { bookBySlug } from '@/data/books';
import { publishedUnits } from '@/lib/review';
import { publishedBooks, readBookText, readReview } from '../../review-server';
import { BookText } from '../../_components/BookText';
import { SitePageLayout } from '../../../_components/SitePageLayout';

export const dynamicParams = false;
export function generateStaticParams() {
  return publishedBooks().map((b) => ({ slug: b.slug }));
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const b = bookBySlug((await params).slug);
  if (!b) return { robots: { index: false, follow: false } };
  return { title: `${b.title} — text`, description: b.blurb, alternates: { canonical: `/books/${b.slug}/text` } };
}

const longDate = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

export default async function BookTextPage({ params }: Params) {
  const { slug } = await params;
  const b = bookBySlug(slug);
  const manifest = b ? readReview(slug) : null;
  const text = b ? readBookText(slug) : null;
  if (!b || !manifest || !text) notFound();
  const opens = publishedUnits(manifest).length;
  return (
    <SitePageLayout>
      <main className="container mx-auto px-4 py-6">
        <Link href={`/books/${b.slug}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors no-underline mb-6 font-sans">
          <ArrowLeft className="h-4 w-4" /> {b.title} — review mode
        </Link>
        <div className="grid gap-8 lg:grid-cols-[19rem_1fr] xl:grid-cols-[21rem_1fr] items-start">
          <aside className="lg:sticky lg:top-24 rounded-lg border border-border bg-card shadow-sm p-6 font-sans">
            <p className="text-xs text-muted-foreground mb-2" style={{ fontVariantNumeric: 'tabular-nums' }}>{longDate(b.date)} · {b.venue}</p>
            <h1 className="font-serif text-3xl leading-tight text-foreground" style={{ fontWeight: 580, letterSpacing: '-0.016em' }}>{b.title}</h1>
            <p className="font-serif text-xl text-muted-foreground mt-2 leading-snug">{b.subtitle}</p>
            <p className="text-sm leading-relaxed text-foreground/85 mt-4">{b.blurb}</p>
            <Link href={`/books/${b.slug}`} className="mt-5 flex items-start gap-2.5 rounded-md border border-primary/30 bg-primary/10 px-3 py-2.5 no-underline hover:bg-primary/15 transition-colors">
              <Columns className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
              <span className="text-sm leading-snug text-foreground">
                <span style={{ fontWeight: 600 }}>Review mode</span> — the book beside the pages it cites: {opens.toLocaleString('en-US')} citations open the page they cite, from {Object.keys(manifest.sources).length} sources. Every citation below is a link into it.
              </span>
            </Link>
            <p className="text-xs text-muted-foreground mt-4">Part of <Link href="/books" className="text-primary underline underline-offset-2">Books · review mode</Link>.</p>
          </aside>
          <section className="min-w-0">
            <BookText citeBase={`/books/${b.slug}`}>{text}</BookText>
          </section>
        </div>
      </main>
    </SitePageLayout>
  );
}
