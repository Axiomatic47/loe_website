// app/composition/[compositionId]/[compositionSlug]/[sectionSlug]/page.tsx —
// canonical descriptive reader URLs for the non-case collections
// (manuscript · data · copyright · timeline · map).
//
// Constitutional documents are NOT served here — their canonical home is
// /<case-slug>/<section-slug> (the [caseSlug]/[docId] route); sectionUrl()
// never emits the composition form for them.
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCollection, getComposition, getSection } from '@/lib/content-manifest';
import type { CollectionType } from '@/lib/content-types';
import { absoluteUrl, sectionUrl } from '@/utils/urls';
import { DocReaderView } from '../../../../_components/DocReaderView';

export const dynamicParams = false;

const READER_COLLECTIONS: CollectionType[] = ['manuscript', 'data', 'copyright', 'timeline', 'map'];

export function generateStaticParams() {
  return READER_COLLECTIONS.flatMap(collection =>
    getCollection(collection).flatMap(composition =>
      composition.sections.map(section => ({
        compositionId: collection,
        compositionSlug: composition.slug,
        sectionSlug: section.slug,
      })),
    ),
  );
}

type Params = {
  params: Promise<{ compositionId: string; compositionSlug: string; sectionSlug: string }>;
};

function resolve(compositionId: string, compositionSlug: string, sectionSlug: string) {
  if (!(READER_COLLECTIONS as string[]).includes(compositionId)) return null;
  const composition = getComposition(compositionId as CollectionType, compositionSlug);
  if (!composition) return null;
  const section = getSection(composition, sectionSlug);
  if (!section) return null;
  return { composition, section };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { compositionId, compositionSlug, sectionSlug } = await params;
  const resolved = resolve(compositionId, compositionSlug, sectionSlug);
  if (!resolved) return {};
  const { composition, section } = resolved;

  const canonical = sectionUrl(composition, section);
  const description = section.description || `${section.title} — ${composition.title}`;
  return {
    title: `${section.title} — ${composition.title}`,
    description,
    alternates: { canonical },
    openGraph: {
      title: section.title,
      description,
      url: absoluteUrl(canonical),
      type: 'article',
    },
  };
}

export default async function CompositionSectionPage({ params }: Params) {
  const { compositionId, compositionSlug, sectionSlug } = await params;
  const resolved = resolve(compositionId, compositionSlug, sectionSlug);
  if (!resolved) notFound();
  return (
    <DocReaderView
      collection={compositionId as CollectionType}
      compositionSlug={compositionSlug}
      sectionSlug={sectionSlug}
    />
  );
}
