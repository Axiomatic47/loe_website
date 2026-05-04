// src/utils/mediaIntegration.ts
// Fixed utility functions with proper URL encoding for image paths

// Re-export types that might be used elsewhere
export interface ImageData {
  src: string;
  alt: string;
  caption?: string;
  position: 'top' | 'middle' | 'bottom' | 'inline';
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'document';
  src: string;
  title: string;
  description?: string;
  tags?: string[];
}

/**
 * Resolve and properly encode image path for browser consumption
 */
function resolveAndEncodeImagePath(src: any): string {
  if (!src) return '';

  // Handle arrays (common with Netlify CMS)
  if (Array.isArray(src)) {
    if (src.length > 0) {
      return resolveAndEncodeImagePath(src[0]); // Use first item in array
    }
    return '';
  }

  // Handle string URLs
  if (typeof src === 'string') {
    const cleanSrc = src.trim();

    // If it's already a full URL, use it as-is
    if (cleanSrc.startsWith('http')) {
      return cleanSrc;
    }

    let resolvedPath = '';

    // If it's already a properly formatted path, use it
    if (cleanSrc.startsWith('/uploads/')) {
      resolvedPath = cleanSrc;
    }
    // If it starts with uploads, add leading slash
    else if (cleanSrc.startsWith('uploads/')) {
      resolvedPath = `/${cleanSrc}`;
    }
    // For collection-specific paths that might be missing /uploads/
    else if (cleanSrc.startsWith('data/') || cleanSrc.startsWith('manuscript/') ||
        cleanSrc.startsWith('timeline/') || cleanSrc.startsWith('map/')) {
      resolvedPath = `/uploads/${cleanSrc}`;
    }
    // CRITICAL FIX: If path starts with /data/, /manuscript/, etc., add /uploads prefix
    else if (cleanSrc.startsWith('/data/') || cleanSrc.startsWith('/manuscript/') ||
        cleanSrc.startsWith('/timeline/') || cleanSrc.startsWith('/map/')) {
      resolvedPath = `/uploads${cleanSrc}`;
    }
    // Default: assume it's a filename that needs /uploads/data/ prefix
    else {
      resolvedPath = `/uploads/data/${cleanSrc}`;
    }

    // CRITICAL FIX: URL encode the path components (but not the slashes)
    const pathParts = resolvedPath.split('/');
    const encodedParts = pathParts.map((part, index) => {
      // Don't encode the first empty part or 'uploads' or 'data'
      if (index === 0 || part === 'uploads' || part === 'data' || part === 'manuscript' ||
          part === 'timeline' || part === 'map') {
        return part;
      }
      // Encode the filename part
      return encodeURIComponent(part);
    });

    return encodedParts.join('/');
  }

  // Handle object URLs (from CMS)
  if (typeof src === 'object' && src !== null) {
    // Try common object properties
    const url = src.url || src.src || src.path || String(src);
    return resolveAndEncodeImagePath(url);
  }

  // Fallback
  return String(src);
}

/**
 * Convert ImageData from CMS to MediaItem format for gallery display
 * FIXED: Now properly resolves and encodes image paths
 */
export function convertImageDataToMediaItems(
  images: ImageData[],
  sectionTitle: string,
  collectionType: string,
  featured: boolean = false
): MediaItem[] {
  if (!images || !Array.isArray(images)) {
    console.warn('🖼️ convertImageDataToMediaItems: Invalid images array', images);
    return [];
  }

  return images.map((img, index) => {
    // CRITICAL FIX: Properly resolve and encode the image path
    const resolvedSrc = resolveAndEncodeImagePath(img.src);
    const mediaType = determineMediaType(img.src);

    const mediaItem: MediaItem = {
      id: `${sectionTitle.toLowerCase().replace(/\s+/g, '-')}-${mediaType}-${index}`,
      type: mediaType,
      src: resolvedSrc, // Use the resolved and encoded path
      title: img.alt || `${sectionTitle} - ${mediaType} ${index + 1}`,
      description: img.caption,
      tags: [
        sectionTitle,
        collectionType,
        img.position,
        mediaType,
        ...(featured ? ['featured'] : [])
      ]
    };

    if (import.meta.env.DEV) {
      console.log(`🖼️ Converted image ${index}:`, {
        originalSrc: img.src,
        resolvedSrc: resolvedSrc,
        mediaItem: mediaItem
      });
    }

    return mediaItem;
  });
}

/**
 * Determine media type from file extension or src content
 */
export function determineMediaType(src: string): 'image' | 'video' | 'document' {
  if (!src || typeof src !== 'string') return 'document';

  const extension = src.toLowerCase().split('.').pop() || '';

  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico', 'tiff', 'tif'];
  const videoExts = ['mp4', 'webm', 'ogg', 'avi', 'mov', 'wmv', 'flv', 'm4v', '3gp'];

  if (imageExts.includes(extension)) return 'image';
  if (videoExts.includes(extension)) return 'video';
  return 'document';
}

/**
 * Get media statistics for display
 */
export function getMediaStats(items: MediaItem[]) {
  const stats = {
    total: items.length,
    images: items.filter(item => item.type === 'image').length,
    videos: items.filter(item => item.type === 'video').length,
    documents: items.filter(item => item.type === 'document').length,
    byPosition: {
      top: items.filter(item => item.tags?.includes('top')).length,
      middle: items.filter(item => item.tags?.includes('middle')).length,
      bottom: items.filter(item => item.tags?.includes('bottom')).length,
      inline: items.filter(item => item.tags?.includes('inline')).length
    }
  };

  return stats;
}

/**
 * Debug helper for development
 */
export function debugMediaIntegration(
  images: ImageData[],
  mediaItems: MediaItem[],
  sectionTitle: string
) {
  if (!import.meta.env.DEV) return;

  console.group(`🖼️ Media Integration Debug - ${sectionTitle}`);

  console.log('Original Images:', images);
  console.log('Converted MediaItems:', mediaItems);
  console.log('Stats:', getMediaStats(mediaItems));

  // Validate all paths
  mediaItems.forEach((item, index) => {
    console.log(`Item ${index}:`, {
      id: item.id,
      type: item.type,
      originalSrc: images[index]?.src,
      resolvedSrc: item.src,
      title: item.title,
      tags: item.tags
    });

    // Check if path looks correct
    if (!item.src.startsWith('/uploads/')) {
      console.warn(`⚠️ Item ${index} path doesn't start with /uploads/:`, item.src);
    }

    // Check if path is properly encoded
    try {
      const decoded = decodeURIComponent(item.src);
      if (decoded !== item.src) {
        console.log(`✅ Item ${index} path is properly URL encoded`);
      }
    } catch (e) {
      console.warn(`⚠️ Item ${index} path encoding issue:`, e);
    }
  });

  console.groupEnd();
}

/**
 * Filter media items by type
 */
export function filterMediaByType(items: MediaItem[], type: 'image' | 'video' | 'document'): MediaItem[] {
  return items.filter(item => item.type === type);
}

/**
 * Group media items by position
 */
export function groupMediaByPosition(items: MediaItem[]): {
  top: MediaItem[];
  middle: MediaItem[];
  bottom: MediaItem[];
  inline: MediaItem[];
  all: MediaItem[];
} {
  const groups = {
    top: [] as MediaItem[],
    middle: [] as MediaItem[],
    bottom: [] as MediaItem[],
    inline: [] as MediaItem[],
    all: items
  };

  items.forEach(item => {
    const position = item.tags?.find(tag =>
      ['top', 'middle', 'bottom', 'inline'].includes(tag)
    ) || 'middle';

    groups[position as keyof Omit<typeof groups, 'all'>].push(item);
  });

  return groups;
}

/**
 * Validate media items and filter out invalid ones
 */
export function validateMediaItems(items: MediaItem[]): MediaItem[] {
  return items.filter(item => {
    const isValid = (
      item.id &&
      item.src &&
      item.title &&
      ['image', 'video', 'document'].includes(item.type)
    );

    if (!isValid && import.meta.env.DEV) {
      console.warn('🚫 Invalid media item filtered out:', item);
    }

    return isValid;
  });
}

// Export a default object with all functions for convenience
export default {
  convertImageDataToMediaItems,
  determineMediaType,
  getMediaStats,
  debugMediaIntegration,
  filterMediaByType,
  groupMediaByPosition,
  validateMediaItems
};