'use client';
// app/review/CaseReviewMount.tsx — the HOST of the Studio's Case Review window on the site.
//
// The window is the Studio's own module, vendored byte for byte under public/casereview/vendor/ and run as a native
// ES module (never bundled: a rule change lands in the Studio and syncs out; scripts/sync-casereview.mjs). This
// component does what the Studio's shell does before the mount and nothing the window does itself: it marks the
// surface (the window writes its ?casereview= deep link only while document.body carries data-mode="casereview",
// the Studio's rule), gives the page a default document when the URL names none (the newest filing with a link
// table — the one skin decision the Studio leaves to its host), and calls mountCaseReview() on #casereviewRoot. The
// window then reads the Studio's three API routes, which the site serves static behind rewrites (see
// scripts/import-casereview.mjs). The deep link is the Studio's exact form: ?casereview=doc=<id>&cite=<page>/<n>&q=…
// A second case (2026-10-10; P97v, Studio 5d048462): the host passes `root` — the case SLUG from the host table, never
// a path — as mountCaseReview({ root }); the window's projRootQS() prefers it over the page URL's ?projroot= and sends
// ?root=<slug> on all three fetches, which the site's keyed rewrites answer. The URL stays the Studio's bare
// ?casereview= form. The default case passes null: bare rules.
import { useEffect } from 'react';

const WINDOW_URL = '/casereview/vendor/casereview.js';

type CaseReviewModule = { mountCaseReview: (opts?: { root?: string | null } | null) => void };

export function CaseReviewMount({ defaultDoc, root = null }: { defaultDoc: string | null; root?: string | null }) {
  useEffect(() => {
    let cancelled = false;
    document.body.dataset.mode = 'casereview';
    // a URL without a state opens the default document through the window's own deep-link restore — no second path
    if (defaultDoc) {
      const u = new URL(location.href);
      if (!u.searchParams.has('casereview')) {
        u.searchParams.set('casereview', `doc=${defaultDoc}`);
        try { history.replaceState(null, '', u.toString()); } catch { /* the window then opens nothing, as the Studio does */ }
      }
    }
    const url = `${location.origin}${WINDOW_URL}`;
    import(/* webpackIgnore: true */ /* turbopackIgnore: true */ url)
      .then((mod: CaseReviewModule) => { if (!cancelled) mod.mountCaseReview(root ? { root } : null); })
      .catch((e: unknown) => {
        const root = document.getElementById('casereviewRoot');
        if (root) root.textContent = `The review window could not load — ${e instanceof Error ? e.message : String(e)}`;
      });
    return () => { cancelled = true; delete document.body.dataset.mode; };
  }, [defaultDoc, root]);
  return <div id="casereviewRoot" aria-label="Case review" />;
}
