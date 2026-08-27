// src/components/PdfScrollViewer.tsx — canvas PDF viewer that fits the pane.
//
// Built for the archive leaf pages (owner ask 2026-08-26): browser-native PDF
// frames ignore fit-to-width in Safari (fixed-size page inside margins, blind
// to pane resizes), so this renders pages itself with PDF.js at exactly the
// container's width — IDE-style. Pages scale live with the pane (CSS width)
// and re-render crisp when the size settles; rendering is lazy (viewport ±
// one screen) and far-off-screen canvases are released so long documents
// stay cheap. SSR-safe: PDF.js loads dynamically on the client.
'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';

interface PdfScrollViewerProps {
  src: string;
  /** sizing from the parent — e.g. "h-[80vh]" or "flex-1 min-h-0" */
  className?: string;
}

// cap the canvas backing width so huge panes on retina can't allocate
// runaway bitmaps (3000px covers crisp text on any realistic pane)
const MAX_BACKING_WIDTH = 3000;
const SETTLE_MS = 150;

type PageMeta = { num: number; aspect: number };

export const PdfScrollViewer = ({ src, className }: PdfScrollViewerProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<PageMeta[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [width, setWidth] = useState(0);
  const docRef = useRef<PDFDocumentProxy | null>(null);
  const canvasRefs = useRef(new Map<number, HTMLCanvasElement>());
  const renderedWidth = useRef(new Map<number, number>());
  const tasks = useRef(new Map<number, RenderTask>());
  const visible = useRef(new Set<number>());
  const ioRef = useRef<IntersectionObserver | null>(null);

  // ---- document load ------------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    let loadingTask: { destroy(): Promise<void> } | null = null;
    const taskMap = tasks.current;
    const widthMap = renderedWidth.current;
    const visibleSet = visible.current;
    setPages([]);
    setError(null);
    (async () => {
      try {
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs',
          import.meta.url
        ).toString();
        const task = pdfjs.getDocument({ url: src });
        loadingTask = task;
        const doc = await task.promise;
        if (cancelled) return;
        docRef.current = doc;
        const metas: PageMeta[] = [];
        for (let n = 1; n <= doc.numPages; n++) {
          const page = await doc.getPage(n);
          const vp = page.getViewport({ scale: 1 });
          metas.push({ num: n, aspect: vp.height / vp.width });
          if (cancelled) return;
        }
        setPages(metas);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
      taskMap.forEach((t) => t.cancel());
      taskMap.clear();
      widthMap.clear();
      visibleSet.clear();
      docRef.current = null;
      // destroying the loading task tears down the document and its worker
      void loadingTask?.destroy();
    };
  }, [src]);

  // ---- pane width tracking (live CSS scale; crisp re-render on settle) ----
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let settle: ReturnType<typeof setTimeout>;
    const ro = new ResizeObserver(() => {
      clearTimeout(settle);
      settle = setTimeout(() => {
        setWidth((prev) => {
          const next = el.clientWidth;
          if (prev > 0 && next > 0 && prev !== next) {
            // heights scale linearly with width — keep the reader's place
            el.scrollTop = (el.scrollTop * next) / prev;
          }
          return next;
        });
      }, SETTLE_MS);
    });
    ro.observe(el);
    return () => {
      clearTimeout(settle);
      ro.disconnect();
    };
  }, []);

  // ---- page rendering ------------------------------------------------------
  const renderPage = useCallback(async (num: number, cssWidth: number) => {
    const doc = docRef.current;
    const canvas = canvasRefs.current.get(num);
    if (!doc || !canvas || cssWidth <= 0) return;
    if (renderedWidth.current.get(num) === cssWidth) return;
    tasks.current.get(num)?.cancel();
    try {
      const page = await doc.getPage(num);
      const base = page.getViewport({ scale: 1 });
      const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, MAX_BACKING_WIDTH / cssWidth));
      const vp = page.getViewport({ scale: cssWidth / base.width });
      canvas.width = Math.floor(vp.width * dpr);
      canvas.height = Math.floor(vp.height * dpr);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const task = page.render({
        canvas,
        canvasContext: ctx,
        viewport: vp,
        transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined,
      });
      tasks.current.set(num, task);
      await task.promise;
      renderedWidth.current.set(num, cssWidth);
    } catch (e) {
      // a cancelled render (rapid resize/scroll) is normal flow, not an error
      if (e instanceof Error && e.name === 'RenderingCancelledException') return;
    } finally {
      tasks.current.delete(num);
    }
  }, []);

  // observe pages: render when near the viewport, release when far away
  useEffect(() => {
    const rootEl = scrollRef.current;
    if (!rootEl || pages.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const num = Number((entry.target as HTMLElement).dataset.page);
          const canvas = canvasRefs.current.get(num);
          if (entry.isIntersecting) {
            visible.current.add(num);
            void renderPage(num, rootEl.clientWidth);
          } else {
            visible.current.delete(num);
            if (canvas) {
              // release the bitmap; the aspect-ratio placeholder keeps layout
              canvas.width = 0;
              canvas.height = 0;
              renderedWidth.current.delete(num);
            }
          }
        }
      },
      { root: rootEl, rootMargin: '100% 0px' }
    );
    ioRef.current = io;
    canvasRefs.current.forEach((c) => io.observe(c.parentElement as Element));
    return () => {
      io.disconnect();
      ioRef.current = null;
    };
  }, [pages, renderPage]);

  // width settled → re-render whatever is on screen at the new width
  useEffect(() => {
    if (width <= 0) return;
    visible.current.forEach((num) => void renderPage(num, width));
  }, [width, renderPage]);

  if (error) {
    return (
      <div className={cn('flex items-center justify-center text-sm font-sans text-muted-foreground p-8', className)}>
        <span>
          The document could not be rendered ({error}).{' '}
          <a href={src} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
            Open the PDF directly
          </a>
          .
        </span>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className={cn('overflow-y-auto overscroll-contain', className)} style={{ background: '#f5f3ed' }}>
      {pages.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="flex flex-col items-stretch gap-3 p-3">
          {pages.map((p) => (
            <div
              key={p.num}
              data-page={p.num}
              className="bg-white shadow-sm"
              style={{ aspectRatio: `1 / ${p.aspect}` }}
            >
              <canvas
                ref={(el) => {
                  if (el) canvasRefs.current.set(p.num, el);
                  else canvasRefs.current.delete(p.num);
                }}
                className="w-full h-auto block"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PdfScrollViewer;
