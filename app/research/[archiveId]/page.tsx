// app/research/[archiveId]/page.tsx — landing page for a primary-source
// archive (server port of src/views/ResearchArchive.tsx).
// PUBLISHED 2026-08-23 (owner direction, TNA reproduction licence in hand):
// linked from the homepage, in the sitemap, and indexable — the pre-licence
// unlisted/noindex posture is retired. The manifest is read from
// public/uploads/research at build.
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Reveal } from '@/components/Reveal';
import { RESEARCH_ARCHIVES } from '@/data/researchArchives';
import {
  imagesPublished,
  archiveBase,
  leafStatus,
  CONVENTIONS,
} from '@/lib/research-archive';
import { ArrowRight, FileText, ScrollText } from 'lucide-react';
import { SitePageLayout } from '../../_components/SitePageLayout';
import { readArchiveManifest } from '../manifest-server';

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(RESEARCH_ARCHIVES).map(archiveId => ({ archiveId }));
}

type Params = { params: Promise<{ archiveId: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { archiveId } = await params;
  const config = RESEARCH_ARCHIVES[archiveId];
  if (!config) return { robots: { index: false, follow: false } };
  return {
    title: `${config.ref} — working transcription`,
    description: `Working diplomatic transcription of ${config.ref}: leaf images, line indexes, and transcriptions.`,
    alternates: { canonical: `/research/${archiveId}` },
  };
}

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <div className="text-xs uppercase tracking-[0.1em] text-muted-foreground font-sans mb-3" style={{ fontWeight: 600 }}>
    {children}
  </div>
);

export default async function ResearchArchivePage({ params }: Params) {
  const { archiveId } = await params;
  const config = RESEARCH_ARCHIVES[archiveId];
  if (!config) notFound();

  const manifest = readArchiveManifest(archiveId);

  return (
    <SitePageLayout>
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <Eyebrow>Primary-source research · working transcription</Eyebrow>
            <h1
              className="font-serif text-foreground"
              style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 580, letterSpacing: "-0.02em", lineHeight: 1.12 }}
            >
              {config.ref} —{" "}
              <span className="[&_p]:inline [&_em]:font-serif">
                <ReactMarkdown allowedElements={["p", "em", "strong"]} unwrapDisallowed>
                  {config.caseTitle}
                </ReactMarkdown>
              </span>
            </h1>
            <p className="text-sm text-muted-foreground mt-2 font-sans">
              {config.source} · {config.dated}
            </p>

            <div className="prose mt-6 max-w-none">
              {config.intro.map((para, i) => (
                <ReactMarkdown key={i} remarkPlugins={[remarkGfm]}>
                  {para}
                </ReactMarkdown>
              ))}
              <p>
                <strong>Every reading here is provisional.</strong> These are working papers:
                uncertainty is marked rather than resolved, deltas between passes are logged, and
                unresolved readings are flagged for professional arbitration against the original.
                Corrections and collaboration are welcome —{" "}
                <a href="mailto:contact@lawsofexistence.com">contact@lawsofexistence.com</a>.
              </p>
            </div>
          </Reveal>

          {!manifest && (
            <div className="mt-8 bg-secondary border border-border border-l-2 border-l-destructive rounded-md px-4 py-3 text-sm font-sans text-foreground/85">
              Manifest not found. Run <code>npm run sync-archives</code> locally to
              publish the current working files.
            </div>
          )}

          {manifest && !imagesPublished(manifest) && (
            <div className="mt-8 bg-secondary border border-border border-l-2 border-l-primary rounded-md px-5 py-4 text-sm font-sans text-foreground/85 leading-relaxed">
              <span style={{ fontWeight: 600 }}>Leaf images are not yet published.</span> A
              reproduction licence from {manifest.images?.rightsHolder || "the rights holder"} is
              pending; placeholders are shown in their place. The transcription and line-index
              PDFs, and the SHA-256 fixity hashes of the source images, are live.
            </div>
          )}

          {/* How to review + conventions */}
          <Reveal delay={80}>
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-xl shadow-sm p-6">
                <Eyebrow>How to review</Eyebrow>
                <ol className="text-sm font-sans text-foreground/85 space-y-2 list-decimal ml-4 leading-relaxed">
                  <li>Open a {config.leafLabel.toLowerCase()} below — the leaf image sits beside its documents (PDF).</li>
                  <li>
                    Compare the image against the <strong>transcript</strong> (continuous text with
                    editorial notes) and the <strong>line index</strong> (line-by-line census).
                  </li>
                  <li>
                    Readings marked <code>[?]</code> are uncertain; <code>⟦…⟧</code> notes record
                    what later passes changed and why.
                  </li>
                  <li>The working papers below track every open question and delta across passes.</li>
                </ol>
              </div>
              <div className="bg-card border border-border rounded-xl shadow-sm p-6">
                <Eyebrow>Diplomatic conventions</Eyebrow>
                <dl className="text-sm font-sans space-y-1.5">
                  {CONVENTIONS.map(([sym, meaning]) => (
                    <div key={sym} className="flex gap-3">
                      <dt className="w-24 flex-shrink-0">
                        <code className="text-primary">{sym}</code>
                      </dt>
                      <dd className="text-muted-foreground">{meaning}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </Reveal>

          {/* Leaf grid */}
          <Reveal delay={140}>
            <div className="mt-12">
              <Eyebrow>
                The {config.leafLabel.toLowerCase()}s{manifest ? ` — ${manifest.leaves.length} leaves` : ""}
              </Eyebrow>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {(manifest?.leaves || []).map((leaf) => (
                  <Link
                    key={leaf.id}
                    href={`/research/${archiveId}/leaf/${leaf.id}`}
                    className="group bg-card border border-border rounded-lg shadow-sm hover:shadow-md hover:border-primary/30 transition-all overflow-hidden flex flex-col"
                  >
                    <div className="aspect-[3/4] bg-muted overflow-hidden">
                      <img
                        src={`${archiveBase(archiveId)}/${leaf.image}`}
                        alt={`${config.leafLabel} ${leaf.id}`}
                        loading="lazy"
                        className="w-full h-full object-cover object-top group-hover:opacity-90 transition-opacity"
                      />
                    </div>
                    <div className="p-3">
                      <div
                        className="font-serif text-foreground group-hover:text-primary transition-colors"
                        style={{ fontWeight: 580, fontVariantNumeric: "tabular-nums" }}
                      >
                        {config.leafLabel} {leaf.id}
                      </div>
                      <div className="text-[11px] text-muted-foreground font-sans mt-1 leading-snug">
                        {leafStatus(leaf)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Working papers */}
          {manifest && manifest.workingPapers.length > 0 && (
            <Reveal delay={200}>
              <div className="mt-12">
                <Eyebrow>Working papers</Eyebrow>
                <div className="bg-card border border-border rounded-xl shadow-sm p-4">
                  {manifest.workingPapers.map((p) => (
                    <Link
                      key={p.pdf}
                      href={`/research/${archiveId}/doc/${encodeURIComponent(p.pdf.replace(/^pdfs\//, ""))}`}
                      className="group flex items-start gap-3 rounded-md px-3 py-2.5 hover:bg-secondary transition-colors"
                    >
                      <ScrollText className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span
                        className="text-sm text-foreground group-hover:text-primary font-sans leading-snug transition-colors"
                        style={{ fontWeight: 550 }}
                      >
                        {p.title}
                      </span>
                      <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground group-hover:text-primary mt-0.5 flex-shrink-0 transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            </Reveal>
          )}

          {/* Provenance & fixity */}
          <Reveal delay={240}>
            <div className="mt-12 bg-secondary border border-border border-l-2 border-l-primary rounded-md px-5 py-4">
              <div className="flex items-start gap-3">
                <FileText className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                <div className="text-sm text-foreground/85 font-sans leading-relaxed">
                  <span style={{ fontWeight: 600 }}>Provenance &amp; fixity.</span> Source images:{" "}
                  {config.source}.
                  {imagesPublished(manifest) && manifest?.images?.rightsNote && (
                    <> {manifest.images.rightsNote}</>
                  )}{" "}
                  Each leaf's SHA-256 is recorded at sync time and shown on its
                  page, so any copy can be verified against the published hash. Crop tiles used
                  during transcription are hash-manifested in the working tree
                  {manifest && manifest.crops.count > 0
                    ? `; ${manifest.crops.count} are published here`
                    : " and published selectively"}
                  .
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </main>
    </SitePageLayout>
  );
}
