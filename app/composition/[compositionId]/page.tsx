// app/composition/[compositionId]/page.tsx — collection grid pages.
//
// Server port of the vite CompositionsPage: same three card variants
// (copyright / constitutional / standard), cards are real <Link>s. The
// store/loading/error/debug machinery falls away — the manifest is resolved
// at build time.
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Music, Send, FileText, Scale, BookOpen, Database, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCollection, ALL_COLLECTIONS } from '@/lib/content-manifest';
import type { CollectionType } from '@/lib/content-types';
import { compositionUrl } from '@/utils/urls';
import { SitePageLayout } from '../../_components/SitePageLayout';

export const dynamicParams = false;

export function generateStaticParams() {
  return ALL_COLLECTIONS.map(compositionId => ({ compositionId }));
}

const getCollectionTitle = (compositionId: string | undefined) => {
  switch (compositionId) {
    case 'manuscript':
      return 'Research';
    case 'data':
      return 'Evidence';
    case 'map':
      return 'Egalitarian World Map';
    case 'copyright':
      return 'Copyright Holder Notifications';
    case 'constitutional':
      return 'Cases';
    default:
      return 'Content';
  }
};

type Params = { params: Promise<{ compositionId: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { compositionId } = await params;
  const title = getCollectionTitle(compositionId);
  return {
    title,
    alternates: { canonical: `/composition/${compositionId}` },
  };
}

export default async function CompositionsGridPage({ params }: Params) {
  const { compositionId } = await params;
  if (!(ALL_COLLECTIONS as string[]).includes(compositionId)) notFound();

  const compositions = getCollection(compositionId as CollectionType);
  const collectionTitle = getCollectionTitle(compositionId);

  return (
    <SitePageLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="rounded-2xl bg-secondary/60 border border-border p-8 sm:p-12 mb-16">
          <div className="flex justify-between items-center mb-8">
            <Button variant="ghost" className="text-foreground hover:bg-secondary/60" asChild>
              <Link href="/">← Back to Home</Link>
            </Button>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-serif mb-6 text-foreground">
              {collectionTitle}
            </h1>
          </div>

          {compositions.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl text-foreground mb-4">No Compositions Found</h2>
              <p className="text-muted-foreground/80">
                No {collectionTitle.toLowerCase()} compositions have been published yet.
              </p>
            </div>
          ) : compositionId === 'copyright' ? (
            /* Special grid layout for Copyright Notifications */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {compositions.map(composition => {
                // Extract song and artist from title (format: "Song - Artist")
                const titleParts = composition.title.split(' - ');
                const songName = titleParts[0] || composition.title;
                const artistName = titleParts.slice(1).join(' - ') || '';
                const publishers = composition.sections?.map(s => s.title) || [];

                return (
                  <Link
                    key={composition.slug}
                    href={compositionUrl(composition)}
                    className="block bg-card rounded-xl p-6 border border-border
                             cursor-pointer transition-all duration-300
                             hover:border-primary/30 hover:shadow-md
                             group"
                  >
                    {/* Icon and Badge Row */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/15 group-hover:bg-primary/25 transition-colors">
                          <Music className="h-5 w-5 text-primary" />
                        </div>
                        <Badge className="bg-primary/15 text-primary border border-primary/30 text-xs">
                          {publishers.length} {publishers.length === 1 ? 'Publisher' : 'Publishers'}
                        </Badge>
                      </div>
                      <Send className="h-4 w-4 text-muted-foreground/70 group-hover:text-primary transition-colors" />
                    </div>

                    {/* Song Title */}
                    <h3 className="text-xl font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {songName}
                    </h3>

                    {/* Artist Name */}
                    {artistName && (
                      <p className="text-muted-foreground/80 text-sm mb-4">{artistName}</p>
                    )}

                    {/* Publisher Badges */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {publishers.map((publisher, pIndex) => (
                        <Badge
                          key={pIndex}
                          variant="outline"
                          className="bg-card/80 text-muted-foreground border-border text-xs
                                   group-hover:border-primary/40 group-hover:text-primary transition-colors"
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          {publisher}
                        </Badge>
                      ))}
                    </div>

                    {/* View Button */}
                    <div className="mt-5 pt-4 border-t border-border">
                      <span className="text-primary group-hover:text-primary/80 text-sm font-medium inline-flex items-center">
                        View Notifications
                        <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : compositionId === 'constitutional' ? (
            /* Constitutional Law - Case documents with PDF info */
            <div className="grid grid-cols-1 gap-6">
              {compositions.map(composition => {
                const sectionCount = composition.sections?.length || 0;
                const firstSection = composition.sections?.[0];
                const description = firstSection?.description || '';

                return (
                  <Link
                    key={composition.slug}
                    href={compositionUrl(composition)}
                    className="block bg-card rounded-xl p-6 border border-border
                             cursor-pointer transition-all duration-300
                             hover:border-primary/30 hover:shadow-md
                             group"
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="p-3 rounded-lg bg-primary/15 group-hover:bg-primary/25 transition-colors flex-shrink-0">
                        <Scale className="h-6 w-6 text-primary" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                            {composition.title}
                          </h3>
                          <Badge className="bg-primary/10 text-primary border border-primary/30 text-xs flex-shrink-0">
                            {sectionCount} {sectionCount === 1 ? 'Document' : 'Documents'}
                          </Badge>
                        </div>

                        {/* Description or section list preview */}
                        {description ? (
                          <p className="text-muted-foreground/80 text-sm line-clamp-2 mb-4">{description}</p>
                        ) : sectionCount > 0 ? (
                          <p className="text-muted-foreground/80 text-sm mb-4">
                            Includes: {composition.sections?.slice(0, 3).map(s => s.title).join(', ')}
                            {sectionCount > 3 ? ` and ${sectionCount - 3} more...` : ''}
                          </p>
                        ) : null}

                        {/* View link */}
                        <span className="text-primary group-hover:text-primary/80 text-sm font-medium inline-flex items-center">
                          View Case Documents
                          <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            /* Standard layout for manuscript, data, and other collections */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {compositions.map(composition => {
                const sectionCount = composition.sections?.length || 0;
                const firstSection = composition.sections?.[0];

                // Try to get preview content from various fields
                const previewContent =
                  firstSection?.description ||
                  firstSection?.content_level_3?.replace(/^#.*\n/, '').substring(0, 200) ||
                  firstSection?.content_level_1?.replace(/^#.*\n/, '').substring(0, 200) ||
                  '';

                const isManuscript = compositionId === 'manuscript';
                const isData = compositionId === 'data';
                const IconComponent = isManuscript ? BookOpen : isData ? Database : FileText;
                const accent = isManuscript || isData;
                // Single warm scheme per DESIGN.md — terracotta is the only accent.
                const colors = accent
                  ? {
                      bg: 'bg-primary/15',
                      bgHover: 'group-hover:bg-primary/25',
                      icon: 'text-primary',
                      badge: 'bg-secondary text-foreground/85 border border-border',
                      border: 'hover:border-primary/30',
                      shadow: 'hover:shadow-md',
                      text: 'text-primary group-hover:text-primary/80',
                      title: 'group-hover:text-primary',
                    }
                  : {
                      bg: 'bg-muted',
                      bgHover: 'group-hover:bg-secondary',
                      icon: 'text-muted-foreground/80',
                      badge: 'bg-secondary text-muted-foreground border border-border',
                      border: 'hover:border-border',
                      shadow: 'hover:shadow-md',
                      text: 'text-muted-foreground/80 group-hover:text-foreground',
                      title: 'group-hover:text-foreground/90',
                    };

                return (
                  <Link
                    key={composition.slug}
                    href={compositionUrl(composition)}
                    className={cn(
                      'block bg-card rounded-xl p-6 border border-border',
                      'cursor-pointer transition-all duration-300',
                      colors.border,
                      colors.shadow,
                      'group'
                    )}
                  >
                    {/* Header with icon */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className={cn('p-2 rounded-lg transition-colors flex-shrink-0', colors.bg, colors.bgHover)}>
                        <IconComponent className={cn('h-5 w-5', colors.icon)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={cn('text-lg font-semibold text-foreground transition-colors line-clamp-2', colors.title)}>
                          {composition.title}
                        </h3>
                      </div>
                      <Badge className={cn('text-xs flex-shrink-0', colors.badge)}>
                        {sectionCount} {sectionCount === 1 ? 'Section' : 'Sections'}
                      </Badge>
                    </div>

                    {/* Preview content */}
                    {previewContent ? (
                      <p className="text-muted-foreground/80 text-sm line-clamp-3 mb-4 leading-relaxed">
                        {previewContent.replace(/[#*_`]/g, '').trim()}...
                      </p>
                    ) : sectionCount > 0 ? (
                      <div className="mb-4">
                        <p className="text-muted-foreground/70 text-sm mb-2">Sections:</p>
                        <div className="flex flex-wrap gap-1">
                          {composition.sections?.slice(0, 4).map((s, i) => (
                            <Badge key={i} variant="outline" className="bg-card/80 text-muted-foreground/80 border-border text-xs">
                              {s.title.length > 25 ? s.title.substring(0, 25) + '...' : s.title}
                            </Badge>
                          ))}
                          {sectionCount > 4 && (
                            <Badge variant="outline" className="bg-card/80 text-muted-foreground/70 border-border text-xs">
                              +{sectionCount - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground/70 text-sm mb-4 italic">No content yet</p>
                    )}

                    {/* Footer */}
                    <div className="pt-4 border-t border-border">
                      <span className={cn('text-sm font-medium inline-flex items-center', colors.text)}>
                        {isManuscript ? 'Read Research' : isData ? 'View Evidence' : 'View Content'}
                        <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </SitePageLayout>
  );
}
