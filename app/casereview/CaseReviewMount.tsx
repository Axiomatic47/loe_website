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
// A second case (2026-10-10): the window keys its root from the page URL's ?projroot= (projRootQS, casereview.js
// l.74–77) and sends ?root=<it> on all three fetches; the host writes `root` (the case SLUG from the host table, never
// a path) into the URL before the mount, and the site's keyed rewrites answer. The default case writes nothing: bare
// rules. When the Studio gives mountCaseReview a root option, the host passes it there instead and the URL stays bare.
import { useEffect } from 'react';

const WINDOW_URL = '/casereview/vendor/casereview.js';

type CaseReviewModule = { mountCaseReview: () => void };

export function CaseReviewMount({ defaultDoc, root = null }: { defaultDoc: string | null; root?: string | null }) {
  useEffect(() => {
    let cancelled = false;
    document.body.dataset.mode = 'casereview';
    // a URL without a state opens the default document through the window's own deep-link restore — no second path;
    // a keyed case carries its root token the same way, before the window reads location.search
    const u = new URL(location.href);
    let changed = false;
    if (defaultDoc && !u.searchParams.has('casereview')) { u.searchParams.set('casereview', `doc=${defaultDoc}`); changed = true; }
    if (root && u.searchParams.get('projroot') !== root) { u.searchParams.set('projroot', root); changed = true; }
    if (changed) {
      try { history.replaceState(null, '', u.toString()); } catch { /* the window then opens nothing, as the Studio does */ }
    }
    const url = `${location.origin}${WINDOW_URL}`;
    import(/* webpackIgnore: true */ /* turbopackIgnore: true */ url)
      .then((mod: CaseReviewModule) => { if (!cancelled) mod.mountCaseReview(); })
      .catch((e: unknown) => {
        const root = document.getElementById('casereviewRoot');
        if (root) root.textContent = `The review window could not load — ${e instanceof Error ? e.message : String(e)}`;
      });
    return () => { cancelled = true; delete document.body.dataset.mode; };
  }, [defaultDoc, root]);
  return <div id="casereviewRoot" aria-label="Case review" />;
}
