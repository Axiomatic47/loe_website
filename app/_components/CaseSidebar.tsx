// app/_components/CaseSidebar.tsx — reader sidebar for the case-document pages.
//
// Client island: keeps the vite SectionPage's sub-case tab state and
// hidden-group toggle, but section entries are real <Link>s (crawlable,
// middle-clickable) instead of onClick buttons. Receives only serializable
// props from the server page. Wraps @/components/MobileNavigation (router-free)
// for the mobile drawer, exactly like the vite reader.
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Scale, Image as ImageIcon } from 'lucide-react';
import MobileNavigation, { useMobileNavigation } from '@/components/MobileNavigation';

// Sub-case tab labels — mirror the vite SectionPage's CASE_GROUP_LABELS use:
// the case_group value itself is the label unless mapped here.
const CASE_GROUP_LABELS: Record<string, string> = {};

export interface SidebarSection {
  slug: string;
  title: string;
  href: string;
  caseGroup?: string;
  date?: string;
  hasImages: boolean;
  /** 1-based position in the composition's original section order. */
  number: number;
}

interface CaseSidebarProps {
  collectionTitle: string;
  collectionHref: string;
  compositionTitle: string;
  sections: SidebarSection[];
  currentSlug: string;
  hiddenCaseGroups: string[];
}

export function CaseSidebar({
  collectionTitle,
  collectionHref,
  compositionTitle,
  sections,
  currentSlug,
  hiddenCaseGroups,
}: CaseSidebarProps) {
  const { isSidebarOpen, setIsSidebarOpen } = useMobileNavigation();

  const current = sections.find(s => s.slug === currentSlug);
  const currentGroup = current?.caseGroup;

  // Mirrors SectionPage: group order = first appearance in section order.
  const caseGroupsInOrder: string[] = [];
  for (const s of sections) {
    if (s.caseGroup && !caseGroupsInOrder.includes(s.caseGroup)) caseGroupsInOrder.push(s.caseGroup);
  }
  const hasCaseGroups = caseGroupsInOrder.length > 1;

  const [activeCaseGroup, setActiveCaseGroup] = useState<string | undefined>(
    currentGroup ?? caseGroupsInOrder[0],
  );
  const [showAllCaseGroups, setShowAllCaseGroups] = useState(false);

  const visibleCaseGroups = showAllCaseGroups
    ? caseGroupsInOrder
    : caseGroupsInOrder.filter(cg => !hiddenCaseGroups.includes(cg) || cg === currentGroup);
  const hasHiddenGroups = hiddenCaseGroups.some(cg => caseGroupsInOrder.includes(cg));

  // Filtered by active tab, sorted by docket date within the tab — same as vite.
  const sidebarSections = hasCaseGroups && activeCaseGroup
    ? sections
        .filter(s => s.caseGroup === activeCaseGroup)
        .slice()
        .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
    : sections;

  return (
    <MobileNavigation isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}>
      <div className="p-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="text-foreground/80 hover:text-foreground hover:bg-card/60 mb-4 -ml-2 whitespace-normal h-auto text-left justify-start"
            asChild
          >
            <Link href={collectionHref}>
              <ArrowLeft className="h-4 w-4 mr-2 flex-shrink-0" />
              Back to {collectionTitle}
            </Link>
          </Button>

          <div className="flex items-center gap-2 mb-1">
            <Scale className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-serif text-foreground" style={{ letterSpacing: '-0.018em' }}>
              {collectionTitle}
            </h2>
          </div>
          <h3 className="text-sm text-foreground/70">{compositionTitle}</h3>
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
                    'px-2.5 py-1.5 text-xs rounded-md transition-colors',
                    activeCaseGroup === cg
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted text-foreground/80 hover:bg-secondary'
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
                {showAllCaseGroups ? 'Hide prior pleadings' : 'Show prior pleadings'}
              </button>
            )}
          </div>
        )}

        <nav className="space-y-1 pb-16">
          {sidebarSections.map(section => {
            const isActive = section.slug === currentSlug;
            return (
              <Link
                key={section.slug}
                href={section.href}
                className={cn(
                  'block w-full text-left px-3 py-2 rounded-md transition-colors',
                  isActive
                    ? 'bg-card/90 text-primary border-l-2 border-primary -ml-[2px] pl-[10px] shadow-sm'
                    : 'text-foreground hover:bg-card/60'
                )}
                style={{ fontWeight: isActive ? 580 : 480 }}
              >
                <span className="text-[11px] text-foreground/60 block uppercase tracking-wider" style={{ fontWeight: 600 }}>
                  Section {section.number}
                </span>
                <div className="flex items-center justify-between">
                  <span className="flex-1 text-sm leading-snug">{section.title}</span>
                  {section.hasImages && (
                    <ImageIcon className="w-3 h-3 ml-2 text-foreground/60 flex-shrink-0" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </MobileNavigation>
  );
}
