# Testimony curation console — TEMPORARY TOOL

Local-only workbench for sorting testimony packages: decide, per set and per
testimony, what is **published** (lives in `testimonies/`, rendered on the
site), **queued** (lives in `testimony_queue/`, not rendered), or **removed**
(deleted from the working tree entirely).

This is NOT part of the site. Nothing here is imported by `src/`, no route
serves it, and the server binds to 127.0.0.1 only. When the sorting work is
finished, delete this directory and the two npm scripts — it is designed to
be disposable.

## Use

```bash
npm run testimonies:review        # serve the console at http://127.0.0.1:4180
npm run testimonies:apply         # DRY RUN: print what would change
npm run testimonies:apply -- --execute   # actually move/delete + regenerate
```

Decisions persist in `.testimony-decisions.json` at the repo root
(**gitignored** — editorial deliberations never reach the public repo; only
the applied results do).

## What apply does

1. Moves testimony directories between `testimonies/<Set>/` and
   `testimony_queue/<Set> queue/` per your decisions; deletes `remove`-marked
   directories from the working tree.
2. On publish, renames a typo'd `exihibits/` subdir to `exhibits/` so the
   processor's image search actually finds the exhibits.
3. Re-runs `scripts/ultimateTestimonyProcessor.js` to regenerate the per-set
   `content/data/*-testimonies-enhanced.json` compositions.
4. Deletes compositions for sets that no longer have any published testimony.
5. Prunes `public/uploads/data/` files that match the processor's naming
   pattern but are no longer referenced by any content JSON (each processor
   run re-copies images under new timestamps, so this also clears stale
   copies).

## Caveats

- `remove` deletes from the WORKING TREE only. Git history still holds the
  files until the (separate, owner-gated) filter-repo purge.
- Unpublishing/removing a currently-published testimony makes its frozen
  legacy 301s land on a 404 — correct behavior for withdrawn content, noted
  here so it isn't a surprise.
- `framework-recognition-testimonies.json` is produced by a different script
  (`processTestimoniesToCMS.ts`) and is out of scope for this tool.

After an `--execute` run: `npm run build` (regenerates sitemap + nav
manifest + validates content), review `git status`, then commit on `preview`.
