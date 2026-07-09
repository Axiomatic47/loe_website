# FOR REVIEWERS — Independent verification of the STAC 8/203/38 transcription
### TNA STAC 8/203/38 (*Lloyde v. Lewys*; the surviving Star Chamber file behind *Floyd v. Barker*, Trinity 1607) — record copy RC8368179, ten membranes, transcribed 2026-07-01 → 2026-07-08

**What you are holding.** A complete, layered, first-hand transcription of the ten-membrane record copy, made from the digitized images by a single accountable reader under the method stated in `../TRANSCRIPTION_AND_ANALYSIS_METHODOLOGY.md`, together with the **entire visual record** (every zoom tile the readings rest on, with pixel-exact manifests), the uncertainty ledger, and the fixity chain. A professional transcription has been commissioned from The National Archives and is pending; all readings are provisional until it returns — **names above all**. Your independent judgment is exactly what this package is built to receive.

**If you prefer to evaluate blind (recommended):** work first from the master images and `crops/` only — they are self-contained, and tile names carry only zone tags, not readings. Transcribe your sample. Only then open the transcription layers below and compare. That ordering makes your agreement (or disagreement) independent evidence rather than anchored review.

---

## 1. The evidentiary chain, and how to check each link

1. **The masters are the archive's.** `8368179_STAC_8_203_38_001–010.jpg` = TNA record copy order RC8368179 (dispatched 2026-07-01). Verify integrity: `shasum -a 256 -c _FIXITY_SHA256_SOURCES.txt`. (To verify against the archive itself, re-order the record copy from TNA and compare checksums, or collate any leaf visually.)
2. **Every tile derives from a master, provably.** Each series under `crops/` carries `_manifest.jsonl`: one JSON row per tile with the exact source-pixel rectangle (`src_px`), render type, and output size (later rows also carry the full parameter set, CLI command, and the master's sha256 prefix). Re-derive any tile: crop the rect from the named master (`_crop_stac_v3.py` in the parent directory is the cutter; `python3 _crop_stac_v3.py <img> <tag> <x0f> <x1f> <nbands>`; render definitions in its docstring). `crops/_FIXITY_SHA256_CROPS.txt` fixes every preserved tile.
3. **Coverage is computable, not asserted.** `python3 ../_coverage_check.py crops/stac_p4d/_manifest.jsonl --img 007` (etc.) shows the swept y-intervals and any gaps.
4. **Every reading cites its tiles.** The per-membrane line indexes (`_WORKING_00N_LINE_INDEX.md`) give line-by-line text with band IDs (`crop_p4d007L_b3` = membrane 007, left half-column, band 3); the deposition/instrument files aggregate them. Pick any line → open its tile(s) → judge the strokes yourself.
5. **Enhancement never stands alone.** Renders: `nat` (untouched control) · `eB`/`eR`/`eG`/`eM` (channel-isolated, flat-field + CLAHE + unsharp). House rule: a reading is trusted only if it survives every render it appears in; artifacts flip between renders, ink does not.

## 2. Reading the apparatus

Conventions (full table in the methodology §6): `[?]` uncertain · `[…]/[__]` supplied/illegible · `^word^`/`«…»` scribal interlineation (`Λ` = caret) · `~~text~~` struck in the MS · `⟨x⟩` expanded/normalized letterform · `∥` seam join · ⚠ lean / ⚠⚠ contested-or-expectation-risk (never asserted) · ✓eB survives enhancement · ✗ scan-limited (image cannot decide; listed for physical/professional inspection). A TEI mapping table is in the methodology §16.4 if you prefer that idiom.

## 3. What to read, in order

| Layer | File(s) |
|---|---|
| Reader-facing companion (per-membrane, diplomatic + modernized — the modernized layer is an aid, never source text) | `READING_COMPANION_STAC_8_203_38.md` |
| Baseline transcriptions (the two depositions, the 16-article instrument, the sheriff's answer) | `_WORKING_TOWNELEY_DEPOSITION_001-003L.md` · `_WORKING_LLOYD_DEPOSITION_003R-007.md` · `_WORKING_008_TRANSCRIPTION.md` · `_WORKING_009_TRANSCRIPTION.md` · `_WORKING_010_TRANSCRIPTION.md` |
| Line-grain indexes (censuses, revision strata, per-band text, eB dispositions, delta logs) | `_WORKING_001…007_LINE_INDEX.md`, `_WORKING_008_LINE_INDEX.md`, `_WORKING_009_LINE_INDEX.md`, `_WORKING_P4C_AUDIT.md` |
| **The uncertainty ledger — the highest-value review target** | `_PRECISION_PASS_LEDGER.md` (every open/contested item with status, tile refs, and the retraction log; doubles as the professional-commission brief) |
| **Quoted-in-print concordance** — every reading quoted in the citing article traced to membrane, working file, tiles, and status (start here for step 2 of § 5) | `QUOTATION_CONCORDANCE.md` |
| **Corrections digest** — every retraction/correction the method caught, dated, with the mechanism that caught it (calibration for what remains) | `CORRECTIONS_LOG.md` |
| Method | `../TRANSCRIPTION_AND_ANALYSIS_METHODOLOGY.md` |
| DOCX renders (derived, for readers who prefer Word: conventions become real formatting — MS strikes as strikethrough, interlineations as superscript, ⟦pass-notes⟧ gray — with a legend page and a source-sha256 footer pinning each render to its exact source state; **the .md files govern**) | `docx_exports/` — regenerate any file: `python3 ../_working_docx_render.py <file.md>` |

## 4. Honest limits you should know before you start

- **Five early crop series were lost** to temporary-directory cleanup before the preserve-all rule (2026-07-03) and exist as *documented deterministic regenerations only* (`crops/stac_regen/` — its README grades each series' parameter fidelity). Readings from those passes cite the original tags; the regenerations show you what the reader saw, but are not the tiles-as-read. All Phase-4 series and the first-sweep/re-sweep series are originals-as-read, with manifests. One scratchpad set was rescued intact (`crops/stac_p4a_rescued/`, README inside).
- **Scan-limited zones are declared, not forced**: membrane 007's folded-under right edge, versos/dorses (positive show-through evidence on 001/007), heavy strikes wanting multispectral, and every ✗ item in the ledger.
- **Single-reader risk is managed, not absent**: the method's countermeasures (independent re-reads, letterforms-first, the wish-fulfilment hazard class, the retraction log) are documented per item — but they are countermeasures. Your independent eyes are the missing control, which is why this package exists.
- **Deployment context, disclosed**: readings from this file are quoted (with disclosure) in the author's article and federal filings; the quoted-readings audit trail is in the ledger. Nothing here asks you to endorse any legal argument — only, if you will, to read strokes.
- **Method version**: this campaign was executed (2026-07-01 → 07-08) under **v1.0** of `../TRANSCRIPTION_AND_ANALYSIS_METHODOLOGY.md`; the file was raised to **v1.1 on 2026-07-08, at this campaign's close, largely from this campaign's lessons** — §15 (preservation/fixity) is written from the crop-loss case study above (its §15.2 cites it), §16's replication-package standard is what this README instantiates, and the v3 cutter + coverage-proof tooling entered service in the final phases (earlier series carry v1/v2 manifests, disclosed in §1 item 2). Two v1.1 §17 additions postdate this corpus and have no STAC artifact: the per-corpus **hand-atlas file** (STAC's within-hand allograph adjudications live inline in the ledger and line-index entries) and **witness collation** (inapplicable here — the record copy is a unique original, not one witness of a copied text). Judge this package by its own §§1–4 disclosures plus the methodology's core; the v1.1 additions are the standard its successors (first: `../HLS_MS149_Floyd_ff81r-83v/`) are held to.

## 5. A time-efficient audit (if you cannot re-read ten membranes)

1. Adjudicate the ledger's TOP/⚠⚠ items (the ans-14 sum ff-token; the date minim; the courier and attorney names; the autograph; the 006R recovered line; the ſd-bar reclassification; "privie/procuringe").
2. Check every reading on the quoted-in-print list — `QUOTATION_CONCORDANCE.md` is that list, one row per quotation with locus, authority file, tiles, and live caveats.
3. Roll 5 random census lines per membrane from the line indexes and verify against tiles.
4. Inspect every strike/interlineation (the revision stratum is where transcriptions most often go wrong).
Agreement there certifies the corpus to stated confidence; any disagreement is welcome — it feeds the same delta-log machinery every internal pass used.

## 6. Credit, contact, terms

Transcription © the author (contact@lawsofexistence.com), offered for scholarly verification and critique; cite as "author's transcription from TNA record copy RC8368179 (STAC 8/203/38), method at [this repository], professional transcription pending." The underlying images remain subject to The National Archives' record-copy terms — this package is shared for individual scholarly verification; please do not re-publish the images themselves without checking TNA reuse terms.
