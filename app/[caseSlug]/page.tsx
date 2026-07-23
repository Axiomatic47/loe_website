// app/[caseSlug]/page.tsx — bare case URLs.
//
// /kirchner-v-johnson|-ellison|-acosta → landing dossier (server port of the
// vite CaseLandingPage; editorial content shared via src/data/caseLanding.ts).
// /scotus-amicus → renders part 1 directly (published URL — no redirect),
// exactly like the vite ScotusAmicusIndex.
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/Reveal';
import { ArrowLeft, ArrowRight, CalendarClock, FileText, Scale } from 'lucide-react';
import { CASES } from '@/data/caseLanding';
import { getCaseComposition } from '@/lib/content-manifest';
import { CASE_SLUGS, sectionUrl, absoluteUrl, isCaseSlug } from '@/utils/urls';
import { SitePageLayout } from '../_components/SitePageLayout';
import { DocReaderView } from '../_components/DocReaderView';

export const dynamicParams = false;

export function generateStaticParams() {
  return CASE_SLUGS.map(caseSlug => ({ caseSlug }));
}

type Params = { params: Promise<{ caseSlug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { caseSlug } = await params;

  if (caseSlug === 'scotus-amicus') {
    const composition = getCaseComposition('scotus-amicus');
    return {
      title: composition?.title ?? 'SCOTUS Amicus',
      description: composition?.sections[0]?.description,
      alternates: { canonical: '/scotus-amicus' },
      openGraph: {
        title: composition?.title ?? 'SCOTUS Amicus',
        url: absoluteUrl('/scotus-amicus'),
        type: 'article',
      },
    };
  }

  const caseKey = caseSlug.replace('kirchner-v-', '');
  const c = CASES[caseKey];
  if (!c) return {};
  return {
    title: c.caption,
    description: c.summary,
    alternates: { canonical: `/${caseSlug}` },
    openGraph: {
      title: c.caption,
      description: c.summary,
      url: absoluteUrl(`/${caseSlug}`),
      type: 'website',
    },
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

export default async function CasePage({ params }: Params) {
  const { caseSlug } = await params;
  if (!isCaseSlug(caseSlug)) notFound();

  // scotus-amicus has no landing page — its canonical entry is part 1.
  if (caseSlug === 'scotus-amicus') {
    const composition = getCaseComposition('scotus-amicus');
    const first = composition?.sections[0];
    if (!composition || !first) notFound();
    return <DocReaderView collection="constitutional" compositionSlug="scotus-amicus" sectionSlug={first.slug} />;
  }

  const caseKey = caseSlug.replace('kirchner-v-', '');
  const c = CASES[caseKey];
  if (!c) notFound();

  const composition = getCaseComposition(caseSlug);
  const docCount = composition?.sections?.length || null;
  // "Browse the full docket" opens the first section's reader in canonical form.
  const docketHref =
    composition && composition.sections?.[0]
      ? sectionUrl(composition, composition.sections[0])
      : c.operativeHref;

  return (
    <SitePageLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back link */}
          <Reveal>
            <Link
              href="/composition/constitutional"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 font-sans"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              All cases
            </Link>
          </Reveal>

          {/* Case header */}
          <Reveal delay={60}>
            <Eyebrow>{c.court}</Eyebrow>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/15 flex-shrink-0 hidden sm:block mt-1">
                <Scale className="h-6 w-6 text-primary" />
              </div>
              <div className="min-w-0">
                <h1
                  className="font-serif text-foreground"
                  style={{
                    fontSize: 'clamp(28px, 4vw, 42px)',
                    fontWeight: 580,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1,
                  }}
                >
                  {c.caption}
                </h1>
                <p
                  className="text-sm text-muted-foreground mt-2 font-sans"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {c.caseNo}
                  {c.judge ? ` · ${c.judge}` : ''}
                  {docCount ? ` · ${docCount} documents on this site` : ''}
                </p>
              </div>
            </div>

            <p
              className="font-serif text-foreground/90 mt-6"
              style={{ fontSize: '1.0625rem', lineHeight: 1.68 }}
            >
              {c.summary}
            </p>

            {/* Status */}
            <div className="mt-6 bg-secondary border border-border border-l-2 border-l-primary rounded-md px-4 py-3">
              <div className="flex items-start gap-3">
                <CalendarClock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-foreground font-sans" style={{ fontWeight: 600 }}>
                    {c.status}
                  </p>
                  {c.deadline && (
                    <p className="text-sm text-foreground/80 font-sans mt-1">{c.deadline}</p>
                  )}
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md"
                asChild
              >
                <Link href={c.operativeHref}>
                  {c.operativeLabel}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                className="bg-card text-foreground border-border shadow-sm hover:shadow-md hover:bg-secondary/60"
                asChild
              >
                <Link href={docketHref}>
                  Browse the full docket{docCount ? ` (${docCount} documents)` : ''}
                </Link>
              </Button>
            </div>
          </Reveal>

          {/* Procedural history: separated per-proceeding tracks when the
              matter spans several dockets; single timeline + key documents
              otherwise. */}
          {c.proceedings ? (
            <>
              <Reveal delay={120}>
                <div className="mt-12">
                  <Eyebrow>The proceedings</Eyebrow>
                </div>
              </Reveal>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
                {c.proceedings.map((p, pi) => (
                  <Reveal key={p.caseNo} delay={140 + pi * 60}>
                    <div
                      className={
                        p.active
                          ? 'bg-card border border-border border-t-2 border-t-primary rounded-xl shadow-sm p-6 h-full flex flex-col'
                          : 'bg-card border border-border rounded-xl shadow-sm p-6 h-full flex flex-col'
                      }
                    >
                      <Eyebrow>{p.label}</Eyebrow>
                      <p
                        className="font-serif text-foreground"
                        style={{ fontSize: '1.125rem', fontWeight: 580, letterSpacing: '-0.014em', lineHeight: 1.3 }}
                      >
                        {p.caseNo}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 font-sans leading-snug">
                        {p.court}
                        {p.judge ? <><br />{p.judge}</> : null}
                      </p>
                      <p
                        className={
                          p.active
                            ? 'text-sm text-foreground/90 font-sans mt-3'
                            : 'text-sm text-muted-foreground font-sans mt-3'
                        }
                        style={{ fontWeight: p.active ? 600 : 500 }}
                      >
                        {p.disposition}
                      </p>

                      <ol className="relative border-l border-border ml-1.5 space-y-4 mt-5 flex-grow">
                        {p.timeline.map((t, i) => (
                          <li key={i} className="ml-5">
                            <span
                              className={
                                t.upcoming
                                  ? 'absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full border-2 border-primary bg-card'
                                  : 'absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-primary'
                              }
                            />
                            <p
                              className="text-xs text-muted-foreground font-sans"
                              style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}
                            >
                              {t.date}
                              {t.upcoming && (
                                <span className="ml-2 text-primary uppercase tracking-wide text-[10px]">
                                  Upcoming
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-foreground/90 font-sans mt-0.5 leading-snug">
                              {t.event}
                            </p>
                          </li>
                        ))}
                      </ol>

                      {p.keyDocuments && p.keyDocuments.length > 0 && (
                        <div className="mt-5 pt-4 border-t border-border">
                          {p.keyDocuments.map(d => (
                            <Link
                              key={d.href}
                              href={d.href}
                              className="group flex items-start gap-2.5 rounded-md px-2.5 py-2 -mx-2.5 hover:bg-secondary transition-colors"
                            >
                              <FileText className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <div className="min-w-0">
                                <p
                                  className="text-sm text-foreground group-hover:text-primary transition-colors leading-snug font-sans"
                                  style={{ fontWeight: 550 }}
                                >
                                  {d.label}
                                </p>
                                <p
                                  className="text-xs text-muted-foreground mt-0.5 font-sans"
                                  style={{ fontVariantNumeric: 'tabular-nums' }}
                                >
                                  {d.doc} · {d.date}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </Reveal>
                ))}
              </div>
              <Reveal delay={320}>
                <div className="mt-6 text-right">
                  <Link
                    href={docketHref}
                    className="inline-flex items-center text-sm text-primary hover:text-primary/80 font-sans transition-colors"
                    style={{ fontWeight: 550 }}
                  >
                    Browse the full docket
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </div>
              </Reveal>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
              <Reveal delay={120}>
                <div className="bg-card border border-border rounded-xl shadow-sm p-6 md:p-7 h-full">
                  <Eyebrow>Procedural history</Eyebrow>
                  <ol className="relative border-l border-border ml-1.5 space-y-5 mt-4">
                    {c.timeline.map((t, i) => (
                      <li key={i} className="ml-5">
                        <span
                          className={
                            t.upcoming
                              ? 'absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full border-2 border-primary bg-card'
                              : 'absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-primary'
                          }
                        />
                        <p
                          className="text-xs text-muted-foreground font-sans"
                          style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}
                        >
                          {t.date}
                          {t.upcoming && (
                            <span className="ml-2 text-primary uppercase tracking-wide text-[10px]">
                              Upcoming
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-foreground/90 font-sans mt-0.5 leading-snug">
                          {t.event}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>
              </Reveal>

              <Reveal delay={180}>
                <div className="bg-card border border-border rounded-xl shadow-sm p-6 md:p-7 h-full flex flex-col">
                  <Eyebrow>Key documents</Eyebrow>
                  <div className="mt-2 flex-grow">
                    {c.keyDocuments.map(d => (
                      <Link
                        key={d.href}
                        href={d.href}
                        className="group flex items-start gap-3 rounded-md px-3 py-2.5 -mx-3 hover:bg-secondary transition-colors"
                      >
                        <FileText className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p
                            className="text-sm text-foreground group-hover:text-primary transition-colors leading-snug font-sans"
                            style={{ fontWeight: 550 }}
                          >
                            {d.label}
                          </p>
                          <p
                            className="text-xs text-muted-foreground mt-0.5 font-sans"
                            style={{ fontVariantNumeric: 'tabular-nums' }}
                          >
                            {d.doc} · {d.date}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link
                    href={docketHref}
                    className="inline-flex items-center text-sm text-primary hover:text-primary/80 font-sans mt-4 pt-4 border-t border-border transition-colors"
                    style={{ fontWeight: 550 }}
                  >
                    Browse the full docket
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </div>
              </Reveal>
            </div>
          )}

          {/* Related cases */}
          <Reveal delay={220}>
            <div className="mt-10 pt-6 border-t border-border flex flex-wrap gap-x-7 gap-y-2">
              <span className="text-xs uppercase tracking-[0.1em] text-muted-foreground font-sans" style={{ fontWeight: 600 }}>
                Related cases
              </span>
              {Object.entries(CASES)
                .filter(([k]) => k !== caseKey)
                .map(([k, rc]) => (
                  <Link
                    key={k}
                    href={`/kirchner-v-${k}`}
                    className="text-sm text-foreground/80 hover:text-primary font-sans underline-offset-4 hover:underline transition-colors"
                    style={{ fontWeight: 500 }}
                  >
                    {rc.caption}
                  </Link>
                ))}
            </div>
          </Reveal>
        </div>
      </div>
    </SitePageLayout>
  );
}
