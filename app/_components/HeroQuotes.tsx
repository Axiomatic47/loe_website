'use client';
// app/_components/HeroQuotes.tsx — Next client boundary for the hero quote
// rotator. The page is a server component and cannot hand a render callback
// across the boundary, so the next/link wiring lives here and the page passes
// only the (serialisable) quote list.
import Link from 'next/link';
import { HeroQuoteRotator } from '@/components/HeroQuoteRotator';
import type { HeroQuote } from '@/data/heroQuotes';

export function HeroQuotes({ quotes, className }: { quotes: HeroQuote[]; className?: string }) {
  return (
    <HeroQuoteRotator
      quotes={quotes}
      className={className}
      renderLink={(href, cls, children) => (
        <Link href={href} className={cls}>
          {children}
        </Link>
      )}
    />
  );
}
