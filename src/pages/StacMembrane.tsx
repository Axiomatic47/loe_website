// src/pages/StacMembrane.tsx — one membrane of STAC 8/203/38 (UNLISTED).
// Leaf image (zoom/pan) beside its documents: the line index and any
// transcriptions that cover the leaf, as tabs. Crop references in the text are
// clickable when the crop is published (see StacMarkdown).

import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { MembraneViewer } from "@/components/MembraneViewer";
import { StacMarkdown } from "@/components/StacMarkdown";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useNoIndex } from "@/hooks/useNoIndex";
import { useStacManifest, STAC_BASE, StacDocRef } from "@/pages/StacArchive";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const StacMembrane = () => {
  const { membraneId = "001" } = useParams();
  const { manifest, error } = useStacManifest();
  useNoIndex();

  const membrane = manifest?.membranes.find((m) => m.id === membraneId) || null;

  useDocumentMeta(
    membrane ? `Membrane ${membrane.id} — STAC 8/203/38` : "STAC 8/203/38",
    "Working diplomatic transcription — membrane leaf, line index, and transcription."
  );

  // tabs = line index + distinct transcription docs
  const tabs = useMemo(() => {
    if (!membrane) return [] as Array<{ key: string; label: string; doc: StacDocRef }>;
    const t: Array<{ key: string; label: string; doc: StacDocRef }> = [];
    if (membrane.lineIndex) t.push({ key: "index", label: "Line index", doc: membrane.lineIndex });
    const seen = new Set<string>();
    for (const tr of membrane.transcriptions) {
      if (seen.has(tr.file)) continue;
      seen.add(tr.file);
      t.push({ key: tr.file, label: `Transcription ${tr.span || ""}`.trim(), doc: tr });
    }
    return t;
  }, [membrane]);

  const [active, setActive] = useState<string | null>(null);
  const [docs, setDocs] = useState<Record<string, string>>({});
  const activeTab = tabs.find((t) => t.key === active) || tabs[0] || null;

  // reset tab when navigating between membranes
  useEffect(() => {
    setActive(null);
  }, [membraneId]);

  // fetch the active doc's markdown once
  useEffect(() => {
    if (!activeTab) return;
    const file = activeTab.doc.file;
    if (docs[file] !== undefined) return;
    fetch(`${STAC_BASE}/${file}`)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((text) => setDocs((d) => ({ ...d, [file]: text })))
      .catch((e) => setDocs((d) => ({ ...d, [file]: `**Could not load document** (${e.message}).` })));
  }, [activeTab, docs]);

  const ids = manifest?.membranes.map((m) => m.id) || [];
  const idx = ids.indexOf(membraneId);
  const prev = idx > 0 ? ids[idx - 1] : null;
  const next = idx >= 0 && idx < ids.length - 1 ? ids[idx + 1] : null;

  return (
    <PageLayout>
      <main className="container mx-auto px-4 py-10">
        {/* header row */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <Link
            to="/research/stac-8-203-38"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors font-sans"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            STAC 8/203/38 — archive
          </Link>
          <div className="flex items-center gap-2 font-sans">
            {prev && (
              <Link to={`/research/stac-8-203-38/m/${prev}`} className="text-sm text-primary hover:text-primary/80 inline-flex items-center transition-colors">
                <ArrowLeft className="h-3.5 w-3.5 mr-1" /> {prev}
              </Link>
            )}
            <span className="font-serif text-foreground px-2" style={{ fontWeight: 580, fontVariantNumeric: "tabular-nums" }}>
              Membrane {membraneId}
            </span>
            {next && (
              <Link to={`/research/stac-8-203-38/m/${next}`} className="text-sm text-primary hover:text-primary/80 inline-flex items-center transition-colors">
                {next} <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-secondary border border-border border-l-2 border-l-destructive rounded-md px-4 py-3 text-sm font-sans text-foreground/85 mb-6">
            Manifest not found ({error}). Run <code>npm run sync-stac</code> locally.
          </div>
        )}
        {!manifest && !error && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        {manifest && !membrane && (
          <div className="text-center py-24 font-sans text-muted-foreground">No membrane “{membraneId}” in the manifest.</div>
        )}

        {membrane && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* leaf */}
            <div className="lg:sticky lg:top-20">
              <MembraneViewer src={`${STAC_BASE}/${membrane.image}`} alt={`STAC 8/203/38 membrane ${membrane.id}`} />
              {membrane.sha256 && (
                <p className="mt-2 text-[11px] text-muted-foreground font-mono break-all">
                  sha256 {membrane.sha256}
                </p>
              )}
            </div>

            {/* documents */}
            <div className="min-w-0">
              {tabs.length === 0 ? (
                <div className="bg-card border border-border rounded-xl shadow-sm p-8 text-sm font-sans text-muted-foreground">
                  No line index or transcription has been published for this leaf yet.
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {tabs.map((t) => (
                      <button
                        key={t.key}
                        onClick={() => setActive(t.key)}
                        className={cn(
                          "px-3 py-1.5 rounded-md text-sm font-sans transition-colors",
                          activeTab?.key === t.key
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-secondary text-foreground/80 hover:bg-secondary/70 border border-border"
                        )}
                        style={{ fontWeight: activeTab?.key === t.key ? 600 : 500 }}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <div className="bg-card border border-border rounded-xl shadow-sm p-6 md:p-8 lg:max-h-[78vh] lg:overflow-y-auto">
                    {activeTab && docs[activeTab.doc.file] !== undefined ? (
                      <StacMarkdown text={docs[activeTab.doc.file]} cropIndex={manifest.crops.index} />
                    ) : (
                      <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </PageLayout>
  );
};

export default StacMembrane;
