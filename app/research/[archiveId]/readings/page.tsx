// app/research/[archiveId]/readings/page.tsx — one collection's open readings.
// The segment is named archiveId by the parent route; here it is a readings
// collection id (content/readings/<id>.json). Unknown ids 404.
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SitePageLayout } from '../../../_components/SitePageLayout';
import { Reveal } from '@/components/Reveal';
import { listReadingCollections, loadReadingsCollection } from '@/lib/open-readings';
import { Eyebrow, ReadingCard } from '../../_readings/ui';

export const dynamicParams = false;
export function generateStaticParams() {
  return listReadingCollections().map(archiveId => ({ archiveId }));
}
type Params = { params: Promise<{ archiveId: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { archiveId } = await params;
  const c = loadReadingsCollection(archiveId);
  if (!c) return { robots: { index: false, follow: false } };
  return {
    title: `${c.title} — open readings`,
    description: c.description ?? `${c.items.length} disputed readings set out for qualified readers to answer.`,
    alternates: { canonical: `/research/${archiveId}/readings` },
  };
}

export default async function ReadingsCollectionPage({ params }: Params) {
  const { archiveId } = await params;
  const c = loadReadingsCollection(archiveId);
  if (!c) notFound();
  return (
    <SitePageLayout>
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <Link href="/research/open-readings" className="text-sm font-sans text-muted-foreground hover:text-foreground underline underline-offset-4">
              ← All open readings
            </Link>
            <div className="mt-6">
              <Eyebrow>{c.holder ?? 'Collection'} · {c.items.length} reading{c.items.length === 1 ? '' : 's'}</Eyebrow>
              <h1 className="font-serif text-foreground" style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 580, letterSpacing: '-0.02em', lineHeight: 1.12 }}>
                {c.title}
              </h1>
              {c.description && (
                <p className="font-serif text-foreground/90 mt-5 max-w-3xl" style={{ fontSize: '1.0625rem', lineHeight: 1.68 }}>{c.description}</p>
              )}
              {c.licence && (
                <p className="text-xs font-sans text-muted-foreground mt-3">
                  Details reproduced from {c.licence.attribution} under{' '}
                  {c.licence.href ? <a href={c.licence.href} className="underline underline-offset-2" rel="license noopener">{c.licence.name}</a> : c.licence.name}.
                </p>
              )}
            </div>
          </Reveal>
          <Reveal>
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {c.items.map(item => <ReadingCard key={item.id} collection={c} item={item} />)}
            </div>
          </Reveal>
        </div>
      </main>
    </SitePageLayout>
  );
}
