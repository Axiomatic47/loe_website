// app/_components/SectionContent.tsx — depth-slider prose island.
//
// Client port of the vite SectionPage's markdown branch: the 1/3/5 content
// slider (a deliberate accessibility feature — DESIGN.md §8) over
// collection-mapped content levels. The server page resolves the field
// mapping and passes plain strings; markdown renders through the shared
// ImageEnhancedMarkdownRenderer (SSR'd on first paint, MathJax on demand).
'use client';

import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import ImageEnhancedMarkdownRenderer from '@/components/ImageEnhancedMarkdownRenderer';

export interface ContentLevel {
  value: number; // slider position: 1 | 3 | 5
  label: string; // e.g. "Content" / "Verify" / "Additional Content"
  content: string;
}

export function SectionContent({ levels }: { levels: ContentLevel[] }) {
  // Default to level 1 so "Content" shows first — same as the vite reader.
  const [literacyLevel, setLiteracyLevel] = useState(1);
  const { toast } = useToast();

  const levelFor = (value: number) => levels.find(l => l.value === value);
  const current = levelFor(literacyLevel) ?? levels[0];

  const handleLiteracyChange = (value: number[]) => {
    const requestedLevel = value[0];
    const requested = levelFor(requestedLevel);
    const hasContent = Boolean(requested?.content);

    const newLevel = hasContent ? requestedLevel : 1;
    setLiteracyLevel(newLevel);

    const levelLabel = levelFor(newLevel)?.label || 'Content';
    if (!hasContent) {
      toast({
        title: 'Content Type Adjusted',
        description: `Content not available at requested type, showing ${levelLabel} instead.`,
      });
    } else {
      toast({
        title: 'Content Type Updated',
        description: `Showing ${levelLabel}`,
      });
    }
  };

  return (
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
            {current?.label || 'Content'}
          </span>
        </div>
      </div>

      {/* Main Content WITHOUT images in markdown */}
      <div className="relative mb-8">
        <div className="prose prose-xl max-w-none">
          <ImageEnhancedMarkdownRenderer
            content={current?.content || ''}
            images={[]}
            showToggle={true}
            className="mb-8"
          />
        </div>
      </div>
    </>
  );
}
