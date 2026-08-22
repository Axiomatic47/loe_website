// app/page.tsx — editorial front page (server port of src/views/Index.tsx).
//
// Structure (owner direction 2026-08-22 — the articles carry the page; no
// featured case):
//   1. Hero — plain-English statement of what this site is, two CTAs
//      (primary: the academic articles)
//   2. Academic articles shelf — the manuscript collection, lead + grid
//   3. Three-case status strip
//   4. Featured work — full inline reading (CMS `featured` flags, same as
//      ever: Declaration of Humanity first via featured_order)
//
// Case status lines are editorial content shared with the vite renderer —
// update src/data/homeContent.ts as the dockets move. Document counts and
// article counts are derived from the content manifest at build time.
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/Reveal';
import { ArrowRight, BookOpen } from 'lucide-react';
import { ARTICLE_SHELF, CASE_STRIP } from '@/data/homeContent';
import { getCollection, getComposition } from '@/lib/content-manifest';
import { compositionUrl, sectionUrl } from '@/utils/urls';
import { SitePageLayout } from './_components/SitePageLayout';
import { FeaturedWork } from './_components/FeaturedWork';

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
  const constitutional = getCollection('constitutional');

  // Live document count across the three cases
  const totalCaseDocs = constitutional.reduce((sum, c) => sum + (c.sections?.length || 0), 0);
  const docCountFor = (match: string) =>
    constitutional.find(c => c.title.toLowerCase().includes(match))?.sections?.length || null;

  // Articles shelf: editorial order + blurbs from ARTICLE_SHELF, everything
  // else derived from the manuscript collection. Missing slugs drop out.
  const shelf = ARTICLE_SHELF.map(entry => ({
    entry,
    comp: getComposition('manuscript', entry.slug),
  })).filter((x): x is { entry: (typeof ARTICLE_SHELF)[number]; comp: NonNullable<ReturnType<typeof getComposition>> } => !!x.comp);
  const [leadItem, ...shelfRest] = shelf;
  const lead = leadItem?.entry;
  const leadComp = leadItem?.comp;
  const leadFeatured = leadComp
    ? leadComp.sections
        .filter(s => s.featured)
        .sort((a, b) => (a.featured_order || 999) - (b.featured_order || 999))
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
                marginBottom: '12px',
              }}
            >
              A unified mathematical framework for consciousness, ethics, and
              reality — and the public record of the federal constitutional
              litigation brought by its author, Joseph Kirchner.
            </p>
            <p className="text-sm text-muted-foreground/80 mb-8 font-sans">
              Three federal cases{totalCaseDocs > 0 ? ` · ${totalCaseDocs} court documents` : ''} · published for
              journalists, attorneys, and the public
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

        {/* ------------------------------------ 2. Academic articles shelf */}
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
            {shelfRest.map(({ entry, comp }, i) => (
              <Reveal key={entry.slug} delay={i * 80}>
                <Link
                  href={compositionUrl(comp)}
                  className="group bg-card border border-border rounded-lg p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 flex flex-col h-full"
                >
                  <h3
                    className="font-serif text-foreground group-hover:text-primary transition-colors"
                    style={{ fontSize: '1.125rem', fontWeight: 580, letterSpacing: '-0.014em', lineHeight: 1.3 }}
                  >
                    {comp.title}
                  </h3>
                  <p className="text-sm text-foreground/85 mt-3 font-sans flex-grow">{entry.blurb}</p>
                  <p className="text-sm text-primary mt-4 font-sans inline-flex items-center" style={{ fontWeight: 500 }}>
                    {comp.sections.length > 1 ? `${comp.sections.length} articles` : 'Read'}
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ------------------------------------------ 3. Three-case strip */}
        <section className="max-w-4xl mx-auto mb-20">
          <Reveal>
            <Eyebrow>The cases</Eyebrow>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CASE_STRIP.map((c, i) => (
              <Reveal key={c.caseNo} delay={i * 80}>
                <Link
                  href={c.href}
                  className="group bg-card border border-border rounded-lg p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 flex flex-col h-full"
                >
                  <h3
                    className="font-serif text-foreground group-hover:text-primary transition-colors"
                    style={{ fontSize: '1.125rem', fontWeight: 580, letterSpacing: '-0.014em', lineHeight: 1.3 }}
                  >
                    {c.caption}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1.5 font-sans" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {c.court}
                    <br />
                    {c.caseNo}
                  </p>
                  <p className="text-sm text-foreground/85 mt-3 font-sans flex-grow">{c.status}</p>
                  <p className="text-sm text-primary mt-4 font-sans inline-flex items-center" style={{ fontWeight: 500 }}>
                    {docCountFor(c.matchTitle)
                      ? `${docCountFor(c.matchTitle)} documents`
                      : 'View documents'}
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ------------------------- 4. Featured work — full inline reading */}
        <section className="mb-8">
          <Reveal>
            <div className="max-w-4xl mx-auto">
              <Eyebrow>Featured research &amp; evidence</Eyebrow>
            </div>
          </Reveal>
          <FeaturedWork />
        </section>
      </main>
    </SitePageLayout>
  );
}
