# Case Review on lawsofexistence.com — the Studio's window, vendored; the lane, bundled

The owner's word (2026-10-01): the DDC case page is a replica of the Studio's Case Review window — "documents listed
just like they are locally in descending order with the same exact structure … the website only differing in skin,
not in logic." `/kirchner-v-johnson` IS the review mode; the landing dossier (summary, status, timeline, key documents)
is gone from that case. Kirchner v. Ellison and Kirchner v. Acosta keep their landings until a review lane exists for
them. The module was built first on kirchnervjohnson.com (f28bb754, `docs/CASE_REVIEW_SITE.md` there) and landed here
as the same files under this site's skin.

## One logic

The window is the Studio's own module, run as a native ES module from `public/` — never bundled, never edited here:

| on the site | in the Studio (`~/Git/ourstudio`) | what |
|---|---|---|
| `public/casereview/vendor/casereview.js` | `ourstudio_frontend/ui/js/deck/casereview.js` | the window: the filings tree, the two panes, the stepper, the footers, the ⋯ menu, the search, the deep link |
| `public/casereview/vendor/casereview_core.js` | `…/deck/casereview_core.js` | the contract as code: the fold, the locate, the tree model (`navRows`, `navView`), the right pane's words (`saysFor`, `publishedAway`), the state string |
| `public/casereview/vendor/casereview_pdf.js` | `…/deck/casereview_pdf.js` | the PDF pane, used twice |
| `public/lib/pdfjs/` | `ourstudio_frontend/ui/lib/pdfjs/` | pdf.js **4.10.38** and its standard fonts — the build every reading-order rule was tuned on. The book pages keep pdfjs-dist 6.3.289 at `/pdfjs/`; one pdf.js build per page, by route |

`public/casereview/vendor/VENDOR.json` records the Studio commit and the sha256 of every vendored file plus the pdf.js
pin from the Studio fixture (`tests/fixtures/casereview_fold.json`). The three Studio modules the window imports and
the site lacks are **shims** beside it (`base.js`, `../filing/ctxmenu.js`, `reviews.js`) — the only host code.

```
npm run casereview:check   # every build (build:next): the files match the record and the pdf.js pin; the bundle is whole
npm run casereview:sync    # on the device: copy from the Studio at its HEAD, rewrite the record, prove it there (its harness)
```

A rule change lands in the Studio first (studio-spec + frontend review), then syncs out; the sites never fork a rule.

**Host and skin.** `app/[caseSlug]/page.tsx` (the Johnson branch) draws the site header, a one-row head (All cases ·
caption · number · CASE REVIEW · registry version) and mounts `app/casereview/CaseReviewMount.tsx`, which sets
`document.body.dataset.mode = 'casereview'` (the rule under which the window writes its deep link), puts the default
document into a URL that names none, and calls `mountCaseReview()`. `app/casereview/casereview.css` is the skin: the
Studio's class names, tracks and placements on this site's HSL tokens (`src/index.css`; left pane a review blue, right
pane the site's primary). The window sits under the site's header at `calc(100dvh - 4rem)`, min 640 px.

**The deep link is the Studio's exact form** — `?casereview=doc=<id>&cite=<page>/<n>[/<k>]&q=<text>&page=<pdf
page>&right=<id>&rpage=<pdf page>` — written by the window on every step with `replaceState`, restored at mount. A
copied Studio URL's query opens here. The per-document reader pages `/kirchner-v-johnson/<docket slug>` stay as indexed
pages; each carries "review with its citations →" into the mode at that document (`app/casereview/review-link.ts`).

## The data: a bundle of the served API, this site's file layout

The window reads the Studio's three read-only routes. The site answers them static — `next.config.ts` `rewrites()`
(so `next start` answers them too) and the marked block in `public/_redirects` (Netlify), both generated:

```
/api/casereview/docs         → /casereview/data/docs.json
/api/casereview/links/<id>   → /casereview/data/links/<id>.json
/api/casereview/file/<id>    → /uploads/constitutional/pdfs/<docket slug>.pdf   (one rule per served document)
```

This site already held the docket as `74.pdf`, `51-54.pdf`, `mo-stay.pdf` under `public/uploads/constitutional/pdfs/`
(436 files, every one sha256-identical to a registry row), so the importer runs in the docket-slug layout:

```
npm run casereview:import
# = node scripts/import-casereview.mjs --uploads-dir uploads/constitutional/pdfs --names docket \
#     --name-map scripts/casereview-name-map.json --serve-groups Filings
```

from the running Studio (`http://127.0.0.1:8765`, the work_station project) or `--from <export dir>`. It names the
existing files, copies what the registry serves and the site lacks **sha-gated** (a file whose sha256 is not the
registry's is not served), prunes only a file it would itself have named, writes `files.json`, `_IMPORT.json` (the
stamp: registry version, counts, the default document, the host policy, the vendored Studio commit), `serve.json`,
and MERGES its rewrite block into `public/_redirects` (the legacy 301 freeze written by `freeze-legacy-urls.mjs` keeps
the block in turn).

**Publication is the registry's word; hosting is the owner's per site.** docs.json carries a per-row `publish` field
(v0.25: serve | link | hold; `publish_url` for link); the importer fails closed — a row without the field is `hold`.
**Host policy (`--serve-groups Filings`, 2026-10-01):** until the owner's hosting word, only the Filings group is hosted
here; a `serve` row of another group is `link` when the registry names an http(s) URL, else `hold` — kept, and the
window says "not published on this site yet" (`publishedAway`) before any fetch. The non-filing serve set is 537
documents, 735 MB (case law 318 MB, statutes 214 MB, USB exhibits 156 MB, …); the owner decides whether it is hosted in
this repository, and the flag is dropped when it is. Today: serve 448 · link 7 · hold 594; default document DDC-077.

**What the bundle leaves out** (the author's voice everywhere the reader reads; record and links only): seat fields,
working notes, the checker's passage texts (the window boxes passages from the PDF's own text layer), filesystem and
mirror paths. The checker's structured answers (violations, warnings, coverage, stale render, `k`, `unit_id`, pdf
pages, section-map resolutions) ride unchanged. The five filings the court has not stamped (ECF 11, 12, 12-1, 14, 15)
carry `filer_copy` and the mark in their title.

## CSP

`netlify.toml`: `worker-src 'self' blob:` (the pdf.js worker) and `data:` in `font-src` (the standard fonts), beside
`connect-src 'self'`.

## Verifying a change (private port 3998; the Studio's pinned ports are never used)

1. `npm run casereview:check`, `npx tsc --noEmit -p .`, `npx next build`.
2. `npx next start -p 3998`; `curl -I http://127.0.0.1:3998/api/casereview/docs` answers JSON, `/api/casereview/file/DDC-077`
   a PDF with `206` on a Range request; `/kirchner-v-johnson` carries `#casereviewRoot`.
3. Offscreen (`~/Git/midesk/tools/ui_snap/snap`, settle ≥ 14 s, a strip in the prep script reading `#casereviewRoot`'s
   footers): the tree draws 30 of 74 top-level filings with "hide before ECF 47" on (44 hidden, 294 hidden in all), 13
   groups; the left footer names the open filing and its citation count; clicking a `.cr-hot button` opens the right
   pane and its footer says the page it shows. Canvases render blank offscreen — assert words, not pixels.
4. Kill the server. A Studio change: `npm run casereview:sync`, then 1–3 again.
