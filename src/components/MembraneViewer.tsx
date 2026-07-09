// src/components/MembraneViewer.tsx — dependency-free zoom/pan viewer for
// large manuscript images (wheel to zoom at cursor, drag to pan, buttons for
// zoom/reset). Designed for the STAC membrane leaves (~2800×4100 up to
// ~3000×6800 px).
import React, { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface MembraneViewerProps {
  src: string;
  alt: string;
}

const MIN = 0.15;
const MAX = 8;

export const MembraneViewer: React.FC<MembraneViewerProps> = ({ src, alt }) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ scale: 0.28, x: 0, y: 0 });
  const drag = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null);

  const clamp = (s: number) => Math.min(MAX, Math.max(MIN, s));

  const zoomAt = useCallback((clientX: number, clientY: number, factor: number) => {
    const box = boxRef.current;
    if (!box) return;
    const rect = box.getBoundingClientRect();
    const cx = clientX - rect.left;
    const cy = clientY - rect.top;
    setT((prev) => {
      const scale = clamp(prev.scale * factor);
      const k = scale / prev.scale;
      // keep the point under the cursor fixed
      return { scale, x: cx - k * (cx - prev.x), y: cy - k * (cy - prev.y) };
    });
  }, []);

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    zoomAt(e.clientX, e.clientY, e.deltaY < 0 ? 1.12 : 1 / 1.12);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    drag.current = { startX: e.clientX, startY: e.clientY, ox: t.x, oy: t.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const d = drag.current;
    setT((prev) => ({ ...prev, x: d.ox + (e.clientX - d.startX), y: d.oy + (e.clientY - d.startY) }));
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  const center = () => {
    const box = boxRef.current;
    if (!box) return;
    zoomAt(box.getBoundingClientRect().left + box.clientWidth / 2, box.getBoundingClientRect().top + box.clientHeight / 2, 1.25);
  };
  const centerOut = () => {
    const box = boxRef.current;
    if (!box) return;
    zoomAt(box.getBoundingClientRect().left + box.clientWidth / 2, box.getBoundingClientRect().top + box.clientHeight / 2, 1 / 1.25);
  };
  const reset = () => setT({ scale: 0.28, x: 0, y: 0 });

  return (
    <div className="relative bg-muted border border-border rounded-lg overflow-hidden">
      {/* controls */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-card/95 border border-border rounded-md shadow-sm p-1">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={centerOut} aria-label="Zoom out">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-xs text-muted-foreground w-12 text-center font-sans" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {Math.round(t.scale * 100)}%
        </span>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={center} aria-label="Zoom in">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={reset} aria-label="Reset view">
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      <div
        ref={boxRef}
        className="h-[62vh] lg:h-[74vh] cursor-grab active:cursor-grabbing touch-none select-none"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="origin-top-left max-w-none"
          style={{ transform: `translate(${t.x}px, ${t.y}px) scale(${t.scale})` }}
        />
      </div>

      <div className="px-3 py-1.5 border-t border-border bg-card/60 text-[11px] text-muted-foreground font-sans">
        Scroll to zoom · drag to pan
      </div>
    </div>
  );
};

export default MembraneViewer;
