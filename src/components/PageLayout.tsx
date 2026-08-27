// src/components/PageLayout.tsx — page chrome (fixed header/footer, paper
// texture). The elastic-scroll effect this carried — content translating up
// to 800px past the page edges and springing back — was RETIRED 2026-08-27
// on owner direction: the stretch read as exaggerated expansion, and on
// viewport-filling pages it hijacked every scroll. Native scrolling only.
// Mirrors app/_components/SitePageLayout.tsx.

import React from 'react';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const PageLayout = ({ children, className = '' }: PageLayoutProps) => {
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
        <Header />
      </div>

      <div className="min-h-screen flex flex-col pt-16 pb-16">
        <main id="main-content" className={`${className} flex-grow relative z-10 pt-8`}>
          {children}
        </main>
      </div>

      {/* Fixed footer */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <Footer />
      </div>
    </>
  );
};

export default PageLayout;
