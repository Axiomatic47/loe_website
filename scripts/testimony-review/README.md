# Testimony curation console — TEMPORARY TOOL

Local-only workbench for sorting testimony packages: decide, per set and per
testimony, what is **published** (lives in `testimonies/`, rendered on the
site), **queued** (lives in `testimony_queue/`, not rendered), or **removed**
(deleted from the working tree entirely).

Third root — the **inbox**: `Chronological Testimonies/` at the repo root is
the owner's staging COPY of the chronological corpus (4.6 GB, 272 dirs,
**gitignored** — it must never enter this public repo's tracking; originals
live outside the repo and are never touched by this tool). Inbox items group
by month bucket derived from their MMDDYY dirname prefix. Decisions there:

- **publish** — move into `testimonies/Chronological Testimonies MMYY/`;
  it becomes tracked repo content on the next commit and renders on the site.
- **hold** — same decision value as queue, but the item simply STAYS in the
  gitignored inbox (moving it to `testimony_queue/` would put unpublished
  material into the public repo, which the inbox model exists to avoid).
- **remove** — delete this local copy only.

**Primary markdown**: the processor renders only TOP-LEVEL `.md`. Dirs whose
markdown is all nested (`mnt/data/` dumps, `Original/`) show a ⚠ in the list;
open the reader and click **set primary** on the document that IS the
testimony. On publish, apply hoists a copy of the primary to the top level.
If the nested copies are content-identical, apply hoists automatically; if
they are distinct and no primary is chosen, that publish is BLOCKED (listed
loudly, everything else proceeds).

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

## Standard package layout (added 2026-07-21)

Publishing now normalizes every package to the standard layout defined in
`scripts/lib/testimony-package.mjs` (typo fix, `mnt/data/` hoist,
`Original/` → `original/`) and writes a `manifest.json` (role + size +
sha256 per file). The processor then copies the FULL authentication chain —
signed testimony `.md`, `.sig`, `.pem`, `verify_*.js`/`.sh`, formal PDFs,
sealed `original/` bundles, and the manifest — to `public/uploads/data/` as
stable `<package>_auth_<name>` files and renders an **Authentication
Materials** table (downloads + hashes) in place of the old truncated
inline blobs. Standalone sweep: `npm run testimonies:normalize` (dry-run;
`--apply`, `--inbox`).
