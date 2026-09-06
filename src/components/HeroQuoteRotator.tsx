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
//   - crossfade on a timer; paused while hovered/focused or the tab is hidden;
//   - prefers-reduced-motion: the swap is instant (no fade), still rotates;
//   - SSR-safe: the first quote renders on the server and hydrates identically.
// Shared by both renderers (vite Index.tsx and Next app/page.tsx).
import { useEffect, useRef, useState } from 'react';
import type { HeroQuote } from '@/data/heroQuotes';

const LINK_CLASS =
  'hover:text-foreground hover:underline underline-offset-4 decoration-border transition-colors';

interface Props {
  quotes: HeroQuote[];
  /** ms each quote holds before the next fades in */
  intervalMs?: number;
  className?: string;
  /** Renders the attribution as a client-side link (react-router Link / next/link).
   *  Defaults to a plain <a>. */
  renderLink?: (href: string, className: string, children: React.ReactNode) => React.ReactNode;
}

export function HeroQuoteRotator({
  quotes,
  intervalMs = 9000,
  className = '',
  renderLink,
}: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reduced.current = mq.matches;
    const onChange = (e: MediaQueryListEvent) => { reduced.current = e.matches; };
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  useEffect(() => {
    if (quotes.length < 2 || paused) return;
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
  }, [quotes.length, intervalMs, paused]);

  if (!quotes.length) return null;

  const fade = reduced.current ? 'none' : 'opacity 700ms ease';

  return (
    <div
      className={`mx-auto ${className}`}
      style={{ maxWidth: '40rem' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="grid" style={{ gridTemplateAreas: '"q"' }}>
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
    </div>
  );
}
