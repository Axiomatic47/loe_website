// app/books/page.tsx — the books published in REVIEW MODE: each opens straight
// into the book beside the pages it cites (owner 2026-09-15). Presentation copy
// from src/data/books.ts; counts from the import's manifests at build.
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, Columns } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { publishedUnits } from '@/lib/review';
import { SitePageLayout } from '../_components/SitePageLayout';
import { publishedBooks, readReview } from './review-server';

export const metadata: Metadata = {
  title: 'Books — review mode',
  description: 'Books from the research library, published beside the pages they cite: every citation in the notes opens the cited page.',
  alternates: { canonical: '/books' },
};

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <div className="text-xs uppercase tracking-[0.1em] text-muted-foreground font-sans mb-3" style={{ fontWeight: 600 }}>
    {children}
  </div>
);

const longDate = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

export default function BooksPage() {
  const books = publishedBooks();
  return (
    <SitePageLayout>
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <Eyebrow>Books · review mode</Eyebrow>
            <h1 className="font-serif text-foreground" style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 580, letterSpacing: '-0.02em', lineHeight: 1.12 }}>
              Check the work at the page.
            </h1>
            <p className="text-base text-foreground/85 mt-4 font-sans leading-relaxed max-w-3xl">
              Each book here is published beside the pages it cites. The book opens as its PDF; every citation in the notes
              is a link, and a click opens the cited page in a reading copy of the source, scrolled to the page, with the cited
              pages marked — so a quotation and its pin can be read against the original without leaving the screen. Only
              public-domain pages are published; a page still in copyright, or reproduced under a licence, is held in the
              library and marked rather than shown.
            </p>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-5">
            {books.map((b, i) => {
              const m = readReview(b.slug);
              const opens = m ? publishedUnits(m).length : 0;
              const sources = m ? Object.keys(m.sources).length : 0;
              return (
                <Reveal key={b.slug} delay={i * 80}>
                  <article className="bg-card border border-border rounded-lg shadow-sm p-6 sm:p-8">
                    <p className="text-xs text-muted-foreground font-sans" style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {b.collection} · {b.venue} · {longDate(b.date)}
                    </p>
                    <h2 className="font-serif text-foreground mt-2" style={{ fontSize: '1.75rem', fontWeight: 580, letterSpacing: '-0.016em', lineHeight: 1.2 }}>
                      <Link href={`/books/${b.slug}`} className="hover:text-primary transition-colors no-underline">{b.title}</Link>
                    </h2>
                    <p className="font-serif text-xl text-muted-foreground mt-1 leading-snug">{b.subtitle}</p>
                    <p className="text-sm text-foreground/85 mt-4 font-sans leading-relaxed">{b.blurb}</p>
                    <div className="mt-5 flex flex-wrap items-center gap-3 font-sans">
                      <Link href={`/books/${b.slug}`} className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm no-underline hover:bg-primary/90 shadow-sm" style={{ fontWeight: 600 }}>
                        <Columns className="h-4 w-4" /> Open in review mode <ArrowRight className="h-4 w-4" />
                      </Link>
                      <Link href={`/books/${b.slug}/text`} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground no-underline hover:bg-muted" style={{ fontWeight: 500 }}>
                        <BookOpen className="h-4 w-4" /> Read as text
                      </Link>
                      {m && (
                        <span className="text-xs text-muted-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>
                          {opens.toLocaleString('en-US')} of {m.units.length.toLocaleString('en-US')} citations open a published page · {sources} sources
                          {m.pdf ? ` · PDF rendered ${m.pdf.rendered}, ${m.pdf.pages} pp.` : ''}
                        </span>
                      )}
                    </div>
                  </article>
                </Reveal>
              );
            })}
            {books.length === 0 && (
              <div className="bg-secondary border border-border border-l-2 border-l-primary rounded-md px-5 py-4 text-sm font-sans text-foreground/85">
                No book has been imported yet. Run <code>node scripts/import-books.mjs &lt;slug&gt;</code> locally on the drafter’s signal.
              </div>
            )}
          </div>
        </div>
      </main>
    </SitePageLayout>
  );
}
