// src/pages/SectionPage.tsx - Collection-aware content mapping with PDF support for Constitutional Challenges
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useCompositionStore, ALL_COLLECTIONS, type CollectionType } from "@/utils/compositionData";
import { PageLayout } from "@/components/PageLayout";
import { cn } from "@/lib/utils";
import MobileNavigation, { useMobileNavigation } from "@/components/MobileNavigation";
import ImageEnhancedMarkdownRenderer from "@/components/ImageEnhancedMarkdownRenderer";
import MediaGallery from "@/components/MediaGallery";
import PDFViewer from "../components/PDFViewer";
import { CollapsibleSummary } from "@/components/CollapsibleSummary";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useCanonical } from "@/hooks/useCanonical";
import { sectionUrl } from "@/utils/urls";
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

// SectionPage resolves its target either from descriptive-slug props (passed by
// the case-document resolver in App.tsx and by the generic descriptive route) or,
// as a fallback, from the legacy positional route params. `collection` is the
// collection type ("constitutional", "manuscript", …) — the same value the code
// historically read from the :compositionId param.
interface SectionPageProps {
  collection?: string;
  compositionSlug?: string;
  sectionSlug?: string;
}

const SectionPage = ({
  collection: collectionProp,
  compositionSlug: compositionSlugProp,
  sectionSlug: sectionSlugProp,
}: SectionPageProps = {}) => {
  const params = useParams();
  const collection = collectionProp ?? params.compositionId ?? "";
  const compositionSlug = compositionSlugProp ?? params.compositionSlug;
  const sectionSlug = sectionSlugProp ?? params.sectionSlug;
  const positionalIndex = params.compositionIndex ?? "1";
  const positionalSectionId = params.sectionId ?? "1";
  const slugMode = Boolean(compositionSlug && sectionSlug);
  // Stable identity of the current section for scroll-reset (works in both modes).
  const sectionKey = slugMode ? `${compositionSlug}/${sectionSlug}` : positionalSectionId;

  // Default to level 1 so "Content" shows first
  const [literacyLevel, setLiteracyLevel] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [activeCaseGroup, setActiveCaseGroup] = useState<string | null>(null);
  const [showAllCaseGroups, setShowAllCaseGroups] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const store = useCompositionStore();
  const { isSidebarOpen, setIsSidebarOpen, isMobile } = useMobileNavigation();

  // Initialize and load ONLY this page's collection (deep-link visitors never
  // download the whole corpus).
  useEffect(() => {
    setMounted(true);

    if ((ALL_COLLECTIONS as string[]).includes(collection)) {
      store.loadCollections([collection as CollectionType]).catch(error => {
        if (import.meta.env.DEV) console.error('Error loading collection:', collection, error);
      });
    }
  }, [store, collection]);

  // Scroll to top when section changes
  useEffect(() => {
    const mainContentArea = document.querySelector('.main-content-area');
    if (mainContentArea) {
      mainContentArea.scrollTop = 0;
    }
  }, [sectionKey]);

  // Get current composition and section.
  // Slug mode: resolve by descriptive slug. Positional mode (legacy): resolve by index.
  let currentComposition = null;
  let currentSection = null;
  let currentSectionNumber = 1;
  if (slugMode) {
    currentComposition = store.getCompositionBySlug(collection, compositionSlug as string);
    const resolved = store.getSectionBySlug(currentComposition, sectionSlug as string);
    if (resolved) {
      currentSection = resolved.section;
      currentSectionNumber = resolved.index;
    }
  } else {
    currentComposition = store.getComposition(collection, parseInt(positionalIndex));
    currentSection = store.getSection(collection, parseInt(positionalIndex), parseInt(positionalSectionId));
    currentSectionNumber = parseInt(positionalSectionId);
  }

  // Canonical URL for the resolved content (reader page). Kept in sync with og:url.
  const canonicalPath =
    currentComposition && currentSection ? sectionUrl(currentComposition, currentSection) : undefined;
  useCanonical(canonicalPath);

  // Per-document browser-tab / share title (falls back to the site default while loading)
  useDocumentMeta(
    currentComposition && currentSection ? `${currentSection.title} — ${currentComposition.title}` : undefined,
    currentSection?.description,
    canonicalPath,
  );

  // Check if this is a section with a PDF (constitutional, copyright, or manuscript collections)
  const hasPDFViewer = (collection === 'constitutional' || collection === 'copyright' || collection === 'manuscript') && currentSection?.pdf_file;

  // Case-group tabs: when a composition's sections carry `case_group`, the sidebar
  // splits navigation by sub-case (e.g. Ellison's trial court / refiled / appeal).
  const CASE_GROUP_LABELS: Record<string, string> = {
    // Kirchner v. Ellison sub-cases
    'cv-00726': 'Trial Court',
    'cv-02594': 'Refiled Action',
    '26-1615': '8th Cir. Appeal',
    // Kirchner v. Johnson — by complaint era
    'original': 'Original Complaint',
    'fac': 'First Amended Complaint',
    'sac': 'Second Amended Complaint',
    'tac': 'Third Amended Complaint',
    'filings': 'Subsequent Filings',
  };
  const allCompositionSections = currentComposition?.sections || [];
  const caseGroupsInOrder: string[] = [];
  for (const s of allCompositionSections) {
    const cg = (s as any).case_group;
    if (cg && !caseGroupsInOrder.includes(cg)) caseGroupsInOrder.push(cg);
  }
  const hasCaseGroups = caseGroupsInOrder.length > 1;

  // Per-composition list of case_groups hidden from the sidebar by default.
  // The current section's group is always shown so users keep visual context after deep-link nav.
  const hiddenCaseGroups: string[] = (currentComposition as any)?.hidden_case_groups || [];
  const currentSectionGroup = (currentSection as any)?.case_group;
  const visibleCaseGroups = showAllCaseGroups
    ? caseGroupsInOrder
    : caseGroupsInOrder.filter(cg => !hiddenCaseGroups.includes(cg) || cg === currentSectionGroup);
  const hasHiddenGroups = hiddenCaseGroups.some(cg => caseGroupsInOrder.includes(cg));

  // Sync active tab to whichever group the current section belongs to.
  // Keyed on derived strings (not the array/object rebuilt every render) so
  // the effect only fires when the group or the group list actually changes.
  const caseGroupsKey = caseGroupsInOrder.join('|');
  useEffect(() => {
    if (currentSectionGroup) {
      setActiveCaseGroup(currentSectionGroup);
    } else if (caseGroupsInOrder.length > 0) {
      setActiveCaseGroup(prev => prev ?? caseGroupsInOrder[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSectionGroup, caseGroupsKey]);

  // Build the list rendered in the sidebar — filtered by active tab, sorted by docket date.
  const sidebarSections = hasCaseGroups && activeCaseGroup
    ? allCompositionSections
        .map((s, i) => ({ section: s, originalIndex: i }))
        .filter(x => (x.section as any).case_group === activeCaseGroup)
        .sort((a, b) => ((a.section as any).date || '').localeCompare((b.section as any).date || ''))
    : allCompositionSections.map((s, i) => ({ section: s, originalIndex: i }));

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
      return `/uploads/${collection}/${src}`;
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
          collection || 'general',
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
        title: "Cases",
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

  const collectionConfig = getCollectionConfig(collection);

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

    // Navigate to the target section's canonical descriptive URL.
    const targetSection = currentComposition?.sections?.[newSectionId - 1];
    const targetUrl =
      currentComposition && targetSection ? sectionUrl(currentComposition, targetSection) : null;
    if (!targetUrl) return;
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
      navigate(`/composition/${collection}`);
    } catch (error) {
      if (import.meta.env.DEV) console.error('Back navigation error:', error);
      window.location.href = `/composition/${collection}`;
    }
  };

  // Don't render until mounted
  if (!mounted) {
    return null;
  }

  // Loading state — gates on THIS page's collection readiness so an unresolved
  // slug never flashes "Section Not Found" before its collection has loaded.
  // (An unknown collection name skips the gate and falls through to not-found.)
  if (
    (ALL_COLLECTIONS as string[]).includes(collection) &&
    !store.loadedCollections[collection as CollectionType]
  ) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="doc-card p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-foreground text-xl">Loading content...</p>
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
          <div className="doc-card p-8">
            <Alert className="bg-destructive/5 border-destructive/30 mb-6">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-foreground">
                Error loading content: {store.error}
              </AlertDescription>
            </Alert>
            <div className="text-center">
              <Button
                variant="outline"
                className="mr-4"
                onClick={() => store.refreshCompositions()}
              >
                Retry
              </Button>
              <Button
                variant="outline"
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
          <div className="doc-card p-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-2xl mb-4 font-serif text-foreground">Section Not Found</h1>
              <p className="text-muted-foreground mb-6">
                The requested section could not be found in the {collectionConfig.title} collection.
              </p>
              <div className="space-x-4">
                <Button variant="outline" onClick={handleBackToCompositions}>
                  Back to {collectionConfig.title}
                </Button>
                <Button variant="outline" onClick={() => navigate('/')}>
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

  // Convert section images to MediaItems for the gallery
  const mediaItems = convertImagesToMediaItems(currentSection.images || []);
  const hasImages = mediaItems.length > 0;

  // Debug logging for development
  if (import.meta.env.DEV) {
    console.log('SectionPage Collection Debug:', {
      collection,
      compositionSlug,
      sectionSlug,
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
                className="text-foreground/80 hover:text-foreground hover:bg-card/60 mb-4 -ml-2 whitespace-normal h-auto text-left justify-start"
                onClick={handleBackToCompositions}
              >
                <ArrowLeft className="h-4 w-4 mr-2 flex-shrink-0" />
                Back to {collectionConfig.title}
              </Button>

              <div className="flex items-center gap-2 mb-1">
                <CollectionIcon className="h-4 w-4 text-primary" />
                <h2 className="text-lg font-serif text-foreground" style={{ letterSpacing: '-0.018em' }}>
                  {collectionConfig.title}
                </h2>
              </div>
              <h3 className="text-sm text-foreground/70">{currentComposition.title}</h3>
            </div>

            {hasCaseGroups && (
              <div className="mb-4 pb-3 border-b border-border/40">
                <div className="text-[11px] text-foreground/60 uppercase tracking-wider mb-2" style={{ fontWeight: 600 }}>
                  Sub-Cases
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {visibleCaseGroups.map(cg => (
                    <button
                      key={cg}
                      onClick={() => setActiveCaseGroup(cg)}
                      className={cn(
                        "px-2.5 py-1.5 text-xs rounded-md transition-colors",
                        activeCaseGroup === cg
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted text-foreground/80 hover:bg-secondary"
                      )}
                      style={{ fontWeight: activeCaseGroup === cg ? 600 : 500 }}
                      title={cg}
                    >
                      {CASE_GROUP_LABELS[cg] || cg}
                    </button>
                  ))}
                </div>
                {hasHiddenGroups && (
                  <button
                    onClick={() => setShowAllCaseGroups(v => !v)}
                    className="mt-2 text-[11px] text-foreground/60 hover:text-foreground underline underline-offset-2 decoration-foreground/40 hover:decoration-foreground transition-colors"
                  >
                    {showAllCaseGroups ? "Hide prior pleadings" : "Show prior pleadings"}
                  </button>
                )}
              </div>
            )}

            <nav className="space-y-1 pb-16">
              {sidebarSections.map(({ section, originalIndex }) => {
                const sectionNum = originalIndex + 1;
                const isActive = sectionNum === currentSectionNumber;
                return (
                  <button
                    key={originalIndex}
                    onClick={() => handleSectionChange(sectionNum)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-md transition-colors",
                      isActive
                        ? "bg-card/90 text-primary border-l-2 border-primary -ml-[2px] pl-[10px] shadow-sm"
                        : "text-foreground hover:bg-card/60"
                    )}
                    style={{ fontWeight: isActive ? 580 : 480 }}
                  >
                    <span className="text-[11px] text-foreground/60 block uppercase tracking-wider" style={{ fontWeight: 600 }}>
                      Section {sectionNum}
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="flex-1 text-sm leading-snug">{section.title}</span>
                      {section.images && section.images.length > 0 && (
                        <ImageIcon className="w-3 h-3 ml-2 text-foreground/60 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </MobileNavigation>

        {/* Main Content */}
        <main className={cn("main-content-area flex-1 overflow-y-auto overflow-x-auto", !isMobile ? "ml-64" : "")}>
          {/* Standard Content Section */}
            <div className="p-8">
              {/* Pending Filing Disclaimer for Kirchner v. Acosta (Florida) */}
              {collection === 'constitutional' && currentComposition?.title?.toLowerCase().includes('acosta') && (
                <Alert className="mb-6 bg-amber-50 border-amber-300/70">
                  <AlertCircle className="h-5 w-5 text-amber-700" />
                  <AlertDescription className="text-amber-900 ml-2">
                    <strong className="text-amber-800">Notice:</strong> The Complaint in this action (No. 9:26-cv-80296-DMM, S.D. Fla.) was dismissed without prejudice on June 24, 2026 for failure to meet the Rule 8/10 pleading standards.
                    On June 30, 2026, Plaintiff filed a motion for a 90-day extension to file an amended complaint (through September 16, 2026), or in the alternative for voluntary dismissal without prejudice.
                    The documents below are the filed court records.
                  </AlertDescription>
                </Alert>
              )}

              <div className="mx-auto doc-card p-8 md:p-10">

              {/* Main Content - PDF or Markdown based on collection type */}
              {hasPDFViewer ? (
                // Constitutional PDF Viewer
                <div className="mb-8">
                    <PDFViewer
                      pdfUrl={currentSection.pdf_file}
                      title={currentSection.title}
                      description={currentSection.description}
                      allSections={currentComposition.sections}
                      compositionTitle={currentComposition.title}
                      className="w-full"
                    />

                  {/* Optional: Show any additional markdown content below PDF */}
                  {currentSection.content_level_1 && (
                    <CollapsibleSummary content={currentSection.content_level_1} proseClassName="prose-xl" />
                  )}
                </div>
              ) : (
                // Standard Markdown Content
                <>
                  <div className="mb-8">
                    {/* Content type controls */}
                    <div className="flex items-center justify-center space-x-4 mb-8 panel-soft px-4 py-3 max-w-md mx-auto">
                      <span className="text-sm text-muted-foreground uppercase tracking-wide">View</span>
                      <Slider
                        value={[literacyLevel]}
                        max={5}
                        min={1}
                        step={2}
                        onValueChange={handleLiteracyChange}
                        className="w-32"
                      />
                      <span className="text-sm font-medium text-foreground min-w-fit">
                        {collectionConfig.contentMapping[literacyLevel]?.label || 'Content'}
                      </span>
                    </div>
                  </div>

                  {/* Main Content WITHOUT images in markdown */}
                  <div className="relative mb-8">
                    <div className="prose prose-xl max-w-none">
                      <ImageEnhancedMarkdownRenderer
                        content={getContentForLevel()}
                        images={[]}
                        showToggle={true}
                        className="mb-8"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Section Navigation */}
              <div className="mt-12 pt-6 border-t border-border">
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={() => handleSectionChange(currentSectionNumber - 1)}
                    className={cn(
                      "px-4 py-2 flex items-center space-x-2 rounded-lg",
                      "transition-colors duration-200",
                      currentSectionNumber <= 1 ? "opacity-40 cursor-not-allowed" : ""
                    )}
                    disabled={currentSectionNumber <= 1}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </Button>

                  <div className="text-muted-foreground text-center">
                    <span className="text-sm">Section {currentSectionNumber} of {totalSections}</span>
                    {hasImages && (
                      <div className="text-xs text-muted-foreground/80 mt-1">
                        {mediaItems.length} media {mediaItems.length === 1 ? 'item' : 'items'}
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => handleSectionChange(currentSectionNumber + 1)}
                    className={cn(
                      "px-4 py-2 flex items-center space-x-2 rounded-lg",
                      "transition-colors duration-200",
                      currentSectionNumber >= totalSections ? "opacity-40 cursor-not-allowed" : ""
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
              <Card className="mt-8 bg-muted border border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-foreground/85 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Debug Info (Development Only)
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <div className="grid grid-cols-2 gap-2">
                    <div>Collection: {collection}</div>
                    <div>Collection Type: {currentComposition?.collection_type || 'N/A'}</div>
                    <div>Composition: {currentComposition?.slug || 'N/A'}</div>
                    <div>Section: {currentSectionNumber} ({currentSection?.slug || 'N/A'}) - {currentSection?.title || 'N/A'}</div>
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
                    <div className="mt-2 pt-2 border-t border-border">
                      <div className="font-medium mb-1">Media Items:</div>
                      {mediaItems.map((item, index) => (
                        <div key={item.id} className="text-sm text-muted-foreground/80">
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
            <div className="w-full bg-secondary/40 border-t border-border">
              <div className="px-4 py-12">
                {/* Gallery Header */}
                <div className="max-w-6xl mx-auto mb-8">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-serif text-foreground mb-2 flex items-center justify-center gap-3" style={{ letterSpacing: '-0.018em' }}>
                      <Monitor className="w-6 h-6 text-primary" />
                      Documentation & Screenshots
                    </h2>
                    <p className="text-muted-foreground text-base mb-1">
                      Full-resolution captures from 32-inch development monitor
                    </p>
                    <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground/80">
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
                <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-border">
                  <div className="text-center text-sm text-muted-foreground/80">
                    <p className="mb-2">
                      Click any image to view all screenshots in full-screen scrollable gallery
                    </p>
                    <p className="text-xs">
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