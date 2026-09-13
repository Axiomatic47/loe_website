// src/components/MembraneViewer.tsx — dependency-free zoom/pan viewer for
// large manuscript images (scroll/pinch to zoom at the cursor, double-click to
// zoom in, drag to pan, buttons for zoom/fit). On load the leaf auto-fits the
// pane width — no more arbitrary initial zoom. Designed for the archive
// leaves (~2800×4100 up to ~7400×7000).
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MembraneViewerProps {
  src: string;
  alt: string;
  /** height utility classes for the pan area (default suits side-by-side) */
  heightClass?: string;
  /** 'width' (default) reads a tall leaf across the pane; 'contain' shows the
      whole image — used for licence placeholders */
  fitMode?: 'width' | 'contain';
  /** header-bar label (the leaf); when set, the zoom controls move from a
      floating overlay into a header bar so the card matches its neighbour
      (manuscript review layout, owner 2026-09-13) */
  title?: React.ReactNode;
  /** one-line sub-bar under the header (provenance / credit) */
  subtitle?: React.ReactNode;
}

const MIN = 0.1;
const MAX = 8;
// keep at least this much of the leaf inside the pane, so a stray pan or zoom
// can never throw it entirely off-screen
const EDGE = 96;

export const MembraneViewer: React.FC<MembraneViewerProps> = ({
  src,
  alt,
  heightClass = 'h-[62vh] lg:h-[74vh]',
  fitMode = 'width',
  title,
  subtitle,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [t, setT] = useState({ scale: 0.28, x: 0, y: 0 });
  const drag = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null);
  // false while the leaf is just fitted to the pane — pane resizes (review-mode
  // divider drags, window resizes) re-fit live. Any manual zoom/pan flips it,
  // so a resize then preserves the reader's spot; the fit button resets it.
  const userAdjusted = useRef(false);

  const clampScale = (s: number) => Math.min(MAX, Math.max(MIN, s));

  const clampPos = useCallback((x: number, y: number, scale: number) => {
    const box = boxRef.current;
    const img = imgRef.current;
    if (!box || !img || !img.naturalWidth) return { x, y };
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    const loX = EDGE - w;
    const hiX = box.clientWidth - EDGE;
    const loY = EDGE - h;
    const hiY = box.clientHeight - EDGE;
    return {
      x: loX > hiX ? (box.clientWidth - w) / 2 : Math.min(hiX, Math.max(loX, x)),
      y: loY > hiY ? (box.clientHeight - h) / 2 : Math.min(hiY, Math.max(loY, y)),
    };
  }, []);

  // fit the leaf to the pane (centered), capped at natural size
  const fit = useCallback(() => {
    const box = boxRef.current;
    const img = imgRef.current;
    if (!box || !img || !img.naturalWidth) return;
    userAdjusted.current = false;
    const wScale = box.clientWidth / img.naturalWidth;
    const scale = clampScale(
      fitMode === 'contain' ? Math.min(wScale, box.clientHeight / img.naturalHeight, 1) : Math.min(wScale, 1)
    );
    setT({
      scale,
      x: Math.max(0, (box.clientWidth - img.naturalWidth * scale) / 2),
      y: fitMode === 'contain' ? Math.max(0, (box.clientHeight - img.naturalHeight * scale) / 2) : 0,
    });
  }, [fitMode]);

  // Follow the pane: the review-mode divider and window resizes change the
  // box without remounting the viewer. While unadjusted, re-fit live so the
  // leaf tracks the divider; after a manual zoom, keep the reader's spot and
  // only clamp it back on-screen.
  useEffect(() => {
    const box = boxRef.current;
    if (!box || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      if (userAdjusted.current) {
        setT((prev) => ({ ...prev, ...clampPos(prev.x, prev.y, prev.scale) }));
      } else {
        fit();
      }
    });
    ro.observe(box);
    return () => ro.disconnect();
  }, [fit, clampPos]);

  const zoomAt = useCallback(
    (clientX: number, clientY: number, factor: number) => {
      const box = boxRef.current;
      if (!box) return;
      userAdjusted.current = true;
      const rect = box.getBoundingClientRect();
      const cx = clientX - rect.left;
      const cy = clientY - rect.top;
      setT((prev) => {
        const scale = clampScale(prev.scale * factor);
        const k = scale / prev.scale;
        // keep the point under the cursor fixed
        return { scale, ...clampPos(cx - k * (cx - prev.x), cy - k * (cy - prev.y), scale) };
      });
    },
    [clampPos]
  );

  // Native, NON-passive wheel listener — but PINCH-ONLY (owner 2026-08-26:
  // plain scrolling over the leaf must scroll the PAGE, not zoom the image).
  // Trackpad pinch reaches Chrome/Firefox/Edge as a ctrlKey wheel event, so
  // only those zoom (which also gives deliberate ctrl/⌘-wheel zoom on a
  // mouse); ordinary wheel/two-finger scroll falls through untouched.
  // Safari's proprietary GestureEvents below cover its trackpad pinch.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return; // plain scroll → the page's
      e.preventDefault();
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 120 : 1);
      // zoom proportional to the gesture — pinch arrives as small deltas
      const factor = Math.min(1.4, Math.max(1 / 1.4, Math.exp(-dy * 0.012)));
      zoomAt(e.clientX, e.clientY, factor);
    };
    root.addEventListener('wheel', onWheel, { passive: false });

    // Safari trackpad pinch fires proprietary GestureEvents (not ctrl-wheel);
    // left unhandled, Safari zooms the whole page instead of the leaf.
    let gScale = 1;
    const onGestureStart = (e: Event) => {
      e.preventDefault();
      gScale = 1;
    };
    const onGestureChange = (e: Event) => {
      e.preventDefault();
      const g = e as Event & { scale: number; clientX: number; clientY: number };
      if (!g.scale) return;
      zoomAt(g.clientX, g.clientY, g.scale / gScale);
      gScale = g.scale;
    };
    const onGestureEnd = (e: Event) => e.preventDefault();
    root.addEventListener('gesturestart', onGestureStart);
    root.addEventListener('gesturechange', onGestureChange);
    root.addEventListener('gestureend', onGestureEnd);
    return () => {
      root.removeEventListener('wheel', onWheel);
      root.removeEventListener('gesturestart', onGestureStart);
      root.removeEventListener('gesturechange', onGestureChange);
      root.removeEventListener('gestureend', onGestureEnd);
    };
  }, [zoomAt]);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    drag.current = { startX: e.clientX, startY: e.clientY, ox: t.x, oy: t.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    userAdjusted.current = true;
    const d = drag.current;
    setT((prev) => ({
      ...prev,
      ...clampPos(d.ox + (e.clientX - d.startX), d.oy + (e.clientY - d.startY), prev.scale),
    }));
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  const onDoubleClick = (e: React.MouseEvent) => {
    zoomAt(e.clientX, e.clientY, e.altKey || e.shiftKey ? 0.5 : 2);
  };

  const zoomCenter = (factor: number) => {
    const box = boxRef.current;
    if (!box) return;
    const r = box.getBoundingClientRect();
    zoomAt(r.left + box.clientWidth / 2, r.top + box.clientHeight / 2, factor);
  };

  const controls = (
    <div className="flex items-center gap-0.5 bg-card border border-border rounded-md p-0.5">
      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => zoomCenter(1 / 1.25)} aria-label="Zoom out" title="Zoom out">
        <ZoomOut className="h-4 w-4" />
      </Button>
      <button
        type="button"
        onClick={fit}
        title="Fit to pane"
        className="h-7 min-w-[3rem] px-1 rounded text-xs text-muted-foreground font-sans hover:bg-muted"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {Math.round(t.scale * 100)}%
      </button>
      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => zoomCenter(1.25)} aria-label="Zoom in" title="Zoom in">
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={fit} aria-label="Fit to pane" title="Fit to pane">
        <Maximize2 className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    // h-full + flex-col let a fixed-height flex parent (the review layout)
    // drive the viewer: the pan box takes the slack (pass heightClass
    // "flex-1 min-h-0") and the hint bar keeps its row. With auto-height
    // parents everything resolves to content height as before.
    <div ref={rootRef} className="relative h-full flex flex-col bg-muted border border-border rounded-lg overflow-hidden" style={{ overscrollBehavior: 'contain' }}>
      {title !== undefined ? (
        <>
          {/* header bar — mirrors the document pane's toolbar so both cards sit level */}
          <div className="flex items-center justify-between gap-3 h-11 px-3 border-b border-border bg-card shrink-0">
            <div className="min-w-0 truncate font-serif text-[15px] text-foreground" style={{ fontWeight: 580 }}>{title}</div>
            {controls}
          </div>
          {subtitle !== undefined && (
            <div className="h-8 px-3 flex items-center border-b border-border bg-card/70 text-[11px] text-muted-foreground font-sans shrink-0">
              <div className="min-w-0 truncate w-full">{subtitle}</div>
            </div>
          )}
        </>
      ) : (
        <div className="absolute top-3 right-3 z-10 shadow-sm">{controls}</div>
      )}

      <div
        ref={boxRef}
        // overflow-hidden: the transformed <img> is a stacking context and
        // would otherwise paint over the hint bar below the pan box
        className={cn('relative overflow-hidden cursor-grab active:cursor-grabbing touch-none select-none', heightClass)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onDoubleClick={onDoubleClick}
      >
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          draggable={false}
          onLoad={fit}
          className="origin-top-left max-w-none"
          style={{ transform: `translate(${t.x}px, ${t.y}px) scale(${t.scale})`, willChange: 'transform' }}
        />
      </div>

      <div className="h-8 px-3 flex items-center border-t border-border bg-card/70 text-[11px] text-muted-foreground font-sans shrink-0 truncate">
        Pinch or ⌃-scroll to zoom · double-click zooms in (⇧ out) · drag to pan · ⤢ refits the leaf
      </div>
    </div>
  );
};

export default MembraneViewer;
