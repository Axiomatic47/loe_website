import type { NextConfig } from 'next';

// Phase 2 port config. Deliberately minimal while routes come over:
// - images stay unoptimized: the scan/exhibit corpora serve from public/
//   exactly as on the vite site; next/image + Netlify image CDN is Phase 4.
// - legacy-route 301s (scripts/data/legacy-routes.json) compile into
//   redirects() at the cutover step, replacing public/_redirects.
const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
};

export default nextConfig;
