import type { Metadata } from 'next';
import Link from 'next/link';
import { SitePageLayout } from './_components/SitePageLayout';

// Real HTTP 404s replace the vite SPA's soft-404 (200 + shell) — one of the
// port's acceptance criteria. Renders inside the site layout so the 404 carries
// the header, the site-wide closing quote, and the footer like every other
// page (owner 2026-09-08: the quote field is a site-wide feature).
export const metadata: Metadata = {
  title: 'Page Not Found',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <SitePageLayout className="flex flex-col">
      <div className="container mx-auto px-4 py-12 flex-grow flex items-center justify-center">
        <div className="bg-card border border-border rounded-xl shadow-sm p-10 max-w-xl text-center">
          <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground font-sans mb-3" style={{ fontWeight: 600 }}>
            404
          </p>
          <h1 className="font-serif text-3xl mb-4" style={{ fontWeight: 580 }}>
            Page Not Found
          </h1>
          <p className="text-muted-foreground mb-8">
            The document or page you requested does not exist. If you followed a
            citation, the document may be reachable from its case page.
          </p>
          <Link href="/" className="text-primary hover:underline" style={{ fontWeight: 550 }}>
            Return to The Laws of Existence
          </Link>
        </div>
      </div>
    </SitePageLayout>
  );
}
