// src/hooks/useCanonical.ts — set <link rel="canonical"> for the current page.
//
// Same lifecycle discipline as useNoIndex: reader/landing pages declare the
// canonical URL for their resolved content while mounted, and it is cleaned up
// (or restored) on unmount so client-side navigation never leaves a stale
// canonical pointing at the previous document.
import { useEffect } from 'react';
import { absoluteUrl } from '@/utils/urls';

export function useCanonical(path?: string) {
  useEffect(() => {
    if (!path) return;
    const href = absoluteUrl(path);

    let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const created = !el;
    const previousHref = el?.getAttribute('href') ?? null;

    if (!el) {
      el = document.createElement('link');
      el.setAttribute('rel', 'canonical');
      document.head.appendChild(el);
    }
    el.setAttribute('href', href);

    return () => {
      if (!el) return;
      if (created) {
        el.parentNode?.removeChild(el);
      } else if (previousHref !== null) {
        el.setAttribute('href', previousHref);
      }
    };
  }, [path]);
}
