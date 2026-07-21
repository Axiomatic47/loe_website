// app/research/[archiveId]/doc/[docFile]/page.tsx — a standalone working
// paper of a research archive (server port of src/views/ResearchDoc.tsx;
// UNLISTED, noindex). PDF-first: serves the docx-converter PDF export listed
// in the manifest — only manifest-listed files enumerate (no arbitrary paths).
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { RESEARCH_ARCHIVES } from '@/data/researchArchives';
import { archiveBase } from '@/lib/research-archive';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, ExternalLink } from 'lucide-react';
import { SitePageLayout } from '../../../../_components/SitePageLayout';
import { readArchiveManifest } from '../../../manifest-server';

export const dynamicParams = false;

export function generateStaticParams() {
  const params: Array<{ archiveId: string; docFile: string }> = [];
  for (const archiveId of Object.keys(RESEARCH_ARCHIVES)) {
    const manifest = readArchiveManifest(archiveId);
    for (const paper of manifest?.workingPapers ?? []) {
      params.push({ archiveId, docFile: paper.pdf.replace(/^pdfs\//, '') });
    }
  }
  return params;
}

type Params = { params: Promise<{ archiveId: string; docFile: string }> };

function lookupPaper(archiveId: string, rawDocFile: string) {
  const docFile = decodeURIComponent(rawDocFile);
  const manifest = readArchiveManifest(archiveId);
  return manifest?.workingPapers.find((p) => p.pdf === `pdfs/${docFile}`) || null;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { archiveId, docFile } = await params;
  const paper = lookupPaper(archiveId, docFile);
  return {
    title: paper ? paper.title : 'Research archive — working paper',
    robots: { index: false, follow: false },
  };
}

export default async function ResearchDocPage({ params }: Params) {
  const { archiveId, docFile } = await params;
  const config = RESEARCH_ARCHIVES[archiveId];
  const paper = lookupPaper(archiveId, docFile);
  if (!config || !paper) notFound();

  const pdfUrl = `${archiveBase(archiveId)}/${paper.pdf}`;

  return (
    <SitePageLayout>
      <main className="container mx-auto px-4 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <Link
              href={`/research/${archiveId}`}
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors font-sans"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              {config.ref} — archive
            </Link>
            <span className="flex items-center gap-1.5">
              <Button variant="outline" size="sm" className="bg-card border-border shadow-sm h-8" asChild>
                <a href={pdfUrl} download>
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Download
                </a>
              </Button>
              <Button variant="outline" size="sm" className="bg-card border-border shadow-sm h-8" asChild>
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                  New tab
                </a>
              </Button>
            </span>
          </div>

          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-border">
              <h1 className="font-serif text-foreground" style={{ fontSize: "1.125rem", fontWeight: 580, lineHeight: 1.3 }}>
                {paper.title}
              </h1>
            </div>
            <iframe
              src={`${pdfUrl}#zoom=100&navpanes=0`}
              title={paper.title}
              className="w-full h-[78vh]"
              style={{ border: "none", background: "#f5f3ed" }}
            />
          </div>
        </div>
      </main>
    </SitePageLayout>
  );
}
