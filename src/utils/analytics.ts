// src/utils/analytics.ts - Enhanced Plausible Analytics for Laws of Existence

// Enhanced Plausible Analytics integration with all features enabled
declare global {
  interface Window {
    plausible?: (event: string, options?: {
      props?: Record<string, any>;
      callback?: () => void;
    }) => void;
  }
}

export const trackEvent = (eventName: string, props?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible(eventName, { props });
    console.log('Analytics event:', eventName, props);
  }
};

// Enhanced tracking functions with Plausible's automatic features
export const trackPageView = (pageName: string, props?: Record<string, any>) => {
  // Plausible automatically tracks page views, but we can add custom properties
  if (props) {
    window.plausible?.('pageview', { props: { page: pageName, ...props } });
  }
};

// File downloads are automatically tracked by Plausible, but we can add custom props
export const trackDownload = (resourceType: string, resourceName: string) => {
  trackEvent('Download', {
    type: resourceType,
    resource: resourceName,
    category: 'Framework Resource'
  });
};

// Enhanced donation tracking
export const trackDonationFlow = {
  started: (amount: string) => {
    trackEvent('Donation Started', {
      amount,
      currency: 'USD',
      category: 'Conversion'
    });
  },

  methodSelected: (method: string, amount: string) => {
    trackEvent('Payment Method Selected', {
      method,
      amount,
      category: 'Conversion'
    });
  },

  completed: (amount: string, method: string, transactionId?: string) => {
    trackEvent('Donation Completed', {
      amount,
      method,
      transaction_id: transactionId,
      category: 'Conversion',
      revenue: parseFloat(amount) // For revenue tracking
    });
  },

  failed: (amount: string, method: string, error: string) => {
    trackEvent('Donation Failed', {
      amount,
      method,
      error: error.substring(0, 100),
      category: 'Error'
    });
  }
};

// Framework engagement tracking
export const trackFrameworkEngagement = (section: string, action: string, timeSpent?: number) => {
  trackEvent('Framework Engagement', {
    section,
    action,
    time_spent: timeSpent,
    category: 'Content'
  });
};

// Consciousness recognition tracking
export const trackConsciousnessEvent = (eventType: string, details?: Record<string, any>) => {
  trackEvent('Consciousness Recognition', {
    type: eventType,
    category: 'Consciousness',
    ...details
  });
};

// Contact and outreach tracking
export const trackContact = (contactType: string, success?: boolean) => {
  trackEvent('Contact', {
    type: contactType,
    success,
    category: 'Engagement'
  });
};

// Research access tracking
export const trackResearchAccess = (researchType: string, documentName?: string) => {
  trackEvent('Research Access', {
    type: researchType,
    document: documentName,
    category: 'Research'
  });
};

// Geography and consciousness spread tracking
export const trackGeographicInterest = (action: string, region?: string) => {
  trackEvent('Geographic Interest', {
    action,
    region,
    category: 'Global Reach'
  });
};

// Error and performance tracking
export const trackError = (errorType: string, component: string, message?: string) => {
  trackEvent('Application Error', {
    type: errorType,
    component,
    message: message?.substring(0, 100),
    category: 'Technical'
  });
};

export const trackPerformance = (metric: string, value: number, threshold?: number) => {
  if (!threshold || value > threshold) {
    trackEvent('Performance', {
      metric,
      value: Math.round(value),
      category: 'Technical'
    });
  }
};

// Utility functions
export const isAnalyticsLoaded = (): boolean => {
  return typeof window !== 'undefined' && !!window.plausible;
};

// Initialize performance tracking
export const initPerformanceTracking = () => {
  if (typeof window === 'undefined') return;

  // Track page load time
  window.addEventListener('load', () => {
    const loadTime = performance.now();
    trackPerformance('page_load_time', loadTime, 3000); // Only track if > 3 seconds
  });

  // Track first contentful paint
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          trackPerformance('first_contentful_paint', entry.startTime, 2000);
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['paint'] });
    } catch {
      // PerformanceObserver not supported
    }
  }
};

// Auto-initialize performance tracking
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initPerformanceTracking);
}