// src/components/MathJaxMarkdownRenderer.tsx - Enhanced renderer with MathJax support

import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw';
import { Button } from '@/components/ui/button';
import { Code, Eye, Copy, Check, ZoomIn, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMathJax } from '@/hooks/useMathJax';

interface ImageData {
  src: string;
  alt: string;
  caption?: string;
  position: 'top' | 'middle' | 'bottom' | 'inline';
}

interface MathJaxMarkdownProps {
  content: string;
  images?: ImageData[];
  className?: string;
  showToggle?: boolean;
}

// Enhanced Image Component with proper error handling
const EnhancedImage: React.FC<{
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  onClick?: () => void;
}> = ({ src, alt, caption, className, onClick }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageError = () => {
    console.error('❌ Image failed to load:', src);
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log('✅ Image loaded successfully:', src);
    setImageLoaded(true);
    setImageError(false);
  };

  // Resolve image path
  const resolvedSrc = src.startsWith('/') ? src : `/uploads/${src}`;

  if (imageError) {
    return (
      <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4 text-center">
        <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-400 text-sm">Image not found</p>
        <p className="text-gray-500 text-xs">{src}</p>
      </div>
    );
  }

  return (
    <div className={cn("image-container", className)}>
      <img
        src={resolvedSrc}
        alt={alt}
        className={cn(
          "rounded-lg shadow-lg transition-all duration-300",
          "hover:shadow-xl hover:scale-[1.02]",
          onClick && "cursor-pointer",
          !imageLoaded && "opacity-0"
        )}
        onLoad={handleImageLoad}
        onError={handleImageError}
        onClick={onClick}
        loading="lazy"
      />
      {caption && (
        <p className="text-center text-gray-400 text-sm mt-2 italic">{caption}</p>
      )}
    </div>
  );
};

// Modal for image viewing
const ImageModal: React.FC<{
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}> = ({ src, alt, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative max-w-[90vw] max-h-[90vh]">
        <Button
          variant="outline"
          size="icon"
          className="absolute -top-12 right-0 bg-black/50 text-white border-white/20"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-full object-contain rounded-lg"
        />
      </div>
    </div>
  );
};

const MathJaxMarkdownRenderer: React.FC<MathJaxMarkdownProps> = ({
  content,
  images = [],
  className,
  showToggle = false
}) => {
  const [viewMode, setViewMode] = useState<'rendered' | 'raw'>('rendered');
  const [copySuccess, setCopySuccess] = useState(false);
  const [modalImage, setModalImage] = useState<{ src: string; alt: string } | null>(null);
  const [processedContent, setProcessedContent] = useState(content);

  // Use MathJax hook with content as dependency
  const { containerRef, isReady, isLoading } = useMathJax({
    autoTypeset: true,
    dependencies: [content, viewMode]
  });

  // Process content to organize images by position
  useEffect(() => {
    if (!images.length) {
      setProcessedContent(content);
      return;
    }

    let processed = content;
    const topImages = images.filter(img => img.position === 'top');
    const bottomImages = images.filter(img => img.position === 'bottom');

    // Add top images
    if (topImages.length > 0) {
      const topImageElements = topImages.map(img =>
        `![${img.alt}](${img.src}${img.caption ? ` "${img.caption}"` : ''})`
      ).join('\n\n');
      processed = topImageElements + '\n\n' + processed;
    }

    // Add bottom images
    if (bottomImages.length > 0) {
      const bottomImageElements = bottomImages.map(img =>
        `![${img.alt}](${img.src}${img.caption ? ` "${img.caption}"` : ''})`
      ).join('\n\n');
      processed = processed + '\n\n' + bottomImageElements;
    }

    setProcessedContent(processed);
  }, [content, images]);

  // Copy to clipboard function
  const handleCopyRaw = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Custom markdown components with MathJax support
  const customComponents = {
    // Mathematical expressions
    div: ({ node, className, children, ...props }: any) => {
      if (className?.includes('math-display')) {
        return (
          <div className="math-display tex2jax_process" {...props}>
            {children}
          </div>
        );
      }
      if (className?.includes('logic-expression')) {
        return <div className={className} {...props}>{children}</div>;
      }
      return <div className={className} {...props}>{children}</div>;
    },

    span: ({ node, className, children, ...props }: any) => {
      if (className?.includes('math-inline')) {
        return (
          <span className="math-inline tex2jax_process" {...props}>
            {children}
          </span>
        );
      }
      return <span className={className} {...props}>{children}</span>;
    },

    // Text elements
    p: ({ node, children, ...props }: any) => (
      <p className="mb-4 leading-relaxed text-gray-100 drop-shadow tex2jax_process" {...props}>
        {children}
      </p>
    ),

    // Headings
    h1: ({ node, children, ...props }: any) => (
      <h1 className="text-4xl font-serif mb-6 text-white drop-shadow-lg tex2jax_process" {...props}>
        {children}
      </h1>
    ),
    h2: ({ node, children, ...props }: any) => (
      <h2 className="text-3xl font-serif mb-5 text-white drop-shadow tex2jax_process" {...props}>
        {children}
      </h2>
    ),
    h3: ({ node, children, ...props }: any) => (
      <h3 className="text-2xl font-serif mb-4 text-white drop-shadow tex2jax_process" {...props}>
        {children}
      </h3>
    ),
    h4: ({ node, children, ...props }: any) => (
      <h4 className="text-xl font-serif mb-3 text-white drop-shadow tex2jax_process" {...props}>
        {children}
      </h4>
    ),

    // Links
    a: ({ node, children, href, ...props }: any) => (
      <a
        href={href}
        className="text-blue-400 hover:text-blue-300 underline decoration-blue-400/50 hover:decoration-blue-300"
        target={href?.startsWith('http') ? '_blank' : undefined}
        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
        {...props}
      >
        {children}
      </a>
    ),

    // Text formatting
    strong: ({ node, children, ...props }: any) => (
      <strong className="font-bold text-white" {...props}>{children}</strong>
    ),
    em: ({ node, children, ...props }: any) => (
      <em className="italic text-gray-200" {...props}>{children}</em>
    ),

    // Lists
    ul: ({ node, children, ...props }: any) => (
      <ul className="list-disc list-inside mb-4 space-y-2 text-gray-200" {...props}>
        {children}
      </ul>
    ),
    ol: ({ node, children, ...props }: any) => (
      <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-200" {...props}>
        {children}
      </ol>
    ),
    li: ({ node, children, ...props }: any) => (
      <li className="text-gray-200" {...props}>{children}</li>
    ),

    // Code
    code: ({ node, inline, className, children, ...props }: any) => {
      if (inline) {
        return (
          <code className="bg-gray-800 text-blue-300 px-2 py-1 rounded font-mono text-sm" {...props}>
            {children}
          </code>
        );
      }
      return (
        <pre className="bg-gray-800 text-gray-200 p-4 rounded-lg overflow-x-auto mb-4">
          <code className="font-mono text-sm" {...props}>
            {children}
          </code>
        </pre>
      );
    },

    // Tables
    table: ({ node, children, ...props }: any) => (
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full border-collapse border border-gray-600" {...props}>
          {children}
        </table>
      </div>
    ),
    th: ({ node, children, ...props }: any) => (
      <th className="border border-gray-600 bg-gray-800 px-4 py-2 text-left text-white font-semibold" {...props}>
        {children}
      </th>
    ),
    td: ({ node, children, ...props }: any) => (
      <td className="border border-gray-600 px-4 py-2 text-gray-200" {...props}>
        {children}
      </td>
    ),

    // Images
    img: ({ node, src, alt, title, ...props }: any) => (
      <EnhancedImage
        src={src}
        alt={alt || 'Image'}
        caption={title}
        className="mb-4 w-full"
        onClick={() => setModalImage({ src, alt: alt || 'Image' })}
        {...props}
      />
    ),

    // Blockquotes
    blockquote: ({ node, children, ...props }: any) => (
      <blockquote className="border-l-4 border-blue-400 pl-4 italic text-gray-300 mb-4" {...props}>
        {children}
      </blockquote>
    ),

    // Horizontal rule
    hr: ({ node, ...props }: any) => (
      <hr className="border-gray-600 my-6" {...props} />
    )
  };

  if (isLoading) {
    return (
      <div className={cn("prose prose-invert prose-lg max-w-none", className)}>
        <div className="math-loading">Loading mathematical content...</div>
      </div>
    );
  }

  return (
    <>
      <div className={cn("relative", className)}>
        {showToggle && (
          <div className="flex justify-end mb-4 space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'rendered' ? 'raw' : 'rendered')}
              className="bg-black/30 border-white/20 text-white hover:bg-black/50"
            >
              {viewMode === 'rendered' ? <Code className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {viewMode === 'rendered' ? 'View Raw' : 'View Rendered'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyRaw}
              className="bg-black/30 border-white/20 text-white hover:bg-black/50"
            >
              {copySuccess ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copySuccess ? 'Copied!' : 'Copy Raw'}
            </Button>
          </div>
        )}

        {viewMode === 'rendered' ? (
          <div
            ref={containerRef}
            className="prose prose-invert prose-lg max-w-none tex2jax_process"
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeRaw]}
              components={customComponents}
            >
              {processedContent}
            </ReactMarkdown>
          </div>
        ) : (
          <pre className="bg-gray-800 text-gray-200 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
            {content}
          </pre>
        )}
      </div>

      {modalImage && (
        <ImageModal
          src={modalImage.src}
          alt={modalImage.alt}
          isOpen={!!modalImage}
          onClose={() => setModalImage(null)}
        />
      )}
    </>
  );
};

export default MathJaxMarkdownRenderer;