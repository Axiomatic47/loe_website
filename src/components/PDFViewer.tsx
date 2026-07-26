// src/components/PDFViewer.tsx - PDF Document Viewer Component
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, ExternalLink, ZoomIn, ZoomOut, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import DownloadAllPDFs from '@/components/DownloadAllPDFs';

interface Section {
  title: string;
  pdf_file?: string;
  [key: string]: any;
}

interface PDFViewerProps {
  pdfUrl: string;
  title?: string;
  description?: string;
  className?: string;
  allSections?: Section[];
  compositionTitle?: string;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfUrl,
  title = 'Legal Document',
  description,
  className,
  allSections,
  compositionTitle
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [initialLoad, setInitialLoad] = useState(true);
  const [dimensions, setDimensions] = useState({ width: '100%', height: 'calc(100vh - 300px)' });
  const [isResizing, setIsResizing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // The iframe must be created client-side only: in prerendered HTML the PDF
  // can finish loading before hydration attaches onLoad, and React never
  // replays the missed load event — the spinner would stay up forever.
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Some browsers never fire load for PDF iframes at all — don't let the
  // overlay wedge; the browser's own viewer shows progress past this point.
  React.useEffect(() => {
    if (!mounted || !loading) return;
    const fallback = setTimeout(() => setLoading(false), 5000);
    return () => clearTimeout(fallback);
  }, [mounted, loading]);

  // Handle PDF load
  const handleLoad = () => {
    setLoading(false);
    setError(null);
    // After initial page loads, load full document
    if (initialLoad) {
      setTimeout(() => setInitialLoad(false), 100);
    }
  };

  // Handle PDF error
  const handleError = () => {
    setLoading(false);
    setError('Failed to load PDF. The document may be corrupted or the file path is incorrect.');
  };

  // Resize handlers
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);

    const rect = containerRef.current?.getBoundingClientRect();
    setStartPos({
      x: e.clientX,
      y: e.clientY,
      width: rect?.width || 0,
      height: rect?.height || 0
    });
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaX = e.clientX - startPos.x;
      const deltaY = e.clientY - startPos.y;

      // Allow much larger sizes - up to 2000px width and 2000px height
      const newWidth = Math.max(400, Math.min(startPos.width + deltaX, 2000));
      const newHeight = Math.max(400, Math.min(startPos.height + deltaY, 2000));

      setDimensions({
        width: `${newWidth}px`,
        height: `${newHeight}px`
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      // Prevent text selection while dragging
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'nesw-resize';
    } else {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isResizing, startPos]);

  // Download PDF
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open in new tab
  const handleOpenNewTab = () => {
    window.open(pdfUrl, '_blank');
  };

  // Zoom controls
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleResetZoom = () => {
    setZoom(100);
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      style={{
        width: dimensions.width,
        margin: '0 auto'
      }}
    >
      {/* PDF Header */}
      <div className="bg-card border border-border rounded-t-xl p-4 relative">
        {/* Resize Handle - Top Right Corner */}
        <div
          onMouseDown={handleResizeStart}
          className={cn(
            "absolute -top-2 -right-2 w-8 h-8 bg-primary hover:bg-primary/90 rounded-full cursor-nesw-resize",
            "flex items-center justify-center shadow-md transition-colors z-10",
            "border-2 border-card",
            isResizing && "scale-110"
          )}
          title="Drag to resize viewer"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-primary-foreground">
            <path d="M2 14L14 2M6 14L14 6M10 14L14 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-xl font-serif font-medium text-foreground" style={{ letterSpacing: '-0.018em' }}>{title}</h3>
              {description && (
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= 50}
              className="text-foreground hover:bg-background"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetZoom}
              className="text-foreground hover:bg-background min-w-[60px]"
              title="Reset Zoom"
            >
              {zoom}%
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= 200}
              className="text-foreground hover:bg-background"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>

          {/* Action Buttons */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenNewTab}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open in New Tab
          </Button>

          {/* Download All Button - only show if allSections provided */}
          {allSections && allSections.length > 0 && (
            <DownloadAllPDFs
              sections={allSections}
              compositionTitle={compositionTitle || 'Documents'}
            />
          )}
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="relative bg-secondary border-x border-b border-border rounded-b-xl">
        {/* Loading State */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur-sm z-10">
            <div className="text-center">
              <div className="animate-spin h-10 w-10 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-foreground text-base">Loading PDF…</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert className="m-4 bg-destructive/5 border-destructive/30">
            <AlertDescription className="text-foreground">
              {error}
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  Try Downloading Instead
                </Button>
                <Button variant="outline" size="sm" onClick={handleOpenNewTab}>
                  Open in Browser
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* PDF iFrame */}
        <div className="relative" style={{ height: 'calc(100vh - 300px)', minHeight: '600px' }}>
          {mounted && (
            <iframe
              src={initialLoad ? `${pdfUrl}#page=1&zoom=${zoom}` : `${pdfUrl}#zoom=${zoom}`}
              className="w-full h-full rounded-b-xl"
              title={title}
              onLoad={handleLoad}
              onError={handleError}
              style={{
                border: 'none',
                background: '#f5f3ed'
              }}
            />
          )}
          {!initialLoad && loading && (
            <div className="absolute bottom-4 right-4 bg-foreground/90 text-background px-4 py-2 rounded-lg text-sm">
              Loading full document…
            </div>
          )}
        </div>
      </div>

      {/* PDF Footer Info */}
      <div className="mt-4 p-3 bg-secondary/60 border border-border rounded-lg">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <span>PDF Document</span>
          </div>
          <div className="text-muted-foreground/50">•</div>
          <div>Click and drag to pan • Scroll to navigate pages</div>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;