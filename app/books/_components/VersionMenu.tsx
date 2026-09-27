// app/books/_components/VersionMenu.tsx — the book's VERSION drop-down (owner 2026-09-24): a button
// naming the current version opens a list of every uploaded version with its date, the sha prefixes of
// its text and PDF, and a concise note of what changed. The list is a popover laid OVER the page
// (absolute, opening upward from the footer), so it never moves the review panes.
// Two dates per version (owner 2026-09-26): COMPLETED is the lane's date; PUBLISHED is when the version first
// reached the live site (the owner's integration — content/versions/<slug>.published.json); a version without
// one reads "not yet published".
'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BookVersion } from '@/lib/review';

const shortDate = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });

export function VersionMenu({ versions, align = 'right', up = true, className }: { versions: BookVersion[]; align?: 'left' | 'right'; up?: boolean; className?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);
  if (!versions.length) return null;
  const current = versions[0];
  return (
    <div ref={ref} className={cn('relative inline-block font-sans', className)}>
      <button type="button" onClick={() => setOpen((x) => !x)} aria-expanded={open} aria-haspopup="listbox"
        className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 h-6 text-[11px] text-foreground/85 hover:bg-muted transition-colors tabular-nums"
        style={{ fontWeight: 550 }} title="Versions of this book — when each was completed and published, and what changed">
        <History className="h-3 w-3 text-primary" aria-hidden />
        Version {current.version} · {current.published ? shortDate(current.published) : 'unpublished'}
        <ChevronDown className={cn('h-3 w-3 transition-transform', open && 'rotate-180')} aria-hidden />
      </button>
      {open && (
        <div role="listbox" aria-label="Versions"
          className={cn('absolute z-40 w-[26rem] max-w-[calc(100vw-2rem)] max-h-[60vh] overflow-y-auto rounded-md border border-border bg-card shadow-lg p-1 text-left',
            up ? 'bottom-full mb-1' : 'top-full mt-1', align === 'right' ? 'right-0' : 'left-0')}>
          {versions.map((v, i) => (
            <div key={v.version} role="option" aria-selected={i === 0} className={cn('rounded px-3 py-2', i === 0 && 'bg-primary/10')}>
              <p className="text-xs text-foreground tabular-nums" style={{ fontWeight: 600 }}>Version {v.version}{i === 0 ? ' — current' : ''}</p>
              <p className="text-[11px] text-muted-foreground tabular-nums" style={{ fontWeight: 500 }}>
                completed {shortDate(v.date)}
                {' · '}
                {v.published
                  ? <span title={v.publishedBy === 'this deploy' ? 'published by this release' : `first reached the live site with main ${v.publishedBy}`}>published {shortDate(v.published)}</span>
                  : <span className="text-primary">not yet published</span>}
              </p>
              <p className="text-xs text-foreground/85 leading-relaxed mt-0.5">{v.note}</p>
              {(v.text || v.pdf) && (
                <p className="text-[10px] text-muted-foreground font-mono mt-1">{v.text ? `text ${v.text.slice(0, 12)}` : ''}{v.text && v.pdf ? ' · ' : ''}{v.pdf ? `pdf ${v.pdf.slice(0, 12)}` : ''}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
