// src/pages/ResearchLeaf.tsx — one leaf (membrane/folio) of a research archive
// (UNLISTED). The leaf image in a zoom/pan viewer beside its reviewer-facing
// documents — the PDF exports of the line index and any transcriptions that
// cover the leaf — as tabs.

import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { MembraneViewer } from "@/components/MembraneViewer";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useNoIndex } from "@/hooks/useNoIndex";
import { useArchiveManifest, archiveBase, ArchiveDoc } from "@/pages/ResearchArchive";
import { RESEARCH_ARCHIVES } from "@/data/researchArchives";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Download, ExternalLink, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const ResearchLeaf = () => {
  const { archiveId = "", leafId = "" } = useParams();
  const config = RESEARCH_ARCHIVES[archiveId];
  const { manifest, error } = useArchiveManifest(config ? archiveId : undefined);
  useNoIndex();

  const leaf = manifest?.leaves.find((l) => l.id === leafId) || null;
  const leafLabel = config?.leafLabel || "Leaf";

  useDocumentMeta(
    config ? `${leafLabel} ${leafId} — ${config.ref}` : "Research archive",
    "Working diplomatic transcription — leaf image, line index, and transcription (PDF)."
  );

  const tabs = useMemo(() => {
    if (!leaf) return [] as Array<{ key: string; label: string; doc: ArchiveDoc }>;
    const t: Array<{ key: string; label: string; doc: ArchiveDoc }> = [];
    const seen = new Set<string>();
    for (const d of leaf.docs) {
      if (seen.has(d.pdf)) continue;
      seen.add(d.pdf);
      t.push({
        key: d.pdf,
        label: d.kind === "index" ? "Line index" : `Transcription ${d.span || ""}`.trim(),
        doc: d,
      });
    }
    return t;
  }, [leaf]);

  const [active, setActive] = useState<string | null>(null);
  useEffect(() => setActive(null), [archiveId, leafId]);
  const activeTab = tabs.find((t) => t.key === active) || tabs[0] || null;

  const ids = manifest?.leaves.map((l) => l.id) || [];
  const idx = ids.indexOf(leafId);
  const prev = idx > 0 ? ids[idx - 1] : null;
  const next = idx >= 0 && idx < ids.length - 1 ? ids[idx + 1] : null;

  const pdfUrl = activeTab ? `${archiveBase(archiveId)}/${activeTab.doc.pdf}` : null;

  if (!config) {
    return (
      <PageLayout>
        <main className="container mx-auto px-4 py-24 text-center font-sans text-muted-foreground">
          No research archive “{archiveId}”.
        </main>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <main className="container mx-auto px-4 py-10">
        {/* header row */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <Link
            to={`/research/${archiveId}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors font-sans"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            {config.ref} — archive
          </Link>
          <div className="flex items-center gap-2 font-sans">
            {prev && (
              <Link to={`/research/${archiveId}/leaf/${prev}`} className="text-sm text-primary hover:text-primary/80 inline-flex items-center transition-colors">
                <ArrowLeft className="h-3.5 w-3.5 mr-1" /> {prev}
              </Link>
            )}
            <span className="font-serif text-foreground px-2" style={{ fontWeight: 580, fontVariantNumeric: "tabular-nums" }}>
              {leafLabel} {leafId}
            </span>
            {next && (
              <Link to={`/research/${archiveId}/leaf/${next}`} className="text-sm text-primary hover:text-primary/80 inline-flex items-center transition-colors">
                {next} <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-secondary border border-border border-l-2 border-l-destructive rounded-md px-4 py-3 text-sm font-sans text-foreground/85 mb-6">
            Manifest not found ({error}). Run <code>npm run sync-archives</code> locally.
          </div>
        )}
        {!manifest && !error && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        {manifest && !leaf && (
          <div className="text-center py-24 font-sans text-muted-foreground">
            No {leafLabel.toLowerCase()} “{leafId}” in the manifest.
          </div>
        )}

        {leaf && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* leaf image */}
            <div className="lg:sticky lg:top-20">
              <MembraneViewer src={`${archiveBase(archiveId)}/${leaf.image}`} alt={`${config.ref} ${leafLabel.toLowerCase()} ${leaf.id}`} />
              {leaf.sha256 && (
                <p className="mt-2 text-[11px] text-muted-foreground font-mono break-all">sha256 {leaf.sha256}</p>
              )}
            </div>

            {/* documents (PDF) */}
            <div className="min-w-0">
              {tabs.length === 0 ? (
                <div className="bg-card border border-border rounded-xl shadow-sm p-8 text-sm font-sans text-muted-foreground">
                  No line index or transcription PDF has been published for this leaf yet.
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-1.5 mb-4">
                    {tabs.map((t) => (
                      <button
                        key={t.key}
                        onClick={() => setActive(t.key)}
                        className={cn(
                          "px-3 py-1.5 rounded-md text-sm font-sans transition-colors",
                          activeTab?.key === t.key
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-secondary text-foreground/80 hover:bg-secondary/70 border border-border"
                        )}
                        style={{ fontWeight: activeTab?.key === t.key ? 600 : 500 }}
                      >
                        {t.label}
                      </button>
                    ))}
                    {pdfUrl && (
                      <span className="ml-auto flex items-center gap-1.5">
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

                  <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    {activeTab && (
                      <div className="px-4 py-2.5 border-b border-border">
                        <p className="text-sm text-foreground font-sans leading-snug line-clamp-2" style={{ fontWeight: 550 }}>
                          {activeTab.doc.title}
                        </p>
                      </div>
                    )}
                    {pdfUrl && (
                      <iframe
                        key={pdfUrl}
                        src={pdfUrl}
                        title={activeTab?.doc.title || "document"}
                        className="w-full h-[62vh] lg:h-[72vh]"
                        style={{ border: "none", background: "#f5f3ed" }}
                      />
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </PageLayout>
  );
};

export default ResearchLeaf;
