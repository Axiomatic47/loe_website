// app/_components/SitePageLayout.tsx — Next port of src/components/PageLayout.tsx
// (Header/Footer swapped for the Next ports. The elastic-scroll "signature"
// this carried — content translating up to 800px past the page edges and
// springing back — was RETIRED 2026-08-27 on owner direction: the stretch
// read as exaggerated expansion, and on viewport-filling pages like the
// archive review mode it hijacked every scroll. Native scrolling only.)
'use client';

import React from 'react';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';

interface SitePageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function SitePageLayout({ children, className = '' }: SitePageLayoutProps) {
  return (
    <>
      {/* Warm cream surface — Claude-aesthetic preview */}
      <div
        className="fixed inset-0 w-full h-full bg-background"
        style={{ zIndex: -2 }}
      />

      {/* Paper texture: soft glow + dot grid + grain (see .bg-texture in index.css) */}
      <div
        className="fixed inset-0 w-full h-full bg-texture pointer-events-none"
        style={{ zIndex: -1 }}
        aria-hidden="true"
      />

      {/* Fixed header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <SiteHeader />
      </div>

      <div className="min-h-screen flex flex-col pt-16 pb-16">
        <main id="main-content" className={`${className} flex-grow relative z-10 pt-8`}>
          {children}
        </main>
      </div>

      {/* Fixed footer */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <SiteFooter />
      </div>
    </>
  );
}
