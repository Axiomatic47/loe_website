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
  60f85bca: Holy Seed) and answer with "imported at <loe sha>"; they run
  `check_links.py <lane> /Users/everest/Git/loe_website` against this checkout.
  The book text and the lane are never edited here.
- Records: `src/data/books.ts` (presentation copy); code under `app/books/`;
  viewer `BookPdfViewer` (range-loading, shared worker, hit boxes, marked
  pages); pdf.js assets under `public/pdfjs/` are copied from `pdfjs-dist` — copy
  again on a version bump. State + numbers: midesk
  `.claude/agent_notes/website-developer/20260915_review_mode_on_lawsofexistence_both_books_55339aa7.md`.
- **Review-mode UI (owner 2026-09-15, all landed):** the Review-mode badge is a switch to
  READING MODE (book alone, no source pane; a citation click returns to review); the
  badge + layout toggle sit over the left pane and the cited-pages strip over the source
  pane on the panes' own column grid; zoom / Download / New tab live UNDER each viewer.
  PANE HEIGHT is the viewport fill as first landed (460fdac): the owner tried a fit-page
  zoom, a whole-page reach and a half reach the same day and had all three undone —
  do not re-propose. kirchner.ink mirrors every one of these — a change here is relayed
  to the ink seat (f28bb754) as a spec, never edited across.
- **Header (owner 2026-09-15):** Articles tab = the two books (The Subject's Unanswered
  Plea first) then the academic compositions; Research tab = the archives first ("From
  the archives"), then Open readings, Acknowledgements. The Abrahamic Faith
  Reconciliation Thesis was removed the same day; its URLs redirect to `/composition/manuscript`.
- **Research archives publish the TRANSCRIPTS ONLY (owner 2026-09-15, all three sites):**
  `PUBLISHED_KINDS = {transcript}` in `src/lib/research-archive.ts`; line indexes, working
  spans and working papers stay in the library; `scripts/sync-archives.mjs` skips them;
  the per-PDF `/research/<id>/doc/` route is gone. HLS MS 149 has no transcripts yet, so
  its folios are image-only until one lands.
- **Device runs:** `studio-site.json` `pages.exclude` / `pages.heavy` / `pages.audit.ignore_selectors`
  feed the Studio's device audit (midesk `docs/DEVICE_RUNS.md`); run it against a PRIVATE port
  whose holder you have checked — 3999 is another seat's.
