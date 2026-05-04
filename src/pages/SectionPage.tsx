// src/pages/SectionPage.tsx - Collection-aware content mapping with PDF support for Constitutional Challenges
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useCompositionStore } from "@/utils/compositionData";
import { PageLayout } from "@/components/PageLayout";
import { cn } from "@/lib/utils";
import MobileNavigation, { useMobileNavigation } from "@/components/MobileNavigation";
import ImageEnhancedMarkdownRenderer from "@/components/ImageEnhancedMarkdownRenderer";
import MediaGallery from "@/components/MediaGallery";
import PDFViewer from "../components/PDFViewer";
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Image as ImageIcon,
  Eye,
  Monitor,
  Maximize2,
  FileText,
  Scale,
  Calendar,
  Map
} from "lucide-react";

// Import your existing types
import type { ImageData } from "@/utils/compositionData";

// MediaItem interface for the gallery
interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'document';
  src: string;
  title: string;
  description?: string;
  tags?: string[];
}

const SectionPage = () => {
  const { compositionId = "", compositionIndex = "1", sectionId = "1" } = useParams();
  // Default to level 1 so "Content" shows first
  const [literacyLevel, setLiteracyLevel] = useState(1);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const store = useCompositionStore();
  const { isSidebarOpen, setIsSidebarOpen, isMobile } = useMobileNavigation();

  // Initialize and load data
  useEffect(() => {
    setMounted(true);

    const loadData = async () => {
      if (!store.initialized) {
        try {
          await store.refreshCompositions();
        } catch (error) {
          if (import.meta.env.DEV) console.error('Error loading compositions:', error);
        }
      }
    };

    loadData();
  }, [store]);

  // Scroll to top when section changes
  useEffect(() => {
    const mainContentArea = document.querySelector('.main-content-area');
    if (mainContentArea) {
      mainContentArea.scrollTop = 0;
    }
  }, [sectionId]);

  // Get current composition and section
  const currentComposition = store.getComposition(compositionId, parseInt(compositionIndex));
  const currentSection = store.getSection(compositionId, parseInt(compositionIndex), parseInt(sectionId));

  // Check if this is a section with a PDF (constitutional, copyright, or manuscript collections)
  const hasPDFViewer = (compositionId === 'constitutional' || compositionId === 'copyright' || compositionId === 'manuscript') && currentSection?.pdf_file;

  // Inline utility functions to avoid import issues
  const determineMediaType = (src: string): 'image' | 'video' | 'document' => {
    if (!src || typeof src !== 'string') return 'document';

    const extension = src.toLowerCase().split('.').pop() || '';

    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico', 'tiff', 'tif'];
    const videoExts = ['mp4', 'webm', 'ogg', 'avi', 'mov', 'wmv', 'flv', 'm4v', '3gp'];

    if (imageExts.includes(extension)) return 'image';
    if (videoExts.includes(extension)) return 'video';
    return 'document';
  };

  // Simple image path resolver (inline to avoid import issues)
  const resolveImagePath = (src: any): string => {
    if (!src) return '';

    // Handle arrays (common with Netlify CMS)
    if (Array.isArray(src)) {
      if (src.length > 0) {
        return resolveImagePath(src[0]); // Use first item in array
      }
      return '';
    }

    // Handle string URLs
    if (typeof src === 'string') {
      // If it's already a full URL or properly formatted path, use it
      if (src.startsWith('http') || src.startsWith('/uploads/')) {
        return src;
      }

      // If it starts with uploads, add leading slash
      if (src.startsWith('uploads/')) {
        return `/${src}`;
      }

      // For different collection types, use appropriate upload path
      if (src.startsWith('manuscript/') || src.startsWith('data/') || src.startsWith('constitutional/') || src.startsWith('copyright/') || src.startsWith('timeline/') || src.startsWith('map/')) {
        return `/uploads/${src}`;
      }

      // Default: use collection-specific path
      return `/uploads/${compositionId}/${src}`;
    }

    // Handle object URLs (from CMS)
    if (typeof src === 'object' && src !== null) {
      // Try common object properties
      const url = src.url || src.src || src.path || String(src);
      return resolveImagePath(url);
    }

    // Fallback
    return String(src);
  };

  // Convert ImageData to MediaItem format for the gallery
  const convertImagesToMediaItems = (images: ImageData[]): MediaItem[] => {
    if (!images || !Array.isArray(images)) {
      if (import.meta.env.DEV) console.warn('convertImagesToMediaItems: Invalid images array', images);
      return [];
    }

    return images.map((img, index) => {
      const resolvedSrc = resolveImagePath(img.src);
      const mediaType = determineMediaType(img.src);

      const mediaItem: MediaItem = {
        id: `${currentSection?.title || 'section'}-${mediaType}-${index}`,
        type: mediaType,
        src: resolvedSrc,
        title: img.alt || `${currentSection?.title || 'Section'} - ${mediaType} ${index + 1}`,
        description: img.caption,
        tags: [
          currentSection?.title || 'Unknown Section',
          compositionId || 'general',
          img.position,
          mediaType,
          ...(currentSection?.featured ? ['featured'] : [])
        ]
      };

      if (import.meta.env.DEV) {
        console.log(`Converting image ${index}:`, {
          originalSrc: img.src,
          srcType: typeof img.src,
          isArray: Array.isArray(img.src),
          resolvedSrc: resolvedSrc,
          mediaType: mediaType,
          original: img,
          converted: mediaItem
        });
      }

      return mediaItem;
    });
  };

  // Collection-specific configuration
const getCollectionConfig = (collectionType: string) => {
  switch (collectionType) {
    case "manuscript":
      // Research content: main content in level_1, methodology in level_3
      return {
        title: "Research",
        icon: FileText,
        contentMapping: {
          1: { field: 'content_level_1', label: 'Content' },           // Main research content
          3: { field: 'content_level_3', label: 'Verify' },            // Methodology details
          5: { field: 'content_level_5', label: 'Additional Content' } // References
        }
      };
    case "data":
      // Evidence content: main content in level_3, verification in level_1
      return {
        title: "Evidence",
        icon: Eye,
        contentMapping: {
          1: { field: 'content_level_3', label: 'Content' },           // Main testimony content (stored in level_3)
          3: { field: 'content_level_1', label: 'Verify' },            // Verification details (stored in level_1)
          5: { field: 'content_level_5', label: 'Additional Content' } // Additional info
        }
      };
    case "constitutional":
      return {
        title: "Constitutional Challenges",
        icon: Scale,
        contentMapping: {
          1: { field: 'content_level_1', label: 'Content' },
          3: { field: 'content_level_3', label: 'Methodology' },
          5: { field: 'content_level_5', label: 'Advanced Content' }
        }
      };
    case "copyright":
      return {
        title: "Copyright Notifications",
        icon: FileText,
        contentMapping: {
          1: { field: 'content_level_1', label: 'Content' },
          3: { field: 'content_level_3', label: 'Details' },
          5: { field: 'content_level_5', label: 'Additional Content' }
        }
      };
    case "timeline":
      return {
        title: "Timeline",
        icon: Calendar,
        contentMapping: {
          1: { field: 'content_level_1', label: 'Content' },
          3: { field: 'content_level_3', label: 'Details' },
          5: { field: 'content_level_5', label: 'Advanced Content' }
        }
      };
    case "map":
      return {
        title: "Egalitarian World Map",
        icon: Map,
        contentMapping: {
          1: { field: 'content_level_1', label: 'Content' },
          3: { field: 'content_level_3', label: 'Analysis' },
          5: { field: 'content_level_5', label: 'Advanced Content' }
        }
      };
    default:
      return {
        title: "Content",
        icon: FileText,
        contentMapping: {
          1: { field: 'content_level_1', label: 'Content' },
          3: { field: 'content_level_3', label: 'Details' },
          5: { field: 'content_level_5', label: 'Advanced Content' }
        }
      };
  }
};

  const collectionConfig = getCollectionConfig(compositionId);

  const handleSectionChange = (newSectionId: number) => {
    // Close mobile sidebar
    if (isMobile) {
      setIsSidebarOpen(false);
    }

    // Scroll to top
    const mainContentArea = document.querySelector('.main-content-area');
    if (mainContentArea) {
      mainContentArea.scrollTop = 0;
    }

    // Navigate to new section
    const targetUrl = `/composition/${compositionId}/composition/${compositionIndex}/section/${newSectionId}`;
    if (import.meta.env.DEV) console.log('Navigating to section:', targetUrl);

    try {
      navigate(targetUrl);
      // Reset to default content view when changing sections
      setLiteracyLevel(1);
    } catch (error) {
      if (import.meta.env.DEV) console.error('Section navigation error:', error);
      window.location.href = targetUrl;
    }
  };

  const handleLiteracyChange = (value: number[]) => {
    const requestedLevel = value[0];

    if (!currentSection) return;

    // Get the field name for the requested level
    const fieldName = collectionConfig.contentMapping[requestedLevel]?.field || 'content_level_3';

    // Check content availability based on collection-specific mapping
    const hasContent = !!(currentSection as any)[fieldName];

    const newLevel = hasContent ? requestedLevel : 1; // Default to Content if not available
    setLiteracyLevel(newLevel);

    const levelLabel = collectionConfig.contentMapping[newLevel]?.label || 'Content';

    if (!hasContent) {
      toast({
        title: "Content Type Adjusted",
        description: `Content not available at requested type, showing ${levelLabel} instead.`,
      });
    } else {
      toast({
        title: "Content Type Updated",
        description: `Showing ${levelLabel}`,
      });
    }
  };

  // Collection-aware content retrieval
  const getContentForLevel = () => {
    if (!currentSection) return "";

    const fieldName = collectionConfig.contentMapping[literacyLevel]?.field || 'content_level_3';
    return (currentSection as any)[fieldName] || "";
  };

  const handleBackToCompositions = () => {
    try {
      navigate(`/composition/${compositionId}`);
    } catch (error) {
      if (import.meta.env.DEV) console.error('Back navigation error:', error);
      window.location.href = `/composition/${compositionId}`;
    }
  };

  // Don't render until mounted
  if (!mounted) {
    return null;
  }

  // Loading state
  if (store.loading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="bg-black/60 backdrop-blur-sm rounded-lg p-8 border border-white/20 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-white" />
            <p className="text-white text-xl">Loading content...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Error state
  if (store.error) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="bg-black/60 backdrop-blur-sm rounded-lg p-8 border border-white/20">
            <Alert className="bg-red-900/20 border-red-500/50 mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-white">
                Error loading content: {store.error}
              </AlertDescription>
            </Alert>
            <div className="text-center">
              <Button
                variant="outline"
                className="bg-black/50 text-white border-white/20 mr-4"
                onClick={() => store.refreshCompositions()}
              >
                Retry
              </Button>
              <Button
                variant="outline"
                className="bg-black/50 text-white border-white/20"
                onClick={handleBackToCompositions}
              >
                Back to {collectionConfig.title}
              </Button>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Content not found
  if (!currentSection || !currentComposition) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="bg-black/60 backdrop-blur-sm rounded-lg p-8 border border-white/20">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-2xl mb-4 text-white drop-shadow-lg">Section Not Found</h1>
              <p className="text-gray-300 mb-6">
                The requested section could not be found in the {collectionConfig.title} collection.
              </p>
              <div className="space-x-4">
                <Button
                  variant="outline"
                  className="bg-black/50 text-white border-white/20"
                  onClick={handleBackToCompositions}
                >
                  Back to {collectionConfig.title}
                </Button>
                <Button
                  variant="outline"
                  className="bg-black/50 text-white border-white/20"
                  onClick={() => navigate('/')}
                >
                  Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  const totalSections = currentComposition.sections?.length || 0;
  const currentSectionNumber = parseInt(sectionId);

  // Convert section images to MediaItems for the gallery
  const mediaItems = convertImagesToMediaItems(currentSection.images || []);
  const hasImages = mediaItems.length > 0;

  // Debug logging for development
  if (import.meta.env.DEV) {
    console.log('SectionPage Collection Debug:', {
      compositionId,
      collectionConfig,
      currentSection,
      literacyLevel,
      hasPDFViewer,
      pdfFile: currentSection?.pdf_file,
      contentMapping: collectionConfig.contentMapping[literacyLevel],
      contentField: collectionConfig.contentMapping[literacyLevel]?.field,
      contentValue: getContentForLevel()
    });
  }

  const CollectionIcon = collectionConfig.icon;

  return (
    <PageLayout>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar Navigation */}
        <MobileNavigation
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        >
          <div className="p-6">
            <div className="mb-6">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 mb-4"
                onClick={handleBackToCompositions}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to {collectionConfig.title}
              </Button>

              <div className="flex items-center gap-2 mb-1">
                <CollectionIcon className="h-4 w-4 text-white" />
                <h2 className="text-lg font-serif text-white drop-shadow-lg">
                  {collectionConfig.title}
                </h2>
              </div>
              <h3 className="text-sm text-gray-200">{currentComposition.title}</h3>
            </div>

            <nav className="space-y-2 pb-16">
              {currentComposition.sections?.map((section, index) => (
                <button
                  key={index}
                  onClick={() => handleSectionChange(index + 1)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md text-base transition-colors",
                    index + 1 === parseInt(sectionId)
                      ? "bg-white/20 text-white font-medium backdrop-blur-md"
                      : "text-gray-200 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <span className="text-sm text-gray-400 block">
                    Section {index + 1}
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="flex-1">{section.title}</span>
                    {/* Show image indicator */}
                    {section.images && section.images.length > 0 && (
                      <ImageIcon className="w-3 h-3 ml-2 text-gray-400 flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </MobileNavigation>

        {/* Main Content */}
<main className={cn("main-content-area flex-1 overflow-y-auto overflow-x-auto", !isMobile ? "ml-64" : "")}>
          )}
        >
          {/* Standard Content Section */}
            <div className="p-8">
              {/* Pending Filing Disclaimer for Kirchner v. Acosta (Florida) */}
              {compositionId === 'constitutional' && currentComposition?.title?.toLowerCase().includes('acosta') && (
                <Alert className="mb-6 bg-amber-900/30 border-amber-500/50 backdrop-blur-sm">
                  <AlertCircle className="h-5 w-5 text-amber-400" />
                  <AlertDescription className="text-amber-100 ml-2">
                    <strong className="text-amber-300">Notice:</strong> This case was signed and mailed on Friday, March 13, 2026, and is pending filing in the United States District Court for the Southern District of Florida.
                    These documents will be replaced with the officially filed versions upon electronic notification from the Court.
                    Any filing deficiencies, if identified, will be cured immediately upon notification.
                    Plaintiff is committed to this filing and publishes these documents now as placeholders.
                  </AlertDescription>
                </Alert>
              )}

              <div className="mx-auto bg-black/90 backdrop-blur-sm p-8 rounded-lg border border-white/30 shadow-xl">

              {/* Main Content - PDF or Markdown based on collection type */}
              {hasPDFViewer ? (
                // Constitutional PDF Viewer
                <div className="mb-8">
                    <PDFViewer
                      pdfUrl={currentSection.pdf_file}
                      title={currentSection.title}
                      description={currentSection.description}
                      allSections={currentComposition.sections}  // Add this
                      compositionTitle={currentComposition.title}  // Add this
                      className="w-full"
                    />

                  {/* Optional: Show any additional markdown content below PDF */}
                  {currentSection.content_level_1 && (
                    <div className="mt-8 prose prose-invert prose-xl max-w-none">
                      <div className="bg-black/60 backdrop-blur-sm border border-white/20 rounded-lg p-6">
                        <h3 className="text-2xl font-serif text-white mb-4">Document Summary</h3>
                        <ImageEnhancedMarkdownRenderer
                          content={currentSection.content_level_1}
                          images={[]}
                          showToggle={false}
                          className="text-lg"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Standard Markdown Content (existing code)
                <>
                  <div className="mb-8">
                    {/* Content type controls */}
                    <div className="flex items-center justify-center space-x-4 mb-8 bg-black/50 p-4 rounded-lg border border-white/20 max-w-md mx-auto">
                      <span className="text-base text-gray-200">View:</span>
                      <Slider
                        value={[literacyLevel]}
                        max={5}
                        min={1}
                        step={2}
                        onValueChange={handleLiteracyChange}
                        className="w-32"
                      />
                      <span className="text-base text-gray-200 min-w-fit">
                        {collectionConfig.contentMapping[literacyLevel]?.label || 'Content'}
                      </span>
                    </div>
                  </div>

                  {/* Main Content WITHOUT images in markdown */}
                  <div className="relative mb-8">
                    <div className="prose prose-invert prose-xl max-w-none text-lg leading-relaxed">
                      <ImageEnhancedMarkdownRenderer
                        content={getContentForLevel()}
                        images={[]}
                        showToggle={true}
                        className="mb-8 text-lg"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Section Navigation */}
              <div className="mt-12 pt-6 border-t border-white/20">
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={() => handleSectionChange(currentSectionNumber - 1)}
                    className={cn(
                      "px-4 py-2 flex items-center space-x-2 rounded-lg",
                      "bg-black/30 border border-white/20",
                      "transition-all duration-200",
                      "text-gray-200 hover:bg-black/50",
                      currentSectionNumber <= 1 ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
                    )}
                    disabled={currentSectionNumber <= 1}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </Button>

                  <div className="text-gray-200 text-center">
                    <span className="text-base">Section {currentSectionNumber} of {totalSections}</span>
                    {hasImages && (
                      <div className="text-sm text-gray-400 mt-1">
                        {mediaItems.length} media {mediaItems.length === 1 ? 'item' : 'items'}
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => handleSectionChange(currentSectionNumber + 1)}
                    className={cn(
                      "px-4 py-2 flex items-center space-x-2 rounded-lg",
                      "bg-black/30 border border-white/20",
                      "transition-all duration-200",
                      "text-gray-200 hover:bg-black/50",
                      currentSectionNumber >= totalSections ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
                    )}
                    disabled={currentSectionNumber >= totalSections}
                  >
                    <span>Next</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

            {/* Development Debug Info */}
            {import.meta.env.DEV && (
              <Card className="mt-8 bg-orange-900/20 border-orange-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-orange-200 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Debug Info (Development Only)
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-orange-200/80">
                  <div className="grid grid-cols-2 gap-2">
                    <div>Collection: {compositionId}</div>
                    <div>Collection Type: {currentComposition?.collection_type || 'N/A'}</div>
                    <div>Composition: {compositionIndex}</div>
                    <div>Section: {sectionId} - {currentSection?.title || 'N/A'}</div>
                    <div>Featured: {String(currentSection?.featured ?? false)}</div>
                    <div>Images: {currentSection?.images?.length || 0}</div>
                    <div>Media Items: {mediaItems.length}</div>
                    <div>Current Level: {literacyLevel}</div>
                    <div>Is PDF: {String(hasPDFViewer)}</div>
                    <div>PDF File: {currentSection?.pdf_file || 'none'}</div>
                    <div>Current View: {collectionConfig.contentMapping[literacyLevel]?.label || 'N/A'}</div>
                    <div>Content Field: {collectionConfig.contentMapping[literacyLevel]?.field || 'N/A'}</div>
                    <div>Content Length: {getContentForLevel().length} chars</div>
                  </div>
                  {mediaItems.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-orange-500/20">
                      <div className="font-medium mb-1">Media Items:</div>
                      {mediaItems.map((item, index) => (
                        <div key={item.id} className="text-sm text-orange-200/60">
                          {index + 1}. {item.title} ({item.type})
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            </div>
          </div>

          {/* Full-Width Media Gallery Section - OUTSIDE constrained content */}
          {hasImages && (
            <div className="w-full bg-gradient-to-b from-black/20 to-black/40 border-t border-white/10">
              <div className="px-4 py-12">
                {/* Gallery Header */}
                <div className="max-w-6xl mx-auto mb-8">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-serif text-white mb-2 flex items-center justify-center gap-3">
                      <Monitor className="w-6 h-6" />
                      Documentation & Screenshots
                    </h2>
                    <p className="text-gray-300 text-lg mb-1">
                      Full-resolution captures from 32-inch development monitor
                    </p>
                    <div className="flex items-center justify-center gap-4 text-base text-gray-400">
                      <span className="flex items-center gap-1">
                        <ImageIcon className="w-4 h-4" />
                        {mediaItems.length} {mediaItems.length === 1 ? 'item' : 'items'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Maximize2 className="w-4 h-4" />
                        Click to view all images full-screen
                      </span>
                    </div>
                  </div>
                </div>

                {/* Full-Width Media Gallery */}
                <div className="w-full max-w-none">
                  <MediaGallery
                    items={mediaItems}
                    showCategories={false}
                    allowDownload={true}
                    className="w-full"
                    columns={1}
                    layout="grid"
                  />
                </div>

                {/* Gallery Footer */}
                <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-white/10">
                  <div className="text-center text-base text-gray-400">
                    <p className="mb-2">
                      Click any image to view all screenshots in full-screen scrollable gallery
                    </p>
                    <p className="text-sm">
                      Images maintain original resolution and aspect ratios from development environment
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </PageLayout>
  );
};

export default SectionPage;