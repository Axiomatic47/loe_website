// app/[caseSlug]/[docId]/page.tsx — canonical case-document reader URLs
// (/kirchner-v-johnson/51, /kirchner-v-ellison/8cir-brief, /scotus-amicus/1 …).
//
// Fully static: generateStaticParams enumerates every canonical section slug;
// dynamicParams=false means unknown ids 404 (never an array index). Historical
// non-canonical spellings (docNN, zero-padded) become real 301s in next.config
// at the redirect-compilation step.
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCaseComposition, getSection } from '@/lib/content-manifest';
import { CASE_SLUGS, absoluteUrl, isCaseSlug } from '@/utils/urls';
import { DocReaderView } from '../../_components/DocReaderView';

export const dynamicParams = false;

export function generateStaticParams() {
  return CASE_SLUGS.flatMap(caseSlug => {
    const composition = getCaseComposition(caseSlug);
    if (!composition) return [];
    return composition.sections.map(section => ({ caseSlug, docId: section.slug }));
  });
}

type Params = { params: Promise<{ caseSlug: string; docId: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { caseSlug, docId } = await params;
  if (!isCaseSlug(caseSlug)) return {};
  const composition = getCaseComposition(caseSlug);
  const section = composition && getSection(composition, docId);
  if (!composition || !section) return {};

  const canonical = `/${caseSlug}/${section.slug}`;
  const description =
    section.description || `${section.title} — ${composition.title}`;
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

export default async function CaseDocPage({ params }: Params) {
  const { caseSlug, docId } = await params;
  if (!isCaseSlug(caseSlug)) notFound();
  const composition = getCaseComposition(caseSlug);
  if (!composition || !getSection(composition, docId)) notFound();
  return <DocReaderView collection="constitutional" compositionSlug={caseSlug} sectionSlug={docId} />;
}
