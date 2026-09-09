// app/research/open-readings/page.tsx — site-wide index of the Open Readings:
// disputed transcriptions set out for qualified readers to answer (owner
// direction 2026-09-08; plan: agent_notes/_shared/20260908_open_readings_build_plan.md).
// Static: everything is derived at build from content/readings/*.json.
import type { Metadata } from 'next';
import Link from 'next/link';
import { SitePageLayout } from '../../_components/SitePageLayout';
import { Reveal } from '@/components/Reveal';
import { loadAllReadings } from '@/lib/open-readings';
import { Eyebrow, ReadingCard, StatusBadge } from '../_readings/ui';

export const metadata: Metadata = {
  title: 'Open Readings',
  description:
    'Disputed manuscript readings set out for qualified readers: the detail enlarged, our transcription beside the comparison edition, one question, and an answer form.',
  alternates: { canonical: '/research/open-readings' },
};

export default function OpenReadingsIndex() {
  const collections = loadAllReadings();
  const items = collections.flatMap(c => c.items.map(item => ({ c, item })));
  const count = (s: 'open' | 'answered' | 'resolved') => items.filter(x => x.item.status === s).length;

  return (
    <SitePageLayout>
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <Eyebrow>Primary-source research · readings for review</Eyebrow>
            <h1 className="font-serif text-foreground" style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 580, letterSpacing: '-0.02em', lineHeight: 1.12 }}>
              Open Readings
            </h1>
            <p className="font-serif text-foreground/90 mt-5 max-w-3xl" style={{ fontSize: '1.0625rem', lineHeight: 1.68 }}>
              Places where a manuscript's letters are in dispute: where our transcription differs from a published
              edition, or where the image leaves a letter open. Each item shows the disputed detail enlarged, our
              reading beside the comparison, and one question. Readers with the palaeography to judge are invited to
              answer, with their credentials, published on the page or sent to the author alone.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-sans text-muted-foreground">
              <span>{items.length} reading{items.length === 1 ? '' : 's'} in {collections.length} collection{collections.length === 1 ? '' : 's'}</span>
              <span className="flex items-center gap-1.5"><StatusBadge status="open" /> {count('open')}</span>
              <span className="flex items-center gap-1.5"><StatusBadge status="answered" /> {count('answered')}</span>
              <span className="flex items-center gap-1.5"><StatusBadge status="resolved" /> {count('resolved')}</span>
              <Link href="/research/acknowledgements" className="underline underline-offset-4 hover:text-foreground">Acknowledgements</Link>
            </div>
          </Reveal>

          {collections.map(c => (
            <Reveal key={c.id}>
              <section className="mt-12">
                <div className="flex flex-wrap items-baseline justify-between gap-3 mb-5">
                  <div>
                    <Eyebrow>{c.holder ?? 'Collection'}</Eyebrow>
                    <h2 className="font-serif text-foreground" style={{ fontSize: '1.5rem', fontWeight: 580, letterSpacing: '-0.018em', lineHeight: 1.2 }}>
                      <Link href={`/research/${c.id}/readings`} className="hover:underline underline-offset-4">{c.title}</Link>
                    </h2>
                  </div>
                  <span className="text-sm font-sans text-muted-foreground">{c.items.length} reading{c.items.length === 1 ? '' : 's'}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {c.items.map(item => <ReadingCard key={item.id} collection={c} item={item} />)}
                </div>
              </section>
            </Reveal>
          ))}
        </div>
      </main>
    </SitePageLayout>
  );
}
