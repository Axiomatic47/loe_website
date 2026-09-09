// app/research/acknowledgements/page.tsx — readers who answered an open
// reading and consented to be named, with the items they answered.
import type { Metadata } from 'next';
import Link from 'next/link';
import { SitePageLayout } from '../../_components/SitePageLayout';
import { Reveal } from '@/components/Reveal';
import { loadAcknowledgements } from '@/lib/open-readings';
import { Eyebrow, itemHref } from '../_readings/ui';

export const metadata: Metadata = {
  title: 'Acknowledgements — Open Readings',
  description: 'Readers who answered a disputed manuscript reading and consented to be named.',
  alternates: { canonical: '/research/acknowledgements' },
};

export default function AcknowledgementsPage() {
  const readers = loadAcknowledgements();
  return (
    <SitePageLayout>
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <Link href="/research/open-readings" className="text-sm font-sans text-muted-foreground hover:text-foreground underline underline-offset-4">← Open readings</Link>
            <div className="mt-6">
              <Eyebrow>Open readings</Eyebrow>
              <h1 className="font-serif text-foreground" style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 580, letterSpacing: '-0.02em', lineHeight: 1.12 }}>Acknowledgements</h1>
              <p className="font-serif text-foreground/90 mt-5" style={{ fontSize: '1.0625rem', lineHeight: 1.68 }}>
                The readers named here answered one or more open readings and agreed to be acknowledged. Credentials
                appear as each reader wrote them. Readers who answered anonymously, or asked that their answer reach
                the author alone, are not listed.
              </p>
            </div>
          </Reveal>
          <Reveal>
            {readers.length === 0 ? (
              <p className="mt-10 text-sm font-sans text-muted-foreground border border-border rounded-md bg-secondary px-5 py-4">
                No answers have been published yet. The first readers to answer will be acknowledged here.
              </p>
            ) : (
              <ul className="mt-10 grid gap-4 list-none p-0 m-0">
                {readers.map(r => (
                  <li key={r.display + (r.credentials_summary ?? '')} className="bg-card border border-border rounded-xl shadow-sm p-5 grid gap-1.5">
                    <div className="font-serif text-foreground" style={{ fontSize: '1.125rem', fontWeight: 580 }}>{r.display}</div>
                    {r.credentials_summary && <div className="text-sm font-sans text-muted-foreground">{r.credentials_summary}</div>}
                    <div className="text-sm font-sans text-foreground/85 flex flex-wrap gap-x-3 gap-y-1 pt-1">
                      {r.items.map(it => (
                        <Link key={it.collection + it.id} href={itemHref(it.collection, it.id)} className="text-primary hover:underline underline-offset-4">{it.shelfmark} · {it.id}</Link>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Reveal>
        </div>
      </main>
    </SitePageLayout>
  );
}
