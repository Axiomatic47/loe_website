// app/research/[archiveId]/leaf/[leafId]/LeafBody.tsx — client body of one
// archive leaf (port of src/views/ResearchLeaf.tsx): the leaf image in a
// zoom/pan viewer beside its reviewer-facing PDFs as tabs. Manifest data
// arrives as server props; tab + layout state stays here.
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
// Side-by-side review mode (owner ask 2026-08-26): fill the whole screen on
// large monitors — full-bleed width, both panes stretched to the viewport
// bottom, and a draggable divider between them, Studio-style.
const SPLIT_KEY = "loe-archive-split";
const SPLIT_MIN = 25;
const SPLIT_MAX = 75;

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

  // Review-mode plumbing: split percentage (persisted), lg breakpoint state,
  // measured fill-height for the pane row, and drag handling. All of it is
  // inert in stacked mode and below lg.
  const [split, setSplit] = useState(50);
  const [isLg, setIsLg] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [fillHeight, setFillHeight] = useState<number | null>(null);
  const rowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const stored = Number(localStorage.getItem(SPLIT_KEY));
    if (stored >= SPLIT_MIN && stored <= SPLIT_MAX) setSplit(stored);
    const mq = window.matchMedia("(min-width: 1024px)");
    const onMq = () => setIsLg(mq.matches);
    onMq();
    mq.addEventListener("change", onMq);
    return () => mq.removeEventListener("change", onMq);
  }, []);

  // paneEpoch remounts the PDF iframe after pane geometry settles — its
  // #view=FitH fragment only applies at document load, so a resized pane
  // otherwise keeps the stale fit (clipped or letterboxed).
  const [paneEpoch, setPaneEpoch] = useState(0);

  const measure = useCallback(() => {
    const el = rowRef.current;
    if (!el) return;
    // fill from the row's top edge to the viewport bottom, minus breathing room
    setFillHeight(Math.max(480, window.innerHeight - el.getBoundingClientRect().top - 16));
  }, []);
  useEffect(() => {
    if (!(layout === "side" && isLg)) return;
    measure();
    let settle: ReturnType<typeof setTimeout>;
    const onResize = () => {
      measure();
      clearTimeout(settle);
      settle = setTimeout(() => setPaneEpoch((n) => n + 1), 300);
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(settle);
      window.removeEventListener("resize", onResize);
    };
  }, [layout, isLg, measure]);

  const review = layout === "side" && isLg;

  const onHandleDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
  };
  const onHandleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || !rowRef.current) return;
    const rect = rowRef.current.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    setSplit(Math.min(SPLIT_MAX, Math.max(SPLIT_MIN, pct)));
  };
  const onHandleUp = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    setDragging(false);
    setSplit((s) => {
      localStorage.setItem(SPLIT_KEY, String(Math.round(s)));
      return s;
    });
    setPaneEpoch((n) => n + 1);
  };
  const resetSplit = () => {
    setSplit(50);
    localStorage.setItem(SPLIT_KEY, "50");
    setPaneEpoch((n) => n + 1);
  };

  const pdfUrl = activeTab ? `${archiveBase(archiveId)}/${activeTab.doc.pdf}` : null;

  return (
    <SitePageLayout>
      <main className={cn(review ? "w-full max-w-none px-4 py-6" : "container mx-auto px-4 py-10")}>
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
                alt={`${refLabel} ${leafLabel.toLowerCase()} ${leaf.id}`}
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
                    <iframe
                      // rendering params match the sitewide PDFViewer (#zoom=100);
                      // the half-width side pane fits the page width instead.
                      // key includes layout — fragment params only apply on load.
                      key={`${pdfUrl}-${layout}-${paneEpoch}`}
                      src={`${pdfUrl}${layout === "stacked" ? "#zoom=100&navpanes=0" : "#view=FitH&navpanes=0"}`}
                      title={activeTab?.doc.title || "document"}
                      className={cn(
                        "w-full",
                        review ? "flex-1 min-h-0" : layout === "stacked" ? "h-[80vh] lg:h-[85vh]" : "h-[62vh]",
                        // the iframe must not swallow pointer events mid-drag
                        dragging && "pointer-events-none"
                      )}
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
