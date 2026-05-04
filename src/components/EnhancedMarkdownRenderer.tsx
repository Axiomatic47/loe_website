// src/components/ImageEnhancedMarkdownRenderer.tsx - Updated with enhanced path resolution
import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Button } from '@/components/ui/button';
import { Code, Eye, Copy, Check, ZoomIn, X, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { resolveImagePath, debugImagePath } from '@/utils/imagePathResolver';

// For MathJax approach
declare global {
  interface Window {
    MathJax: any;
  }
}

interface ImageData {
  src: string;
  alt: string;
  caption?: string;
  position: 'top' | 'middle' | 'bottom' | 'inline';
}

interface ImageEnhancedMarkdownProps {
  content: string;
  images?: ImageData[];
  className?: string;
  showToggle?: boolean;
}

// Enhanced image component with better error handling and debugging
const EnhancedImage: React.FC<{
  src: any;
  alt: string;
  caption?: string;
  className?: string;
  onClick?: () => void;
  onError?: (src: string) => void;
  onLoad?: (src: string) => void;
}> = ({ src, alt, caption, className, onClick, onError, onLoad }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState('');

  // Resolve the image path when src changes
  useEffect(() => {
    const resolvedSrc = resolveImagePath(src);
    setCurrentSrc(resolvedSrc);
    setImageError(false);
    setImageLoaded(false);

    // Debug in development
    if (import.meta.env.DEV) {
      debugImagePath(src);
    }
  }, [src]);

  const handleImageError = () => {
    console.error('❌ Image failed to load:', { originalSrc: src, resolvedSrc: currentSrc });
    setImageError(true);
    if (onError) {
      onError(currentSrc);
    }
  };

  const handleImageLoad = () => {
    console.log('✅ Image loaded successfully:', { originalSrc: src, resolvedSrc: currentSrc });
    setImageLoaded(true);
    setImageError(false);
    if (onLoad) {
      onLoad(currentSrc);
    }
  };

  const retryLoad = () => {
    setImageError(false);
    setImageLoaded(false);
    // Force reload by adding timestamp
    const newSrc = currentSrc.includes('?')
      ? `${currentSrc}&retry=${Date.now()}`
      : `${currentSrc}?retry=${Date.now()}`;
    setCurrentSrc(newSrc);
  };

  if (!currentSrc) {
    return (
      <div className="w-full h-48 bg-card border border-yellow-500/50 rounded flex flex-col items-center justify-center text-yellow-300 p-4">
        <AlertCircle className="h-8 w-8 mb-2" />
        <span className="text-sm text-center">Invalid image source</span>
        <span className="text-xs text-center mt-1 opacity-75">
          Original: {JSON.stringify(src)}
        </span>
      </div>
    );
  }

  if (imageError) {
    return (
      <div className="w-full h-48 bg-card border border-red-500/50 rounded flex flex-col items-center justify-center text-red-300 p-4">
        <AlertCircle className="h-8 w-8 mb-2" />
        <span className="text-sm text-center mb-2">Image failed to load</span>
        <span className="text-xs text-center mb-3 opacity-75 break-all">
          {currentSrc}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="bg-red-900/30 border-red-500/50 text-red-300 hover:bg-red-900/50"
          onClick={retryLoad}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Retry
        </Button>
        {import.meta.env.DEV && (
          <details className="mt-2 w-full">
            <summary className="text-xs cursor-pointer">Debug Info</summary>
            <pre className="text-xs mt-1 bg-card/80 p-2 rounded max-w-full overflow-auto">
              {JSON.stringify({ original: src, resolved: currentSrc }, null, 2)}
            </pre>
          </details>
        )}
      </div>
    );
  }

  return (
    <div className="relative group">
      <img
        src={currentSrc}
        alt={alt}
        className={cn("transition-all duration-200", className)}
        onClick={onClick}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
      />
      {!imageLoaded && (
        <div className="absolute inset-0 bg-card flex items-center justify-center">
          <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></div>
        </div>
      )}
      {caption && (
        <div className="p-3 bg-card">
          <p className="text-sm text-foreground/90 text-center">{caption}</p>
        </div>
      )}
    </div>
  );
};

// Enhanced Image Gallery Component
const ImageGallery: React.FC<{ images: ImageData[]; position: string }> = ({ images, position }) => {
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter images for this position with better validation
  const filteredImages = images.filter(img => {
    const hasValidSrc = img.src && (typeof img.src === 'string' || typeof img.src === 'object');
    const hasCorrectPosition = img.position === position;

    if (import.meta.env.DEV) {
      console.log(`🖼️ Image filter check [${position}]:`, {
        img,
        hasValidSrc,
        hasCorrectPosition,
        srcType: typeof img.src
      });
    }

    return hasValidSrc && hasCorrectPosition;
  });

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log(`🖼️ ImageGallery [${position}] rendered with ${filteredImages.length} images`);
    }
  }, [filteredImages, position]);

  if (filteredImages.length === 0) {
    return null;
  }

  const openModal = (image: ImageData) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedImage(null);
    setIsModalOpen(false);
  };

  return (
    <>
      <div className={cn(
        "my-6",
        filteredImages.length === 1 ? "flex justify-center" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      )}>
        {filteredImages.map((image, index) => (
          <div key={`${position}-${index}`} className="relative group">
            <div className="bg-card/80 rounded-lg border border-border overflow-hidden hover:border-border transition-all duration-200 shadow-lg">
              <EnhancedImage
                src={image.src}
                alt={image.alt}
                caption={image.caption}
                className="w-full h-48 object-cover cursor-pointer transition-all duration-200 hover:scale-105"
                onClick={() => openModal(image)}
              />
              <div className="absolute inset-0 bg-card opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-card text-foreground border-border hover:bg-card"
                  onClick={() => openModal(image)}
                >
                  <ZoomIn className="h-4 w-4 mr-2" />
                  View
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Modal */}
      {isModalOpen && selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[9999]"
          onClick={closeModal}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="outline"
              size="icon"
              className="absolute top-4 right-4 z-[10000] bg-card text-foreground border-border hover:bg-card"
              onClick={closeModal}
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="bg-card/80 rounded-lg border border-border overflow-hidden shadow-2xl">
              <EnhancedImage
                src={selectedImage.src}
                alt={selectedImage.alt}
                caption={selectedImage.caption}
                className="w-full h-auto max-h-[70vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Enhanced Inline Image Component
const InlineImageRenderer: React.FC<{ images: ImageData[] }> = ({ images }) => {
  const inlineImages = images.filter(img =>
    img.position === 'inline' && img.src
  );

  if (inlineImages.length === 0) return null;

  return (
    <>
      {inlineImages.map((image, index) => (
        <span key={`inline-${index}`} className="inline-block mx-2 my-1 relative group">
          <EnhancedImage
            src={image.src}
            alt={image.alt}
            className="inline h-8 w-auto rounded border border-border hover:border-white/50 transition-colors cursor-pointer"
          />
        </span>
      ))}
    </>
  );
};

// Main component remains the same with enhanced image components
const ImageEnhancedMarkdownRenderer: React.FC<ImageEnhancedMarkdownProps> = ({
  content,
  images = [],
  className = "",
  showToggle = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'rendered' | 'raw'>('rendered');
  const [copySuccess, setCopySuccess] = useState(false);

  // Enhanced debug logging
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🎨 ImageEnhancedMarkdownRenderer:', {
        contentLength: content.length,
        imagesCount: images.length,
        processedImages: images.map((img, index) => ({
          index,
          src: img.src,
          resolvedSrc: resolveImagePath(img.src),
          alt: img.alt,
          position: img.position
        }))
      });
    }
  }, [content, images]);

  // Process MathJax after render
  useEffect(() => {
    if (window.MathJax && containerRef.current && viewMode === 'rendered') {
      window.MathJax.typesetPromise([containerRef.current]).catch((err: any) =>
        console.error('MathJax error:', err)
      );
    }
  }, [content, viewMode]);

  // Copy to clipboard function
  const handleCopyRaw = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  // Custom markdown components (same as before, but with enhanced image handling)
  const customComponents = {
    // All existing components remain the same...
    span: ({ node, className, children, ...props }: any) => {
      if (className?.includes('logic-expression')) {
        return <span className={className} {...props}>{children}</span>;
      }
      return <span className={className} {...props}>{children}</span>;
    },
    div: ({ node, className, children, ...props }: any) => {
      if (className?.includes('logic-expression') || className?.includes('logic-block')) {
        return <div className={className} {...props}>{children}</div>;
      }
      return <div className={className} {...props}>{children}</div>;
    },
    p: ({ node, children, ...props }: any) => (
      <p className="mb-4 leading-relaxed text-foreground" {...props}>
        {children}
        <InlineImageRenderer images={images} />
      </p>
    ),
    h1: ({ node, ...props }: any) => <h1 className="text-3xl font-serif mb-6 text-foreground font-bold" {...props} />,
    h2: ({ node, ...props }: any) => <h2 className="text-2xl font-serif mb-4 text-foreground font-bold" {...props} />,
    h3: ({ node, ...props }: any) => <h3 className="text-xl font-serif mb-3 text-foreground font-semibold" {...props} />,
    h4: ({ node, ...props }: any) => <h4 className="text-lg font-serif mb-2 text-foreground font-semibold" {...props} />,
    ul: ({ node, ...props }: any) => <ul className="list-disc pl-6 mb-4 text-foreground" {...props} />,
    ol: ({ node, ...props }: any) => <ol className="list-decimal pl-6 mb-4 text-foreground" {...props} />,
    li: ({ node, ...props }: any) => <li className="mb-2 text-foreground leading-relaxed" {...props} />,
    blockquote: ({ node, ...props }: any) => (
      <blockquote className="border-l-4 border-border pl-4 italic my-6 text-foreground bg-secondary/40 p-4 rounded-r-lg shadow-sm" {...props} />
    ),
    a: ({ node, ...props }: any) => (
      <a className="text-primary hover:text-primary/80 underline underline-offset-2 decoration-1 transition-colors" {...props} />
    ),
    em: ({ node, ...props }: any) => <em className="italic text-foreground font-medium" {...props} />,
    strong: ({ node, ...props }: any) => <strong className="font-bold text-foreground" {...props} />,
    code: ({ node, inline, className, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');
      const isLogic = match && match[1] === 'logic';

      if (isLogic) {
        return (
          <div className="logic-block my-4">
            <code className="text-foreground" {...props} />
          </div>
        );
      }

      return inline ? (
        <code className="bg-card/60 px-2 py-1 rounded text-sm text-foreground font-mono border border-border" {...props} />
      ) : (
        <div className="my-4">
          <pre className="bg-card/60 p-4 rounded-lg text-sm overflow-x-auto text-foreground font-mono border border-border">
            <code {...props} />
          </pre>
        </div>
      );
    },
    pre: ({ node, children, ...props }: any) => (
      <div className="my-4">
        <pre className="bg-card/60 p-4 rounded-lg text-sm overflow-x-auto text-foreground font-mono border border-border" {...props}>
          {children}
        </pre>
      </div>
    ),
    table: ({ node, ...props }: any) => (
      <div className="overflow-x-auto my-6 rounded-lg border border-border">
        <table className="min-w-full" {...props} />
      </div>
    ),
    thead: ({ node, ...props }: any) => <thead className="bg-secondary/40" {...props} />,
    tbody: ({ node, ...props }: any) => <tbody className="divide-y divide-white/20" {...props} />,
    tr: ({ node, ...props }: any) => <tr className="hover:bg-secondary/60 transition-colors" {...props} />,
    th: ({ node, ...props }: any) => (
      <th className="border-b border-border px-4 py-3 text-left text-foreground font-semibold bg-card/60" {...props} />
    ),
    td: ({ node, ...props }: any) => (
      <td className="px-4 py-3 text-foreground border-b border-border" {...props} />
    ),
    hr: ({ node, ...props }: any) => <hr className="my-8 border-border border-t-2" {...props} />,
    img: ({ node, ...props }: any) => (
      <EnhancedImage
        {...props}
        className="max-w-full h-auto rounded-lg shadow-lg my-4 border border-border"
      />
    ),
  };

  return (
    <div ref={containerRef} className={`formal-logic-content ${className}`}>
      {/* Toggle Controls (same as before) */}
      {showToggle && (
        <div className="flex items-center justify-between mb-4 p-3 bg-secondary/40 rounded-lg border border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground/90">View Mode:</span>
            <div className="flex items-center gap-1">
              <Button
                variant={viewMode === 'rendered' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('rendered')}
                className={cn(
                  "text-xs h-8",
                  viewMode === 'rendered'
                    ? "bg-blue-600 text-foreground hover:bg-blue-700"
                    : "text-foreground/90 hover:bg-secondary/60 hover:text-foreground"
                )}
              >
                <Eye className="h-3 w-3 mr-1" />
                Rendered
              </Button>
              <Button
                variant={viewMode === 'raw' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('raw')}
                className={cn(
                  "text-xs h-8",
                  viewMode === 'raw'
                    ? "bg-blue-600 text-foreground hover:bg-blue-700"
                    : "text-foreground/90 hover:bg-secondary/60 hover:text-foreground"
                )}
              >
                <Code className="h-3 w-3 mr-1" />
                Raw Markdown
              </Button>
            </div>
          </div>

          {viewMode === 'raw' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyRaw}
              className={cn(
                "text-xs h-8 border-border",
                copySuccess
                  ? "bg-green-600 border-green-500 text-foreground"
                  : "bg-card/60 text-foreground/90 hover:bg-card hover:text-foreground"
              )}
            >
              {copySuccess ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 mr-1" />
                  Copy Raw
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Debug info in development */}
      {import.meta.env.DEV && images.length > 0 && (
        <div className="mb-4 p-2 bg-blue-900/20 border border-blue-500/30 rounded text-xs text-blue-200">
          <strong>Debug:</strong> Found {images.length} images -
          {images.filter(img => img.position === 'top').length} top,
          {images.filter(img => img.position === 'middle').length} middle,
          {images.filter(img => img.position === 'bottom').length} bottom,
          {images.filter(img => img.position === 'inline').length} inline
        </div>
      )}

      {/* Content Display */}
      {viewMode === 'raw' ? (
        <div className="relative">
          <pre className={cn(
            "whitespace-pre-wrap font-mono text-sm leading-relaxed",
            "bg-card/80 p-4 rounded-lg border border-border",
            "text-foreground overflow-x-auto max-h-96 overflow-y-auto",
            "scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent",
            "select-all"
          )}>
            <code className="text-foreground">{content}</code>
          </pre>

          <div className="mt-2 text-xs text-muted-foreground/80 text-right">
            {content.length} characters • {content.split('\n').length} lines
          </div>
        </div>
      ) : (
        <div className="prose prose-lg max-w-none">
          {/* Top Images */}
          <ImageGallery images={images} position="top" />

          {/* Main Content */}
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={customComponents}
          >
            {content}
          </ReactMarkdown>

          {/* Middle Images */}
          <ImageGallery images={images} position="middle" />

          {/* Bottom Images */}
          <ImageGallery images={images} position="bottom" />
        </div>
      )}
    </div>
  );
};

export default ImageEnhancedMarkdownRenderer;