// app/research/[archiveId]/readings/[id]/page.tsx — one open reading: the
// disputed detail enlarged on a dark plate, our reading beside the comparison
// edition, the question, then (phase three) the answer form and any published
// answers. Static; unknown ids 404.
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SitePageLayout } from '../../../../_components/SitePageLayout';
import { Reveal } from '@/components/Reveal';
import { findReading, listReadingCollections, loadReadingsCollection } from '@/lib/open-readings';
import { Eyebrow, LegibilityBadge, LicenceLine, StatusBadge, itemHref } from '../../../_readings/ui';
import { ReadingText, renderBidi } from '../../../_readings/bidi';
import { ReadingAnswerForm } from '../../../_readings/ReadingAnswerForm';
import { LEGAL_CONTACT_EMAIL } from '@/components/legal/prose';

export const dynamicParams = false;
export function generateStaticParams() {
  const out: { archiveId: string; id: string }[] = [];
  for (const archiveId of listReadingCollections()) {
    for (const item of loadReadingsCollection(archiveId)?.items ?? []) out.push({ archiveId, id: item.id });
  }
  return out;
}
type Params = { params: Promise<{ archiveId: string; id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { archiveId, id } = await params;
  const found = findReading(archiveId, id);
  if (!found) return { robots: { index: false, follow: false } };
  const { item } = found;
  return {
    title: `${item.shelfmark}, ${item.leaf}, line ${item.line} — open reading`,
    description: item.question,
    alternates: { canonical: itemHref(archiveId, id) },
  };
}

export default async function ReadingItemPage({ params }: Params) {
  const { archiveId, id } = await params;
  const found = findReading(archiveId, id);
  if (!found) notFound();
  const { collection, item, index } = found;
  const prev = index > 0 ? collection.items[index - 1] : null;
  const next = index < collection.items.length - 1 ? collection.items[index + 1] : null;
  const holderLabel = item.source.kind === 'archive' ? 'View on the leaf' : `View at ${item.source.holder ?? 'the holder'}`;
  const holderHref = item.source.kind === 'archive' ? `/research/${item.source.archiveId}/leaf/${item.source.leafId}` : item.source.href;

  return (
    <SitePageLayout>
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm font-sans text-muted-foreground">
              <Link href={`/research/${collection.id}/readings`} className="hover:text-foreground underline underline-offset-4">← {collection.title}</Link>
              <span>{index + 1} of {collection.items.length}</span>
            </div>
            <div className="mt-6">
              <Eyebrow>{item.shelfmark} · {item.leaf} · line {item.line} · {item.language === 'he' ? 'Hebrew' : item.language}</Eyebrow>
              <h1 className="font-serif text-foreground" style={{ fontSize: 'clamp(24px, 3.4vw, 36px)', fontWeight: 580, letterSpacing: '-0.02em', lineHeight: 1.18 }}>
                {renderBidi(item.question)}
              </h1>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <LegibilityBadge legibility={item.legibility} />
                <StatusBadge status={item.status} />
              </div>
            </div>
          </Reveal>

          {/* the detail */}
          <Reveal>
            <figure className="mt-8 m-0 rounded-xl overflow-hidden border border-border shadow-sm bg-[#1a1f2a]">
              <div className="p-5 sm:p-8 flex items-center justify-center">
                {item.crop ? (
                  <img
                    src={item.crop}
                    alt={`${item.shelfmark}, ${item.leaf}, line ${item.line}: the disputed detail enlarged ${item.zoom}×`}
                    className="w-full h-auto rounded-sm"
                    style={{ imageRendering: 'auto' }}
                  />
                ) : (
                  <p className="text-sm font-sans text-white/70 m-0 text-center py-10">
                    This holder does not permit the image to be reproduced here. Open the folio at the holder to see the disputed detail.
                  </p>
                )}
              </div>
              <figcaption className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-white/10 text-xs font-sans text-white/70">
                <span>Detail enlarged {item.zoom}× from the {item.image.url.includes('!2000,2000') ? '2000-pixel ' : ''}image · region {item.region.w}×{item.region.h} px</span>
                {holderHref && (
                  <a href={holderHref} className="text-white underline underline-offset-4 hover:no-underline" rel="noopener">{holderLabel} →</a>
                )}
              </figcaption>
            </figure>
          </Reveal>

          {/* the two readings */}
          <Reveal>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-card border border-border rounded-xl shadow-sm p-6 grid gap-3">
                <Eyebrow>Our reading</Eyebrow>
                <ReadingText text={item.transcription.text} />
                {item.transcription.ref && <p className="text-xs font-sans text-muted-foreground m-0">{item.transcription.ref}</p>}
              </div>
              <div className="bg-card border border-border rounded-xl shadow-sm p-6 grid gap-3">
                <Eyebrow>Comparison</Eyebrow>
                <ReadingText text={item.comparison.text} />
                <p className="text-xs font-sans text-muted-foreground m-0">
                  {item.comparison.edition}{item.comparison.page ? `, p. ${item.comparison.page}` : ''}
                </p>
              </div>
            </div>
          </Reveal>

          {item.context && (
            <Reveal>
              <div className="mt-6 prose max-w-none">
                <p className="font-serif text-foreground/90" style={{ fontSize: '1.0625rem', lineHeight: 1.72 }}>{renderBidi(item.context)}</p>
              </div>
            </Reveal>
          )}

          {item.resolution && (
            <Reveal>
              <div className="mt-6 bg-secondary border border-border border-l-2 border-l-primary rounded-md px-5 py-4 text-sm font-sans text-foreground/85 leading-relaxed">
                <span style={{ fontWeight: 600 }}>Resolved {item.resolution.date}.</span> {item.resolution.decision}
                {item.resolution.rests_on?.length ? <> Rests on the readings of {item.resolution.rests_on.join(', ')}.</> : null}
              </div>
            </Reveal>
          )}

          {/* published answers */}
          {item.answers.length > 0 && (
            <Reveal>
              <section className="mt-10">
                <Eyebrow>Published answers · {item.answers.length}</Eyebrow>
                <ol className="grid gap-3 list-none p-0 m-0">
                  {item.answers.map((a, i) => (
                    <li key={i} className="bg-card border border-border rounded-xl shadow-sm p-5 grid gap-2">
                      <div className="flex flex-wrap items-baseline gap-2 text-sm font-sans">
                        <span className="font-serif text-primary" style={{ fontSize: '1.25rem', fontWeight: 600 }}>{a.letter}</span>
                        <span className="text-foreground" style={{ fontWeight: 500 }}>{a.reader.display}</span>
                        {a.reader.credentials_summary && <span className="text-muted-foreground">· {a.reader.credentials_summary}</span>}
                        <span className="text-muted-foreground ml-auto">{a.published}</span>
                      </div>
                      {a.reading && <ReadingText text={a.reading} size="md" />}
                      {a.note && <p className="font-serif text-foreground/90 m-0" style={{ fontSize: '1rem', lineHeight: 1.6 }}>{renderBidi(a.note)}</p>}
                    </li>
                  ))}
                </ol>
              </section>
            </Reveal>
          )}

          {/* answer form */}
          <Reveal>
            <section id="answer" className="mt-10 bg-card border border-border rounded-xl shadow-sm p-6 sm:p-8">
              <Eyebrow>Answer this reading</Eyebrow>
              <p className="font-serif text-foreground/90 mt-1 mb-6" style={{ fontSize: '1.0625rem', lineHeight: 1.68 }}>
                If you read this hand, say which reading the detail supports. Give your credentials so the author can weigh the
                answer and, if you agree, acknowledge you. Nothing is published until the author has read it.
              </p>
              <ReadingAnswerForm
                collection={collection.id}
                itemId={item.id}
                ourReading={item.transcription.text}
                comparisonReading={item.comparison.text}
                language={item.language}
                resolved={!!item.resolution}
                contactEmail={LEGAL_CONTACT_EMAIL}
              />
            </section>
          </Reveal>

          <Reveal>
            <div className="mt-10 pt-6 border-t border-border grid gap-4">
              <LicenceLine item={item} />
              <div className="flex justify-between gap-4 text-sm font-sans">
                {prev ? <Link href={itemHref(collection.id, prev.id)} className="text-primary hover:underline underline-offset-4">← Previous reading</Link> : <span />}
                {next ? <Link href={itemHref(collection.id, next.id)} className="text-primary hover:underline underline-offset-4">Next reading →</Link> : <span />}
              </div>
            </div>
          </Reveal>
        </div>
      </main>
    </SitePageLayout>
  );
}
