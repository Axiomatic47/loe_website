// src/main.tsx - Enhanced with Constitutional support and proper initialization
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Initialize application with proper error handling and constitutional support
async function initializeApp() {
  try {
    console.log('🚀 Laws of Existence Framework - Initializing Application');

    // Development-only logging
    if (import.meta.env.DEV) {
      console.log('🔧 Development Mode - Enhanced Logging Enabled');
      console.log('📁 Supported Collections:', {
        manuscript: 'Research Content',
        data: 'Evidence Collections',
        constitutional: 'Constitutional Challenges',
        timeline: 'Timeline Events',
        map: 'World Map Data'
      });

      // Log current URL for debugging
      console.log('🌐 Current URL:', window.location.href);
      console.log('🛣️ Current Path:', window.location.pathname);

      // Check if we're accessing constitutional content
      if (window.location.pathname.includes('/constitutional')) {
        console.log('🏛️ Constitutional content detected - initializing constitutional support');
      }
    }

    // NOTE: no store preload here — routes load only the content collections
    // they render (src/hooks/useCollections.ts), so a deep-link visitor never
    // downloads the whole corpus at boot.

    // Get the root element with proper error handling
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error('Root element not found - check your HTML template');
    }

    // Create React root and render the app
    const root = createRoot(rootElement);

    // Render with error boundary
    root.render(<App />);

    console.log('✅ Application initialized successfully');

    // Add global error handler for unhandled promises
    window.addEventListener('unhandledrejection', (event) => {
      console.error('🚨 Unhandled promise rejection:', event.reason);

      // Don't prevent default behavior in production
      if (import.meta.env.DEV) {
        console.error('🔧 Development mode: showing full error details');
      }
    });

    // Add global error handler for JavaScript errors
    window.addEventListener('error', (event) => {
      console.error('🚨 Global JavaScript error:', event.error);
    });

    // Constitutional-specific initialization
    if (window.location.pathname.includes('/constitutional')) {
      console.log('🏛️ Constitutional page detected - performing constitutional-specific initialization');

      // Ensure constitutional directories exist in development
      if (import.meta.env.DEV) {
        console.log('📁 Constitutional content should be available at:');
        console.log('   - /composition/constitutional (collection view)');
        console.log('   - /kirchner-v-johnson/51 (case document reader)');
        console.log('   - Content files: content/constitutional/*.json');
        console.log('   - Media files: public/uploads/constitutional/*');
      }
    }

    // Performance monitoring in development
    if (import.meta.env.DEV) {
      // Monitor performance
      if ('performance' in window) {
        window.addEventListener('load', () => {
          setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0] as any;
            console.log('⚡ Performance metrics:', {
              domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
              loadComplete: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
              total: Math.round(perfData.loadEventEnd - perfData.fetchStart)
            });
          }, 0);
        });
      }
    }

  } catch (error) {
    console.error('❌ Failed to initialize application:', error);

    // Show error UI
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="
          min-height: 100vh;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: system-ui, -apple-system, sans-serif;
          color: white;
          padding: 2rem;
        ">
          <div style="
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 2rem;
            text-align: center;
            max-width: 400px;
          ">
            <h1 style="margin: 0 0 1rem 0; font-size: 1.5rem;">Application Error</h1>
            <p style="margin: 0 0 1.5rem 0; color: #ccc;">
              Failed to initialize the Laws of Existence Framework.
            </p>
            <button
              onclick="window.location.reload()"
              style="
                background: #3b82f6;
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 4px;
                cursor: pointer;
                font-size: 1rem;
              "
            >
              Refresh Page
            </button>
            ${import.meta.env.DEV ? `
              <details style="margin-top: 1rem; text-align: left;">
                <summary style="cursor: pointer; color: #999;">Error Details</summary>
                <pre style="
                  margin-top: 0.5rem;
                  padding: 0.5rem;
                  background: rgba(255, 255, 255, 0.1);
                  border-radius: 4px;
                  font-size: 0.75rem;
                  color: #ccc;
                  overflow: auto;
                ">${error}</pre>
              </details>
            ` : ''}
          </div>
        </div>
      `;
    }
  }
}

// Initialize the application
initializeApp();

// Export for potential use in tests or other modules
export { initializeApp };