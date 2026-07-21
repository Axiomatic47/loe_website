// app/error.tsx — Next port of the vite ErrorBoundary (src/App.tsx).
'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="bg-card rounded-2xl p-8 border border-border shadow-sm max-w-md text-center">
        <h1 className="text-2xl font-serif text-foreground mb-4">Something went wrong</h1>
        <p className="text-muted-foreground mb-6">
          An error occurred while loading the page. Please refresh to try again.
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors shadow-sm"
        >
          Refresh Page
        </button>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left">
            <summary className="text-muted-foreground cursor-pointer">Error Details (Dev)</summary>
            <pre className="mt-2 text-xs text-muted-foreground/80 overflow-auto">
              {error?.toString()}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
