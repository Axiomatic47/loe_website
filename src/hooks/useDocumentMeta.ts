// src/hooks/useDocumentMeta.ts
// Lightweight per-page document metadata (title + description/OG) with no dependency.
//
// This updates <head> on the client, which covers browser tabs, bookmarks, history,
// and JS-rendering crawlers (e.g. Googlebot). Social-card scrapers that do NOT run JS
// (Twitter/Facebook/Slack/LinkedIn) still read the static tags baked into index.html —
// giving those per-URL cards would require SSR or prerendering (future work).
import { useEffect } from 'react';

const SITE = 'The Laws of Existence';
const DEFAULT_DESCRIPTION =
  'A unified mathematical framework for consciousness, ethics, and reality by Joseph Kirchner';

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Sets document.title plus the description and OG title/description meta tags.
 * Pass `undefined` while data is still loading — the site default is used until a
 * real title is available. No cleanup on unmount: each page sets its own title on
 * mount, which avoids a flash back to the default during client-side navigation.
 */
export function useDocumentMeta(title?: string, description?: string) {
  useEffect(() => {
    const fullTitle = title ? `${title} — ${SITE}` : SITE;
    const desc = description || DEFAULT_DESCRIPTION;

    document.title = fullTitle;
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('name', 'description', desc);
    upsertMeta('property', 'og:description', desc);
  }, [title, description]);
}
