// app/research/[archiveId]/leaf/[leafId]/LeafBody.tsx — client body of one
// archive leaf (port of src/views/ResearchLeaf.tsx): the leaf image in a
// zoom/pan viewer beside its reviewer-facing PDFs as tabs. Manifest data
// arrives as server props; tab + layout state stays here.
//
// Manuscript review layout (owner 2026-09-13): the two panes are matched
// cards — each has an h-11 header bar (image: leaf label + zoom controls;
// document: tabs + download/new-tab), an h-8 sub-bar (image: credit;
// document: title), a body, and an h-8 footer — so their edges sit level.
// Side by side is the DEFAULT on large screens (the stacked toggle remains
// and is remembered); the leaf pager and the fixity block sit BELOW the
// panes. In side-by-side the row fills the viewport with a draggable divider.
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { MembraneViewer } from "@/components/MembraneViewer";
import { PdfScrollViewer } from "@/components/PdfScrollViewer";
import {
  type ArchiveDoc,
  type ArchiveLeafEntry,
  type ArchiveManifest,
  archiveBase,
  imagesPublished,
  publishedDocs,
} from "@/lib/research-archive";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Columns, Download, ExternalLink, FileText, Rows } from "lucide-react";
import { cn } from "@/lib/utils";
import { SitePageLayout } from "../../../../_components/SitePageLayout";

type LeafLayout = "stacked" | "side";
const LAYOUT_KEY = "loe-archive-layout";
const SPLIT_KEY = "loe-archive-split";
const SPLIT_MIN = 25;
const SPLIT_MAX = 75;
const DIVIDER_PX = 14;
// SitePageLayout's fixed footer (pb-16) + the slack under the below-panes row
const FIXED_FOOTER_PX = 64;
const BOTTOM_PAD_PX = 16;

interface LeafBodyProps {
  archiveId: string;
  refLabel: string;
  leafLabel: string;
  manifest: ArchiveManifest;
  leaf: ArchiveLeafEntry;
  prev: string | null;
  next: string | null;
  /** open readings whose source is this leaf (plan §3) — rendered as a link when non-empty */
  openReadings?: { collection: string; id: string }[];
}

export const LeafBody = ({ archiveId, refLabel, leafLabel, manifest, leaf, prev, next, openReadings = [] }: LeafBodyProps) => {
  const tabs = useMemo(() => {
    const t: Array<{ key: string; label: string; doc: ArchiveDoc }> = [];
    const seen = new Set<string>();
    for (const d of publishedDocs(leaf)) {
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
  const [pageCount, setPageCount] = useState(0);

  // side by side is the default; a stored choice (either way) wins after
  // hydration (a localStorage read in the initializer would mismatch)
  const [layout, setLayout] = useState<LeafLayout>("side");
  const [split, setSplit] = useState(50);
  const [isLg, setIsLg] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [fillHeight, setFillHeight] = useState<number | null>(null);
  const rowRef = useRef<HTMLDivElement | null>(null);
  const belowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const l = localStorage.getItem(LAYOUT_KEY);
    if (l === "side" || l === "stacked") setLayout(l);
    const stored = Number(localStorage.getItem(SPLIT_KEY));
    if (stored >= SPLIT_MIN && stored <= SPLIT_MAX) setSplit(stored);
    const mq = window.matchMedia("(min-width: 1024px)");
    const onMq = () => setIsLg(mq.matches);
    onMq();
    mq.addEventListener("change", onMq);
    return () => mq.removeEventListener("change", onMq);
  }, []);
  const changeLayout = (l: LeafLayout) => {
    setLayout(l);
    localStorage.setItem(LAYOUT_KEY, l);
  };

  const measure = useCallback(() => {
    const el = rowRef.current;
    if (!el) return;
    // fill from the row's top edge to the top of the fixed footer, leaving
    // room for the pager/fixity row beneath the panes
    const below = belowRef.current ? belowRef.current.offsetHeight + 12 : 48;
    setFillHeight(Math.max(480, window.innerHeight - el.getBoundingClientRect().top - below - FIXED_FOOTER_PX - BOTTOM_PAD_PX));
  }, []);
  useEffect(() => {
    if (!(layout === "side" && isLg)) return;
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
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
  };
  const resetSplit = () => {
    setSplit(50);
    localStorage.setItem(SPLIT_KEY, "50");
  };

  const pdfUrl = activeTab ? `${archiveBase(archiveId)}/${activeTab.doc.pdf}` : null;
  const published = imagesPublished(manifest);
  const pagerBtn =
    "h-8 px-2.5 inline-flex items-center gap-1 rounded text-sm text-primary hover:text-primary/80 hover:bg-muted transition-colors font-sans";

  return (
    <SitePageLayout>
      <main className={cn(review ? "w-full max-w-none px-4 py-4" : "container mx-auto px-4 py-6")}>
        {/* header row — back link · open readings · layout toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <Link
            href={`/research/${archiveId}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors font-sans"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            {refLabel} — archive
          </Link>
          <div className="flex items-center gap-2 font-sans">
            {openReadings.length > 0 && (
              <Link
                href={openReadings.length === 1 ? `/research/${openReadings[0].collection}/readings/${openReadings[0].id}` : `/research/${openReadings[0].collection}/readings`}
                className="text-xs uppercase tracking-[0.06em] text-primary border border-primary/30 bg-primary/10 rounded-md px-2 py-0.5 hover:bg-primary/15 transition-colors"
                style={{ fontWeight: 600 }}
              >
                {openReadings.length} open reading{openReadings.length === 1 ? "" : "s"} on this leaf
              </Link>
            )}

            {/* layout toggle — side by side (default) vs stacked; only meaningful ≥lg */}
            <span className="hidden lg:inline-flex items-center gap-0.5 bg-card border border-border rounded-md shadow-sm p-0.5">
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
            </span>
          </div>
        </div>

        {/* the two panes */}
        <div
          ref={rowRef}
          className={cn(
            "grid grid-cols-1 gap-4",
            // side by side prerenders as two equal columns ≥lg (no flash from
            // stacked); once hydrated the divider column and measured height arrive
            layout === "side" ? "lg:grid-cols-2 lg:items-stretch" : "items-start max-w-4xl mx-auto",
            review && "lg:gap-0"
          )}
          style={
            review && fillHeight
              ? { height: fillHeight, gridTemplateColumns: `${split}% ${DIVIDER_PX}px minmax(0, 1fr)` }
              : undefined
          }
        >
          {/* leaf image */}
          <div className={cn("min-w-0", review && "h-full min-h-0 flex flex-col")}>
            <MembraneViewer
              src={`${archiveBase(archiveId)}/${leaf.web ?? leaf.image}`}
              alt={`${refLabel} ${leafLabel.toLowerCase()} ${leaf.id}`}
              heightClass={review ? "flex-1 min-h-0" : "h-[56vh] lg:h-[64vh]"}
              fitMode={published ? "width" : "contain"}
              title={
                <>
                  {leafLabel} {leaf.id}{" "}
                  <span className="text-muted-foreground font-sans text-xs ml-1.5" style={{ fontWeight: 500 }}>
                    {refLabel}
                  </span>
                </>
              }
              subtitle={
                published ? (
                  leaf.credit ?? refLabel
                ) : (
                  <>Placeholder — the leaf image awaits a reproduction licence from {manifest?.images?.rightsHolder || "the rights holder"}.</>
                )
              }
            />
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
            {tabs.length === 0 || !pdfUrl || !activeTab ? (
              <div className="bg-card border border-border rounded-lg shadow-sm p-8 text-sm font-sans text-muted-foreground">
                The transcript of this leaf is not yet published — the image stands alone until it is.
              </div>
            ) : (
              <div className={cn("bg-card border border-border rounded-lg shadow-sm overflow-hidden flex flex-col", review && "h-full min-h-0")}>
                {/* header bar — tabs · download · new tab */}
                <div className="flex items-center gap-2 h-11 px-3 border-b border-border shrink-0 font-sans">
                  <div className="flex-1 min-w-0 flex items-center gap-1 overflow-x-auto whitespace-nowrap" role="tablist" aria-label="Documents for this leaf">
                    {tabs.map((t) => {
                      const on = activeTab.key === t.key;
                      return (
                        <button
                          key={t.key}
                          type="button"
                          role="tab"
                          aria-selected={on}
                          onClick={() => setActive(t.key)}
                          className={cn(
                            "h-7 px-2.5 rounded-md text-xs transition-colors shrink-0",
                            on ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary text-foreground/80 hover:bg-secondary/70 border border-border"
                          )}
                          style={{ fontWeight: on ? 600 : 500 }}
                        >
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                  <Button variant="outline" size="sm" className="bg-card border-border h-8 px-2.5 shrink-0" asChild>
                    <a href={pdfUrl} download title="Download the PDF" aria-label="Download the PDF">
                      <Download className="h-3.5 w-3.5" />
                      <span className="hidden xl:inline ml-1.5">Download</span>
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="bg-card border-border h-8 px-2.5 shrink-0" asChild>
                    <a href={pdfUrl} target="_blank" rel="noopener noreferrer" title="Open in new tab" aria-label="Open in new tab">
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span className="hidden xl:inline ml-1.5">New tab</span>
                    </a>
                  </Button>
                </div>
                {/* sub-bar — document title */}
                <div className="h-8 px-3 flex items-center border-b border-border bg-card/70 shrink-0" title={activeTab.doc.title}>
                  <p className="min-w-0 truncate w-full text-[11px] text-foreground font-sans" style={{ fontWeight: 550 }}>
                    {activeTab.doc.title}
                  </p>
                </div>
                {/* PDF.js canvas viewer — pages render at the pane's width and
                    follow it as the split or window moves (Safari's native
                    frame ignores fit-to-width; owner ask 8/26) */}
                <PdfScrollViewer
                  key={pdfUrl}
                  src={pdfUrl}
                  onPages={setPageCount}
                  className={cn("w-full", review ? "flex-1 min-h-0" : "h-[80vh] lg:h-[85vh]")}
                />
                {/* footer — matches the image pane's hint bar */}
                <div className="h-8 px-3 flex items-center gap-3 border-t border-border bg-card/70 text-[11px] text-muted-foreground font-sans shrink-0">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  <span>PDF</span>
                  <span className="text-border">•</span>
                  <span>{pageCount ? `${pageCount} page${pageCount === 1 ? "" : "s"}` : "Loading"}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* below the panes — fixity (left) · leaf pager (right) */}
        <div ref={belowRef} className={cn("mt-3 flex flex-wrap items-start justify-between gap-x-6 gap-y-2", layout !== "side" && "max-w-4xl mx-auto")}>
          <div className="min-w-0 text-[11px] text-muted-foreground font-sans leading-relaxed space-y-0.5">
            {published ? (
              <>
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
                  {leaf.web && <> Shown at web resolution; the hash is the original’s.</>}
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
                {leaf.sha256 && <p className="font-mono break-all">sha256 {leaf.sha256}</p>}
              </>
            ) : (
              leaf.sha256 && <p className="font-mono break-all">Source-image sha256 (recorded fixity): {leaf.sha256}</p>
            )}
          </div>
          <nav aria-label="Leaf navigation" className="ml-auto inline-flex items-center gap-0.5 bg-card border border-border rounded-md shadow-sm p-0.5">
            {prev ? (
              <Link href={`/research/${archiveId}/leaf/${prev}`} className={pagerBtn} rel="prev" style={{ fontVariantNumeric: "tabular-nums" }}>
                <ArrowLeft className="h-3.5 w-3.5" /> {prev}
              </Link>
            ) : (
              <span className={cn(pagerBtn, "opacity-40 pointer-events-none")} aria-hidden="true">
                <ArrowLeft className="h-3.5 w-3.5" /> —
              </span>
            )}
            <span className="font-serif px-3 text-[15px] text-foreground" style={{ fontWeight: 580, fontVariantNumeric: "tabular-nums" }}>
              {leafLabel} {leaf.id}
            </span>
            {next ? (
              <Link href={`/research/${archiveId}/leaf/${next}`} className={pagerBtn} rel="next" style={{ fontVariantNumeric: "tabular-nums" }}>
                {next} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <span className={cn(pagerBtn, "opacity-40 pointer-events-none")} aria-hidden="true">
                — <ArrowRight className="h-3.5 w-3.5" />
              </span>
            )}
          </nav>
        </div>
      </main>
    </SitePageLayout>
  );
};
