# The Laws of Existence — lawsofexistence.com

Public legal-advocacy site for the Laws of Existence project. Self-publishes
three federal constitutional cases (Kirchner v. Johnson, v. Ellison, v. Acosta
— filed ECF documents only), the research framework, testimony collections,
SCOTUS shadow-docket analyses, and manuscript/timeline realms.

**Stack (since the 2026-07-21 cutover):** Next.js 16 App Router (`app/`) ·
TypeScript · Radix/shadcn UI · Tailwind · Netlify via `@netlify/plugin-nextjs`
(every route prerendered; the Netlify functions carry the owner console and
the forms). The older React + Vite SPA (`src/views`, `index.html`) still builds
as a gate but no longer deploys; new work goes in `app/`. Design system:
`DESIGN.md` (read before any visual work).

## ⚠ Deploy model

Netlify builds `main` on push — **a push to `main` is a production deploy.**
Work lands on `device/<host>` (this Mac: `device/macbook`); agents never push
`main`. The owner integrates device → main with their own credentials (the
Studio's signed-push card). See `CLAUDE.md` for the branch law. The site carries **only public, FILED material** (ECF-filed
documents, released testimony sets) — never drafts, sealed material, or
strategy notes.

## Develop

```bash
npm install
npx next dev -p 3300   # the Next dev server (the Studio's SITES preview uses this port)
npx next build         # the production renderer (offline; `npm run build:next` adds the Open Readings pull)
npx next start -p 3301 # serve the production build locally
npm run build          # the LEGACY gate chain: validate-content → nav manifest → sitemap → typecheck → vite build
npm run lint
```

Gates before "done": `npm run build`, `npx next build`, `npm run lint`, `tsc`.
Never start servers on the Studio's pinned ports (3300/3301) from an agent
shell — the Studio owns them; use a private port and check it is free first.

## Books in review mode (`/books`)

Two books from the research library are published beside the pages they
cite: `/books/<slug>` opens the book's PDF with hit boxes over every citation;
a click opens the cited page in a reading copy of the source, scrolled to the
page. `node scripts/import-books.mjs <slug>` imports a book from its Pinned
Citation Extracts lane on the drafter's "lane at <sha>" signal — public-domain
pages only, sha-gated, linearized served copies. Contracts and state:
`CLAUDE.md` § "Books from the research library" and the website-developer
notes in midesk's `.claude/agent_notes/website-developer/`.

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
