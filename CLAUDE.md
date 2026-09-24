# REALM CHARTER — loe_website (public Laws of Existence site)

This is the PUBLIC website repo (Next.js migration in progress, Netlify).
Primary role: website-developer. Admin may act here on owner direction.

## BRANCH LAW (owner-set 2026-08-23 — mirrors midesk BRANCHING.md §11)

- **Agents never push `main`.** It is the restricted trunk AND the
  production deploy: Netlify builds the public site from it. Enforced
  twice — locally by midesk's `gate_push_main` hook (this repo is listed
  in `protected_apex_repos`; the block fires from any cwd, including
  `git -C` spellings) and server-side by the GitHub ruleset. Being
  blocked here is the system working, not an obstacle to route around.
- **Your branch is `device/<host>`** (this checkout lives on
  `device/macbook`). Commit and push it freely — pushing the device
  branch does not deploy production. Commit by pathspec; the checkout
  can be shared.
- **The owner integrates**: device branch → `main` with their own
  credentials (Studio signed-push card or their plain terminal). Your
  git job ends at "pushed device/<host>, ready."
- **R6 is global**: no force-push, no history rewrite, no trunk
  deletion — any branch, any repo.

## PUBLICATION GATE (hard rule, unchanged)

The site carries only PUBLIC, FILED material — ECF-filed documents from
docketed/machine-read copies, published testimony sets, released
content. NEVER pre-filing drafts, opposition work product, DDC_SEALED
anything, unfiled evidence, or strategy notes. A push to `main`
publishes; that is why `main` is the owner's alone.

## Lanes

website-developer does NOT edit case documents, evidence,
research_library, or the Kirchner Studio (frontend-developer's lane).
Coordination (registry, /btw, /deliver, board) rides the midesk
project registry as before.

## Books from the research library, and REVIEW MODE (owner 2026-09-15)

- **Production is the Next App Router** (`netlify.toml` → `npm run build:next`,
  `@netlify/plugin-nextjs`, since 2026-07-21). The Vite SPA still builds as a
  gate (`npm run build`) but does not deploy; `/books` exists only in `app/`.
  `studio-site.json` launches Next for the Studio's SITES preview.
- A reviewed book (`/books/<slug>`) is the book's PDF beside the pages it cites,
  ported from kirchner.ink: `scripts/import-books.mjs <slug>` (slug REQUIRED)
  reads the research library's **Pinned Citation Extracts** lane by header name
  (`_INDEX.tsv`, `_SOURCES.tsv`, `_BOOK.json`, fixity lists, `_WEB/overlay.json`
  — plain TSV, split on tabs only), refuses a book whose sha256 differs from the
  lane's `_BOOK.json`, copies the **public-domain rows only** (rights per PAGE,
  two gates: on-disk set == PD rows, extra 0 missing 0), linearizes the served
  multi-page copies (qpdf; `_SERVED.json` maps lane sha → served sha) and
  writes `content/books/<slug>.md`, `content/review/<slug>.json` and the
  browser's copy `public/review/<slug>.<hash>.json`. A citation whose page is
  held but not published is MARKED on the site, never dropped.
- **Import only on a drafter's "lane at <sha>" send** (0b43895f: immunity;
  60f85bca: Holy Seed, the Genesis reading and the Madisonian article — slug
  madisonian-test (= kirchner.ink's existing /work/madisonian-test), id madisonian-test, lane beside the article, no
  BOOK/ folder; pre-wired 2026-09-16, first import on its "lane at <sha> + render" send) and
  answer with "imported at <loe sha>"; they run
  `check_links.py <lane> /Users/everest/Git/loe_website` against this checkout.
  The book text and the lane are never edited here.
- **Lane contract, `url` column (2026-09-15/16):** an index row may carry `url` —
  a site-relative path (this site's own leaf page for a held membrane / folio: STAC
  `/research/stac-8-203-38/leaf/<n>`, HLS `/research/hls-ms149-floyd/leaf/<f>`) or an
  https URL (status EXTERNAL: a catalogue record the book cites, rights
  `external-link`, no extract, pin = the holder's preferred citation printed as written).
  ONE rule: any row with `url` yields a page chip with `url`; a served chip keeps its
  file; a held chip with `url` IS the link (site-relative in this tab, https in a new
  tab with rel noopener); the held card lists the same links. `external-link` is not in
  PUBLISHABLE, so nothing is served for it. check_links requires a chip's url to equal
  its row's.
- **Lane contract, `work` column + `_REGISTER.tsv` (2026-09-16, drafter 8a96daa3's register):**
  an index row may name the WORK it cites (`work` = a register id; only `is_work` Y rows
  are pointed at; split the register on tabs only). The importer copies `work` onto the
  page and the unit (first row's), refuses an id the register lacks, and writes a manifest
  `works` map (id → the card's fields: full_citation, full_work_url + kind, volume_url,
  preferred_citation, rights_statement, licence, holder …; never shelf_path / sha256 /
  notes). The card (`WorkRecord`) shows the full citation, "Full text:" with the kind in
  words (`WORK_URL_KIND`), "Cite as:", rights, and the holder when it differs from the
  source's — in the held card as a <details>, CLOSED by default; under the panes as a
  "the work cited ▾" toggle on the record line whose body renders as a SIBLING of the
  measured block. Owner rule 2026-09-16: "the pdf view panes shouldn't be affected by the
  data fields … MUST REMAIN the same size" — nothing that can grow lives inside the node
  measure() subtracts from the viewport. Lanes without a register import unchanged.
- Records: `src/data/books.ts` (presentation copy); code under `app/books/`;
  viewer `BookPdfViewer` (range-loading, shared worker, hit boxes, marked
  pages); pdf.js assets under `public/pdfjs/` are copied from `pdfjs-dist` — copy
  again on a version bump. State + numbers: midesk
  `.claude/agent_notes/website-developer/20260915_review_mode_on_lawsofexistence_both_books_55339aa7.md`.
- **Review-mode UI (owner 2026-09-15, all landed):** the Review-mode badge is a switch to
  READING MODE (book alone, no source pane; a citation click returns to review); the
  badge + layout toggle sit over the left pane and the cited-pages strip over the source
  pane on the panes' own column grid; zoom / Download / New tab live UNDER each viewer;
  each pane SEARCHES its own document (magnifier in the header bar → a search row under the
  title: text-layer hits boxed on the pages, Enter / Shift+Enter or the arrows walk them, an
  image-only scan says "no text layer in this document"). The text layer is read with
  `streamTextContent()` + a reader loop — pdf.js's `getTextContent()` drives its stream with
  `for await`, which WebKit (Safari, the Studio shell) cannot do; every page threw.
  PANE HEIGHT is the viewport fill as first landed (460fdac): the owner tried a fit-page
  zoom, a whole-page reach and a half reach the same day and had all three undone —
  do not re-propose. kirchner.ink mirrors every one of these — a change here is relayed
  to the ink seat (f28bb754) as a spec, never edited across.
- **Analytics — first-party, no third party (owner 2026-09-16, "free, no subscriptions"; f28bb754's
  design, ported from ink_site e4b7cf5..a3951ff):** `app/_components/Analytics.tsx` (mounted once in
  `app/layout.tsx`) posts `{p, r, w}` to this site's own `/api/hit` — the edge function
  `netlify/edge-functions/hit.js` → `netlify/lib/analytics-hit.mjs` — one Blobs record per view;
  `netlify/functions/analytics-rollup.mjs` (@hourly, published deploy only) folds them into
  `day/<day>.json`; the console reads them at `/admin/analytics`. Design, store, gates:
  `docs/ANALYTICS.md`. Plausible left with it (layout, index.html, CSP). Rules: recorded per view =
  normalized path, referrer HOST (first load only), country, device class, hour (`ANALYTICS_TZ`),
  and a visitor hash of `sha256(daily salt · host · ip · ua)` that dies with the salt at day close;
  NEVER the IP, user agent, query, fragment, anything under `/admin` or `/api`; never counted = bots,
  prefetches, `Sec-GPC: 1`, the Privacy page's switch (`localStorage loe-analytics`), localhost. The
  store name follows the deploy context (`analytics` / `analytics-branch-deploy` /
  `analytics-deploy-preview`). The roll-up is the only writer of `day/*.json`. `/api/hit` is an edge
  function ahead of the Next handler — never add an `app/api/hit` route. The Privacy page
  (`src/components/legal/PrivacyBody.tsx`, shared with the vite gate; the switch is passed in by the
  Next page) states exactly what is recorded — a change to the counter is a change to that page in
  the same commit. Gates: `npm run test:analytics` (Node, 39), `npm run test:edge` (Deno),
  `npm run test:console`, lint, build; the edge and core modules are Web-standard (no `node:`
  imports) — keep them so.
- **Header (owner 2026-09-15):** Articles tab = the books (The Subject's Unanswered
  Plea first, then The Holy Seed, then A Restorative Reading of Genesis 1–3) then the academic compositions; Research tab = the archives first ("From
  the archives"), then Open readings, Acknowledgements. The Abrahamic Faith
  Reconciliation Thesis was removed the same day; its URLs redirect to `/composition/manuscript`.
- **Research archives publish the EDITION ONLY — Whittick's verification transcription
  (owner 2026-09-18, all three sites; supersedes the 2026-09-15 transcripts-only rule):**
  `PUBLISHED_KINDS = {edition}` in `src/lib/research-archive.ts`. `scripts/sync-archives.mjs`
  is the DURABLE BUILDER for all three sites (ink and jk copy `public/uploads/research/<id>/`
  verbatim): the STAC config's `edition` block reads the library's
  `02_STAC_8_203_38/05_Whittick Edition/` (his 4 Aug 2026 texts by hash — depositions mm. 1–7,
  interrogatories mm. 8–9, the answer m. 10 as the owner's export of his docx); the dir's
  `_FIXITY_SHA256.txt` is the gate (sha mismatch or missing row = FATAL); no md sibling, so
  the footer-freshness gate does not apply to edition files. Each edition doc is pushed onto
  every leaf it spans with `author`, `credit`, `sha256`. The owner's transcripts, line indexes,
  working spans and working papers stay in the library, unserved; the per-PDF
  `/research/<id>/doc/` route is gone. Rules: the credit reads exactly "Professional
  verification transcription by Christopher Whittick" wherever his text shows (leaf record
  line, archive page, shelf blurb, metadata; `researchArchives.ts` `edition` block); his
  licence (written agreement 18 Sep 2026, research_library 6f70fa6e) is the basis for his
  text — never print the Open Government Licence over it (that covers the record; cite it as
  "The National Archives, ref. STAC 8/203/38"). An image-only archive (HLS MS 149, no
  edition) syncs unchanged; the empty-set guard fires only when a run would wipe a set that
  had documents. A change to what is served is a change to the archive page's words in the
  same commit. **Right folio, right page (owner 2026-09-21):** a document spanning several
  membranes opens on each membrane at the page where THAT membrane's text begins — the
  builder reads `05_Whittick Edition/_PAGE_MAP.tsv` (`leaf	file	page	folio	note`, the
  manuscript seat's table; a leaf outside its document's span or a page past the PDF's last is
  FATAL) into each edition doc's `page`; `PdfScrollViewer` takes `page` and scrolls there once
  laid out; a leaf URL's `#page=N` fragment overrides it, so a citation can land on an exact
  page (`/research/stac-8-203-38/leaf/009#page=5`). No map = page 1, said aloud in the log.
- **A book's VERSION log (owner 2026-09-24):** `content/versions/<slug>.json` — one entry per uploaded
  version (number, ISO date, the text and PDF sha prefixes the import printed, a concise note of what
  changed), newest last in the file; `VersionMenu.tsx` shows it as a drop-down in the review page's
  footer (opens upward as a popover, never inside the panes' height budget) and in the text page's
  side panel. On a new render or text landing, add the entry in the same commit as the import; the
  immunity book's version 1 is the eighteenth lane state of 2026-09-22.
- **Social cards are per page (owner 2026-09-21):** `npm run og:build` (manual-run: Pillow, poppler,
  the Mac's fonts) writes `public/og/<key>.jpg`, 1200×630 — the archive page and every leaf show the
  manuscript (a band of the first leaf / that leaf), a book its PDF's first page letterboxed on the site's
  paper, an academic article its PDF's first page or, with no PDF, a rendered title page in Georgia on
  the same paper; `app/_lib/og-server.ts` `ogImages(key, alt)` puts the card (or `/og-image.png` when
  missing) into openGraph + twitter. Re-run after a new leaf, book render, article PDF or new article;
  commit `public/og/`. Case documents and letters keep the default card by scope.
- **Device runs:** `studio-site.json` `pages.exclude` / `pages.heavy` / `pages.audit.ignore_selectors`
  feed the Studio's device audit (midesk `docs/DEVICE_RUNS.md`); run it against a PRIVATE port
  whose holder you have checked — 3999 is another seat's.
