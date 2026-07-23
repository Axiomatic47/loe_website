import type { NextConfig } from 'next';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Legacy URL space — real permanent redirects compiled from data. They
// replace the vite client resolvers; public/_redirects (same frozen map,
// forced 301s, evaluated first) deliberately STAYS as the backstop layer
// for URLs cited in filed legal documents.
// - legacy-routes.json: the FROZEN positional→descriptive map (Phase 1;
//   684 URLs; regenerate never — it is a historical contract).
// - next-redirects.json: data-derived grammars (section-index forms, doc-id
//   alias spellings, Acosta arithmetic links, collection aliases) —
//   regenerate via `npm run generate-next-redirects` after content changes.
function loadRules(file: string): Array<{ source: string; destination: string }> {
  const raw = JSON.parse(readFileSync(join(__dirname, 'scripts', 'data', file), 'utf8'));
  // legacy-routes.json uses {from,to}; next-redirects.json uses {source,destination}
  return raw.map((r: Record<string, string>) => ({
    source: r.source ?? r.from,
    destination: r.destination ?? r.to,
  }));
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Static corpus is served from public/ exactly as on the vite site;
  // next/image + Netlify image CDN adoption is Phase 4.
  images: { unoptimized: true },
  // A few pages read JSON indexes from public/ at BUILD time (authority map,
  // scotus indexes, research manifests). Output tracing saw those dynamic fs
  // paths and pulled the entire public/ corpus (~920MB of court PDFs and
  // exhibits) into the serverless handler, blowing Netlify's function upload
  // limit. Every route is fully prerendered (dynamicParams=false, no
  // revalidation), so the handler never re-renders and never needs public/ —
  // the CDN serves it. Keep content/** traced (small) as render-input safety.
  outputFileTracingExcludes: {
    '*': ['./public/**', 'public/**'],
  },
  async redirects() {
    return [
      // Statics (mirror public/_redirects' hand rules + vite client redirects)
      { source: '/kirchner-v-trump', destination: '/kirchner-v-johnson', permanent: true },
      { source: '/kirchner-v-trump/section/:n', destination: '/kirchner-v-johnson/section/:n', permanent: true },
      { source: '/kirchner-v-trump/:docId', destination: '/kirchner-v-johnson/:docId', permanent: true },
      { source: '/copyright', destination: '/composition/copyright', permanent: true },
      ...loadRules('legacy-routes.json').map(r => ({ ...r, permanent: true })),
      ...loadRules('next-redirects.json').map(r => ({ ...r, permanent: true })),
    ];
  },
};

export default nextConfig;
