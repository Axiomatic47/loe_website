// app/research/[archiveId]/leaf/[leafId]/LeafBody.tsx — client body of one
// archive leaf (port of src/views/ResearchLeaf.tsx): the leaf image in a
// zoom/pan viewer beside its reviewer-facing PDFs as tabs. Manifest data
// arrives as server props; tab + layout state stays here.
'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MembraneViewer } from "@/components/MembraneViewer";
import {
  type ArchiveDoc,
  type ArchiveLeafEntry,
  type ArchiveManifest,
  archiveBase,
  imagesPublished,
} from "@/lib/research-archive";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Columns, Download, ExternalLink, Rows } from "lucide-react";
import { cn } from "@/lib/utils";
import { SitePageLayout } from "../../../../_components/SitePageLayout";

// Leaf/document arrangement. Stacked (image above, document below) is the
// default — side-by-side only earns its keep on very wide screens.
type LeafLayout = "stacked" | "side";
const LAYOUT_KEY = "loe-archive-layout";

interface LeafBodyProps {
  archiveId: string;
  refLabel: string;
  leafLabel: string;
  manifest: ArchiveManifest;
  leaf: ArchiveLeafEntry;
  prev: string | null;
  next: string | null;
}

export const LeafBody = ({ archiveId, refLabel, leafLabel, manifest, leaf, prev, next }: LeafBodyProps) => {
  const tabs = useMemo(() => {
    const t: Array<{ key: string; label: string; doc: ArchiveDoc }> = [];
    const seen = new Set<string>();
    for (const d of leaf.docs) {
      if (seen.has(d.pdf)) continue;
      seen.add(d.pdf);
      t.push({
        key: d.pdf,
        label:
          d.kind === "transcript"
            ? "Transcript"
            : d.kind === "index"
              ? "Line index"
              : `Transcription ${d.span || ""}`.trim(),
        doc: d,
      });
    }
    return t;
  }, [leaf]);

  const [active, setActive] = useState<string | null>(null);
  useEffect(() => setActive(null), [archiveId, leaf.id]);
  const activeTab = tabs.find((t) => t.key === active) || tabs[0] || null;

  // SSR-safe layout preference: prerender stacked, adopt the stored choice
  // after hydration (a localStorage read in the initializer would mismatch).
  const [layout, setLayout] = useState<LeafLayout>("stacked");
  useEffect(() => {
    if (localStorage.getItem(LAYOUT_KEY) === "side") setLayout("side");
  }, []);
  const changeLayout = (l: LeafLayout) => {
    setLayout(l);
    localStorage.setItem(LAYOUT_KEY, l);
  };

  const pdfUrl = activeTab ? `${archiveBase(archiveId)}/${activeTab.doc.pdf}` : null;

  return (
    <SitePageLayout>
      <main className="container mx-auto px-4 py-10">
        {/* header row */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <Link
            href={`/research/${archiveId}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors font-sans"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            {refLabel} — archive
          </Link>
          <div className="flex items-center gap-2 font-sans">
            {prev && (
              <Link href={`/research/${archiveId}/leaf/${prev}`} className="text-sm text-primary hover:text-primary/80 inline-flex items-center transition-colors">
                <ArrowLeft className="h-3.5 w-3.5 mr-1" /> {prev}
              </Link>
            )}
            <span className="font-serif text-foreground px-2" style={{ fontWeight: 580, fontVariantNumeric: "tabular-nums" }}>
              {leafLabel} {leaf.id}
            </span>
            {next && (
              <Link href={`/research/${archiveId}/leaf/${next}`} className="text-sm text-primary hover:text-primary/80 inline-flex items-center transition-colors">
                {next} <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            )}

            {/* layout toggle — stacked (default) vs side-by-side; only meaningful ≥lg */}
            <span className="hidden lg:inline-flex items-center gap-0.5 ml-3 bg-card border border-border rounded-md shadow-sm p-0.5">
              <Button
                variant="ghost"
                size="sm"
                className={cn("h-7 w-7 p-0", layout === "stacked" ? "bg-primary/15 text-primary hover:bg-primary/20 hover:text-primary" : "text-muted-foreground")}
                onClick={() => changeLayout("stacked")}
                aria-label="Stacked layout (image above, document below)"
                aria-pressed={layout === "stacked"}
                title="Stacked — image above, document below"
              >
                <Rows className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn("h-7 w-7 p-0", layout === "side" ? "bg-primary/15 text-primary hover:bg-primary/20 hover:text-primary" : "text-muted-foreground")}
                onClick={() => changeLayout("side")}
                aria-label="Side-by-side layout"
                aria-pressed={layout === "side"}
                title="Side by side — image beside document"
              >
                <Columns className="h-4 w-4" />
              </Button>
            </span>
          </div>
        </div>

        <div
          className={cn(
            "grid grid-cols-1 gap-6 items-start",
            // stacked reads as one centered column (sitewide document width);
            // side-by-side uses the full container
            layout === "side" ? "lg:grid-cols-2" : "max-w-4xl mx-auto"
          )}
        >
          {/* leaf image */}
          <div className={cn(layout === "side" && "lg:sticky lg:top-20")}>
            <MembraneViewer
              key={layout} // remount on layout change so the leaf re-fits the new pane width
              src={`${archiveBase(archiveId)}/${leaf.image}`}
              alt={`${refLabel} ${leafLabel.toLowerCase()} ${leaf.id}`}
              heightClass={layout === "stacked" ? "h-[56vh] lg:h-[64vh]" : "h-[62vh] lg:h-[74vh]"}
              fitMode={imagesPublished(manifest) ? "width" : "contain"}
            />
            {!imagesPublished(manifest) ? (
              <p className="mt-2 text-[11px] text-muted-foreground font-sans leading-relaxed">
                Placeholder — the leaf image awaits a reproduction licence from{" "}
                {manifest?.images?.rightsHolder || "the rights holder"}.
                {leaf.sha256 && (
                  <span className="font-mono break-all"> Source-image sha256 (recorded fixity): {leaf.sha256}</span>
                )}
              </p>
            ) : (
              <div className="mt-2 text-[11px] text-muted-foreground font-sans leading-relaxed space-y-0.5">
                {leaf.credit && (
                  <p>
                    {leaf.credit}
                    {manifest?.images?.creditUrl && (
                      <>
                        {" · "}
                        <a
                          href={manifest.images.creditUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-2 hover:text-foreground transition-colors break-all"
                        >
                          {manifest.images.creditUrl.replace(/^https?:\/\//, "")}
                        </a>
                      </>
                    )}
                  </p>
                )}
                {leaf.sha256 && <p className="font-mono break-all">sha256 {leaf.sha256}</p>}
              </div>
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
                      // rendering params match the sitewide PDFViewer (#zoom=100);
                      // the half-width side pane fits the page width instead.
                      // key includes layout — fragment params only apply on load.
                      key={`${pdfUrl}-${layout}`}
                      src={`${pdfUrl}${layout === "stacked" ? "#zoom=100&navpanes=0" : "#view=FitH&navpanes=0"}`}
                      title={activeTab?.doc.title || "document"}
                      className={cn("w-full", layout === "stacked" ? "h-[80vh] lg:h-[85vh]" : "h-[62vh] lg:h-[72vh]")}
                      style={{ border: "none", background: "#f5f3ed" }}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </SitePageLayout>
  );
};
