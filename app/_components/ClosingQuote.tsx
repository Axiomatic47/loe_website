'use client';
// app/_components/ClosingQuote.tsx — the site-wide closing quote field (Next
// renderer). Rendered by SitePageLayout at the tail of every page's scrolling
// content, directly above the fixed footer (owner 2026-09-08: a site-wide
// feature, same location on every page). Mirrors src/components/ClosingQuote.tsx.
import Link from 'next/link';
import { HeroQuoteRotator } from '@/components/HeroQuoteRotator';
import { HERO_QUOTES } from '@/data/heroQuotes';

export function ClosingQuote() {
  return (
    <section aria-label="Closing quotation" className="container mx-auto px-4 relative z-10">
      <div className="max-w-4xl mx-auto mt-16 mb-6 pt-10 border-t border-border">
        <HeroQuoteRotator
          quotes={HERO_QUOTES}
          renderLink={(href, cls, children) => (
            <Link href={href} className={cls}>
              {children}
            </Link>
          )}
        />
      </div>
    </section>
  );
}
