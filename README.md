# The Laws of Existence — lawsofexistence.com

Public legal-advocacy site for the Laws of Existence project. Self-publishes
three federal constitutional cases (Kirchner v. Johnson, v. Ellison, v. Acosta
— filed ECF documents only), the research framework, testimony collections,
SCOTUS shadow-docket analyses, and manuscript/timeline realms.

**Stack:** React 18 + Vite 6 + TypeScript SPA · react-router v6 · Radix/shadcn
UI · Tailwind · Netlify (functions + hosting). Design system: `DESIGN.md`
(read before any visual work). Refactor/migration roadmap:
`docs/AUDIT_AND_REFACTOR_PLAN_2026-07-20.md`.

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
npm run build      # sitemap + production build into dist/
npm run preview    # serve the production build locally
npm run typecheck  # real TS check (not yet wired into build — error burn-down in progress)
npm run lint
```

## Content model

Content is JSON, loaded from `content/<collection>/*.json` (constitutional ·
copyright · data · manuscript · map · timeline) by
`src/utils/compositionLoader.ts` into a zustand store. Court-doc PDFs and
media live under `public/uploads/`. **Note:** document URLs are currently
positional (array-index based); the descriptive-URL refactor is Phase 1 of the
plan in `docs/`.

### Content pipelines (manual — never wired into `build`)

| Command | Purpose |
|---|---|
| `npm run process-testimonies-cms` | legacy testimony → `content/data` processor (retirement planned; see plan §Phase 3) |
| `node scripts/ultimateTestimonyProcessor.js` | generator of the four `*-testimonies-enhanced.json` collections |
| `npm run sync-archives` | research-archive sync from work_station (fail-closed licensing, fixity manifests) |
| `npm run scotus:process` | ⚠ broken — hardcoded source path no longer exists (plan §Phase 3) |
| `npm run generate-sitemap` | sitemap.xml (also runs inside `build`) |

## Functions

`netlify/functions/simulate.js` — proxy for the world-map simulation API
(feature retirement pending owner decision; see plan §3 D4).
