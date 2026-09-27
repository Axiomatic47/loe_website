'use client';
// src/components/HeroQuoteRotator.tsx — rotating epigraph under the hero CTAs.
//
// Owner ask 2026-09-05: a quote field just under the hero buttons that rotates
// intriguing quotations OF OTHERS found throughout the work (the pool lives in
// src/data/hero-quotes.json; transcribers and drafters supply entries).
//
// Behaviour:
//   - every quote is rendered into the same grid cell, so the block's height is
//     the tallest quote and the layout below never jumps between rotations;
//   - crossfade on a fixed timer that nothing passive on the page can reset. (v1
//     paused on hover/focus; every pause flip re-armed the timer, and the field
//     sits right under the CTAs where the cursor rests — the owner saw it
//     stationary, 2026-09-06. Only a hidden tab now skips ticks, and it keeps
//     the clock.)
//   - owner 2026-09-26 ("cycle through within about 5 seconds making it
//     difficult to read in full"): the hold is 1.8× what it was (8 s → 14.4 s),
//     and an arrow on each side of the block steps backward / forward through
//     the pool. An arrow click restarts the hold so the chosen quote keeps its
//     full time (a deliberate act, unlike the hover of v1). Every quote is
//     centred in the shared cell so the arrows sit level with the visible one. Applies to every
//     quoting section on every page: this one component is the only rotator.
//   - prefers-reduced-motion: the swap is instant (no fade), still rotates;
//   - SSR-safe: the first quote renders on the server and hydrates identically.
// Shared by both renderers (vite Index.tsx and Next app/page.tsx).
import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { HeroQuote } from '@/data/heroQuotes';

const LINK_CLASS =
  'hover:text-foreground hover:underline underline-offset-4 decoration-border transition-colors';

interface Props {
  quotes: HeroQuote[];
  /** ms each quote holds before the next fades in (owner 2026-09-26: 1.8× the original 8 s) */
  intervalMs?: number;
  className?: string;
  /** Renders the attribution as a client-side link (react-router Link / next/link).
   *  Defaults to a plain <a>. */
  renderLink?: (href: string, className: string, children: React.ReactNode) => React.ReactNode;
}

export function HeroQuoteRotator({
  quotes,
  intervalMs = 14400,
  className = '',
  renderLink,
}: Props) {
  const [index, setIndex] = useState(0);
  /** bumped by an arrow click: the hold timer restarts from the chosen quote */
  const [epoch, setEpoch] = useState(0);
  const reduced = useRef(false);
  const step = (d: 1 | -1) => {
    setIndex(i => (i + d + quotes.length) % quotes.length);
    setEpoch(e => e + 1);
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reduced.current = mq.matches;
    const onChange = (e: MediaQueryListEvent) => { reduced.current = e.matches; };
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  useEffect(() => {
    if (quotes.length < 2) return;
    let hidden = typeof document !== 'undefined' && document.visibilityState === 'hidden';
    const onVis = () => { hidden = document.visibilityState === 'hidden'; };
    document.addEventListener('visibilitychange', onVis);
    const t = window.setInterval(() => {
      if (hidden) return;
      setIndex(i => (i + 1) % quotes.length);
    }, intervalMs);
    return () => {
      window.clearInterval(t);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [quotes.length, intervalMs, epoch]);

  if (!quotes.length) return null;

  const fade = reduced.current ? 'none' : 'opacity 700ms ease';

  const arrows = quotes.length > 1;
  const ARROW_CLASS =
    'shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40';

  return (
    <div
      className={`mx-auto flex items-center gap-1 sm:gap-2 ${className}`}
      style={{ maxWidth: arrows ? '46rem' : '40rem' }}
    >
      {arrows && (
        <button type="button" onClick={() => step(-1)} className={ARROW_CLASS} aria-label="Previous quotation" title="Previous quotation">
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
      )}
      <div className="grid flex-1 min-w-0 items-center" style={{ gridTemplateAreas: '"q"' }}>
        {quotes.map((q, i) => {
          const active = i === index;
          const caption = (
            <>
              — {q.attribution}, <span className="whitespace-normal">{q.source}</span>
            </>
          );
          return (
            <figure
              key={q.id}
              aria-hidden={!active}
              className="text-center px-2"
              style={{
                gridArea: 'q',
                opacity: active ? 1 : 0,
                transition: fade,
                pointerEvents: active ? 'auto' : 'none',
              }}
            >
              <blockquote>
                <p
                  className="font-serif italic text-foreground/85"
                  style={{
                    fontSize: 'clamp(15px, 1.6vw, 18px)',
                    lineHeight: 1.55,
                    letterSpacing: '-0.005em',
                  }}
                >
                  “{q.text}”
                </p>
              </blockquote>
              <figcaption className="text-xs text-muted-foreground mt-2 font-sans">
                {q.href && renderLink ? (
                  renderLink(q.href, LINK_CLASS, caption)
                ) : q.href ? (
                  <a href={q.href} className={LINK_CLASS}>
                    {caption}
                  </a>
                ) : (
                  caption
                )}
              </figcaption>
            </figure>
          );
        })}
      </div>
      {arrows && (
        <button type="button" onClick={() => step(1)} className={ARROW_CLASS} aria-label="Next quotation" title="Next quotation">
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
      )}
    </div>
  );
}
