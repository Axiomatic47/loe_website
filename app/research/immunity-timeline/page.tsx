// app/research/immunity-timeline/page.tsx — the actual history of immunity, in all its categories, set beside the
// six-step origin story at endqi.org (the author's word 2026-10-06; shared with Campaign Zero as a proposed
// correction to their timeline, and carried on all three sites). The content is public/research/immunity-timeline.json,
// the reviewed work (every fact from the book or a shelf copy; src/lib/immunity-timeline.ts is the shape,
// scripts/validate-timeline.mjs the gate). The body is TimelineBody.tsx, byte-identical on every site; this file is
// lawsofexistence.com's shell around it. No content → 404: the route exists only when the reviewed content does.
//
// bookBase: this site carries the book at /books/<slug>, and its plain-text route /books/<slug>/text prints every
// footnote as remark-gfm does (id="user-content-fn-<note>"), the form the module's bookNoteHref expects.
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SitePageLayout } from '../../_components/SitePageLayout';
import { loadImmunityTimeline } from '@/lib/immunity-timeline.server';
import { TIMELINE_PAGE_PATH } from '@/lib/immunity-timeline';
import { TimelineBody } from './TimelineBody';
import './timeline.css';
import './timeline-loe.css';

export function generateMetadata(): Metadata {
  const t = loadImmunityTimeline();
  if (!t) return { title: 'Immunity timeline', robots: { index: false, follow: false } };
  return {
    title: t.title,
    description: t.standfirst.replace(/[*_`]/g, '').slice(0, 300),
    alternates: { canonical: TIMELINE_PAGE_PATH },
  };
}

export default function ImmunityTimelinePage() {
  const t = loadImmunityTimeline();
  if (!t || t.entries.length === 0) notFound();
  return (
    <SitePageLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <Link href="/books" className="text-sm font-sans text-muted-foreground hover:text-foreground underline underline-offset-4">← Books</Link>
          <div className="mt-6">
            <TimelineBody t={t} bookBase={`/books/${t.provenance.book_slug}`} contactHref="/contact" />
          </div>
        </div>
      </div>
    </SitePageLayout>
  );
}
