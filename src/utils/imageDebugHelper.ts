// src/utils/imageDebugHelper.ts - Enhanced image debugging for Laws of Existence

export interface ImageDebugInfo {
  originalSrc: any;
  resolvedSrc: string;
  srcType: string;
  isValid: boolean;
  possibleIssues: string[];
  suggestedFixes: string[];
  fallbackPaths: string[];
}

/**
 * Enhanced image path resolver that handles NetlifyCMS output variations
 */
export function debugAndResolveImagePath(src: any): ImageDebugInfo {
  const debug: ImageDebugInfo = {
    originalSrc: src,
    resolvedSrc: '',
    srcType: typeof src,
    isValid: false,
    possibleIssues: [],
    suggestedFixes: [],
    fallbackPaths: []
  };

  // Handle null/undefined/empty
  if (!src) {
    debug.possibleIssues.push('Source is null, undefined, or empty');
    debug.suggestedFixes.push('Check CMS image field configuration');
    return debug;
  }

  // Handle array format (NetlifyCMS sometimes returns arrays)
  if (Array.isArray(src)) {
    debug.possibleIssues.push('Source is an array - taking first element');
    debug.suggestedFixes.push('Check CMS multiple file configuration');
    if (src.length > 0) {
      const resolved = debugAndResolveImagePath(src[0]);
      debug.resolvedSrc = resolved.resolvedSrc;
      debug.isValid = resolved.isValid;
    }
    return debug;
  }

  // Handle object format (NetlifyCMS file objects)
  if (typeof src === 'object') {
    let pathFound = false;

    // Try different object properties NetlifyCMS might use
    const pathProperties = ['path', 'src', 'url', 'public_path', 'file'];

    for (const prop of pathProperties) {
      if (src[prop] && typeof src[prop] === 'string') {
        debug.resolvedSrc = normalizeImagePath(src[prop]);
        pathFound = true;
        break;
      }
    }

    if (!pathFound) {
      debug.possibleIssues.push('Object has no recognizable path property');
      debug.suggestedFixes.push(`Expected properties: ${pathProperties.join(', ')}`);
      debug.suggestedFixes.push('Check NetlifyCMS media configuration');
      return debug;
    }
  } else if (typeof src === 'string') {
    debug.resolvedSrc = normalizeImagePath(src);
  } else {
    debug.possibleIssues.push(`Unexpected source type: ${typeof src}`);
    debug.suggestedFixes.push('Source should be string or object with path property');
    return debug;
  }

  // Generate fallback paths
  if (debug.resolvedSrc) {
    debug.fallbackPaths = generateFallbackPaths(debug.resolvedSrc);
    debug.isValid = true;
  }

  return debug;
}

/**
 * Normalize image path from various CMS formats to working frontend path
 */
function normalizeImagePath(path: string): string {
  if (!path || typeof path !== 'string') return '';

  const cleanPath = path.trim();

  // External URLs - return as-is
  if (cleanPath.match(/^https?:\/\//)) {
    return cleanPath;
  }

  // Already properly formatted
  if (cleanPath.startsWith('/uploads/')) {
    return cleanPath;
  }

  // Remove leading slashes and normalize
  const normalized = cleanPath.replace(/^\/+/, '');

  // Handle various CMS output patterns
  if (normalized.match(/^public\/uploads\//)) {
    return `/${normalized.replace('public/', '')}`;
  }

  if (normalized.match(/^uploads\//)) {
    return `/${normalized}`;
  }

  // Collection-specific paths
  if (normalized.match(/^(manuscript|data|timeline|map)\//)) {
    return `/uploads/${normalized}`;
  }

  // Default: assume it's a filename that needs /uploads/ prefix
  return `/uploads/${normalized}`;
}

/**
 * Generate fallback paths for image resolution
 */
function generateFallbackPaths(originalPath: string): string[] {
  const filename = originalPath.split('/').pop() || '';
  const collections = ['manuscript', 'data', 'timeline', 'map', 'general'];

  const fallbacks = [
    originalPath, // Original path first
    `/uploads/${filename}`, // Direct in uploads
    `/uploads/general/${filename}` // General folder
  ];

  // Add collection-specific paths
  collections.forEach(collection => {
    fallbacks.push(`/uploads/${collection}/${filename}`);
    // Add subcategories for each collection
    const subcategories = getSubcategoriesFor(collection);
    subcategories.forEach(sub => {
      fallbacks.push(`/uploads/${collection}/${sub}/${filename}`);
    });
  });

  // Remove duplicates
  return [...new Set(fallbacks)];
}

/**
 * Get subcategories for each collection type
 */
function getSubcategoriesFor(collection: string): string[] {
  const subcategories: Record<string, string[]> = {
    manuscript: ['diagrams', 'photos', 'charts'],
    data: ['graphs', 'screenshots', 'documents'],
    timeline: ['events', 'organizations', 'milestones'],
    map: ['visualizations', 'regions', 'data'],
    general: ['icons', 'backgrounds', 'logos']
  };

  return subcategories[collection] || [];
}

/**
 * Test if image path exists (development only)
 */
export async function testImagePath(path: string): Promise<boolean> {
  if (!import.meta.env.DEV) return true;

  try {
    const response = await fetch(path, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Find working image path from fallbacks
 */
export async function findWorkingImagePath(fallbackPaths: string[]): Promise<string | null> {
  if (!import.meta.env.DEV) return fallbackPaths[0] || null;

  for (const path of fallbackPaths) {
    if (await testImagePath(path)) {
      return path;
    }
  }

  return null;
}

/**
 * Main enhanced resolver function
 */
export function enhancedResolveImagePath(src: any): string {
  const debug = debugAndResolveImagePath(src);

  if (import.meta.env.DEV) {
    console.log('🔍 Enhanced Image Debug:', {
      original: debug.originalSrc,
      resolved: debug.resolvedSrc,
      type: debug.srcType,
      valid: debug.isValid,
      issues: debug.possibleIssues,
      fallbacks: debug.fallbackPaths.slice(0, 3) // Show first 3 fallbacks
    });

    if (debug.possibleIssues.length > 0) {
      console.warn('⚠️ Image path issues:', debug.possibleIssues);
      console.log('💡 Suggested fixes:', debug.suggestedFixes);
    }

    // Test the resolved path in development
    if (debug.resolvedSrc) {
      testImagePath(debug.resolvedSrc).then(exists => {
        if (!exists) {
          console.warn(`❌ Image not found: ${debug.resolvedSrc}`);
          console.log(`🔄 Trying fallback paths...`);

          findWorkingImagePath(debug.fallbackPaths).then(workingPath => {
            if (workingPath && workingPath !== debug.resolvedSrc) {
              console.log(`✅ Found working alternative: ${workingPath}`);
            } else {
              console.error(`❌ No working path found for image`);
            }
          });
        } else {
          console.log(`✅ Image verified: ${debug.resolvedSrc}`);
        }
      });
    }
  }

  return debug.resolvedSrc;
}