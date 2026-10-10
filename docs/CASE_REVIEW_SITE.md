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
#     --name-map scripts/casereview-name-map.json
```

from the running Studio (`http://127.0.0.1:8765`, the work_station project) or `--from <export dir>`. It names the
existing files, copies what the registry serves and the site lacks **sha-gated** (a file whose sha256 is not the
registry's is not served), prunes only a file it would itself have named, writes `files.json`, `_IMPORT.json` (the
stamp: registry version, counts, the default document, the host policy, the vendored Studio commit), `serve.json`,
and MERGES its rewrite block into `public/_redirects` (the legacy 301 freeze written by `freeze-legacy-urls.mjs` keeps
the block in turn).

**Publication is the registry's word; hosting is the owner's per site.** docs.json carries a per-row `publish` field
(v0.25: serve | link | hold; `publish_url` for link); the importer fails closed — a row without the field is `hold`.
**Hosting (the owner's word, 2026-10-01 09:1x CDT):** the registry's `publish` word alone decides what this site hosts —
every `serve` row is a PDF in this repository (serve 985 · link 7 · hold 57 at registry v0.25b; default document
DDC-077). The import of 2026-10-01 morning had narrowed hosting to the Filings group (`--serve-groups Filings`, 448
served, 594 held) and the owner read the result on the live site as a defect: the United States Code pages and the case
law "appear linked but nothing is pulled up in the other viewer when clicked" — the window was obeying `hold`. The
narrowing came off the same morning (+537 PDFs, 701 MB: case law, statutes, USB exhibits, secondary sources, rules; the
largest single file 76.9 MB, Peters' Statutes at Large vol. I). `--serve-groups` remains a host narrowing a site may
make (`link` when the registry names an http(s) URL, else `hold`, stamped in `_IMPORT.json.host_policy`), never a
widening.

**Unsafe ids.** A case-law id carries spaces, commas and parentheses; the host file is the id's URL-safe slug and the
window requests `/api/casereview/file/<encodeURIComponent(id)>`. Each such id gets its own rule in BOTH encoded forms
(encodeURIComponent; encodeURI where a browser would normalise to it): in `public/_redirects` (Netlify) and in
`next.config.ts` `rewrites()` — Next tests the compiled regex against the request path AS SENT, not the decoded path
(a rule on the raw id matched nothing, measured 2026-10-01), so the config emits the encoded forms with path-to-regexp's
syntax characters escaped. Proof on the private port: every served id answers 200 `application/pdf` through the route,
bytes identical to disk (985/985).

**What the bundle leaves out** (the author's voice everywhere the reader reads; record and links only): seat fields,
working notes, the checker's passage texts (the window boxes passages from the PDF's own text layer), filesystem and
mirror paths. The checker's structured answers (violations, warnings, coverage, stale render, `k`, `unit_id`, pdf
pages, section-map resolutions) ride unchanged. The five filings the court has not stamped (ECF 11, 12, 12-1, 14, 15)
carry `filer_copy` and the mark in their title.

## A second case on the same host (2026-10-10; the owner's word of 2026-10-09: the MN case gets the DDC architecture)

The window keys its root itself: `projRootQS()` (casereview.js l.74–77) turns the page URL's `?projroot=<slug>` into
`?root=<slug>` on all three fetches, and the window's per-case tree store is `ourstudio_cr_tree:<case_root>` where
`case_root` is docs.json's field — the importer writes the case SLUG there, never a path. So a second case needs no
window change: a host table, a keyed bundle, keyed rewrites.

- **The host table** — `app/casereview/review-link.ts` `CASE_REVIEW_HOSTS`: slug → `root` (null for the default
  case), the head row's caption, docket number and court. A case is in review mode ONLY while its bundle is on disk
  (`caseReviewHost()` tests `_IMPORT.json`): a row with no bundle changes nothing, the landing dossier stays; the day
  the bundle lands, `/<slug>` flips and its per-document pages get "review with its citations →".
- **The bundle** — `node scripts/import-casereview.mjs --case <slug> …` writes `public/casereview/<slug>/data/`
  (docs.json, links/, files.json, _IMPORT.json). The default case (`kirchner-v-johnson`) keeps `public/casereview/data/`
  and bare rules, byte for byte (proven on the P96 export: before == after == the committed bundle).
- **The rewrites** — `public/_redirects` gets a second marked block, `# casereview BEGIN <slug> — …` /
  `# casereview END <slug>`, every rule carrying Netlify's query condition (`/api/casereview/docs  root=<slug>  …  200`;
  such a rule matches only a request carrying exactly that parameter, and the window's fetches carry only `root`),
  inserted BEFORE the default block (first match wins; a bare rule matches under any query); each block regenerates
  alone. `next.config.ts` builds the same from the bundles on disk (`has: [{type:'query', key:'root', value:<slug>}]`,
  keyed rules first). `public/serve.json` (serve-handler) has no query condition in its grammar — it stays the default
  case's alone; `next start` serves both.
- **The mount** — `CaseReviewMount` takes `root` and writes `projroot=<slug>` into the URL by replaceState before the
  window reads `location.search`, as it writes the default document. When the Studio gives `mountCaseReview` a root
  option, the host passes it there and the URL stays bare.
- **The check** — `--check` without `--case` reads the default bundle AND every `public/casereview/<slug>/data/` present,
  so the build gate covers a second case the day it lands; `--check --case <slug>` reads one.
- **The MN files** — this site already holds them under `public/uploads/constitutional/pdfs/minnesota/` (three dockets
  by filename prefix: the closed 00726 as `1.pdf`, the refiled 02594 as `2594-20.pdf`, the appeal as `8cir-brief.pdf`).
  `--names docket` reads an `ECF N(-M)` label; the MN labels are `Doc. N`, so the MN import takes a name map or a
  second label pattern — said by name with f28bb754 when the registry's labels exist, byte-identical on both sites.

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
