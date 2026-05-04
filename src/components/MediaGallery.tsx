// src/components/MediaGallery.tsx
// Complete MediaGallery component optimized for full-width scrollable screenshots

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'document';
  src: string;
  title: string;
  description?: string;
  tags?: string[];
}

interface MediaGalleryProps {
  items: MediaItem[];
  showCategories?: boolean;
  allowDownload?: boolean;
  className?: string;
  layout?: 'grid' | 'masonry' | 'carousel';
  columns?: 2 | 3 | 4;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({
  items,
  allowDownload = true,
  className,
  columns = 3
}) => {
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set());

  // Debug logging for development
  if (import.meta.env.DEV) {
    console.log('🎨 MediaGallery received items:', items.map(item => ({
      id: item.id,
      src: item.src,
      title: item.title,
      type: item.type
    })));
  }

  // Keyboard support for modal
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isModalOpen) return;

      if (e.key === 'Escape') {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyPress);
      return () => {
        document.removeEventListener('keydown', handleKeyPress);
      };
    }
  }, [isModalOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const openModal = (item: MediaItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedItem(null);
    setIsModalOpen(false);
    // Restore body scroll when modal is closed
    document.body.style.overflow = 'unset';
  };

  const handleImageError = (itemId: string, src: string) => {
    console.error('❌ MediaGallery image failed to load:', { itemId, src });
    setImageLoadErrors(prev => new Set(prev).add(itemId));
  };

  const handleImageLoad = (src: string) => {
    if (import.meta.env.DEV) {
      console.log('✅ MediaGallery image loaded successfully:', src);
    }
  };

  const downloadImage = async (src: string, title: string) => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  if (items.length === 0) {
    return (
      <div className={cn(
        "text-center py-8 px-4 bg-black/20 rounded-lg border border-white/20",
        className
      )}>
        <p className="text-gray-300">No media items to display</p>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Gallery Grid - Optimized for full-width screenshots */}
      <div className={cn(
        "grid gap-4",
        // Single column layout for full-width screenshots
        "grid-cols-1"
      )}>
        {items.map((item) => {
          const hasError = imageLoadErrors.has(item.id);

          return (
            <div
              key={item.id}
              className="relative group cursor-pointer overflow-hidden rounded-lg border border-white/20 hover:border-white/40 transition-all duration-200 bg-black/20 hover:bg-black/30"
              onClick={() => openModal(item)}
            >
              {!hasError ? (
                <img
                  src={item.src}
                  alt={item.title}
                  className="w-full h-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
                  onError={() => handleImageError(item.id, item.src)}
                  onLoad={() => handleImageLoad(item.src)}
                  style={{
                    maxHeight: 'none', // Allow full height for long screenshots
                    minHeight: '200px' // Minimum height for loading
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-48 text-gray-400">
                  <div className="text-center">
                    <div className="text-sm">Image unavailable</div>
                    <div className="text-xs">{item.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{item.src}</div>
                  </div>
                </div>
              )}

              {/* Overlay with controls */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex items-center space-x-3">
                  <div className="bg-black/60 backdrop-blur-sm rounded-full p-3">
                    <Maximize2 className="w-8 h-8 text-white drop-shadow-lg" />
                  </div>
                  {allowDownload && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="bg-black/60 backdrop-blur-sm text-white hover:bg-black/80"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadImage(item.src, item.title);
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Caption overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <p className="text-white text-base font-medium">{item.title}</p>
                {item.description && (
                  <p className="text-gray-300 text-sm mt-1">{item.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="mt-6 text-center text-sm text-gray-400">
        Showing {items.length} {items.length === 1 ? 'item' : 'items'}
      </div>

      {/* Full-Screen Scrollable Gallery Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-black/80 backdrop-blur-sm border-b border-white/20 p-4">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium text-lg">Documentation Gallery</h3>
                <p className="text-gray-300 text-sm mt-1">
                  {items.length} {items.length === 1 ? 'image' : 'images'} - Scroll to view all
                </p>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                {allowDownload && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Download the first image as a sample
                      if (items.length > 0) {
                        downloadImage(items[0].src, `${items[0].title}_gallery`);
                      }
                    }}
                    className="text-white hover:bg-white/10"
                    title="Download first image"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeModal}
                  className="text-white hover:bg-white/10"
                  title="Close gallery"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Scrollable content with ALL images */}
          <div className="pt-20 pb-4 px-4 h-full overflow-auto">
            <div className="max-w-none mx-auto space-y-8">
              {items.map((item, index) => {
                const hasError = imageLoadErrors.has(item.id);

                return (
                  <div key={item.id} className="relative">
                    {/* Image title */}
                    <div className="mb-4 text-center">
                      <h4 className="text-white font-medium text-lg">{item.title}</h4>
                      {item.description && (
                        <p className="text-gray-300 text-sm mt-1">{item.description}</p>
                      )}
                      <div className="text-gray-400 text-xs mt-1">
                        Image {index + 1} of {items.length}
                      </div>
                    </div>

                    {/* Full-width image */}
                    {!hasError ? (
                      <img
                        src={item.src}
                        alt={item.title}
                        className="w-full h-auto object-contain rounded-lg shadow-2xl"
                        onError={() => handleImageError(item.id, item.src)}
                        onLoad={() => handleImageLoad(item.src)}
                        style={{
                          maxHeight: 'none', // Allow full natural height
                          minHeight: '200px' // Minimum height for loading
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-64 bg-black/40 rounded-lg border border-white/20">
                        <div className="text-center text-gray-400">
                          <div className="text-sm">Image unavailable</div>
                          <div className="text-xs mt-1">{item.src}</div>
                        </div>
                      </div>
                    )}

                    {/* Individual download button */}
                    {allowDownload && !hasError && (
                      <div className="absolute top-2 right-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadImage(item.src, item.title)}
                          className="bg-black/60 backdrop-blur-sm text-white hover:bg-black/80"
                          title={`Download ${item.title}`}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Instructions */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-gray-400 text-sm bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
            Scroll to view all images • Press ESC to close
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaGallery;