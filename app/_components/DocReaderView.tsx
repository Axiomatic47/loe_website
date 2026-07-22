// app/_components/DocReaderView.tsx — server-rendered section reader, all
// collections. Next port of the vite SectionPage: fixed sidebar (client
// island, real links) + document card; PDF viewer / depth-slider prose /
// media gallery mount as client islands. Collection-specific titles and
// content-level mappings mirror getCollectionConfig in the vite reader —
// including the `data` collection's deliberate level swap.
import Link from 'next/link';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { getComposition, getSection } from '@/lib/content-manifest';
import type { CollectionType, ImageData, Section } from '@/lib/content-types';
import { sectionUrl } from '@/utils/urls';
import type { MediaItem } from '@/components/MediaGallery';
import { SitePageLayout } from './SitePageLayout';
import { CaseSidebar, type SidebarSection } from './CaseSidebar';
import { SectionContent, type ContentLevel } from './SectionContent';
import { PDFViewer, CollapsibleSummary, MediaGallery } from './client-islands';
import { displayTitle } from './presentation';

// Collection config — server copy of the vite reader's getCollectionConfig
// (icons live in the sidebar island, keyed by collection). `unit` names one
// entry in reader chrome ("Document 3 of 17"); `mediaLabel` heads the gallery.
const COLLECTION_CONFIG: Record<
  string,
  {
    title: string;
    unit: string;
    mediaLabel: string;
    contentMapping: Record<number, { field: keyof Section; label: string }>;
  }
> = {
  manuscript: {
    title: 'Research',
    unit: 'Section',
    mediaLabel: 'Figures',
    contentMapping: {
      1: { field: 'content_level_1', label: 'Content' },
      3: { field: 'content_level_3', label: 'Verify' },
      5: { field: 'content_level_5', label: 'Additional Content' },
    },
  },
  data: {
    // Evidence content: main content in level_3, verification in level_1
    title: 'Evidence',
    unit: 'Item',
    mediaLabel: 'Exhibits',
    contentMapping: {
      1: { field: 'content_level_3', label: 'Content' },
      3: { field: 'content_level_1', label: 'Verify' },
      5: { field: 'content_level_5', label: 'Additional Content' },
    },
  },
  constitutional: {
    title: 'Cases',
    unit: 'Document',
    mediaLabel: 'Exhibits',
    contentMapping: {
      1: { field: 'content_level_1', label: 'Content' },
      3: { field: 'content_level_3', label: 'Methodology' },
      5: { field: 'content_level_5', label: 'Advanced Content' },
    },
  },
  copyright: {
    title: 'Copyright Notifications',
    unit: 'Notification',
    mediaLabel: 'Attachments',
    contentMapping: {
      1: { field: 'content_level_1', label: 'Content' },
      3: { field: 'content_level_3', label: 'Details' },
      5: { field: 'content_level_5', label: 'Additional Content' },
    },
  },
  timeline: {
    title: 'Timeline',
    unit: 'Section',
    mediaLabel: 'Media',
    contentMapping: {
      1: { field: 'content_level_1', label: 'Content' },
      3: { field: 'content_level_3', label: 'Details' },
      5: { field: 'content_level_5', label: 'Advanced Content' },
    },
  },
  map: {
    title: 'Egalitarian World Map',
    unit: 'Entry',
    mediaLabel: 'Media',
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
  const compositionDisplay = displayTitle(composition.title);
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
          compositionTitle={compositionDisplay}
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
              {/* Context strip — where this document sits in the record */}
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-8 pb-4 border-b border-border">
                <span
                  className="text-xs uppercase tracking-[0.1em] text-muted-foreground font-sans min-w-0"
                  style={{ fontWeight: 600 }}
                >
                  {config.title} · {compositionDisplay}
                </span>
                <span
                  className="text-xs text-muted-foreground font-sans flex-shrink-0"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {config.unit} {index + 1} of {totalSections}
                </span>
              </div>

              {hasPdf ? (
                <div className="mb-8">
                  <PDFViewer
                    pdfUrl={section.pdf_file!}
                    title={section.title}
                    description={section.description}
                    allSections={sections.map(s => ({ title: s.title, pdf_file: s.pdf_file }))}
                    compositionTitle={compositionDisplay}
                    className="w-full"
                  />
                  {section.content_level_1 && (
                    <CollapsibleSummary content={section.content_level_1} proseClassName="prose-xl" />
                  )}
                </div>
              ) : (
                <SectionContent levels={levels} />
              )}

              {/* Prev/next — book-reader style, neighbor titles shown */}
              <div className="mt-12 pt-6 border-t border-border">
                <div className="flex items-start justify-between gap-6">
                  {prev ? (
                    <Link href={sectionUrl(composition, prev)} className="group min-w-0 flex-1">
                      <span className="inline-flex items-center text-xs uppercase tracking-[0.08em] text-muted-foreground font-sans" style={{ fontWeight: 600 }}>
                        <ArrowLeft className="h-3 w-3 mr-1 group-hover:-translate-x-0.5 transition-transform" />
                        Previous
                      </span>
                      <span
                        className="block text-sm text-foreground group-hover:text-primary transition-colors font-sans truncate mt-1"
                        style={{ fontWeight: 550 }}
                      >
                        {prev.title}
                      </span>
                    </Link>
                  ) : (
                    <span className="flex-1" />
                  )}

                  <div
                    className="text-xs text-muted-foreground text-center font-sans pt-0.5 flex-shrink-0"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {config.unit} {index + 1} of {totalSections}
                  </div>

                  {next ? (
                    <Link href={sectionUrl(composition, next)} className="group min-w-0 flex-1 text-right">
                      <span className="inline-flex items-center text-xs uppercase tracking-[0.08em] text-muted-foreground font-sans" style={{ fontWeight: 600 }}>
                        Next
                        <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                      <span
                        className="block text-sm text-foreground group-hover:text-primary transition-colors font-sans truncate mt-1"
                        style={{ fontWeight: 550 }}
                      >
                        {next.title}
                      </span>
                    </Link>
                  ) : (
                    <span className="flex-1" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Full-width media gallery — outside the constrained document card */}
          {hasImages && (
            <div className="w-full bg-secondary/40 border-t border-border">
              <div className="px-4 py-12">
                <div className="max-w-6xl mx-auto mb-8 text-center">
                  <div
                    className="text-xs uppercase tracking-[0.1em] text-muted-foreground font-sans mb-3"
                    style={{ fontWeight: 600 }}
                  >
                    {config.mediaLabel}
                  </div>
                  <h2 className="text-2xl font-serif text-foreground" style={{ letterSpacing: '-0.018em', fontWeight: 580 }}>
                    {section.title}
                  </h2>
                  <p
                    className="text-sm text-muted-foreground mt-2 font-sans"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {mediaItems.length} full-resolution {mediaItems.length === 1 ? 'image' : 'images'} · select any to
                    open the gallery
                  </p>
                </div>

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
              </div>
            </div>
          )}
        </main>
      </div>
    </SitePageLayout>
  );
}
