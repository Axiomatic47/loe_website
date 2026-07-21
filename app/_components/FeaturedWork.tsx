// app/_components/FeaturedWork.tsx — server port of the vite
// FeaturedWorkSection: full inline reading of the CMS-flagged featured
// content. Same selection rule (a section shows when it is explicitly
// featured, or when its composition is featured and none of its sections
// are), same featured_order sort with stable collection-order ties.
// The vite dev-only debug block is not ported — these pages prerender with
// NODE_ENV=production, so it could never render here.
import Link from 'next/link';
import { Reveal } from '@/components/Reveal';
import { getCollection } from '@/lib/content-manifest';
import type { CollectionType, Section } from '@/lib/content-types';
import { sectionUrl } from '@/utils/urls';
import {
  PDFViewer,
  CollapsibleSummary,
  ImageEnhancedMarkdownRenderer,
} from './client-islands';

// Collections the homepage actually displays (copyright is the only one it
// never shows), in the vite iteration order — the stable sort keeps it for
// featured_order ties.
const HOME_COLLECTIONS: CollectionType[] = [
  'manuscript',
  'data',
  'constitutional',
  'timeline',
  'map',
];

const COLLECTION_DISPLAY: Record<string, string> = {
  manuscript: 'Research',
  data: 'Evidence',
  constitutional: 'Cases',
  timeline: 'Timeline',
  map: 'World Map',
};

interface FeaturedEntry {
  section: Section;
  collection: CollectionType;
  readMoreHref: string;
}

function collectFeatured(): FeaturedEntry[] {
  const featured: FeaturedEntry[] = [];
  for (const collection of HOME_COLLECTIONS) {
    for (const comp of getCollection(collection)) {
      const hasAnyFeaturedSections = comp.sections.some(s => s.featured);
      for (const section of comp.sections) {
        if (section.featured || (comp.featured && !hasAnyFeaturedSections)) {
          featured.push({ section, collection, readMoreHref: sectionUrl(comp, section) });
        }
      }
    }
  }
  // featured_order ascending; 0/undefined sink to the end.
  return featured.sort(
    (a, b) => (a.section.featured_order || 999) - (b.section.featured_order || 999)
  );
}

export function FeaturedWork() {
  const entries = collectFeatured();
  if (entries.length === 0) return null;

  return (
    <div className="space-y-24">
      {entries.map(({ section, collection, readMoreHref }, index) => (
        <section key={readMoreHref} className="max-w-4xl mx-auto">
          <Reveal>
            <div className="relative rounded-xl p-8 sm:p-12 bg-card border border-border shadow-sm">
              <h2
                className="text-4xl font-serif mb-8 text-foreground text-center"
                style={{ letterSpacing: '-0.022em', fontWeight: 580 }}
              >
                {section.title}
              </h2>

              {/* PDF or markdown, by what the section carries */}
              {section.pdf_file ? (
                <div className="mb-8">
                  <PDFViewer
                    pdfUrl={section.pdf_file}
                    title={section.title}
                    description={section.description}
                    className="w-full"
                  />
                  {section.content_level_1 && (
                    <CollapsibleSummary content={section.content_level_1} proseClassName="prose-lg" />
                  )}
                </div>
              ) : (
                <div className="prose prose-lg max-w-none">
                  <ImageEnhancedMarkdownRenderer
                    content={section.content_level_3}
                    images={section.images || []}
                    showToggle={false}
                    className=""
                  />
                </div>
              )}

              <div className="mt-8 text-center">
                <Link
                  href={readMoreHref}
                  className="text-primary hover:text-primary/80 underline underline-offset-2 decoration-1 font-medium"
                >
                  Read more in {COLLECTION_DISPLAY[collection] ?? collection}
                </Link>
              </div>
            </div>
          </Reveal>

          {index < entries.length - 1 && <hr className="border-t border-border my-16" />}
        </section>
      ))}
    </div>
  );
}
