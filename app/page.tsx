// app/page.tsx — editorial front page (server port of src/views/Index.tsx).
//
// Structure (owner direction 2026-08-22/23 — the articles carry the page;
// no featured case, no case strip):
//   1. Hero — plain-English statement of what this site is, two CTAs
//      (primary: the academic articles)
//   2. The book — The Subject's Unanswered Plea in the review-mode PDF viewer,
//      read here under the hero buttons (owner 2026-09-18), with the link
//      into review mode
//   3. Prynne epigraph — one quote summarizing why the originals are here
//   4. From the archives — the two Star Chamber primary-source archives
//      (published 2026-08-23 with the TNA reproduction licence in hand)
//   5. Academic articles shelf — the manuscript collection, lead + grid
//      (moved below the archives 2026-09-18, owner's order of the page)
//   6. Books in review mode — the shelf of every imported book
//   7. Featured works — full inline reading of the Declaration of Humanity
//      set (manuscript `featured` flags; Declaration first via
//      featured_order)
//   (The closing quote field is site-wide — rendered by SitePageLayout above
//   the footer on every page, owner 2026-09-08.)
//
// Article counts and archive leaf counts are derived from the content/archive
// manifests at build time.
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/Reveal';
import { ArrowRight, BookOpen, ScrollText } from 'lucide-react';
import { ARTICLE_LEAD, CDO_ARTICLE_CARDS, ARCHIVE_SHELF } from '@/data/homeContent';
import { getComposition } from '@/lib/content-manifest';
import { compositionUrl, sectionUrl } from '@/utils/urls';
import { SitePageLayout } from './_components/SitePageLayout';
import { FeaturedWork } from './_components/FeaturedWork';
import { readArchiveManifest } from './research/manifest-server';
import { publishedBooks, readReview } from './books/review-server';
import { BookPdfViewer } from './books/_components/BookPdfViewer';
import { versioned } from '@/lib/review';

// Title/description/OG come from the root layout defaults (they ARE the
// site defaults); the home page only pins its canonical.
export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <div
    className="text-xs uppercase tracking-[0.1em] text-muted-foreground font-sans mb-3"
    style={{ fontWeight: 600 }}
  >
    {children}
  </div>
);

export default function Home() {
  // Articles shelf (owner 2026-08-29: purely CDO): the lead card is the
  // composition; the grid is individual CDO articles resolved by section
  // slug. Blurbs are editorial; titles/links derive. Missing slugs drop out.
  const lead = ARTICLE_LEAD;
  const leadComp = getComposition('manuscript', ARTICLE_LEAD.slug);
  // the books published in review mode (import landed): a shelf between the archives and the featured works
  const books = publishedBooks();
  // The Subject's Unanswered Plea read on the home page (owner 2026-09-18): the review-mode PDF
  // in the same viewer as /books/<slug>, one page tall at fit width, under the hero buttons
  const plea = books.find((b) => b.slug === 'the-subjects-unanswered-plea') ?? null;
  const pleaReview = plea ? readReview(plea.slug) : null;
  const leadFeatured = leadComp
    ? leadComp.sections
        .filter(s => s.featured)
        .sort((a, b) => (a.featured_order || 999) - (b.featured_order || 999))
    : [];
  const cdoCards = leadComp
    ? CDO_ARTICLE_CARDS.map(entry => ({
        entry,
        section: leadComp.sections.find(s => s.slug === entry.slug),
      })).filter((x): x is { entry: (typeof CDO_ARTICLE_CARDS)[number]; section: NonNullable<typeof x.section> } => !!x.section)
    : [];

  return (
    <SitePageLayout>
      <main className="container mx-auto px-4 py-12">
        {/* ------------------------------------------------ 1. Hero */}
        <section className="max-w-4xl mx-auto text-center pt-8 pb-16">
          <Reveal>
            <Eyebrow>A public legal record</Eyebrow>
          </Reveal>
          <Reveal delay={70}>
            <h1
              className="font-serif text-foreground"
              style={{
                fontSize: 'clamp(36px, 5.5vw, 60px)',
                lineHeight: 1.05,
                letterSpacing: '-0.022em',
                fontWeight: 580,
                marginBottom: '20px',
              }}
            >
              The Laws of Existence
            </h1>
          </Reveal>
          <Reveal delay={140}>
            <p
              className="font-serif text-muted-foreground mx-auto"
              style={{
                fontSize: 'clamp(17px, 2vw, 21px)',
                lineHeight: 1.55,
                maxWidth: '46rem',
                marginBottom: '32px',
              }}
            >
              A unified mathematical framework for consciousness, ethics, and
              reality — and the public record, from the Star Chamber
              manuscripts of 1607 to the modern federal docket.
            </p>
          </Reveal>
          <Reveal delay={210}>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md"
                asChild
              >
                <Link href="/composition/manuscript">
                  Explore the academic articles
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-card text-foreground border-border shadow-sm hover:shadow-md hover:bg-secondary/60"
                asChild
              >
                <Link href="/composition/constitutional">The litigation record</Link>
              </Button>
            </div>
          </Reveal>
        </section>

        {/* ------------------------------ 2. The book — the PDF, read here (owner 2026-09-18) */}
        {plea && pleaReview && (
          <section className="max-w-4xl mx-auto mb-16 -mt-4">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 mb-4">
                <div className="min-w-0">
                  <Eyebrow>The book</Eyebrow>
                  <h2
                    className="font-serif text-foreground"
                    style={{ fontSize: 'clamp(22px, 2.6vw, 28px)', fontWeight: 580, letterSpacing: '-0.018em', lineHeight: 1.2 }}
                  >
                    {plea.title}
                  </h2>
                  {plea.subtitle && <p className="text-sm text-muted-foreground mt-1 font-sans">{plea.subtitle} · {plea.venue}</p>}
                </div>
                <Link
                  href={`/books/${plea.slug}`}
                  className="text-sm text-primary font-sans inline-flex items-center hover:text-primary/80 transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  Open in review mode — the book beside the pages it cites
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <BookPdfViewer
                src={versioned(pleaReview.pdf.file, pleaReview.pdf.served ?? pleaReview.pdf.sha256)}
                bytes={pleaReview.pdf.bytes}
                downloadSrc={pleaReview.pdf.linked ? versioned(pleaReview.pdf.linked.file, pleaReview.pdf.linked.served ?? pleaReview.pdf.linked.sha256) : undefined}
                downloadName={`${plea.slug}.pdf`}
                title={`${plea.title}${plea.subtitle ? `: ${plea.subtitle}` : ''} — ${plea.venue ?? 'working draft'}; ${pleaReview.pdf.pages} pages`}
                height="page"
              />
            </Reveal>
          </section>
        )}

        {/* --------------------------------------------- 3. Prynne epigraph */}
        <section className="max-w-4xl mx-auto mb-16">
          <Reveal>
            <figure className="text-center px-4">
              <blockquote>
                <p
                  className="font-serif italic text-foreground/90 mx-auto"
                  style={{
                    fontSize: 'clamp(19px, 2.4vw, 26px)',
                    lineHeight: 1.5,
                    letterSpacing: '-0.01em',
                    maxWidth: '44rem',
                  }}
                >
                  “how unsafe it is to take Records upon trust, from the
                  reports of learned Judges, who never read nor perused their
                  originals.”
                </p>
              </blockquote>
              <figcaption className="text-sm text-muted-foreground mt-4 font-sans">
                — William Prynne (1669), Keeper of His Majesties Records in the
                Tower of London
              </figcaption>
            </figure>
          </Reveal>
        </section>

        {/* --------------------------------------- 4. From the archives */}
        <section className="max-w-4xl mx-auto mb-16">
          <Reveal>
            <Eyebrow>From the archives</Eyebrow>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ARCHIVE_SHELF.map((a, i) => {
              const manifest = readArchiveManifest(a.id);
              const leafCount = manifest?.leaves?.length || 0;
              // first-leaf thumbnail (owner 2026-08-29) — sync-time rendition
              const firstLeaf = manifest?.leaves?.[0];
              const thumbSrc = firstLeaf?.thumb
                ? `/uploads/research/${a.id}/${firstLeaf.thumb}`
                : null;
              return (
                <Reveal key={a.id} delay={i * 80}>
                  <Link
                    href={`/research/${a.id}`}
                    className="group bg-card border border-border rounded-lg p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 flex flex-col h-full"
                  >
                    <div className="flex items-start gap-3">
                      <ScrollText className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <div className="min-w-0">
                        <h3
                          className="font-serif text-foreground group-hover:text-primary transition-colors"
                          style={{ fontSize: '1.125rem', fontWeight: 580, letterSpacing: '-0.014em', lineHeight: 1.3 }}
                        >
                          {a.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 font-sans" style={{ fontVariantNumeric: 'tabular-nums' }}>
                          {a.ref}
                          <br />
                          {a.detail}
                        </p>
                      </div>
                    </div>
                    {thumbSrc && (
                      <div className="mt-4 rounded-md border border-border overflow-hidden bg-muted">
                        <img
                          src={thumbSrc}
                          alt={`${a.ref} — first leaf`}
                          width={600}
                          height={176}
                          decoding="async"
                          loading="lazy"
                          className="w-full h-44 object-cover object-top group-hover:opacity-90 transition-opacity"
                        />
                      </div>
                    )}
                    <p className="text-sm text-foreground/85 mt-3 font-sans flex-grow">{a.blurb}</p>
                    <p className="text-sm text-primary mt-4 font-sans inline-flex items-center" style={{ fontWeight: 500 }}>
                      {leafCount > 0 ? `Read the manuscript (${leafCount} leaves)` : 'Read the manuscript'}
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </p>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* ------------------------------------ 5. Academic articles shelf */}
        <section className="max-w-4xl mx-auto mb-16">
          <Reveal>
            <Eyebrow>The academic articles</Eyebrow>
          </Reveal>
          {lead && leadComp && (
            <Reveal>
              <div className="bg-card border border-border rounded-xl shadow-sm p-8 md:p-10">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/15 flex-shrink-0 hidden sm:block">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h2
                      className="font-serif text-foreground"
                      style={{ fontSize: '1.75rem', fontWeight: 580, letterSpacing: '-0.018em', lineHeight: 1.2 }}
                    >
                      {leadComp.title}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1 font-sans" style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {leadComp.sections.length} articles
                    </p>
                  </div>
                </div>

                <p className="font-serif text-foreground/90 mt-5" style={{ fontSize: '1.0625rem', lineHeight: 1.65 }}>
                  {lead.blurb}
                </p>

                <div className="mt-5">
                  {leadFeatured.map(s => (
                    <Link
                      key={s.slug}
                      href={sectionUrl(leadComp, s)}
                      className="group flex items-start gap-2.5 rounded-md px-2.5 py-2 -mx-2.5 hover:bg-secondary transition-colors"
                    >
                      <BookOpen className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <p
                        className="text-sm text-foreground group-hover:text-primary transition-colors leading-snug font-sans"
                        style={{ fontWeight: 550 }}
                      >
                        {s.title}
                      </p>
                    </Link>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <Button
                    className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md"
                    asChild
                  >
                    <Link href={compositionUrl(leadComp)}>Start reading</Link>
                  </Button>
                </div>
              </div>
            </Reveal>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {leadComp &&
              cdoCards.map(({ entry, section }, i) => (
                <Reveal key={entry.slug} delay={i * 80}>
                  <Link
                    href={sectionUrl(leadComp, section)}
                    className="group bg-card border border-border rounded-lg p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 flex flex-col h-full"
                  >
                    <h3
                      className="font-serif text-foreground group-hover:text-primary transition-colors"
                      style={{ fontSize: '1.125rem', fontWeight: 580, letterSpacing: '-0.014em', lineHeight: 1.3 }}
                    >
                      {section.title}
                    </h3>
                    <p className="text-sm text-foreground/85 mt-3 font-sans flex-grow">{entry.blurb}</p>
                    <p className="text-sm text-primary mt-4 font-sans inline-flex items-center" style={{ fontWeight: 500 }}>
                      Read the article
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </p>
                  </Link>
                </Reveal>
              ))}
          </div>
        </section>

        {/* ------------------------------------- 6. Books in review mode */}
        {books.length > 0 && (
          <section className="max-w-4xl mx-auto mb-16">
            <Reveal>
              <Eyebrow>Books · review mode</Eyebrow>
            </Reveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {books.map((b, i) => (
                <Reveal key={b.slug} delay={i * 80}>
                  <Link
                    href={`/books/${b.slug}`}
                    className="group bg-card border border-border rounded-lg p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 flex flex-col h-full"
                  >
                    <div className="flex items-start gap-3">
                      <BookOpen className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <div className="min-w-0">
                        <h3
                          className="font-serif text-foreground group-hover:text-primary transition-colors"
                          style={{ fontSize: '1.125rem', fontWeight: 580, letterSpacing: '-0.014em', lineHeight: 1.3 }}
                        >
                          {b.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 font-sans">{b.subtitle}</p>
                      </div>
                    </div>
                    <p className="text-sm text-foreground/85 mt-3 font-sans flex-grow">{b.blurb}</p>
                    <p className="text-sm text-primary mt-4 font-sans inline-flex items-center" style={{ fontWeight: 500 }}>
                      Open in review mode — the book beside the pages it cites
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </p>
                  </Link>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* ------------------------ 7. Featured works — full inline reading */}
        <section className="mb-8">
          <Reveal>
            <div className="max-w-4xl mx-auto">
              <Eyebrow>Featured works</Eyebrow>
            </div>
          </Reveal>
          <FeaturedWork />
        </section>
      </main>
    </SitePageLayout>
  );
}
