// src/components/sections/FeaturedWorkSection.tsx - Fixed to only show explicitly featured sections

import React, { useEffect } from 'react';
import { useCompositionStore } from "@/utils/compositionData";
import { useNavigate } from "react-router-dom";
import ImageEnhancedMarkdownRenderer from "@/components/ImageEnhancedMarkdownRenderer";
import PDFViewer from "@/components/PDFViewer";
import { CollapsibleSummary } from "@/components/CollapsibleSummary";
import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";

const FeaturedPanel = ({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "relative rounded-xl p-8 sm:p-12 bg-card border border-border shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
};

export const FeaturedWorkSection = () => {
  const navigate = useNavigate();
  const { manuscript, data, constitutional, timeline, map, refreshCompositions } = useCompositionStore();

  useEffect(() => {
    refreshCompositions();
  }, [refreshCompositions]);

  const getFeaturedSections = () => {
    const featured = [];

    // Helper function to process compositions
    const processCompositions = (compositions: any[], collectionType: string) => {
      if (Array.isArray(compositions)) {
        compositions.forEach((comp, compIndex) => {
          if (comp?.sections && Array.isArray(comp.sections)) {

            // Check if composition itself is explicitly featured
            const compositionIsFeatured = Boolean(comp?.featured);

            comp.sections.forEach((section: any, sectionIndex: number) => {
              // Check if individual section is explicitly featured
              const sectionIsFeatured = Boolean(section?.featured);

              // PRECISE LOGIC: Show section if:
              // 1. The section itself is marked as featured, OR
              // 2. The composition is marked as featured AND no individual sections are marked as featured
              const hasAnyFeaturedSections = comp.sections.some((s: any) => Boolean(s?.featured));

              let shouldShow = false;

              if (sectionIsFeatured) {
                // Always show explicitly featured sections
                shouldShow = true;
              } else if (compositionIsFeatured && !hasAnyFeaturedSections) {
                // Show all sections if composition is featured but no individual sections are featured
                shouldShow = true;
              }

              if (shouldShow) {
                featured.push({
                  ...section,
                  collection: collectionType,
                  compositionIndex: compIndex + 1,
                  sectionIndex: sectionIndex + 1,
                  compositionTitle: comp.title,
                  // Debug info
                  featuredSource: sectionIsFeatured ? 'section' : 'composition',
                  debugInfo: {
                    sectionFeatured: sectionIsFeatured,
                    compositionFeatured: compositionIsFeatured,
                    hasAnyFeaturedSections: hasAnyFeaturedSections
                  }
                });
              }
            });
          }
        });
      }
    };

    // Process each collection type
    processCompositions(manuscript, 'manuscript');
    processCompositions(data, 'data');
    processCompositions(constitutional, 'constitutional');
    processCompositions(timeline, 'timeline');
    processCompositions(map, 'map');

    // Debug logging in development
    if (import.meta.env.DEV) {
      console.log('Featured sections analysis:');
      console.log(`  Total featured sections found: ${featured.length}`);

      featured.forEach((section, index) => {
        console.log(`  ${index + 1}. "${section.title}" (${section.collection})`);
        console.log(`     Source: ${section.featuredSource}`);
        console.log(`     Has PDF: ${Boolean(section.pdf_file)}`);
        console.log(`     Debug:`, section.debugInfo);
      });

      if (featured.length === 0) {
        console.log('No featured sections found. Checking all compositions...');
        const allCompositions = [...manuscript, ...data, ...constitutional, ...timeline, ...map];
        allCompositions.forEach((comp, index) => {
          console.log(`  Composition ${index + 1}: "${comp.title}"`);
          console.log(`    Composition featured: ${Boolean(comp?.featured)}`);
          if (comp?.sections) {
            comp.sections.forEach((section: any, sIndex: number) => {
              console.log(`    Section ${sIndex + 1}: "${section.title}" - Featured: ${Boolean(section?.featured)}`);
            });
          }
        });
      }
    }

    return featured;
  };

  const featuredSections = getFeaturedSections();

  // Sort by featured_order (lower numbers first, 0 or undefined go to end)
  const sortedSections = featuredSections.sort((a, b) => {
    const orderA = a.featured_order || 999;
    const orderB = b.featured_order || 999;
    return orderA - orderB;
  });

  if (sortedSections.length === 0) {
    return null;
  }

  const handleReadMore = (section: any) => {
    navigate(`/composition/${section.collection}/composition/${section.compositionIndex}/section/${section.sectionIndex}`);
  };

  // Helper function to get collection display name
  const getCollectionDisplayName = (collection: string) => {
    switch (collection) {
      case 'manuscript':
        return 'Research';
      case 'data':
        return 'Evidence';
      case 'constitutional':
        return 'Cases';
      case 'timeline':
        return 'Timeline';
      case 'map':
        return 'World Map';
      default:
        return collection;
    }
  };

  return (
    <div className="space-y-24">
      {sortedSections.map((section, index) => (
        <section key={index} className="max-w-4xl mx-auto">
          <Reveal>
          <FeaturedPanel>
            <h2
              className="text-4xl font-serif mb-8 text-foreground text-center"
              style={{ letterSpacing: '-0.022em', fontWeight: 580 }}
            >
              {section.title}
            </h2>

            {/* Show debug info in development */}
            {import.meta.env.DEV && (
              <div className="mb-6 text-center text-sm text-muted-foreground/80">
                Featured via: {section.featuredSource} | Collection: {section.collection}
                {section.pdf_file && ' | Type: PDF'}
              </div>
            )}

            {/* Render PDF or Markdown content based on what's available */}
            {section.pdf_file ? (
              <div className="mb-8">
                <PDFViewer
                  pdfUrl={section.pdf_file}
                  title={section.title}
                  description={section.description}
                  className="w-full"
                />

                {section.content_level_1 && (
                  <CollapsibleSummary content={section.content_level_1} proseClassName="prose-lg" />
                )}
              </div>
            ) : (
              <div className="prose prose-lg max-w-none">
                <ImageEnhancedMarkdownRenderer
                  content={section.content_level_3}
                  images={section.images || []}
                  showToggle={false}
                  className=""
                />
              </div>
            )}

            <div className="mt-8 text-center">
              <button
                onClick={() => handleReadMore(section)}
                className="text-primary hover:text-primary/80 underline underline-offset-2 decoration-1 font-medium"
              >
                Read more in {getCollectionDisplayName(section.collection)}
              </button>
            </div>
          </FeaturedPanel>
          </Reveal>

          {index < sortedSections.length - 1 && (
            <hr className="border-t border-border my-16" />
          )}
        </section>
      ))}
    </div>
  );
};