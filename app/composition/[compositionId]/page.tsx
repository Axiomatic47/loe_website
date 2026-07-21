// app/composition/[compositionId]/page.tsx — collection landing pages.
//
// Editorial redesign (owner direction 2026-07-21): these are the public
// reading-room doors, not CMS grids. Each collection gets an eyebrow, a
// serif title, one factual lede, and a quiet count line; cards follow the
// home/case-page design language (serif titles, tabular meta, terracotta
// hover, ArrowRight nudge). Excerpts are cleaned — markdown tokens, leading
// "Summary"/byline boilerplate, and placeholder text never reach the page;
// when no honest excerpt exists, the card shows its section titles instead.
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, Music, Scale } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { getCollection, ALL_COLLECTIONS } from '@/lib/content-manifest';
import type { CollectionType, Composition } from '@/lib/content-types';
import { compositionUrl } from '@/utils/urls';
import { SitePageLayout } from '../../_components/SitePageLayout';

export const dynamicParams = false;

export function generateStaticParams() {
  return ALL_COLLECTIONS.map(compositionId => ({ compositionId }));
}

// ---------------------------------------------------------------------------
// Per-collection editorial framing (title/lede are page copy, not data)
// ---------------------------------------------------------------------------
interface CollectionPageConfig {
  eyebrow: string;
  title: string;
  lede: string;
  itemNoun: [string, string]; // singular, plural
  unitNoun: [string, string];
  cta: string;
}

const COLLECTION_PAGES: Record<string, CollectionPageConfig> = {
  manuscript: {
    eyebrow: 'Research library',
    title: 'Research',
    lede:
      'The Laws of Existence manuscripts — a unified mathematical framework for consciousness, ethics, and reality — published here in full.',
    itemNoun: ['manuscript', 'manuscripts'],
    unitNoun: ['section', 'sections'],
    cta: 'Read the manuscript',
  },
  data: {
    eyebrow: 'Evidence collections',
    title: 'Evidence',
    lede:
      'Documented AI-system testimonies, forensic records, and simulations — published with the signatures, public keys, and verification scripts needed to authenticate each item independently.',
    itemNoun: ['collection', 'collections'],
    unitNoun: ['item', 'items'],
    cta: 'View the collection',
  },
  constitutional: {
    eyebrow: 'The federal record',
    title: 'Cases',
    lede:
      'The filed record of the federal constitutional litigation. Every document is the as-filed version and can be verified independently against the courts’ dockets.',
    itemNoun: ['matter', 'matters'],
    unitNoun: ['document', 'documents'],
    cta: 'View case documents',
  },
  copyright: {
    eyebrow: 'Copyright program',
    title: 'Copyright Holder Notifications',
    lede:
      'Formal notifications delivered to publishers and rights holders regarding documented use of protected works.',
    itemNoun: ['notification', 'notifications'],
    unitNoun: ['publisher', 'publishers'],
    cta: 'View notifications',
  },
  timeline: {
    eyebrow: 'Chronology',
    title: 'Timeline',
    lede: 'Chronological records of the framework’s development and documented AI-system events.',
    itemNoun: ['record', 'records'],
    unitNoun: ['section', 'sections'],
    cta: 'View the record',
  },
  map: {
    eyebrow: 'Data visualization',
    title: 'Egalitarian World Map',
    lede: 'Country-level analyses from the egalitarian world-map dataset.',
    itemNoun: ['dataset', 'datasets'],
    unitNoun: ['entry', 'entries'],
    cta: 'View the data',
  },
};

const noun = ([singular, plural]: [string, string], n: number) => (n === 1 ? singular : plural);

// ---------------------------------------------------------------------------
// Excerpt hygiene — data text reaches the page only after cleanup
// ---------------------------------------------------------------------------
const PLACEHOLDER_RE = /blank page|under construction|coming soon|lorem ipsum|placeholder/i;

function cleanExcerpt(raw: string | undefined): string | null {
  if (!raw) return null;
  let t = raw
    .replace(/^#.*$/gm, ' ') // headings
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links → text
    .replace(/[#*_`>|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^Summary[:.\s—–-]+/i, '')
    .replace(/^Joseph(\s+D\.)?\s+Kirchner[.,:\s—–-]+/i, '');
  // Front-matter before an early horizontal rule (byline, affiliation) is
  // not an excerpt — drop it when it isn't a real sentence.
  t = t.replace(/^(.{0,100}?)\s*-{3,}\s*/, (m, head) => (/[.!?]/.test(head) ? m : ''));
  t = t.replace(/\s-{3,}\s/g, ' ').replace(/\s+/g, ' ').trim();
  if (!t || t.length < 40 || PLACEHOLDER_RE.test(t)) return null;
  if (t.length > 220) {
    const cut = t.slice(0, 220);
    t = cut.slice(0, Math.max(cut.lastIndexOf(' '), 180)).trimEnd() + '…';
  }
  return t;
}

function compositionExcerpt(c: Composition): string | null {
  const first = c.sections?.[0];
  return (
    cleanExcerpt(first?.description) ??
    cleanExcerpt(first?.content_level_1) ??
    cleanExcerpt(first?.content_level_3)
  );
}

function contentsLine(c: Composition): string | null {
  const titles = (c.sections ?? []).map(s => s.title).filter(Boolean);
  if (!titles.length) return null;
  const shown = titles.slice(0, 3).join(' · ');
  return titles.length > 3 ? `${shown} · +${titles.length - 3} more` : shown;
}

// Processor/CMS label suffixes never reach the page ("… - Case Documents",
// "… (Enhanced)") — the data keeps them, the presentation drops them.
function displayTitle(title: string): string {
  return title
    .replace(/\s*[-–—]\s*Case Documents$/i, '')
    .replace(/\s*\(Enhanced\)$/i, '')
    .trim();
}

// ---------------------------------------------------------------------------
type Params = { params: Promise<{ compositionId: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { compositionId } = await params;
  const page = COLLECTION_PAGES[compositionId];
  if (!page) return {};
  return {
    title: page.title,
    description: page.lede,
    alternates: { canonical: `/composition/${compositionId}` },
  };
}

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <div
    className="text-xs uppercase tracking-[0.1em] text-muted-foreground font-sans mb-3"
    style={{ fontWeight: 600 }}
  >
    {children}
  </div>
);

export default async function CompositionsGridPage({ params }: Params) {
  const { compositionId } = await params;
  if (!(ALL_COLLECTIONS as string[]).includes(compositionId)) notFound();

  const compositions = getCollection(compositionId as CollectionType);
  const page = COLLECTION_PAGES[compositionId] ?? {
    eyebrow: 'Collection',
    title: 'Content',
    lede: '',
    itemNoun: ['item', 'items'] as [string, string],
    unitNoun: ['section', 'sections'] as [string, string],
    cta: 'View',
  };
  const totalUnits = compositions.reduce((n, c) => n + (c.sections?.length || 0), 0);

  return (
    <SitePageLayout>
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Back link */}
          <Reveal>
            <Link
              href="/"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 font-sans"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Home
            </Link>
          </Reveal>

          {/* Header */}
          <Reveal delay={60}>
            <Eyebrow>{page.eyebrow}</Eyebrow>
            <h1
              className="font-serif text-foreground"
              style={{
                fontSize: 'clamp(30px, 4.5vw, 44px)',
                fontWeight: 580,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              {page.title}
            </h1>
            {page.lede && (
              <p
                className="font-serif text-foreground/90 mt-4"
                style={{ fontSize: '1.0625rem', lineHeight: 1.68, maxWidth: '46rem' }}
              >
                {page.lede}
              </p>
            )}
            {compositions.length > 0 && (
              <p
                className="text-sm text-muted-foreground mt-3 font-sans"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {compositions.length} {noun(page.itemNoun, compositions.length)}
                {totalUnits > 0 && (
                  <>
                    {' · '}
                    {totalUnits} {noun(page.unitNoun, totalUnits)}
                  </>
                )}
              </p>
            )}
          </Reveal>

          {/* Grid */}
          {compositions.length === 0 ? (
            <Reveal delay={120}>
              <div className="mt-12 bg-card border border-border rounded-xl shadow-sm p-10 text-center">
                <p className="text-muted-foreground font-sans text-sm">
                  Nothing has been published in this collection yet.
                </p>
              </div>
            </Reveal>
          ) : compositionId === 'constitutional' ? (
            /* Cases — docket-style rows */
            <div className="mt-10 space-y-4">
              {compositions.map((composition, i) => {
                const docCount = composition.sections?.length || 0;
                const excerpt = compositionExcerpt(composition);
                const contents = excerpt ? null : contentsLine(composition);

                return (
                  <Reveal key={composition.slug} delay={Math.min(120 + i * 60, 360)}>
                    <Link
                      href={compositionUrl(composition)}
                      className="group flex items-start gap-4 bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200"
                    >
                      <div className="p-3 rounded-lg bg-primary/15 flex-shrink-0 hidden sm:block">
                        <Scale className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2
                          className="font-serif text-foreground group-hover:text-primary transition-colors"
                          style={{ fontSize: '1.25rem', fontWeight: 580, letterSpacing: '-0.014em', lineHeight: 1.3 }}
                        >
                          {displayTitle(composition.title)}
                        </h2>
                        <p
                          className="text-xs text-muted-foreground mt-1.5 font-sans"
                          style={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                          {docCount} {noun(page.unitNoun, docCount)} · as filed
                        </p>
                        {excerpt && (
                          <p className="text-sm text-foreground/85 mt-3 font-sans leading-relaxed line-clamp-2">
                            {excerpt}
                          </p>
                        )}
                        {contents && (
                          <p className="text-sm text-muted-foreground mt-3 font-sans leading-snug line-clamp-2">
                            {contents}
                          </p>
                        )}
                        <p
                          className="text-sm text-primary mt-4 font-sans inline-flex items-center"
                          style={{ fontWeight: 500 }}
                        >
                          {page.cta}
                          <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </p>
                      </div>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          ) : compositionId === 'copyright' ? (
            /* Copyright notifications — work · artist · publishers */
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {compositions.map((composition, i) => {
                const titleParts = composition.title.split(' - ');
                const songName = titleParts[0] || composition.title;
                const artistName = titleParts.slice(1).join(' - ');
                const publishers = (composition.sections ?? []).map(s => s.title).filter(Boolean);

                return (
                  <Reveal key={composition.slug} delay={Math.min(120 + i * 50, 360)}>
                    <Link
                      href={compositionUrl(composition)}
                      className="group bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 flex flex-col h-full"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/15 flex-shrink-0">
                          <Music className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h2
                            className="font-serif text-foreground group-hover:text-primary transition-colors"
                            style={{ fontSize: '1.125rem', fontWeight: 580, letterSpacing: '-0.014em', lineHeight: 1.3 }}
                          >
                            {songName}
                          </h2>
                          {artistName && (
                            <p className="text-xs text-muted-foreground mt-1 font-sans">{artistName}</p>
                          )}
                        </div>
                      </div>
                      {publishers.length > 0 && (
                        <p className="text-sm text-muted-foreground mt-3 font-sans leading-snug line-clamp-2 flex-grow">
                          {publishers.join(' · ')}
                        </p>
                      )}
                      <p
                        className="text-sm text-primary mt-4 font-sans inline-flex items-center"
                        style={{ fontWeight: 500 }}
                      >
                        {publishers.length} {noun(page.unitNoun, publishers.length)}
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </p>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          ) : (
            /* Standard — manuscript, data, timeline, map */
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
              {compositions.map((composition, i) => {
                const sectionCount = composition.sections?.length || 0;
                const excerpt = compositionExcerpt(composition);
                const contents = excerpt ? null : contentsLine(composition);

                return (
                  <Reveal key={composition.slug} delay={Math.min(120 + i * 60, 360)}>
                    <Link
                      href={compositionUrl(composition)}
                      className="group bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 flex flex-col h-full"
                    >
                      <h2
                        className="font-serif text-foreground group-hover:text-primary transition-colors"
                        style={{ fontSize: '1.25rem', fontWeight: 580, letterSpacing: '-0.014em', lineHeight: 1.3 }}
                      >
                        {displayTitle(composition.title)}
                      </h2>
                      <p
                        className="text-xs text-muted-foreground mt-1.5 font-sans"
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                      >
                        {sectionCount} {noun(page.unitNoun, sectionCount)}
                      </p>
                      {excerpt ? (
                        <p className="text-sm text-foreground/85 mt-3 font-sans leading-relaxed line-clamp-3 flex-grow">
                          {excerpt}
                        </p>
                      ) : contents ? (
                        <p className="text-sm text-muted-foreground mt-3 font-sans leading-snug line-clamp-3 flex-grow">
                          {contents}
                        </p>
                      ) : (
                        <span className="flex-grow" />
                      )}
                      <p
                        className="text-sm text-primary mt-4 font-sans inline-flex items-center"
                        style={{ fontWeight: 500 }}
                      >
                        {page.cta}
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </p>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </SitePageLayout>
  );
}
