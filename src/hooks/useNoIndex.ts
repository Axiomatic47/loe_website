// src/hooks/useNoIndex.ts — mark a page as unlisted (robots noindex) while mounted.
// Used by draft/review pages that are live by URL but not linked or indexed.
// Cleans up on unmount so client-side navigation never leaks noindex onto
// public pages.
import { useEffect } from 'react';

export function useNoIndex() {
  useEffect(() => {
    const el = document.createElement('meta');
    el.setAttribute('name', 'robots');
    el.setAttribute('content', 'noindex, nofollow');
    document.head.appendChild(el);
    return () => {
      document.head.removeChild(el);
    };
  }, []);
}
