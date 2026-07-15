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
}) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [t, setT] = useState({ scale: 0.28, x: 0, y: 0 });
  const drag = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null);

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

  const zoomAt = useCallback(
    (clientX: number, clientY: number, factor: number) => {
      const box = boxRef.current;
      if (!box) return;
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

  // Native, NON-passive wheel listener. React's synthetic onWheel is attached
  // passively, so preventDefault there is silently ignored — the page would
  // scroll while zooming, which made the viewer feel broken.
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 120 : 1);
      // zoom proportional to the gesture, not a fixed step per event — smooth
      // on trackpads AND mouse wheels; pinch arrives as ctrlKey-wheel with
      // small deltas, so it gets a higher gain
      const gain = e.ctrlKey ? 0.012 : 0.002;
      const factor = Math.min(1.4, Math.max(1 / 1.4, Math.exp(-dy * gain)));
      zoomAt(e.clientX, e.clientY, factor);
    };
    box.addEventListener('wheel', onWheel, { passive: false });
    return () => box.removeEventListener('wheel', onWheel);
  }, [zoomAt]);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    drag.current = { startX: e.clientX, startY: e.clientY, ox: t.x, oy: t.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
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

  return (
    <div className="relative bg-muted border border-border rounded-lg overflow-hidden">
      {/* controls */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-card/95 border border-border rounded-md shadow-sm p-1">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => zoomCenter(1 / 1.25)} aria-label="Zoom out">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-xs text-muted-foreground w-12 text-center font-sans" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {Math.round(t.scale * 100)}%
        </span>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => zoomCenter(1.25)} aria-label="Zoom in">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={fit} aria-label="Fit to pane">
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      <div
        ref={boxRef}
        className={cn('cursor-grab active:cursor-grabbing touch-none select-none', heightClass)}
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

      <div className="px-3 py-1.5 border-t border-border bg-card/60 text-[11px] text-muted-foreground font-sans">
        Scroll or pinch to zoom · double-click to zoom in (⇧-double-click out) · drag to pan · ⤢ refits the leaf
      </div>
    </div>
  );
};

export default MembraneViewer;
