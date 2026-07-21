# The Laws of Existence — lawsofexistence.com

Public legal-advocacy site for the Laws of Existence project. Self-publishes
three federal constitutional cases (Kirchner v. Johnson, v. Ellison, v. Acosta
— filed ECF documents only), the research framework, testimony collections,
SCOTUS shadow-docket analyses, and manuscript/timeline realms.

**Stack:** React 18 + Vite 6 + TypeScript SPA · react-router v6 · Radix/shadcn
UI · Tailwind · Netlify hosting (static — no serverless functions). Design
system: `DESIGN.md` (read before any visual work).

## ⚠ Deploy model

Netlify builds `main` on push — **a push to `main` is a production deploy.**
Development happens on the local `preview` branch; nothing is pushed until the
owner approves. The site carries **only public, FILED material** (ECF-filed
documents, released testimony sets) — never drafts, sealed material, or
strategy notes.

## Develop

```bash
npm install
npm run dev        # vite dev server → http://localhost:3000
npm run build      # validate-content → nav manifest → sitemap → typecheck → vite build into dist/
npm run preview    # serve the production build locally
npm run typecheck  # real TS check (also runs inside build)
npm run lint
```

## Content model

Content is JSON, loaded from `content/<collection>/*.json` (constitutional ·
copyright · data · manuscript · map · timeline) by
`src/utils/compositionLoader.ts` into a zustand store, per collection on
demand. Court-doc PDFs and media live under `public/uploads/`. **URLs are
descriptive and slug-based:** court documents resolve by ECF coordinate
(`/kirchner-v-johnson/70-1`), everything else by explicit `slug` fields in the
content JSON — identity lives in data, never in sort order, and
`scripts/validate-content.mjs` fails the build on malformed or slug-colliding
content. The 684 legacy positional URLs are frozen as forced 301s in the
generated `public/_redirects` (source data: `scripts/data/legacy-routes.json`).
Never hand-edit or break these maps — the URLs are cited in filed legal
documents and must resolve forever.

### Content pipelines (manual — never wired into `build`)

| Command | Purpose |
|---|---|
| `npm run process-testimonies-cms` | legacy testimony → `content/data` processor (retirement planned) |
| `node scripts/ultimateTestimonyProcessor.js` | generator of the four `*-testimonies-enhanced.json` collections |
| `npm run testimonies:review` / `testimonies:apply` | local-only testimony curation console (temporary tool — `scripts/testimony-review/README.md`) |
| `npm run sync-archives` | research-archive sync (fail-closed licensing, fixity manifests) |
| `npm run scotus:process` | ⚠ broken — hardcoded source path no longer exists; the committed corpus is the source of truth |
| `npm run generate-sitemap` | sitemap.xml (also runs inside `build`) |
| `npm run enrich-content-slugs` | one-shot slug enrichment across content JSON (already run) |
| `npm run freeze-legacy-urls` | regenerates the legacy-301 map from `legacy-routes.json` |
