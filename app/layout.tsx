import type { Metadata } from 'next';
import { Providers } from './providers';
import { Analytics } from './_components/Analytics';
import { SITE_ORIGIN } from '@/utils/urls';
import '@/index.css';
import './head-styles.css';

// Site-wide defaults; every reader page overrides via generateMetadata —
// per-document titles/descriptions/social cards are a core goal of the port.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: {
    default: 'The Laws of Existence - A Unified Mathematical Framework',
    template: '%s — The Laws of Existence',
  },
  description:
    'A unified mathematical framework for consciousness, ethics, and reality by Joseph Kirchner',
  authors: [{ name: 'Joseph Kirchner' }],
  keywords: [
    'consciousness',
    'mathematical framework',
    'ethics',
    'philosophy',
    'unified theory',
    'AI alignment',
  ],
  openGraph: {
    title: 'The Laws of Existence',
    description: 'A unified mathematical framework for consciousness, ethics, and reality',
    type: 'website',
    url: SITE_ORIGIN,
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: next-themes mutates <html> class/color-scheme
    // pre-hydration (replaces the vite index.html FOUC bootstrap script).
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* Google Fonts as on the vite site (React hoists these to <head>);
            next/font self-hosting is the Phase 4 item, not a port change. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300..700&family=Source+Serif+4:ital,opsz,wght@0,8..60,300..700;1,8..60,300..700&family=Noto+Serif:ital,wght@0,400;0,600;0,700;1,400&family=Noto+Serif+Hebrew:wght@400;600&display=swap"
          rel="stylesheet"
        />
        <Providers>{children}</Providers>
        {/* First-party page counter (owner 2026-09-16: "free, no subscriptions"): one beacon to
            this site's own /api/hit per page shown, no cookie, no third party — Plausible left
            with it. app/_components/Analytics.tsx; design in docs/ANALYTICS.md. */}
        <Analytics />
      </body>
    </html>
  );
}
