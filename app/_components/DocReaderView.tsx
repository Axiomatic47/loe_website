// app/_components/DocReaderView.tsx — server-rendered section reader, all
// collections. Next port of the vite SectionPage: fixed sidebar (client
// island, real links) + document card; PDF viewer / depth-slider prose /
// media gallery mount as client islands. Collection-specific titles and
// content-level mappings mirror getCollectionConfig in the vite reader —
// including the `data` collection's deliberate level swap.
import Link from 'next/link';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, ArrowRight, Monitor, Maximize2, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getComposition, getSection } from '@/lib/content-manifest';
import type { CollectionType, ImageData, Section } from '@/lib/content-types';
import { sectionUrl } from '@/utils/urls';
import type { MediaItem } from '@/components/MediaGallery';
import { SitePageLayout } from './SitePageLayout';
import { CaseSidebar, type SidebarSection } from './CaseSidebar';
import { SectionContent, type ContentLevel } from './SectionContent';
import { PDFViewer, CollapsibleSummary, MediaGallery } from './client-islands';

// Collection config — server copy of the vite reader's getCollectionConfig
// (icons live in the sidebar island, keyed by collection).
const COLLECTION_CONFIG: Record<string, { title: string; contentMapping: Record<number, { field: keyof Section; label: string }> }> = {
  manuscript: {
    title: 'Research',
    contentMapping: {
      1: { field: 'content_level_1', label: 'Content' },
      3: { field: 'content_level_3', label: 'Verify' },
      5: { field: 'content_level_5', label: 'Additional Content' },
    },
  },
  data: {
    // Evidence content: main content in level_3, verification in level_1
    title: 'Evidence',
    contentMapping: {
      1: { field: 'content_level_3', label: 'Content' },
      3: { field: 'content_level_1', label: 'Verify' },
      5: { field: 'content_level_5', label: 'Additional Content' },
    },
  },
  constitutional: {
    title: 'Cases',
    contentMapping: {
      1: { field: 'content_level_1', label: 'Content' },
      3: { field: 'content_level_3', label: 'Methodology' },
      5: { field: 'content_level_5', label: 'Advanced Content' },
    },
  },
  copyright: {
    title: 'Copyright Notifications',
    contentMapping: {
      1: { field: 'content_level_1', label: 'Content' },
      3: { field: 'content_level_3', label: 'Details' },
      5: { field: 'content_level_5', label: 'Additional Content' },
    },
  },
  timeline: {
    title: 'Timeline',
    contentMapping: {
      1: { field: 'content_level_1', label: 'Content' },
      3: { field: 'content_level_3', label: 'Details' },
      5: { field: 'content_level_5', label: 'Advanced Content' },
    },
  },
  map: {
    title: 'Egalitarian World Map',
    contentMapping: {
      1: { field: 'content_level_1', label: 'Content' },
      3: { field: 'content_level_3', label: 'Analysis' },
      5: { field: 'content_level_5', label: 'Advanced Content' },
    },
  },
};

// ---- media helpers — verbatim ports of the vite SectionPage inline utils ----

function determineMediaType(src: string): 'image' | 'video' | 'document' {
  if (!src || typeof src !== 'string') return 'document';
  const extension = src.toLowerCase().split('.').pop() || '';
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico', 'tiff', 'tif'];
  const videoExts = ['mp4', 'webm', 'ogg', 'avi', 'mov', 'wmv', 'flv', 'm4v', '3gp'];
  if (imageExts.includes(extension)) return 'image';
  if (videoExts.includes(extension)) return 'video';
  return 'document';
}

function resolveImagePath(src: unknown, collection: string): string {
  if (!src) return '';
  if (Array.isArray(src)) {
    return src.length > 0 ? resolveImagePath(src[0], collection) : '';
  }
  if (typeof src === 'string') {
    if (src.startsWith('http') || src.startsWith('/uploads/')) return src;
    if (src.startsWith('uploads/')) return `/${src}`;
    if (
      src.startsWith('manuscript/') || src.startsWith('data/') || src.startsWith('constitutional/') ||
      src.startsWith('copyright/') || src.startsWith('timeline/') || src.startsWith('map/')
    ) {
      return `/uploads/${src}`;
    }
    return `/uploads/${collection}/${src}`;
  }
  if (typeof src === 'object' && src !== null) {
    const o = src as Record<string, unknown>;
    return resolveImagePath(o.url || o.src || o.path || String(src), collection);
  }
  return String(src);
}

function convertImagesToMediaItems(images: ImageData[], section: Section, collection: string): MediaItem[] {
  if (!images || !Array.isArray(images)) return [];
  return images.map((img, index) => {
    const resolvedSrc = resolveImagePath(img.src, collection);
    const mediaType = determineMediaType(img.src);
    return {
      id: `${section.title || 'section'}-${mediaType}-${index}`,
      type: mediaType,
      src: resolvedSrc,
      title: img.alt || `${section.title || 'Section'} - ${mediaType} ${index + 1}`,
      description: img.caption,
      tags: [
        section.title || 'Unknown Section',
        collection || 'general',
        img.position,
        mediaType,
        ...(section.featured ? ['featured'] : []),
      ],
    };
  });
}

// -----------------------------------------------------------------------------

export function DocReaderView({
  collection,
  compositionSlug,
  sectionSlug,
}: {
  collection: CollectionType;
  compositionSlug: string;
  sectionSlug: string;
}) {
  const composition = getComposition(collection, compositionSlug);
  if (!composition) return null;
  const section = getSection(composition, sectionSlug);
  if (!section) return null;

  const config = COLLECTION_CONFIG[collection] ?? COLLECTION_CONFIG.manuscript;
  const sections = composition.sections;
  const index = sections.findIndex(s => s.slug === section.slug);
  const totalSections = sections.length;
  const prev = index > 0 ? sections[index - 1] : null;
  const next = index < totalSections - 1 ? sections[index + 1] : null;

  const sidebarSections: SidebarSection[] = sections.map((s, i) => ({
    slug: s.slug,
    title: s.title,
    href: sectionUrl(composition, s),
    caseGroup: s.case_group,
    date: s.date,
    hasImages: Boolean(s.images && s.images.length > 0),
    number: i + 1,
  }));

  // PDF sections exist in the constitutional, copyright, and manuscript
  // collections — same rule as the vite reader.
  const hasPdf =
    (collection === 'constitutional' || collection === 'copyright' || collection === 'manuscript') &&
    Boolean(section.pdf_file);
  const isAcosta = collection === 'constitutional' && composition.title.toLowerCase().includes('acosta');

  const mediaItems = convertImagesToMediaItems(section.images || [], section, collection);
  const hasImages = mediaItems.length > 0;

  const levels: ContentLevel[] = [1, 3, 5].map(value => ({
    value,
    label: config.contentMapping[value].label,
    content: String(section[config.contentMapping[value].field] ?? ''),
  }));

  return (
    <SitePageLayout>
      <div className="flex h-[calc(100vh-4rem)]">
        <CaseSidebar
          collectionKey={collection}
          collectionTitle={config.title}
          collectionHref={`/composition/${collection}`}
          compositionTitle={composition.title}
          sections={sidebarSections}
          currentSlug={section.slug}
          hiddenCaseGroups={composition.hidden_case_groups || []}
        />

        {/* Main Content */}
        <main className="main-content-area flex-1 overflow-y-auto overflow-x-auto md:ml-64">
          <div className="p-8">
            {/* Docket-status disclaimer for Kirchner v. Acosta (S.D. Fla.) */}
            {isAcosta && (
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
              {hasPdf ? (
                <div className="mb-8">
                  <PDFViewer
                    pdfUrl={section.pdf_file!}
                    title={section.title}
                    description={section.description}
                    allSections={sections.map(s => ({ title: s.title, pdf_file: s.pdf_file }))}
                    compositionTitle={composition.title}
                    className="w-full"
                  />
                  {section.content_level_1 && (
                    <CollapsibleSummary content={section.content_level_1} proseClassName="prose-xl" />
                  )}
                </div>
              ) : (
                <SectionContent levels={levels} />
              )}

              {/* Section Navigation */}
              <div className="mt-12 pt-6 border-t border-border">
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    className={cn(
                      'px-4 py-2 flex items-center space-x-2 rounded-lg transition-colors duration-200',
                      !prev ? 'opacity-40 pointer-events-none' : ''
                    )}
                    asChild={Boolean(prev)}
                    disabled={!prev}
                  >
                    {prev ? (
                      <Link href={sectionUrl(composition, prev)}>
                        <ArrowLeft className="h-4 w-4" />
                        <span>Previous</span>
                      </Link>
                    ) : (
                      <span className="flex items-center space-x-2">
                        <ArrowLeft className="h-4 w-4" />
                        <span>Previous</span>
                      </span>
                    )}
                  </Button>

                  <div className="text-muted-foreground text-center">
                    <span className="text-sm">
                      Section {index + 1} of {totalSections}
                    </span>
                    {hasImages && (
                      <div className="text-xs text-muted-foreground/80 mt-1">
                        {mediaItems.length} media {mediaItems.length === 1 ? 'item' : 'items'}
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    className={cn(
                      'px-4 py-2 flex items-center space-x-2 rounded-lg transition-colors duration-200',
                      !next ? 'opacity-40 pointer-events-none' : ''
                    )}
                    asChild={Boolean(next)}
                    disabled={!next}
                  >
                    {next ? (
                      <Link href={sectionUrl(composition, next)}>
                        <span>Next</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <span className="flex items-center space-x-2">
                        <span>Next</span>
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </div>
              </div>
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
                      Documentation &amp; Screenshots
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
    </SitePageLayout>
  );
}
