// src/App.tsx - Enhanced with proper Constitutional support and Identity token handling
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from 'react';
import Index from "./pages/Index";
import CompositionsPage from "./pages/CompositionsPage";
import SectionPage from "./pages/SectionPage";
import Contact from "./pages/Contact";
import Partners from "./pages/Partners";
import Donate from "./pages/Donate";
import WorldMap from "./pages/WorldMap";
import IndividualsMetrics from "./pages/IndividualsMetrics";
import Timeline from "./pages/Timeline";
import SimulationAdmin from "./pages/SimulationAdmin";
import VideosPage from "./pages/VideosPage";
import SCOTUSShadowDocket from "./pages/SCOTUSShadowDocket";
import ConstitutionalAccountability from "./pages/ConstitutionalAccountability";
import AdminLink from "./components/AdminLink";

// Legal page imports
import LegalDisclaimers from "./pages/LegalDisclaimers";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";

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
        <div className="min-h-screen bg-black flex items-center justify-center p-8">
          <div className="bg-black/80 backdrop-blur-md rounded-lg p-8 border border-white/10 max-w-md text-center">
            <h1 className="text-2xl font-serif text-white mb-4">Something went wrong</h1>
            <p className="text-gray-300 mb-6">
              An error occurred while loading the page. Please refresh to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
            {import.meta.env.DEV && (
              <details className="mt-4 text-left">
                <summary className="text-gray-400 cursor-pointer">Error Details (Dev)</summary>
                <pre className="mt-2 text-xs text-gray-500 overflow-auto">
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
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white">Redirecting to admin panel...</div>
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="bg-black/80 backdrop-blur-md rounded-lg p-8 border border-blue-500/30 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-serif text-white mb-2">Processing Authentication</h2>
          <p className="text-gray-300">Please wait while we set up your account...</p>
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
//   /kirchner-v-johnson/52..57        → main filing (errata, notices, motions)
//   /kirchner-v-johnson/52-N..57-N    → attachment N to that filing
//   /kirchner-v-johnson/N             → plain section number (1..107)
// Legacy doc 13 (Second Amended Complaint) routes still resolve into the new section ordering.
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
    const docMatch = docId.match(/^(doc)?(\d+)(?:-(\d+))?$/);
    if (docMatch) {
      const hasDocPrefix = !!docMatch[1];
      const docNum = parseInt(docMatch[2], 10);
      const hasAttachment = !!docMatch[3];
      const attNum = hasAttachment ? parseInt(docMatch[3], 10) : 0;
      const base = JOHNSON_DOC_SECTION_BASE[docNum];

      if (base !== undefined) {
        sectionNum = base + attNum;
      } else if (docNum === 13 && (hasDocPrefix || hasAttachment)) {
        // Legacy doc 13 (Second Amended Complaint) — re-mapped onto operative pleading.
        // Plain "13" (no prefix, no attachment) is treated as plain section 13 below.
        sectionNum = 1 + attNum;
      } else if (!hasAttachment) {
        sectionNum = docNum;
      }
    }
  }

  return <Navigate to={`/composition/constitutional/composition/3/section/${sectionNum}`} replace />;
};

// Wrapper component for Kirchner v. Ellison document routing
// Supports: /kirchner-v-ellison/1, /kirchner-v-ellison/22, /kirchner-v-ellison/doc01-5, etc.
const KirchnerEllisonDocRedirect = () => {
  const { docId } = useParams<{ docId: string }>();

  let sectionNum = 1;
  if (docId) {
    // Check if it's a plain number (e.g., "1", "22")
    const plainNumberMatch = docId.match(/^(\d+)$/);
    if (plainNumberMatch) {
      sectionNum = parseInt(plainNumberMatch[1], 10);
    }
    // Legacy doc01 format and attachments
    else {
      const doc01Match = docId.match(/(?:doc)?0?1-(\d+)/);
      const doc01Main = docId.match(/^(?:doc)?0?1$/);

      if (doc01Main) {
        sectionNum = 1;
      } else if (doc01Match) {
        sectionNum = parseInt(doc01Match[1], 10) + 1;
      } else {
        // Handle doc02 through doc08
        const docMatch = docId.match(/(?:doc)?0?(\d+)$/);
        if (docMatch) {
          const docNum = parseInt(docMatch[1], 10);
          if (docNum >= 2 && docNum <= 8) {
            sectionNum = 15 + (docNum - 2) + 1;
          }
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

// Wrapper component for Kirchner v. Acosta document routing
// Supports: /kirchner-v-acosta/1, /kirchner-v-acosta/13, etc.
const KirchnerAcostaDocRedirect = () => {
  const { docId } = useParams<{ docId: string }>();

  let sectionNum = 1;
  if (docId) {
    // Check if it's a plain number (e.g., "1", "13")
    const plainNumberMatch = docId.match(/^(\d+)$/);
    if (plainNumberMatch) {
      sectionNum = parseInt(plainNumberMatch[1], 10);
    }
  }

  return <Navigate to={`/composition/constitutional/composition/1/section/${sectionNum}`} replace />;
};

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
                    <div className="min-h-screen bg-black flex items-center justify-center p-8">
                      <div className="bg-black/80 backdrop-blur-md rounded-lg p-8 border border-white/10 text-center">
                        <h1 className="text-2xl font-serif text-white mb-4">Page Not Found</h1>
                        <p className="text-gray-300 mb-6">The page you're looking for doesn't exist.</p>
                        <div className="space-x-4">
                          <a href="/" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                            Go Home
                          </a>
                          <a href="/kirchner-v-johnson" className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors">
                            Kirchner v. Johnson Case
                          </a>
                        </div>
                        {import.meta.env.DEV && (
                          <div className="mt-4 text-left text-sm text-gray-400">
                            <p>Attempted path: {window.location.pathname}</p>
                            <p>Available collections: manuscript, data, constitutional, timeline, map</p>
                          </div>
                        )}
                      </div>
                    </div>
                  } />
                </Routes>

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