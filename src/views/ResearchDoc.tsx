// src/pages/ResearchDoc.tsx — a standalone working paper of a research archive
// (UNLISTED), e.g. the Precision Pass Ledger or reviewers' README. PDF-first:
// serves the docx-converter PDF export listed in the manifest.

import { Link, useParams } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useNoIndex } from "@/hooks/useNoIndex";
import { useArchiveManifest, archiveBase } from "@/views/ResearchArchive";
import { RESEARCH_ARCHIVES } from "@/data/researchArchives";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, ExternalLink, Loader2 } from "lucide-react";

const ResearchDoc = () => {
  const { archiveId = "", docFile = "" } = useParams();
  const config = RESEARCH_ARCHIVES[archiveId];
  const { manifest, error } = useArchiveManifest(config ? archiveId : undefined);
  useNoIndex();

  // only serve files the manifest lists (no arbitrary path fetches)
  const paper = manifest?.workingPapers.find((p) => p.pdf === `pdfs/${docFile}`) || null;
  const pdfUrl = paper ? `${archiveBase(archiveId)}/${paper.pdf}` : null;

  useDocumentMeta(paper ? paper.title : "Research archive — working paper");

  return (
    <PageLayout>
      <main className="container mx-auto px-4 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <Link
              to={`/research/${archiveId}`}
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors font-sans"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              {config ? `${config.ref} — archive` : "Archive"}
            </Link>
            {pdfUrl && (
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
            )}
          </div>

          {error && (
            <div className="bg-secondary border border-border border-l-2 border-l-destructive rounded-md px-4 py-3 text-sm font-sans text-foreground/85">
              Manifest not found ({error}). Run <code>npm run sync-archives</code> locally.
            </div>
          )}
          {!manifest && !error && (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          {manifest && !paper && (
            <div className="text-center py-24 font-sans text-muted-foreground">
              No working paper “{docFile}” in the manifest.
            </div>
          )}

          {paper && pdfUrl && (
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
          )}
        </div>
      </main>
    </PageLayout>
  );
};

export default ResearchDoc;
