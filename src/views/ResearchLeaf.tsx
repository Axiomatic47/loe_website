// src/pages/ResearchLeaf.tsx — one leaf (membrane/folio) of a research archive
// (UNLISTED). The leaf image in a zoom/pan viewer beside its reviewer-facing
// documents — the PDF exports of the line index and any transcriptions that
// cover the leaf — as tabs.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { MembraneViewer } from "@/components/MembraneViewer";
import { PdfScrollViewer } from "@/components/PdfScrollViewer";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useNoIndex } from "@/hooks/useNoIndex";
import { useArchiveManifest, archiveBase, imagesPublished, ArchiveDoc } from "@/views/ResearchArchive";
import { RESEARCH_ARCHIVES } from "@/data/researchArchives";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Columns, Download, ExternalLink, Loader2, Rows } from "lucide-react";
import { cn } from "@/lib/utils";

// Leaf/document arrangement. Stacked (image above, document below) is the
// default — side-by-side only earns its keep on very wide screens.
type LeafLayout = "stacked" | "side";
const LAYOUT_KEY = "loe-archive-layout";
// Side-by-side review mode (owner ask 2026-08-26; mirrors app LeafBody):
// full-bleed width, panes filled to the viewport bottom, draggable divider.
const SPLIT_KEY = "loe-archive-split";
const SPLIT_MIN = 25;
const SPLIT_MAX = 75;

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
  useEffect(() => setActive(null), [archiveId, leafId]);
  const activeTab = tabs.find((t) => t.key === active) || tabs[0] || null;

  const [layout, setLayout] = useState<LeafLayout>(() => {
    const stored = localStorage.getItem(LAYOUT_KEY);
    return stored === "side" ? "side" : "stacked";
  });
  const changeLayout = (l: LeafLayout) => {
    setLayout(l);
    localStorage.setItem(LAYOUT_KEY, l);
  };

  // review-mode plumbing — see app LeafBody for the annotated original
  const [split, setSplit] = useState(() => {
    const stored = Number(localStorage.getItem(SPLIT_KEY));
    return stored >= SPLIT_MIN && stored <= SPLIT_MAX ? stored : 50;
  });
  const [isLg, setIsLg] = useState(() => window.matchMedia("(min-width: 1024px)").matches);
  const [dragging, setDragging] = useState(false);
  const [fillHeight, setFillHeight] = useState<number | null>(null);
  const rowRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onMq = () => setIsLg(mq.matches);
    mq.addEventListener("change", onMq);
    return () => mq.removeEventListener("change", onMq);
  }, []);
  const measure = useCallback(() => {
    const el = rowRef.current;
    if (!el) return;
    setFillHeight(Math.max(480, window.innerHeight - el.getBoundingClientRect().top - 16));
  }, []);
  const review = layout === "side" && isLg;
  useEffect(() => {
    if (!review) return;
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [review, measure]);
  const onHandleDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
  };
  const onHandleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || !rowRef.current) return;
    const rect = rowRef.current.getBoundingClientRect();
    setSplit(Math.min(SPLIT_MAX, Math.max(SPLIT_MIN, ((e.clientX - rect.left) / rect.width) * 100)));
  };
  const onHandleUp = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    setDragging(false);
    setSplit((s) => {
      localStorage.setItem(SPLIT_KEY, String(Math.round(s)));
      return s;
    });
  };
  const resetSplit = () => {
    setSplit(50);
    localStorage.setItem(SPLIT_KEY, "50");
  };

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
      <main className={cn(review ? "w-full max-w-none px-4 py-6" : "container mx-auto px-4 py-10")}>
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
          <div
            ref={rowRef}
            className={cn(
              "grid grid-cols-1 gap-6",
              // stacked reads as one centered column (sitewide document width);
              // review mode (side-by-side ≥lg) fills the viewport with a
              // draggable divider between the panes
              review ? "items-stretch lg:gap-0" : "items-start",
              layout !== "side" && "max-w-4xl mx-auto"
            )}
            style={
              review && fillHeight
                ? { height: fillHeight, gridTemplateColumns: `${split}% 14px minmax(0, 1fr)` }
                : undefined
            }
          >
            {/* leaf image */}
            <div className={cn(review && "h-full min-h-0 flex flex-col")}>
              <div className={cn(review && "flex-1 min-h-0")}>
                <MembraneViewer
                  key={`${layout}-${review ? "review" : "page"}`} // remount on mode change; within a mode the viewer re-fits itself (ResizeObserver)
                  src={`${archiveBase(archiveId)}/${leaf.web ?? leaf.image}`}
                  alt={`${config.ref} ${leafLabel.toLowerCase()} ${leaf.id}`}
                  heightClass={review ? "flex-1 min-h-0" : layout === "stacked" ? "h-[56vh] lg:h-[64vh]" : "h-[62vh]"}
                  fitMode={imagesPublished(manifest) ? "width" : "contain"}
                />
              </div>
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
                  {leaf.web && <p>Shown at web resolution — the fixity hash below is the original’s.</p>}
                  <p>
                    <a
                      href={`${archiveBase(archiveId)}/${leaf.image}`}
                      download
                      className="underline underline-offset-2 text-primary hover:text-primary/80 transition-colors"
                      style={{ fontWeight: 550 }}
                    >
                      Download the full-resolution original
                      {leaf.imageBytes ? ` (${Math.round(leaf.imageBytes / 1e6)} MB)` : ""}
                    </a>
                    {" "}— for private study and non-commercial research.
                  </p>
                  {leaf.sha256 && <p className="font-mono break-all">sha256 {leaf.sha256}</p>}
                </div>
              )}
            </div>

            {/* divider — drag to resize the split (double-click to recenter) */}
            {review && (
              <div
                role="separator"
                aria-orientation="vertical"
                aria-label="Resize the membrane/document split"
                title="Drag to resize · double-click to recenter"
                onPointerDown={onHandleDown}
                onPointerMove={onHandleMove}
                onPointerUp={onHandleUp}
                onDoubleClick={resetSplit}
                className={cn(
                  "h-full cursor-col-resize touch-none select-none flex items-center justify-center group",
                  dragging && "bg-primary/5"
                )}
              >
                <div
                  className={cn(
                    "w-1 h-16 rounded-full bg-border group-hover:bg-primary/50 transition-colors",
                    dragging && "bg-primary"
                  )}
                />
              </div>
            )}

            {/* documents (PDF) */}
            <div className={cn("min-w-0", review && "h-full min-h-0 flex flex-col")}>
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

                  <div
                    className={cn(
                      "bg-card border border-border rounded-xl shadow-sm overflow-hidden",
                      review && "flex-1 min-h-0 flex flex-col"
                    )}
                  >
                    {activeTab && (
                      <div className="px-4 py-2.5 border-b border-border shrink-0">
                        <p className="text-sm text-foreground font-sans leading-snug line-clamp-2" style={{ fontWeight: 550 }}>
                          {activeTab.doc.title}
                        </p>
                      </div>
                    )}
                    {pdfUrl && (
                      // PDF.js canvas viewer — pages render at the pane's width
                      // and follow it as the split or window moves (see app LeafBody)
                      <PdfScrollViewer
                        key={pdfUrl}
                        src={pdfUrl}
                        className={cn(
                          "w-full",
                          review ? "flex-1 min-h-0" : layout === "stacked" ? "h-[80vh] lg:h-[85vh]" : "h-[62vh]"
                        )}
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
