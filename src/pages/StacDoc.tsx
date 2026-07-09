// src/pages/StacDoc.tsx — a standalone STAC working paper (UNLISTED), e.g. the
// Precision Pass Ledger or resume notes. Rendered with the same crop-linking
// markdown treatment as the membrane pages.

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { StacMarkdown } from "@/components/StacMarkdown";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useNoIndex } from "@/hooks/useNoIndex";
import { useStacManifest, STAC_BASE } from "@/pages/StacArchive";
import { ArrowLeft, Loader2 } from "lucide-react";

const StacDoc = () => {
  const { docFile = "" } = useParams();
  const { manifest, error } = useStacManifest();
  useNoIndex();

  // only serve files the manifest knows about (no arbitrary path fetches)
  const paper =
    manifest?.workingPapers.find((p) => p.file === `docs/${docFile}`) ||
    null;

  useDocumentMeta(paper ? paper.title : "STAC 8/203/38 — working paper");

  const [text, setText] = useState<string | null>(null);
  useEffect(() => {
    if (!paper) return;
    fetch(`${STAC_BASE}/${paper.file}`)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(setText)
      .catch((e) => setText(`**Could not load document** (${e.message}).`));
  }, [paper]);

  return (
    <PageLayout>
      <main className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/research/stac-8-203-38"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors font-sans mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            STAC 8/203/38 — archive
          </Link>

          {error && (
            <div className="bg-secondary border border-border border-l-2 border-l-destructive rounded-md px-4 py-3 text-sm font-sans text-foreground/85">
              Manifest not found ({error}). Run <code>npm run sync-stac</code> locally.
            </div>
          )}
          {manifest && !paper && (
            <div className="text-center py-24 font-sans text-muted-foreground">
              No working paper “{docFile}” in the manifest.
            </div>
          )}

          {paper && (
            <div className="bg-card border border-border rounded-xl shadow-sm p-6 md:p-10">
              {text !== null && manifest ? (
                <StacMarkdown text={text} cropIndex={manifest.crops.index} />
              ) : (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </PageLayout>
  );
};

export default StacDoc;
