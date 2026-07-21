// app/page.tsx — TEMPORARY PORT SCAFFOLD, replaced by the Index (home) port.
// Exists to prove the content manifest end-to-end under `next build` (SSG):
// if this page renders, fs-loading, normalization, and ordering all work.
import { getAllCompositions, ALL_COLLECTIONS } from '@/lib/content-manifest';

export default function Home() {
  const compositions = getAllCompositions();

  return (
    <div className="min-h-screen bg-background px-4 py-16">
      <div className="container mx-auto max-w-3xl">
        <div className="bg-card border border-border rounded-xl shadow-sm p-10">
          <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground font-sans mb-3" style={{ fontWeight: 600 }}>
            Next.js port scaffold — not the home page
          </p>
          <h1 className="font-serif text-3xl mb-6" style={{ fontWeight: 580 }}>
            Content manifest: {compositions.length} compositions
          </h1>
          <ul className="space-y-2">
            {ALL_COLLECTIONS.map(collection => {
              const comps = compositions.filter(c => c.collection_type === collection);
              const sections = comps.reduce((n, c) => n + c.sections.length, 0);
              return (
                <li key={collection} className="flex justify-between border-b border-border pb-2">
                  <span className="font-serif">{collection}</span>
                  <span className="text-muted-foreground">
                    {comps.length} compositions · {sections} sections
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
