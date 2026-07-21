// app/research/[archiveId]/leaf/[leafId]/page.tsx — one leaf of an unlisted
// research archive. Params enumerate from the manifests at build; unknown
// leaves 404 (dynamicParams=false). Noindex, like every /research page.
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RESEARCH_ARCHIVES } from '@/data/researchArchives';
import { readArchiveManifest } from '../../../manifest-server';
import { LeafBody } from './LeafBody';

export const dynamicParams = false;

export function generateStaticParams() {
  const params: Array<{ archiveId: string; leafId: string }> = [];
  for (const archiveId of Object.keys(RESEARCH_ARCHIVES)) {
    const manifest = readArchiveManifest(archiveId);
    for (const leaf of manifest?.leaves ?? []) {
      params.push({ archiveId, leafId: leaf.id });
    }
  }
  return params;
}

type Params = { params: Promise<{ archiveId: string; leafId: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { archiveId, leafId } = await params;
  const config = RESEARCH_ARCHIVES[archiveId];
  if (!config) return { robots: { index: false, follow: false } };
  return {
    title: `${config.leafLabel} ${leafId} — ${config.ref}`,
    description:
      'Working diplomatic transcription — leaf image, line index, and transcription (PDF).',
    robots: { index: false, follow: false },
  };
}

export default async function ResearchLeafPage({ params }: Params) {
  const { archiveId, leafId } = await params;
  const config = RESEARCH_ARCHIVES[archiveId];
  const manifest = readArchiveManifest(archiveId);
  const leaf = manifest?.leaves.find((l) => l.id === leafId);
  if (!config || !manifest || !leaf) notFound();

  const ids = manifest.leaves.map((l) => l.id);
  const idx = ids.indexOf(leafId);

  return (
    <LeafBody
      archiveId={archiveId}
      refLabel={config.ref}
      leafLabel={config.leafLabel}
      manifest={manifest}
      leaf={leaf}
      prev={idx > 0 ? ids[idx - 1] : null}
      next={idx >= 0 && idx < ids.length - 1 ? ids[idx + 1] : null}
    />
  );
}
