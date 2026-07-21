// app/_components/CaseDocView.tsx — server-rendered case-document reader.
//
// Next port of the vite SectionPage's constitutional branch: fixed sidebar
// (CaseSidebar client island, real links) + document card. The PDF viewer and
// markdown renderer mount as client islands; everything else — titles,
// descriptions, navigation, the document list — is static HTML at build time.
import Link from 'next/link';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCaseComposition, getSection } from '@/lib/content-manifest';
import { sectionUrl } from '@/utils/urls';
import type { CaseSlug } from '@/utils/urls';
import { SitePageLayout } from './SitePageLayout';
import { CaseSidebar, type SidebarSection } from './CaseSidebar';
import { PDFViewer, CollapsibleSummary, ImageEnhancedMarkdownRenderer } from './client-islands';

export function CaseDocView({ caseSlug, docSlug }: { caseSlug: CaseSlug; docSlug: string }) {
  const composition = getCaseComposition(caseSlug);
  if (!composition) return null;
  const section = getSection(composition, docSlug);
  if (!section) return null;

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

  const hasPdf = Boolean(section.pdf_file);
  const isAcosta = composition.title.toLowerCase().includes('acosta');

  return (
    <SitePageLayout>
      <div className="flex h-[calc(100vh-4rem)]">
        <CaseSidebar
          collectionTitle="Constitutional Challenges"
          collectionHref="/composition/constitutional"
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
                <div className="relative mb-8">
                  <div className="prose prose-xl max-w-none">
                    <ImageEnhancedMarkdownRenderer
                      content={section.content_level_3 || section.content_level_1}
                      images={[]}
                      showToggle={true}
                      className="mb-8"
                    />
                  </div>
                </div>
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
        </main>
      </div>
    </SitePageLayout>
  );
}
