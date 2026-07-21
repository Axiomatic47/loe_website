// src/App.tsx - route table + app shell
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { lazy, Suspense, useMemo } from 'react';
import { useNoIndex } from "./hooks/useNoIndex";
import { useCollections } from "./hooks/useCollections";
import { useCompositionStore, ALL_COLLECTIONS, type CollectionType } from "./utils/compositionData";
import { normalizeDocId, sectionUrl, type CaseSlug } from "./utils/urls";

// Route components are lazy-loaded so each page ships as its own chunk.
// This keeps the initial bundle small for visitors who land on a single deep
// document (the common case for this site).
const Index = lazy(() => import("./pages/Index"));
const CompositionsPage = lazy(() => import("./pages/CompositionsPage"));
const SectionPage = lazy(() => import("./pages/SectionPage"));
const Contact = lazy(() => import("./pages/Contact"));
const Partners = lazy(() => import("./pages/Partners"));
const Donate = lazy(() => import("./pages/Donate"));
const WorldMap = lazy(() => import("./pages/WorldMap"));
const IndividualsMetrics = lazy(() => import("./pages/IndividualsMetrics"));
const Timeline = lazy(() => import("./pages/Timeline"));
const SimulationAdmin = lazy(() => import("./pages/SimulationAdmin"));
const VideosPage = lazy(() => import("./pages/VideosPage"));
const SCOTUSShadowDocket = lazy(() => import("./pages/SCOTUSShadowDocket"));
const ConstitutionalAccountability = lazy(() => import("./pages/ConstitutionalAccountability"));
const CaseLandingPage = lazy(() => import("./pages/CaseLandingPage"));
const ForJournalists = lazy(() => import("./pages/ForJournalists"));
// Primary-source research archives — live but UNLISTED (no nav, no sitemap, noindex)
const ResearchArchive = lazy(() => import("./pages/ResearchArchive"));
const ResearchLeaf = lazy(() => import("./pages/ResearchLeaf"));
const ResearchDoc = lazy(() => import("./pages/ResearchDoc"));
const LegalDisclaimers = lazy(() => import("./pages/LegalDisclaimers"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (import.meta.env.DEV) console.error('Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-8">
          <div className="bg-card rounded-2xl p-8 border border-border shadow-sm max-w-md text-center">
            <h1 className="text-2xl font-serif text-foreground mb-4">Something went wrong</h1>
            <p className="text-muted-foreground mb-6">
              An error occurred while loading the page. Please refresh to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors shadow-sm"
            >
              Refresh Page
            </button>
            {import.meta.env.DEV && (
              <details className="mt-4 text-left">
                <summary className="text-muted-foreground cursor-pointer">Error Details (Dev)</summary>
                <pre className="mt-2 text-xs text-muted-foreground/80 overflow-auto">
                  {this.state.error?.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// On-brand fallback shown while a lazy-loaded route chunk downloads or while the
// content store is still loading during slug/index resolution.
const RouteFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading" />
  </div>
);

// Case resolvers only ever need the constitutional collection (module-level
// constant so the useCollections effect dep stays stable).
const CONSTITUTIONAL: CollectionType[] = ['constitutional'];
const NO_COLLECTIONS: CollectionType[] = [];

// Descriptive case-document routes (/kirchner-v-<case>/:docId, /scotus-amicus/:docId)
// render the reader DIRECTLY — no redirect. The docId is normalized to a section
// slug and looked up on the case composition. An unknown docId never falls through
// to an array index: it redirects to the case landing page instead (Acosta keeps
// its legacy N-A arithmetic deep links).
const CaseDocReader = ({ caseSlug }: { caseSlug: CaseSlug }) => {
  const { docId = "" } = useParams<{ docId: string }>();
  const store = useCompositionStore();
  const { ready, error } = useCollections(CONSTITUTIONAL);

  if (!ready) return error ? <NotFound /> : <RouteFallback />;

  const composition = store.getCaseComposition(caseSlug);
  if (!composition) return <NotFound />;

  const resolved = store.getSectionBySlug(composition, normalizeDocId(caseSlug, docId));
  if (resolved) {
    return (
      <SectionPage
        collection="constitutional"
        compositionSlug={caseSlug}
        sectionSlug={resolved.section.slug}
      />
    );
  }

  // Acosta legacy arithmetic deep links: /kirchner-v-acosta/N-A → section (N + A).
  if (caseSlug === "kirchner-v-acosta") {
    const m = docId.match(/^(\d+)-(\d+)$/);
    if (m) {
      const target = composition.sections?.[parseInt(m[1], 10) + parseInt(m[2], 10) - 1];
      if (target) return <Navigate to={sectionUrl(composition, target)} replace />;
    }
  }

  // scotus-amicus has no landing page — its canonical entry is part 1.
  if (caseSlug === "scotus-amicus") {
    const first = composition.sections?.[0];
    return first ? <Navigate to={sectionUrl(composition, first)} replace /> : <NotFound />;
  }

  return <Navigate to={`/${caseSlug}`} replace />;
};

// Legacy /kirchner-v-<case>/section/:sectionId — resolve by index, then redirect
// to the canonical descriptive slug URL.
const CaseSectionRedirect = ({ caseSlug }: { caseSlug: CaseSlug }) => {
  const { sectionId = "1" } = useParams<{ sectionId: string }>();
  const store = useCompositionStore();
  const { ready, error } = useCollections(CONSTITUTIONAL);

  if (!ready) return error ? <NotFound /> : <RouteFallback />;

  const composition = store.getCaseComposition(caseSlug);
  const target = composition?.sections?.[parseInt(sectionId, 10) - 1];
  if (composition && target) return <Navigate to={sectionUrl(composition, target)} replace />;
  return composition ? <Navigate to={`/${caseSlug}`} replace /> : <NotFound />;
};

// Bare /scotus-amicus renders part 1 directly (published URL — no redirect).
const ScotusAmicusIndex = () => {
  const store = useCompositionStore();
  const { ready, error } = useCollections(CONSTITUTIONAL);

  if (!ready) return error ? <NotFound /> : <RouteFallback />;

  const composition = store.getCaseComposition("scotus-amicus");
  const first = composition?.sections?.[0];
  if (composition && first) {
    return (
      <SectionPage collection="constitutional" compositionSlug="scotus-amicus" sectionSlug={first.slug} />
    );
  }
  return <NotFound />;
};

// Legacy positional reader URL (/composition/:type/composition/:i/section/:n):
// resolve by index and redirect to the canonical descriptive URL.
const LegacyPositionalRedirect = () => {
  const { compositionId = "", compositionIndex = "1", sectionId = "1" } = useParams();
  const store = useCompositionStore();
  const isCollection = (ALL_COLLECTIONS as string[]).includes(compositionId);
  const collections = useMemo<CollectionType[]>(
    () => (isCollection ? [compositionId as CollectionType] : NO_COLLECTIONS),
    [isCollection, compositionId],
  );
  const { ready, error } = useCollections(collections);

  if (!isCollection) return <NotFound />;
  if (!ready) return error ? <NotFound /> : <RouteFallback />;

  const composition = store.getComposition(compositionId, parseInt(compositionIndex, 10));
  const section = store.getSection(compositionId, parseInt(compositionIndex, 10), parseInt(sectionId, 10));
  if (composition && section) return <Navigate to={sectionUrl(composition, section)} replace />;
  return <NotFound />;
};

// Legacy /kirchner-v-trump/* → Johnson equivalents (preserving the sub-path).
const TrumpDocRedirect = () => {
  const { docId = "" } = useParams<{ docId: string }>();
  return <Navigate to={`/kirchner-v-johnson/${docId}`} replace />;
};
const TrumpSectionRedirect = () => {
  const { sectionId = "" } = useParams<{ sectionId: string }>();
  return <Navigate to={`/kirchner-v-johnson/section/${sectionId}`} replace />;
};

// 404 page — noindex'd so the SPA's soft-404 (HTTP 200 + shell) doesn't get
// indexed as a duplicate of the site shell. Real 404 status arrives with the
// framework migration.
const NotFound = () => {
  useNoIndex();
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="bg-card rounded-2xl p-8 border border-border shadow-sm text-center">
        <h1 className="text-2xl font-serif text-foreground mb-4">Page Not Found</h1>
        <p className="text-muted-foreground mb-6">The page you're looking for doesn't exist.</p>
        <div className="space-x-4">
          <a href="/" className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors shadow-sm">
            Go Home
          </a>
          <a href="/kirchner-v-johnson" className="px-4 py-2 bg-card text-foreground border border-border rounded-md hover:bg-secondary transition-colors shadow-sm">
            Kirchner v. Johnson Case
          </a>
        </div>
        {import.meta.env.DEV && (
          <div className="mt-4 text-left text-sm text-muted-foreground">
            <p>Attempted path: {window.location.pathname}</p>
            <p>Available collections: manuscript, data, constitutional, timeline, map</p>
          </div>
        )}
      </div>
    </div>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem storageKey="loe-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true
              }}
            >
                <Suspense fallback={<RouteFallback />}>
                <Routes>
                  {/* Home page */}
                  <Route path="/" element={<Index />} />

                  {/* Kirchner v. Ellison (Minnesota). Bare URL = case landing page;
                      /:docId renders the reader directly; legacy /section/:n redirects. */}
                  <Route path="/kirchner-v-ellison" element={<CaseLandingPage caseKey="ellison" />} />
                  <Route
                    path="/kirchner-v-ellison/section/:sectionId"
                    element={<CaseSectionRedirect caseSlug="kirchner-v-ellison" />}
                  />
                  <Route
                    path="/kirchner-v-ellison/:docId"
                    element={<CaseDocReader caseSlug="kirchner-v-ellison" />}
                  />

                  {/* Kirchner v. Johnson (D.D.C.). */}
                  <Route path="/kirchner-v-johnson" element={<CaseLandingPage caseKey="johnson" />} />
                  <Route
                    path="/kirchner-v-johnson/section/:sectionId"
                    element={<CaseSectionRedirect caseSlug="kirchner-v-johnson" />}
                  />
                  <Route
                    path="/kirchner-v-johnson/:docId"
                    element={<CaseDocReader caseSlug="kirchner-v-johnson" />}
                  />

                  {/* Legacy redirects from the old /kirchner-v-trump URLs */}
                  <Route path="/kirchner-v-trump" element={<Navigate to="/kirchner-v-johnson" replace />} />
                  <Route path="/kirchner-v-trump/section/:sectionId" element={<TrumpSectionRedirect />} />
                  <Route path="/kirchner-v-trump/:docId" element={<TrumpDocRedirect />} />

                  {/* Kirchner v. Acosta (Florida). */}
                  <Route path="/kirchner-v-acosta" element={<CaseLandingPage caseKey="acosta" />} />
                  <Route
                    path="/kirchner-v-acosta/section/:sectionId"
                    element={<CaseSectionRedirect caseSlug="kirchner-v-acosta" />}
                  />
                  <Route
                    path="/kirchner-v-acosta/:docId"
                    element={<CaseDocReader caseSlug="kirchner-v-acosta" />}
                  />

                  {/* SCOTUS amicus (Trump v. Barbara). Bare URL reads part 1 directly. */}
                  <Route path="/scotus-amicus" element={<ScotusAmicusIndex />} />
                  <Route path="/scotus-amicus/:docId" element={<CaseDocReader caseSlug="scotus-amicus" />} />

                  {/* For Journalists */}
                  <Route path="/for-journalists" element={<ForJournalists />} />

                  {/* Primary-source research archives — unlisted review pages
                      (configs in src/data/researchArchives.ts; data via `npm run sync-archives`) */}
                  <Route path="/research/:archiveId" element={<ResearchArchive />} />
                  <Route path="/research/:archiveId/leaf/:leafId" element={<ResearchLeaf />} />
                  <Route path="/research/:archiveId/doc/:docFile" element={<ResearchDoc />} />

                  {/* Friendly URL for Copyright Notifications */}
                  <Route path="/copyright" element={<Navigate to="/composition/copyright" replace />} />

                  {/* Collection grid — one parameterized route handles ALL collection types */}
                  <Route path="/composition/:compositionId" element={<CompositionsPage />} />

                  {/* Canonical descriptive reader URL for non-case collections:
                      /composition/<collection>/<composition-slug>/<section-slug> */}
                  <Route
                    path="/composition/:compositionId/:compositionSlug/:sectionSlug"
                    element={<SectionPage />}
                  />

                  {/* Legacy positional reader URL → redirect to the canonical form */}
                  <Route
                    path="/composition/:compositionId/composition/:compositionIndex/section/:sectionId"
                    element={<LegacyPositionalRedirect />}
                  />

                  {/* Feature pages */}
                  <Route path="/worldmap" element={<WorldMap />} />
                  <Route path="/timeline" element={<Timeline />} />
                  <Route path="/individuals-metrics" element={<IndividualsMetrics />} />
                  <Route path="/videos" element={<VideosPage />} />
                  <Route path="/scotus-shadow-docket" element={<SCOTUSShadowDocket />} />
                  <Route path="/constitutional-accountability" element={<ConstitutionalAccountability />} />

                  {/* Contact and support pages */}
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/partners" element={<Partners />} />
                  <Route path="/donate" element={<Donate />} />

                  {/* Legal pages */}
                  <Route path="/legal-disclaimers" element={<LegalDisclaimers />} />
                  <Route path="/terms-of-service" element={<TermsOfService />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />

                  {/* Simulation admin (worldmap realm — retirement pending owner decision D4) */}
                  <Route path="/simulation-admin" element={<SimulationAdmin />} />

                  {/* Catch-all route for 404s */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                </Suspense>
              </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
