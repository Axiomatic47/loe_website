// src/App.tsx - Enhanced with proper Constitutional support and Identity token handling
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { useEffect, useState, lazy, Suspense } from 'react';
import AdminLink from "./components/AdminLink";

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
const LegalDisclaimers = lazy(() => import("./pages/LegalDisclaimers"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));

// Declare Netlify Identity types
declare global {
  interface Window {
    netlifyIdentity: any;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

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

const AdminPage = () => {
  useEffect(() => {
    window.location.href = '/admin/index.html';
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-foreground">Redirecting to admin panel...</div>
    </div>
  );
};

// Component to handle Identity callbacks
const IdentityHandler = ({ children }: { children: React.ReactNode }) => {
  const [identityReady, setIdentityReady] = useState(false);
  const [processingToken, setProcessingToken] = useState(false);

  useEffect(() => {
    const initIdentity = () => {
      if (window.netlifyIdentity) {
        if (import.meta.env.DEV) console.log('Initializing Netlify Identity...');
        window.netlifyIdentity.init();

        // Check for Identity tokens in URL hash
        const hash = window.location.hash;
        if (import.meta.env.DEV) console.log('Current hash:', hash);

        if (hash.includes('invite_token') ||
            hash.includes('confirmation_token') ||
            hash.includes('recovery_token') ||
            hash.includes('email_change_token')) {
          if (import.meta.env.DEV) console.log('Identity token detected, processing...');
          setProcessingToken(true);

          // Let the Identity widget handle the token
          // It will automatically show the appropriate form
        }

        // Set up event listeners
        window.netlifyIdentity.on('init', (user: any) => {
          if (import.meta.env.DEV) console.log('Identity initialized, user:', user);
          setIdentityReady(true);
          setProcessingToken(false);
        });

        window.netlifyIdentity.on('login', (user: any) => {
          if (import.meta.env.DEV) console.log('User logged in:', user);
          // Only redirect to admin if we're on the admin page or explicitly requested
          // Otherwise stay on current page (e.g., /worldmap for simulation access)
          if (window.location.pathname.startsWith('/admin')) {
            window.location.reload();
          }
          // For other pages, just reload to update auth state
          else {
            window.location.reload();
          }
        });

        window.netlifyIdentity.on('logout', () => {
          if (import.meta.env.DEV) console.log('User logged out');
          // Redirect to home on logout
          if (window.location.pathname.startsWith('/admin')) {
            window.location.href = '/';
          }
        });

        window.netlifyIdentity.on('error', (error: any) => {
          if (import.meta.env.DEV) console.error('Identity error:', error);
          setProcessingToken(false);
        });

        window.netlifyIdentity.on('close', () => {
          if (import.meta.env.DEV) console.log('Identity modal closed');
          setProcessingToken(false);
        });

        setIdentityReady(true);
      } else {
        // Widget not loaded yet, try again in 100ms
        setTimeout(initIdentity, 100);
      }
    };

    initIdentity();
  }, []);

  // Show loading state while processing tokens
  if (processingToken) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-card rounded-2xl p-8 border border-border shadow-sm text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-serif text-foreground mb-2">Processing Authentication</h2>
          <p className="text-muted-foreground">Please wait while we set up your account...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Route validation component to help debug routing issues
const RouteDebugger = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('Route Debug Info:', {
        currentPath: window.location.pathname,
        isConstitutional: window.location.pathname.includes('/constitutional'),
        isManuscript: window.location.pathname.includes('/manuscript'),
        isData: window.location.pathname.includes('/data'),
        isTimeline: window.location.pathname.includes('/timeline'),
        isMap: window.location.pathname.includes('/map'),
        supportedCollections: ['manuscript', 'data', 'constitutional', 'timeline', 'map']
      });
    }
  }, []);

  return <>{children}</>;
};

// Wrapper component for Kirchner v. Johnson (DCC) section routing
const KirchnerJohnsonSectionRedirect = () => {
  const { sectionId } = useParams<{ sectionId: string }>();
  return <Navigate to={`/composition/constitutional/composition/3/section/${sectionId || '1'}`} replace />;
};

// Wrapper component for Kirchner v. Ellison (Minnesota) section routing
const KirchnerEllisonSectionRedirect = () => {
  const { sectionId } = useParams<{ sectionId: string }>();
  return <Navigate to={`/composition/constitutional/composition/2/section/${sectionId || '1'}`} replace />;
};

// Wrapper component for Kirchner v. Johnson document routing
// Operative pleading is the Third Amended Complaint (Doc 51).
// Supports:
//   /kirchner-v-johnson/51            → main complaint (section 1)
//   /kirchner-v-johnson/51-N          → attachment N (section 1+N)
//   /kirchner-v-johnson/doc51         → main complaint (section 1)
//   /kirchner-v-johnson/doc51-N       → attachment N (section 1+N)
//   /kirchner-v-johnson/52..68        → main filing (errata, notices, motions, appearances)
//   /kirchner-v-johnson/52-N..68-N    → attachment N to that filing
//   /kirchner-v-johnson/1,2,5,6,8     → superseded pleadings (Original / First Amended era)
//   /kirchner-v-johnson/13, /13-N     → Second Amended Complaint and its attachments
//   /kirchner-v-johnson/N             → doc numbers not in the map fall back to plain section N
const JOHNSON_DOC_SECTION_BASE: Record<number, number> = {
  // Third Amended Complaint era (operative pleading) — TAC tab
  51: 1,    // Third Amended Complaint (operative pleading, 76 attachments)
  // Subsequent Filings era — "Subsequent Filings" tab
  52: 78,   // Errata to Third Amended Complaint
  53: 84,   // Notice of Conventionally-Maintained Exhibits
  54: 86,   // Notice of Related Case
  55: 87,   // Emergency Motion for Discovery & Preservation
  56: 103,  // Errata Notice for Discovery Correlation Matrix
  57: 105,  // Emergency Motion for TRO vs. Anthropic & Comcast
  59: 108,  // Federal Defendants' Motion for Extension of Time
  60: 109,  // Notice of Appearance — AUSA Derbisz
  61: 110,  // Appearance of Counsel — OpenAI Percarpio
  62: 111,  // Plaintiff's Motion for USMS Service / Individual-Capacity Finding
  63: 405,  // Appearance of Counsel — Coleman (METR)
  64: 406,  // METR's Motion to Admit Ahuja Pro Hac Vice (attachments 64-1..64-3 → 407..409)
  65: 410,  // Appearance of Counsel — Ahuja (METR)
  66: 411,  // LCvR 26.1 Corporate Disclosure — METR
  67: 412,  // Federal Defendants' Notice of Non-Service
  68: 413,  // Plaintiff's Reply re Service / Response to Non-Service (attachments 68-1..68-10 → 414..423)
  // Original Complaint era — "Original Complaint" tab
  1: 112,   // Original Complaint (dismissed for standing)
  2: 114,   // Motion for TRO and Preliminary Injunction (denied as moot)
  // First Amended Complaint era — "First Amended Complaint" tab
  5: 149,   // First Amended Complaint
  6: 237,   // Emergency Motion for TRO (withdrawn)
  8: 259,   // Motion for Leave to File Under Seal
  // Second Amended Complaint era — "Second Amended Complaint" tab
  13: 260,  // Second Amended Complaint (86 attachments)
  16: 347,  // Notice of Exhibit Limitations
  17: 349,  // Notice of Intent to Contact Copyright Holders
  18: 351,  // Notice of Related Case (Ellison)
  19: 352,  // Certificate of Service — Copyright Holders
  20: 355,  // Notice of Caption Correction
  21: 356,  // Request for Summonses (10 summonses)
  22: 367,  // Summonses Issued
  23: 368,  // Appearance — Anthropic (Onorato)
  24: 369,  // Appearance — Anthropic (Tighe)
  25: 370,  // Anthropic Corp Disclosure
  26: 371,  // Anthropic Consent Motion for Extension
  27: 373,  // Summons Returned — Anthropic
  28: 374,  // Summons Returned — Apple
  29: 375,  // Summons Returned — Carr
  30: 376,  // Summons Returned — Comcast
  31: 377,  // Summons Returned — METR
  32: 378,  // Summons Returned — Johnson
  33: 379,  // Summons Returned — OpenAI
  34: 380,  // Summons Returned — Bondi/US AG
  35: 381,  // Summons Returned — US House
  36: 382,  // Summons Returned — US Attorney
  37: 383,  // Summons Unexecuted — Trump
  38: 384,  // Notice of Service Effectuation
  39: 387,  // Motion for Alternative Service — Trump
  40: 390,  // Appearance — OpenAI (Margo)
  41: 391,  // OpenAI Corp Disclosure
  42: 392,  // Stipulation — OpenAI Leave to Amend
  43: 393,  // Appearance — Apple
  44: 394,  // Apple Corp Disclosure
  45: 395,  // Apple Notice of Intent to File MTD
  46: 396,  // Doc 46
  47: 397,  // Doc 47
  49: 399,  // Plaintiff's Response to Apple Notice of MTD
  50: 401,  // Notice of Supplement to Service Effectuation
};

const KirchnerJohnsonDocRedirect = () => {
  const { docId } = useParams<{ docId: string }>();

  let sectionNum = 1;
  if (docId) {
    const docMatch = docId.match(/^(?:doc)?(\d+)(?:-(\d+))?$/);
    if (docMatch) {
      const docNum = parseInt(docMatch[1], 10);
      const attNum = docMatch[2] ? parseInt(docMatch[2], 10) : 0;
      const base = JOHNSON_DOC_SECTION_BASE[docNum];

      if (base !== undefined) {
        sectionNum = base + attNum;
      } else if (!docMatch[2]) {
        // Unknown doc number with no attachment → preserve as plain section number
        sectionNum = docNum;
      }
    }
  }

  return <Navigate to={`/composition/constitutional/composition/3/section/${sectionNum}`} replace />;
};

// Wrapper component for Kirchner v. Ellison document routing.
// Three docket sources are addressable under /kirchner-v-ellison/:
//   1. Main case (cv-00726) — operative pleading is Doc 1 (Petition, 14 attachments).
//      /kirchner-v-ellison/1          → Doc 1 main (section 1)
//      /kirchner-v-ellison/1-6        → Doc 1 attachment 6 (section 7)
//      /kirchner-v-ellison/19         → Doc 19 (Motion to Dismiss, section 35)
//      Legacy /doc01, /doc01-5, /doc02..doc08 still resolve via the same map.
//   2. Consolidated sub-case (cv-02594).
//      /kirchner-v-ellison/2594-1     → cv-02594 Doc 1 (section 23)
//      /kirchner-v-ellison/2594-1-2   → cv-02594 Doc 1 attachment 2 (section 25)
//      /kirchner-v-ellison/2594-summons → cv-02594 Summons Issued (section 32)
//   3. Eighth Circuit appeal (No. 26-1615) — addressed by filename slug.
//      /kirchner-v-ellison/8cir-brief, /8cir-addendum, /8cir-documents,
//      /8cir-notice-refiled, /8cir-certificate
const ELLISON_MAIN_DOC_BASE: Record<number, number> = {
  1: 1,    // Petition (14 attachments → sections 2..15)
  2: 16,   // Memo I: SCOTUS Ultra Vires Practice
  3: 17,   // Memo L: Birthright Citizenship
  4: 18,   // Memo N: Constitutional Failures of Harlow v. Fitzgerald
  5: 19,   // Summons Issued
  6: 20,   // Emergency Motion for TRO and Declaratory Relief
  7: 21,   // Notice of Hearing
  8: 22,   // Declaration of Joseph D. Kirchner
  19: 35,  // Defendant's Motion to Dismiss
  20: 36,  // Notice of Hearing on Motion to Dismiss
  21: 37,  // Defendant's Memorandum in Support of MTD
  22: 38,  // Meet and Confer Statement
  23: 39,  // Proposed Order on Motion to Dismiss
  26: 40,  // Amended Complaint
  28: 41,  // Notice of ECF Filing Anomaly
  29: 42,  // Order Dismissing Case
  30: 43,  // Judgment
  31: 44,  // Notice of Appeal to Eighth Circuit
  32: 45,  // Receipt for Appeal Filing Fee
  33: 46,  // Notice of Appearance — Kirchner Pro Se
  34: 47,  // Transmittal of Appeal Letter to Eighth Circuit
  35: 48,  // USCA Case Number Assignment — No. 26-1615
  36: 49,  // Eighth Circuit Clerk Order — Electronic Record
  37: 50,  // Appearance of Counsel — McGuire for Appellee Ellison
};

const ELLISON_SUB_DOC_BASE: Record<number, number> = {
  1: 23,   // cv-02594 Doc 1 (4 attachments → sections 24..27)
  2: 28,   // cv-02594 Doc 2
  3: 29,   // cv-02594 Doc 3 (2 attachments → sections 30..31)
  6: 51,   // cv-02594 Doc 6 — Order of Recusal
};

const ELLISON_SPECIALS: Record<string, number> = {
  '2594-summons':         32,
  '8cir-brief':           33,
  '8cir-addendum':        34,
  '8cir-documents':       52,
  '8cir-notice-refiled':  53,
  '8cir-certificate':     54,
};

const KirchnerEllisonDocRedirect = () => {
  const { docId } = useParams<{ docId: string }>();

  let sectionNum = 1;
  if (docId) {
    const slug = docId.toLowerCase();

    // 1. Named slugs (8th Cir appeal, cv-02594 summons)
    if (ELLISON_SPECIALS[slug] !== undefined) {
      sectionNum = ELLISON_SPECIALS[slug];
    }
    // 2. cv-02594 sub-case: 2594-N or 2594-N-A
    else if (slug.startsWith('2594-')) {
      const subMatch = slug.match(/^2594-(\d+)(?:-(\d+))?$/);
      if (subMatch) {
        const docNum = parseInt(subMatch[1], 10);
        const attNum = subMatch[2] ? parseInt(subMatch[2], 10) : 0;
        const base = ELLISON_SUB_DOC_BASE[docNum];
        if (base !== undefined) {
          sectionNum = base + attNum;
        }
      }
    }
    // 3. Main case docs: N, N-A, doc01, doc01-A, doc1, etc.
    else {
      const docMatch = slug.match(/^(?:doc)?0*(\d+)(?:-(\d+))?$/);
      if (docMatch) {
        const docNum = parseInt(docMatch[1], 10);
        const attNum = docMatch[2] ? parseInt(docMatch[2], 10) : 0;
        const base = ELLISON_MAIN_DOC_BASE[docNum];
        if (base !== undefined) {
          sectionNum = base + attNum;
        } else if (!docMatch[2]) {
          // Unknown doc number with no attachment → preserve as plain section number
          // (mirrors Johnson's fallback for non-doc deep links)
          sectionNum = docNum;
        }
      }
    }
  }

  return <Navigate to={`/composition/constitutional/composition/2/section/${sectionNum}`} replace />;
};

// Wrapper component for Kirchner v. Acosta (Florida) section routing
const KirchnerAcostaSectionRedirect = () => {
  const { sectionId } = useParams<{ sectionId: string }>();
  return <Navigate to={`/composition/constitutional/composition/1/section/${sectionId || '1'}`} replace />;
};

// Wrapper component for Kirchner v. Acosta document routing.
// The Acosta filing is a single Petition bundle with 13 sequential parts
// (Petition, Appendix A, Memos A-C, Civil Cover Sheet, Summonses, Definitions,
//  Exhibits A-C, Notice of Related Actions). Each part is addressable by its
//  sequence number.
//   /kirchner-v-acosta/1         → Petition (section 1)
//   /kirchner-v-acosta/13        → Notice of Related Actions (section 13)
//   /kirchner-v-acosta/doc1      → same as /1
//   /kirchner-v-acosta/01        → same as /1 (zero-padded accepted)
//   /kirchner-v-acosta/1-2       → section 1+2 = 3 (reserved for future attachments)
const KirchnerAcostaDocRedirect = () => {
  const { docId } = useParams<{ docId: string }>();

  let sectionNum = 1;
  if (docId) {
    const docMatch = docId.toLowerCase().match(/^(?:doc)?0*(\d+)(?:-(\d+))?$/);
    if (docMatch) {
      const docNum = parseInt(docMatch[1], 10);
      const attNum = docMatch[2] ? parseInt(docMatch[2], 10) : 0;
      sectionNum = docNum + attNum;
    }
  }

  return <Navigate to={`/composition/constitutional/composition/1/section/${sectionNum}`} replace />;
};

// On-brand fallback shown while a lazy-loaded route chunk downloads
const RouteFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading" />
  </div>
);

const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem storageKey="loe-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <IdentityHandler>
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

                  {/* Custom route for Kirchner v. Ellison (Minnesota) case - composition 2 */}
                  <Route
                    path="/kirchner-v-ellison"
                    element={<Navigate to="/composition/constitutional/composition/2/section/23" replace />}
                  />
                  <Route
                    path="/kirchner-v-ellison/section/:sectionId"
                    element={<KirchnerEllisonSectionRedirect />}
                  />
                  {/* Document-specific routes: /kirchner-v-ellison/doc01, /kirchner-v-ellison/doc02, etc. */}
                  <Route
                    path="/kirchner-v-ellison/:docId"
                    element={<KirchnerEllisonDocRedirect />}
                  />

                  {/* Custom route for Kirchner v. Johnson (DCC) case - composition 3 */}
                  <Route
                    path="/kirchner-v-johnson"
                    element={<Navigate to="/composition/constitutional/composition/3/section/1" replace />}
                  />
                  <Route
                    path="/kirchner-v-johnson/section/:sectionId"
                    element={<KirchnerJohnsonSectionRedirect />}
                  />
                  {/* Document-specific routes: /kirchner-v-johnson/51, /kirchner-v-johnson/51-1, etc. (legacy doc13 supported) */}
                  <Route
                    path="/kirchner-v-johnson/:docId"
                    element={<KirchnerJohnsonDocRedirect />}
                  />
                  {/* Legacy redirect from old URL */}
                  <Route
                    path="/kirchner-v-trump"
                    element={<Navigate to="/kirchner-v-johnson" replace />}
                  />
                  <Route
                    path="/kirchner-v-trump/section/:sectionId"
                    element={<KirchnerJohnsonSectionRedirect />}
                  />

                  {/* Custom route for Kirchner v. Acosta (Florida) case - composition 1 */}
                  <Route
                    path="/kirchner-v-acosta"
                    element={<Navigate to="/composition/constitutional/composition/1/section/1" replace />}
                  />
                  <Route
                    path="/kirchner-v-acosta/section/:sectionId"
                    element={<KirchnerAcostaSectionRedirect />}
                  />
                  {/* Document-specific routes: /kirchner-v-acosta/1, /kirchner-v-acosta/2, etc. */}
                  <Route
                    path="/kirchner-v-acosta/:docId"
                    element={<KirchnerAcostaDocRedirect />}
                  />

                  {/* Friendly URL for Copyright Notifications */}
                  <Route
                    path="/copyright"
                    element={<Navigate to="/composition/copyright" replace />}
                  />

                  {/* Collection pages - simple parameterized route handles ALL collection types */}
                  <Route path="/composition/:compositionId" element={<CompositionsPage />} />

                  {/* Section page with proper route parameters - handles ALL collection types */}
                  <Route
                    path="/composition/:compositionId/composition/:compositionIndex/section/:sectionId"
                    element={<SectionPage />}
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

                  {/* Admin pages */}
                  <Route path="/admin/*" element={<AdminPage />} />
                  <Route path="/simulation-admin" element={<SimulationAdmin />} />

                  {/* Catch-all route for 404s */}
                  <Route path="*" element={
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
                  } />
                </Routes>
                </Suspense>

                {/* Admin Link for development */}
                <AdminLink />
              </BrowserRouter>
            </IdentityHandler>
        </TooltipProvider>
      </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;