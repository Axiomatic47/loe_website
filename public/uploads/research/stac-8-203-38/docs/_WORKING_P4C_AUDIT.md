# PHASE 4C AUDIT — completeness + fidelity closure, STAC 8/203/38 (2026-07-07)

Scope (per `_RESUME_TRANSCRIPTION_NOTES.md` NEXT block, expanded after the 009
endorsement find): (i) 010 seam-strips x≈0.27/0.52/0.755 · (ii) eR/nat@2×
re-renders of remaining [?] tokens · (iii) blank-zone verification · (iv) 010
rows 13–16 spot pass · (v) **full-extent foot/edge ink-screen + corner zooms on
ALL TEN membranes**. Crops → repo `crops/stac_p4c/` (user directive 2026-07-07:
preserve all crops as we work). First-hand paleography only; no subagents.

---

## (v) ALL-MEMBRANES INK SCREEN — RESULTS (2026-07-07)

Tool: `_ink_screen_p4c.py` (parchment-bbox detection → 16×16 cell grid →
per-cell dark fractions in B/blue, M/min-channel, plus a P stamp-signature map
for the blue screen's purple blind spot). Thresholds = the 4B recipe (0.55 ×
leaf median). A TRIAGE AID ONLY — every flag below gets eyes before any claim.

**Screen-wide observations**
- The scans have a dark backing board; raw frame stats are meaningless — all
  results below are within each leaf's parchment bbox.
- P-map (purple-stamp signature) fired NOWHERE on any leaf at the 0.5%
  threshold — purple/graphite remain screen-blind or sub-threshold; stamp
  zones rest on direct reads (04B caveat stands).
- **Every double leaf (001–006) shows the same bottom-right-corner gradient**
  (dark rising toward the corner as parchment coverage falls): candidate =
  handling soiling/curl common to the whole file; counter-candidate =
  endorsement-class writing. One representative zoom (002, strongest) decides.

**Flag list (eyes-on queue)**
| # | leaf | zone (scan fractions) | signal | prior coverage | verdict |
|---|------|----------------------|--------|----------------|---------|
| F1 | 007 | bottom-right corner x 0.70–1.00 y 0.90–0.97 (r16 c11–c16, B up to 12.8% on parch 74–94%) | endorsement-class; 007 = final Lloyd leaf | foot imaged 07-02 (blank lower half noted) but corner never zoomed | pending |
| F2 | 007 | right margin x 0.94–1.00 y 0.79–0.85 (B 0.63% parch 97%) | small isolated blot in the blank zone | imaged, unremarked | pending |
| F3 | 007 | top-left x 0.04–0.22 y 0.04–0.21 (B≫G: 17.0% vs 1.3%) | RED material (B-dark/G-light) — foliation numeral? red chalk? | imaged; colour signature never noticed | pending |
| F4 | 008 | left edge x 0.00–0.06 y 0.44–0.50 (B 16.1% parch 79%) | dark feature in the x<0.05 strip **never imaged by any pass** (4A L bands started x 0.05) | UNIMAGED | pending |
| F5 | 009 | left edge x 0.00–0.06 y 0.38–0.44 (B 21.7% parch 75%) + smaller y 0.56–0.62 (1.6%) | same class as F4 — unimaged x-strip; lacing holes? margin writing? | UNIMAGED | pending |
| F6 | 010 | left edge x 0.00–0.06 y 0.48–0.83 (column: 4.3→29.8% dark, parch 70–95%) | substantial dark left-edge column on the ANSWER (filed folded — edge docket class) | first-sweep/grid started x 0.02; strip only part-covered | pending |
| F7 | 010 | top-left x 0.185–0.25 y 0.015–0.07 (B 4.9% vs G 2.4%, parch 64%) | red-material signature (foliation class, cf. F3) | heading zone read, colour unremarked | pending |
| F8 | 010 | foot cells x 0.06–0.31 & x 0.56–0.80 y 0.88–0.94 (1.5–4.2%) | foot-margin signals below the subscription row | row-16 grid cells covered it; spot-verify while doing (iv) | pending |
| F9 | 002 | bottom-right corner x 0.70–0.97 y 0.90–0.96 (B 7–34%, parch 63–90%) | REPRESENTATIVE for the doubles' shared corner gradient (001 r16c13–15, 003 r16c11–15, 004 r16c11–13, 005 r16c10–12, 006 r16c12–15 all match) | feet imaged in sweeps; corners never zoomed | pending |
| F10 | 001 | left margin x 0.06–0.12 y 0.55–0.67 (B 3.0–8.8% parch 90–95%) | margin marks beside lower text (examiner's marginalia class) | imaged in bands; margin never zoomed | pending |
| F11 | 008 | foot x 0.42–0.54 y 0.92–0.98 (B 1.4–2.3% parch 92%) | foot-center signal at the torn edge (Art-13 stub fragments?) | 4A b12 imaged it; re-verify against the 4A foot reading | pending |

008/009 top-edge and 001–006 top-row signals = the known caption/heading tops
(imaged, read); not queued. 009 bottom-right stained corner = read in 4B (blot,
no letterforms); not re-queued. 009's endorsement zone itself sits in ragged
(`~`) cells — the screen would NOT have listed it under the parch≥60% filter;
noted as a screen limitation: **ragged-edge cells always need eyes regardless
of stats** (they are exactly where edge dockets live).

---

## (v) EYES-ON VERDICTS

(flushed per tile as read)

**F1 — 007 bottom-right corner: STAIN/TEAR ONLY on the recto.** Tile
`crop_p4c007cornBR_b1[_eR].jpg` (x 0.62–1.00, y 0.74–1.00, 2×). The corner
gradient = ragged torn foot edge with tide-line staining; no recto letterforms.
The known verso show-through (faint mirrored strokes, greenish-gray) is plainly
visible across the blank zone — consistent with writing on 007's BACK.

**F2 — 007 right-edge fold: ★ REAL WRITING, CUT OFF BY THE FOLD.** Tiles
`crop_p4c007_edgeR_cw.jpg` (x 0.88–1.00, y 0.68–0.97, 3×, rotated CW) and
`crop_p4c007_edgeR_frag.jpg` (fragment zoom). Three iron-gall LETTER-BOTTOMS
protrude from under the fold crease at scan x≈0.95, y≈0.79–0.86: (1) a wedge
with a descender tail; (2) a wide shallow arc (bowl-base of a large rounded
letter); (3) a horizontal bar with a short descender crossing below. Letter
bodies are hidden under the folded-over edge — docket/endorsement-class script
size (spacing far wider than deposition text). NOT readable from this scan by
physics (the leaf is folded), not by imaging quality. ⚠ **TNA-ORDER ITEM
(upgraded from "possibly unscanned verso writing"):** request 007 verso /
unfolded right-edge image — the leaf that closes the Lloyd deposition carries
concealed edge-writing exactly where a filing endorsement would sit, matching
the (now-imaged) 009 endorsement class. (A further pin-size mark higher on the
fold, CW-tile upper right, unresolved — same hidden-face family.)

**F3 — 007 top-left "red" feature: STAIN, retracted.** Tile
`crop_p4c007cornTL_b1.jpg` (x 0.02–0.30, y 0.02–0.24). The B-dark/G-light
signature = yellow-brown tide-line staining on the ragged corner — exactly the
spectral signature a brown stain gives (absorbs blue, passes green/red). No
numeral, no chalk, no marks. The red-foliation hypothesis is retracted; the
same explanation presumptively covers F7 (010 top-left, parch 64% —
stain/ragged edge), to be spot-confirmed during the 010 pass.

**F4 — 008 left edge (x<0.05, previously unimaged): NO TEXT; minor flecks,
scan-limited.** Tile `crop_p4c008_edgeL_b1.jpg` (x 0.00–0.08, y 0.40–0.54, 3×).
Three-layer geometry: an ADJACENT MEMBRANE's blank edge intrudes at far left;
then the dark backing gap (this shadow IS the screen's 16% — geometry, not
ink); then 008's own left edge (greenish-mottled). On 008's edge: a vertical
series of tiny marks — two curl-shaped traces ("6"/"C"-like, letterform-
fragment class, sub-readable) near the top and several regularly spaced
arrowhead flecks (contact-offset from the facing leaf, or lace-hole soiling).
Nothing readable at native resolution; logged as a low-priority TNA glance
item, NOT claimed as writing.

**F5 — 009 left edge (x<0.05, previously unimaged): CLEAN — geometry only.**
Tile `crop_p4c009_edgeL_b1.jpg` (x 0.00–0.08, y 0.34–0.48, 3×). Same
three-layer structure (adjacent leaf / backing gap / 009's edge) plus a pale
lifted/torn edge sliver. The screen's 21.7% = the gap shadow. No ink, no
marks. F4's flecks therefore do NOT repeat across leaves at the same height —
lacing-pattern hypothesis dropped; F4 stays soiling/offset class.

**F6 — 010 left-edge dark column: PHYSICAL CONDITION, NO WRITING.** Tiles
`crop_p4c010_edgeL_b1.jpg` + `_b2.jpg` (x 0.00–0.08, y 0.44–0.86, 2×). The
column decomposes into: (a) a **STITCHED SEAM** — a regular line of sewing
holes (thread-soiled) running down the left margin from ≈y 0.50 to y 0.80
(edge repair or hem; condition note for the record); (b) a **diamond-shaped
HOLE** through the parchment at scan x≈0.054 y≈0.56, dark backing visible
through it; (c) the dark backing gap where the leaf edge tapers; (d) a
**preserved INSECT** (crane-fly class, legs intact) adhered to the surface at
x≈0.065 y≈0.585 — organic debris, not ink; (e) creases. Two pin-size flecks
only; no letterforms anywhere on the strip. The Answer has no left-edge
docket on the recto.

**F9 — 002 bottom-right corner (representative for ALL doubles): TAIL TEXT +
RAGGED EDGE, no docket.** Tile `crop_p4c002cornBR_b1.jpg` (x 0.66–0.98,
y 0.86–0.98, 2×). The corner cells contain the last lines of the known 002R
text running down to the torn foot edge (line-end fragments legible and
consistent with the recorded reading: "…the matters…", "…hand to h[im]…",
"…the graunte…"). The screen's corner gradient = dark ragged edge + text
approaching the corner. Verdict extrapolated to the identical gradient on
001/003/004/005/006 (all fully swept leaves): **no separate corner dockets on
the doubles' rectos.**

**F10 — 001 left margin: ★ VERSO WRITING CONFIRMED (sub-legible), recto
clean.** Tiles `crop_p4c001_margL_b1.jpg` (x 0.05–0.15, y 0.52–0.70, 3×; no
recto ink — faint mirrored strokes only) and `crop_p4c001_verso_mirror_eG.jpg`
(x 0.05–0.55, y 0.42–0.78, green-channel flat-field+CLAHE, MIRRORED so verso
strokes read forward). In the mirrored render the margin show-through
resolves into LARGE FLOURISHED LOOPS reading forward — big elliptical
flourish + long curved strokes, docket/endorsement-class script, only the
heaviest strokes penetrating. NO text recoverable (physics: we are reading
through the parchment). ⚠ **TNA-ORDER ITEM:** request the DORSE of 001 — the
file's first/outer leaf; the show-through is exactly where a cover-docket for
the file (or the Towneley deposition) would sit. — Note the pattern now
established: 001 verso (cover-docket class), 007 verso + folded edge
(letter-bottoms at the fold), 009 foot endorsement (read, 4B). The file's
dorse faces were never scanned; every dorse signal found is on a deposition
bundle's outer face.

**F11 — 008 foot center: ✓ VERIFIED — the 4A reading stands (independent
cross-check).** Tile `crop_p4c008_footC_b1.jpg` (x 0.38–0.58, y 0.91–1.00,
3× — a CENTER strip crossing the 4A L/R stitch seam). The six faded lines
match the 4A stitched text token for token: "vpon a peticon" (L81 — my first
in-tile impression "person" corrected against the recorded reading), "the
said suite vpon the" (L82), "the cause were de|creed" (L83 — the very word
that spans the 4A stitch, continuous here), "you soe inten[ded]" (L84), faint
L85/L86 traces. No writing beyond L86. **The foot text and the 4A stitching
method are independently confirmed.**

**F7 — 010 top-left: ★ FADED HEAD-MARGIN JOTTING (name-like), scan-limited.**
Tiles `crop_p4c010cornTL_b1.jpg` (x 0.16–0.30, y 0.005–0.08, 3×) and
`crop_p4c010_headjot_eM.jpg` (eM render — mottle-amplified, WORSE than nat;
the pilot lesson holds). In the top margin, left of the Answer's heading:
a rubbed/faded jotting reading "[?]m̃[?] W[i]lle[?]"-class — name-like
(candidates include a "W[i]ll[ia]m̃"-family token; NOT the foot counsel
signature "Boyd/Boys?", which is a different hand and place), plus a more
heavily rubbed cluster above it. CORRECTION (2026-07-08): this is the SAME
feature the Phase-B pass logged as "g1_b1 superscript '[W]illm W[e/i]ll[?]'
(filing note?)" — not a first sighting; this pass adds the precise locus
(top margin, x≈0.16–0.24, y≈0.02–0.05), the two-token structure, and the
render verdict (nat@3× best; eM fails). Still nothing integrable — TNA item:
the Answer's head margin may carry a clerk's or counsel's name. The brown smudge zone right of the jotting = stain (the F3-class
B≫G signature; that part of the hypothesis held).

---

## (i) 010 SEAM-STRIP VERIFICATION (g1/g2 at x≈0.275 · g2/g3 at x≈0.525 · g3/g4 at x≈0.765)

Grid columns overlapped by only 0.02 (≈147 px) — misjoin risk at every seam.
Strips x 0.225–0.325 / 0.475–0.575 / 0.715–0.815, y 0.015–0.90, 4 bands each,
2× (`crop_p4c010seam{A,B,C}_b1..4.jpg`). Method: read every line's
seam-crossing words, verify each against `_WORKING_010_TRANSCRIPTION.md`;
zoom wide any token that fails to anchor.

**Seam A (g1/g2) band 1 (rows 1–4): ✓ NO LOSSES.** ~17 lines cross; 14 tokens
anchor verbatim (incl. the LOAD-BEARING fear clause crossing this seam intact:
"to stryke a [feare]…", "retorned or [impannelled]", "manifestacion of",
"reasonable ch[a]rges", "then havinge", "def[endan]t John", "Countie of
A[nglesey]"). Three initially unanchored tokens resolved by wide re-cuts
(`crop_p4c010seamA_L7_b1.jpg`, `_L13_b1.jpg`):
- "of the said [k]yngs" → misparse of "**of the said Hughe**" — full line "…willfull
  murtheringe of the said Hughe ap Willia[m] [named?] in the said bill…" ✓ record.
- "recompen[c]ion" → the unlawful-combination formula line: "…unlawfull …
  [combina/confedera]c[i]on s[ur]m[i]sed of…" — consistent with the recorded
  clause ("unlawful and manifest plot, practice, confederacy [or] combination
  … [surmised…]"); adds support for "surmised of/in"; a possible tail "and
  other the [premisses?]" [?]-flagged (TNA-class, no integration).
- "and fforme s[?]b in" → the standard formula "**in such sorte, man[er] and
  fforme, as in and by the said bill of compl[ain]t** [is supposed]" — the very
  words the recorded quote elides before its "…is supposed. Howebeit…" opening ✓.
- NEW small delta candidate: "as doth **[anie waye?]** concerne him" (record has
  "as doth concerne him") — [?]-flagged.

**Seam A band 2 (rows 4–8): ✓ NO LOSSES; the recorded strike CONFIRMED at the
seam.** ~22 lines cross; ~19 anchor directly ("office w[i]thout any",
"menc[i]oned", "ma[jes]t[ie]s service", "Auguste last p[ast]", "substanciall
gent…", "Challenge, and…", "declared. And this def[endan]t further saith
that att or aboute…"). The Phase-B **strike-through zone at the g1–g2 seam is
independently confirmed**: continuous bar over "~~W[illia]m ap [K/h]ellew~~"-
class strokes, as recorded. Three flags resolved by wide re-cuts
(`crop_p4c010seamA_L1618_b1.jpg`, `_L12_b1.jpg`):
- "Willia[m] B[r/i]g[?]son" → "**Willia[m] Brereton** and Richard Barker
  esquiers" — the RECORDED trial-bench pairing, now independently re-confirmed
  at 2× ("Anglesey before the said Willia[m] Brereton and Richard Barker
  esquiers in the said b[ill?]…").
- "[?]ant prooffe" → "**vpon good and pregnaunt prooffe** (as this def[endan]t
  thinketh), by the said Exam[ined?]…" — row 7's recorded conviction clause
  re-confirmed (sing./plural "prooffe[s]" nuance stays as logged).
- "to be confedera[ted]" → line reads "…[through?]out the said Countie to be
  confederated together, or shall be [?]…" — a candidate ALLEGATION-RESTATEMENT
  clause in a zone the recorded quote elides (the denial "doth not knowe that
  they were confederated…" is a separate, recorded clause) — [?]-flagged,
  TNA-class.
- NEW small delta: row 6's "In or aboute **[October?]**" supplement reads
  "**In or aboute w[hi]ch tyme** a bill of Inditem[en]t was p[re]ferred" — the
  [October?] guess at THIS spot is likely phantom (October is securely named
  elsewhere in the Answer); [?]-flagged for the working file.

**Seam A band 3 (rows 8–11): ✓ NO LOSSES + three deltas.** ~23 lines cross;
~20 anchor ("open Courte on his…", "and behaved him self[e]",
"[confede]racie or combynac[i]on", "found not guiltie", "…laboured…"-class).
Wide re-cuts (`crop_p4c010seamA_L5_b1.jpg`, `_L2122_b1.jpg`) resolved:
- ★ **"conceaved" — FIRM DELTA**: "…as this def[endan]t **conceaved** to be
  most indifferent for his ma[jes]t[ie]s [service]…" — resolves the recorded
  row-8 "[adjudged?]" bracket (anchor words verbatim around it).
- ★ REFORM-PASSAGE gains: "…whose cominge into **these Countreys** div[er]se
  abuses enormyties and oppressions…" — "these Countreys" PLURAL is a
  [?]-candidate vs recorded "this Countrey" (plural = the circuit counties,
  not Anglesey alone; the next line itself uses singular "the whole
  Countrey," so both forms are scribal options — TNA arbitrates); and the
  clause tail RECOVERED: "…and **the whole Countrey much bettered and
  amended**. And as touch[inge]…" (digest had only "well reformed").
- "…hath caused the said Compl[ainan]t (as this def[endan]t think[eth])…"
  fragment consistent with the complainant-attack zone.

**Seam A band 4 (rows 11–15): ✓ NO LOSSES.** Custody/fees lines all anchor or
read compatibly ("the house of the s[ai]d…", "did send to…", "remayninge",
"the key/said Castell", "[esc]apes out of the said…", "Shiriffe…"). Small
digest-refinement tokens for the rows-13–16 spot pass: "were **retorned**
ov[er] to th[e] [new Shiriffe?]" (digest "turned over"), "by the **lawes &
statut[es]**", "Shiriffe **or his deput[ies]**", "conven[y]ent tymes",
"where (to his [great?] ch[arge?])…" parenthesis.

**★ SEAM A (g1/g2) VERDICT: verified end to end — NO WORDS LOST at the g1/g2
boundary in the grid read.** Gains: 1 firm bracket resolution (conceaved),
1 clause recovery (much bettered and amended), 5 [?]-candidates for the
working file, multiple independent re-confirmations (fear clause, strike
zone, Brereton+Barker, pregnant-proof clause).

**Seam B (g2/g3) band 1 (rows 1–4): ✓ NO LOSSES + a CLAUSE RECOVERY.**
⚠ CONDITION: a long vertical TEAR runs down the seam zone (scan x≈0.49,
y 0.015–0.11) — lines cross it; no text lost to it (the tear follows a blank
inter-word channel in the upper faded zone). Anchors: the fear clause's right
half ("[freehol]ders of the [s]a[id]…", "compl[ain]t named)"), the
appointment clause ("followinge or [duringe]…"), "of exception to th[e]…"
(supports the recorded "[exception]" bracket). Wide re-cuts
(`crop_p4c010seamB_L6_b1.jpg`, `_L1516_b1.jpg`) yielded:
- ★ **GENERAL TRAVERSE — CORRECTION (2026-07-08): recorded in the Phase-B
  LEDGER** ("not guyltie of the said unlawfull and manifest plotte,
  practizes, confederacies, combinac[i]ons and misdemeano[u]rs … nor of anie
  [?], [extor]c[i]on[?], sellinge of offices and other the offences … as …
  is supposed"), though absent from the working-file quotes. The seam views
  RE-CONFIRM it and contribute VARIANT tokens for the ledger's gaps:
  "…combinac[i]on **surmised o[f]** [?] and other the **offences abuses and
  misdemeanors in the said bill**… as in and by the said bill of compl[ain]t
  is supposed. Howebeit…" — [?]-flagged; TNA reconciles the two passes'
  token-level differences.
- **"p[er]suasion" now the LEAD** for the recorded "[instigac[i]on/
  p[er]suasion?]" bracket: the token is short, no t-ascender/g-descender —
  "…contryved by the Compl[ainan]t by the p[er]suasion and direcc[i]on of the
  said Willia[m] Bulkeley…" ([?] retained, TNA).
- [?]-candidate: "of p[ur]pose not onelie to **vexe and trouble**" — no clear
  "greve" between the verbs in this view (recorded "[vexe?], [gre]ve and
  trouble"); faded zone, verbatim uncertainty, TNA.

**Seam B band 2 (rows 4–8): ✓ NO LOSSES + three bracket gains.** All ~22
lines anchor ("his ma[jes]t[ies] Commiss[ion]", "hatred or malice",
"esquiers as gent…", "(to this def[endan]ts [knowledge])", "p[re]ferred
agaynst…", "[Ju]ry to passe upon…", "by the said Justic[es]", "for the body
of…"). Gains: recorded "[?]onded to be retorned" → "**menc[i]oned** to be
[retorned]" (lead); "for the more certentie **thereof**" (extends the
recorded fragment); a clean "**Examined Jury**" crossing the seam firms the
recorded [Examined?] bracket.

**Seam B band 3 (rows 8–12): ✓ NO LOSSES + ★★ TWO RECOVERIES + a NEW
INTERLINE.** Wide re-cuts `crop_p4c010seamB_INTL_b1.jpg` +
`crop_p4c010_LONDON_b1.jpg`:
- ★ **THE LETTERS-TO-LONDON CLAUSE — CORRECTION (2026-07-08): NOT new.** The
  Phase-B LEDGER already records it ("did write his l[ett]res [un]to some
  spetiall frends of his [heere?/herd?] in London," "some meanes that he
  should not be Sher[iffe] for that tyme") — it is absent only from the
  working-file digest I first grepped. The seam view is an INDEPENDENT
  RE-CONFIRMATION that also **resolves the ledger's open bracket**:
  "[heere?/herd?]" reads "**here**"; and adds "**amongest others** did write"
  + the fuller frame "…[should be?] Highe Shreiffe of the said Countie for
  the yere then next followinge or otherwise, ffor this def[endan]t amongest
  others did write his l[ett]res to some spec[i]all frende ["frends"
  pl. per ledger — sing./pl. open] of his here in London to make some meanes
  that he should not be Shrieffe…". METHOD LESSON: grep BOTH the working
  file AND the ledger before claiming novelty.
- ★ **NEW INTERLINE on the Answer (second revision event on 010):** a small
  "**^at^**" rides the line "…aboute the tyme in the said bill [alleag?]ed
  ^at,^ or any other tyme…" — same clarifying-insertion class as the known
  £20 interline.
- ★ The second Barker denial now VERBATIM: "…[p]lott practise confederacie or
  combynac[i]on **betwene th[is] def[endan]t and the said M[r] Barker or any
  other** touchinge [the callinge in question]…" (record had the digest +
  the callinge-in-question fragment).
- Minor [?]-tokens: "[?]usted in his place", "by su[ch/re] meanes",
  "ffraudulent and infamous" (exact-wording candidate for the "devised and
  infamous bill" clause).

**Seam B band 4 (rows 11–15): ✓ NO LOSSES.** Custody/fees anchors
("desiringe him that…", "the said Castell", "[e]scape out of the s[aid]…");
[?]-tokens for the rows-13–16 pass: "for the better safetie and…", "driven
to finde & m[?]…", "charge of offic[ers?]". **SEAM B (g2/g3) VERDICT: NO
WORDS LOST**; gains as above (traverse, letters-to-London, ^at^ interline,
denial formula, menc[i]oned, p[er]suasion-lead).

**Seam C (g3/g4) bands 1–3 (rows 1–11): ✓ NO LOSSES + ★★ THE BARKER-PRAISE
CLAUSE RECOVERED IN FULL FORM.** Bands 1–2 anchor throughout (demurrer, fear
clause, appointment, jury-return, indictee list "Willm Prend[?]"/"Edward ap
J[ohn]", "[Chief?] Justic[e] of the…" — no new light on the sing./plural
parse). Micro-[?]s: "tedious suite" (sing.), "therein vsed", "att barre to
take". Band 3 + wide cut `crop_p4c010seamC_JUD_b1.jpg` (x 0.52–0.99,
y 0.583–0.635):
- ★★ **"…[the] def[endan]t furth[e]r saieth that in all the said JUDICIALL
  P[RO]CEEDINGE[S] in or upon the said Inditem[en]ts the said [M[r]
  Barker?]…"** — the frame of the Barker-conduct clause recovered VERBATIM;
  the Answer's own phrase is "judiciall proceedinges" (alongside the recorded
  "callinge in question" term of art).
- ★★ The praise clause EXTENDED + its tail COMPLETED: "…[in] his place and
  w[i]th ^[suche?]^ **integritie and synceritie**, that (as this def[endan]t
  thinketh) non[e] that were the[n] [present?] … to save their l[i]v[e]s
  **could fynd noe iust cause to mislike or fynde fault w[i]th his said**
  [dealinge?]…" (recorded text had "…earnestlie labo[u]red to save their
  l[i]v[e]s" and stopped; the interline word "^[suche?]^" is [?]-flagged).
- FLAG CORRECTED: the "new interline" candidate at y≈0.622 is the RIGHT TAIL
  of the KNOWN £20 interline ("…to th[e] def[endan]ts knowledge^") crossing
  seam C — NOT a new revision event. Beneath it: "…and one that together
  w[i]th his elder brother [?] ben [indicted]…" ✓ co-indictment clause.
- The letters-to-London clause CROSS-CONFIRMED at this seam ("…[should n]ot
  be Shrieffe for…"), and the reform clause's "…and nowe (god [be
  praised])…" right half anchors.

**Seam C band 4 (rows 11–15): ✓ NO LOSSES + two load-bearing confirmations.**
The reversed KEYS narrative crosses this seam intact ("**should not have the
k[eys]** [of the Castell]" — headline-5 reading independently re-confirmed at
2×); the custody burden likewise ("def[endan]t **removed** th[e]
[prisoners]", "[night] **and day durin[ge]**…", "of the said **Gaole**",
"or his deputie or a[ny]"). Four [?]-flags DEFERRED to the rows-13–16 spot
pass (same y-range): a possible interline "^and [?]inge fre[?]^" at scan
y≈0.812 (x≈0.72–0.82); "writt for money or other [reward?]" at y≈0.871;
"not well able of…"; "the not makinge of…".

---

**★★ SEAM-PASS VERDICT (task i COMPLETE): NO WORDS LOST AT ANY OF THE THREE
GRID-COLUMN BOUNDARIES.** The 2026-07-02 grid read + Phase-B re-verification
survive a full independent seam audit. Net gains (as corrected 2026-07-08
against the LEDGER's Phase-B verdicts, not just the working-file digest):
1. ★★ GENUINELY NEW: the "**in all the said judiciall p[ro]ceedinges in or
   upon the said Inditem[en]ts**" frame of the Barker-conduct clause (the
   Answer's own phrase, alongside "callinge in question"); "w[i]th
   ^[suche?]^ **integritie and synceritie**" in the praise clause; the
   praise tail variant "could fynd noe **iust** cause to mislike or **fynde
   fault** w[i]th his said [?]" (ledger has "[noe] cause to mislike or
   thinke otherwise" — token-level variance for TNA); the "**^at^**"
   interline ("…[alleag]ed ^at,^ or any other tyme…" — second revision
   event on 010).
2. ★ Bracket resolutions/leads: "**conceaved**" (firm, was "[adjudged?]");
   "**menc[i]oned** to be [retorned]" (was "[?]onded"); "**p[er]suasion**"
   (lead, was "[instigac[i]on/p[er]suasion?]"); "**here** in London"
   (resolves the ledger's "[heere?/herd?]"); "+**amongest others** did
   write"; reform tail "**much bettered and amended**" (candidate resolution
   of the ledger's "[?ab?]l[?]ished" verb pair); "In or aboute **w[hi]ch
   tyme**" (vs "[October?]"); "as doth [anie waye?] concerne him".
3. ★ Formula attestations recovered from elided zones: "in such sorte,
   man[er] and fforme, as in and by the said bill of compl[ain]t [is
   supposed]"; traverse variant tokens ("offences abuses and misdemeanors
   in the said bill", "surmised o[f]"); allegation-restatement candidate
   ("[through]out the said Countie to be confederated together").
4. Independent re-confirmations of: the fear clause, the strike zone
   (~~W[illia]m ap [K/h]ellew~~), Brereton+Barker esquiers, pregnant-proofe,
   the £20 interline (its tail), the keys reversal, Examined Jury, the
   letters-to-London clause (ledger ✓), the general traverse (ledger ✓).
5. CONDITION notes: vertical tear in the seam-B zone (x≈0.49, y 0.015–0.11,
   no text lost); stitched seam + hole + insect on the left edge (F6).

**(iii) BLANK-ZONE VERIFICATION — SATISFIED** by the all-membranes ink screen
(computational, full extent, all ten leaves) + eyes on every flagged cell
(F1–F11). The 007 lower half, 009 mid-foot, and all margins are verified
blank ON THE RECTO except as flagged above; the screen's purple/graphite
blindness is disclosed, and dorse writing (001/007) is a scanning gap, not a
blank-zone failure.

---

# (iv) 010 ROWS 13–16 SPOT PASS — COMPLETE (2026-07-08, Fable 5, first-hand)

Tiles `crop_p4civ_*` in `crops/stac_p4c/` (~21 reads this cycle; full-width
coverage of x 0.015–0.995 × y 0.803–0.998 at 2–4×, on top of the seam strips).
All four deferred seam-C-b4 flags + every seam-A/B-b4 refinement token + F8
foot cells + the subscription zone are dispositioned below.

## ★★ HEADLINE RESULTS

1. **★ THIRD REVISION EVENT ON 010 — the interline is REAL and now read**
   (`p4civ_intlZ/intlZZ`, x 0.69–0.875 y 0.799–0.812 @2.5–4×): baseline
   "…beinge Sheriffe as afford said, ^ p[ro]cured a rem[ove?]…" carries a
   caret + full superscript insertion:
   **"^and, some what[?] f[a]rre[?] distant from the said Castell^"** —
   the Answer's added explanation for the prisoner transfer: he was somewhat
   far distant from the castle, so he "procured a remove of the said
   p[ri]soners to his owne house, where he might the better intend" them.
   RE-PARSE: the grid-pass fragment "[some had] detained[?] from the said
   Castell" (row 13 tail) WAS this interline read as baseline; "detained" was
   "distant". Alternates preserved: "deteyn[e]d" for "distant"; "some what /
   farre" both [?]-flagged. TNA item.
2. **★ "SHERIFFEWICK" RECOVERED** (`p4civ_writtZ` @3×): the flag "writt for
   money or other [reward?]" reads "…[the dis]charge of offices belonginge
   to the said **Sheriffe wick[e]**, for money or other **valuable
   considerac[i]on**…" — "writt" was the tail of *Sheriffwick* (the
   shrievalty), "[reward?]" is RETRACTED.
3. **★★ THE FOOT SUBSCRIPTION MYSTERY RESOLVED — it is the engrossed PRAYER,
   not a name/jurat** (`p4civ_subL` @2.5×): the "large flourished
   subscription [S_?]zand[?] / [Ll_?]d[?]" of the grid pass reads
   "**dismissed by[?] th[e/is] ho[nora]ble[?] Co[ur]te[?] w[i]th…**" —
   the final prayer clause written large at line start, sloping up into
   "…reasonable costes and charges in that behalfe most wrongfullie
   **susteyned**" (prayer tail now firm; "[sustained]" bracket resolved).
   "[S_?]zand[?]" was a mid-word misparse of "[di]smi**ss**ed" (double
   long-s taken for z). Foot layout fully accounted for: engrossed prayer →
   right foot "& 6d" note → counsel signature → paraph → corner clip.
4. **Counsel signature: "Boyd" initial-B FIRM at 2×** (`p4civ_sigR`);
   terminal still flourish-crossed (d/s — "Boys" stays possible). NEW: the
   faded line just above it ends "**…[ack?]nowled[?] … & 6d**" — candidate
   jurat-class acknowledgment note + the fee, not merely a bare "6d". TNA.

## FLAG DISPOSITIONS (the four deferred seam-C-b4 flags)

- "^and [?]inge fre[?]^" interline → ★ READ (headline 1).
- "writt for money or other [reward?]" → ★ RESOLVED (headline 2).
- "the not makinge of…" → anchors: "**And as touchinge the not makinge or
  appointinge & [swea?/ser?]vinge[?] of deputi[es]**…" — the &-token is
  stain-crossed; "swearinge"/"servinge" both kept (TNA).
- "not well able of…" → RE-PARSE (lead): the seam glimpse was
  "…sometymes **avaliable** an[d] be[neficiall]…" ("aliable" ≈ "well able"
  through the seam window). No lost text; see row-15 resolutions below.

## SEAM-A/B-b4 REFINEMENT TOKENS — ALL ANCHOR (`p4civ_g12r14_b1/b2` @~2×)

- ✓ VERBATIM: "…the said def[endan]t **John Lewis house where (to his greate
  charge and expenses**, beinge dryven to finde…" (name's 3rd appearance
  re-confirmed eyes-on).
- ✓ "…remayned **untill they were retorned over to the n[o/e]we Sheriffe of
  that Co[untie], as lawfullie he might**" (nowe/newe vowel minor-flagged).
- ✓ "in suche convenient tyme **and as by the lawes & statut[es] of this
  Realme is in suche cases required**".
- ✓ "…watch the said p[ri]soners **at convenient tymes; Whereupon this
  def[endan]t for his better safetie a[nd]**…" (resolves "conven[y]ent
  tymes" + the better-safetie token in one clause).
- ✓ "dryven to finde & **mainteyne men to watch them night and day duringe
  the space of [——unfilled gap——]**" — the BLANK GAP seen directly
  (`p4civ_writt_b1` line 1); notable (2) re-confirmed on sight.
- ✓ "charge of offic[ers?]" → "[the dis]**charge of offices** belonginge to
  the said Sheriffewick[e]" (see headline 2).
- ⚠ NEW FLAG (sense-flip candidate, TNA): "to looke unto them; **[no/as]
  other Sheriffe [hath/shall?] [vs?]uall[ie] formerlie done vpon the like
  occasions**" — if "no", Lewis claims he did what NO other sheriff had
  formerly done (vs the grid's "[as other Sheriffes have usually?] done").
  Strokes support "no other Sheriffe" but the verb is stain-crossed.
- ⚠ NEW CLAUSE CANDIDATE (f8L line 2, faded): "that ev[er]y
  [Sheriffe/officer?] before he shall [?]…" — possibly an oath-of-office
  clause in the fees answer. TNA.

## ROW-15 FEES-ANSWER RESOLUTIONS (`p4civ_f8L/f8R/placeZZ/nameZ*` @2–3×)

- ★ The doublet is "**place & places**" FIRM — two instances, the second
  with clear terminal-s: "pleasure appointed the **place & place[s]** for
  the [doinge of all man[ner] of Courts]" + "[vs]ed to appointe the **place
  & places** for the keepinge of [Courts]". "[person & persons?]" RETRACTED.
- ★ "…was sometymes **avaliable and beneficiall to the said Sheriff[e/s]**"
  — the "[inhabitants/suitors?]" bracket RETRACTED in favor of *Sheriffe*
  (the appointments were profitable to the sheriff — sharpens the
  confession-and-avoidance).
- ✓ "the **appointmentes** of the said places" (f8Rlow line 1).
- ✓ The "^bayliffs^" INTERLINE seen directly above "the hund[reds]"
  (f8L line 5) — notable (2) of row 15 re-confirmed eyes-on.
- "did receave & take some smalle [rewarde?]" — "rewarde" now the lead for
  the "[fee/sum]" bracket (two sightings: f8L line 6 + `p4civ_r15low`
  line 3 "some[?] smalle rewarde of the said [——]").
- ✗ SCAN-LIMITED: the payer's name. `p4civ_nameZ2/nameZ3` (nat + eR @3×):
  "of the said [M?]ial[?]…" — eR is noise-dominated in this stain zone
  (stain + show-through amplify together). f8L line 6 opens with
  "[G/Th?][?]ili[?]d[?]th did receave…" — EITHER a Welsh personal name OR
  a phrase ("the like dueties"?). "[Griffith?]" stays an UNCONFIRMED lead.
  Formal TNA item.
- ✓ "w[hi]ch was lawfull for him so to do" + tail "…have vsed vsuall[ie] …
  **and not otherwise**" (g4low line 6) — the fees-answer close verbatim.
- ✓ Prayer sequence: "All w[hi]ch matters…" → "[to be] dismissed…" →
  "…most wrongfullie susteyned" (headline 3).

**★★ ROWS 13–16 VERDICT: the grid/Phase-B text SURVIVES; no lost text found
anywhere in the spot zone. Net: one new interline READ (revision event #3),
Sheriffewick + place&places + avaliable-to-the-Sheriffe + susteyned + the
engrossed-prayer resolution; the payer name and the no-other-Sheriffe verb
are the two remaining scan-limited tokens (TNA).**

---

---

# (ii) STANDING-[?]-TOKEN RE-RENDERS — COMPLETE (2026-07-08, Fable 5, first-hand)

Tiles `crop_p4cii_*` in `crops/stac_p4c/` (nat @2.5–3.5× + eR where stained;
eB was already on record from 4A/4B). All seven listed tokens dispositioned:

1. **008 L75 "[Ro?]rland [T?]horp[?]" — SCAN-LIMITED, CONFIRMED TOP TNA
   ITEM.** 3× nat + eR (x 0.45–0.98, y 0.842–0.872): the main-line tokens
   hold the "**[Ro/Do?]rlan[d/t] [T/H]orp[e?] were[?]**" letterform family;
   eR adds texture, not strokes. NEW observation: token-2's initial could
   also be C/E-class (observation only, NOT a reading). ★ GAIN: the Art-11
   interline's middle token firms at 3× — "**^or of him selfe^**" (the
   "[him?]" bracket drops).
2. **008 patronym (Res ap [Ev[a]n?/hu?] Lloyd, L1 + L8)** — the two
   instances CONFLICT at 3×: L1 opens with a tall-ascender "hu"-compatible
   form; L8 opens rounded, "E"-compatible. "**Ev[a]n**" keeps the
   documentary lead (07-02 v008 zooms; the Answer's caption "[Rees ap
   E]van"; 009 L24 "Rees ap Ev[o]n"); "Hu[gh/w]" stays letterform-live at
   L1. TNA arbitrates; no delta logged (names above all). L2R's faint tail
   after "ffleete" still unresolved ("a[tt?] agaynste him[?] […]").
3. **009 L2 fewer/favoured — "favor" NOW THE LEAD.** 3.5× nat + eR: token-1
   vowel is a/o-class with a clear "**-or**" terminal ("fewer" needs "-er");
   three of four views now favor "favor" (nat@3.5×, eR, 4B's eB "-ov-"
   lean) vs 07-02's sub-native "fewer". Verb-2 stays "**foul[l]d/fou[n]d**"
   (unresolved). Sense options both open ("favour found" vs "fewer found");
   TNA arbitrates the crux.
4. **009 "[C]irc[uit]s" — DOWNGRADED to unconfirmed.** The cluster after
   "in" resists all renders: "**in [?]ir[?]/[?]ne[?] re[?]s[?]**";
   "ev[er]ie respect" logged as a letterform-possible alternate ONLY.
   (The 07-02 reading was never confirmed at native+; now formally open.)
5. **009 L4R "L[a]ighton" — "Laighton" FIRM at 3.5×**: the post-L vowel is
   an open-bowl "a", not an e-loop. 07-02's "Leighton" was a normalization.
   (Instance-level; TNA final on names.)
6. **008 L49/L51 "ha[dd/ll]" — "hadd" upgraded to letterform-lead** (not
   just grammar): both ascenders rise from base-bowls = looped d's, not
   plain l's (2.5×). Flag kept, softened.
7. **008 L52R "[aswell?/expended?]" — "expended" upgraded to LEAD** (two
   views: the R7-overlap re-read + this 2.5× — double-d terminal visible;
   "x"-descender compatible). "aswell" stays the grammar-motivated
   alternate (07-02's "…aswell in suites of lawe as for yo[ur] owne
   expenses" needs it). Also on this strip: "**sixt**" CONFIRMED spelled-out
   (the "[vj^te^?]" alternate retires for L52; L38 keeps "vj^te^"); L53's
   "have [or hath?] yo[u]" unchanged (crease-crossed).

**★★ PHASE 4C COMPLETE — all five items (v)+(i)+(iii)+(iv)+(ii) done.** The
scan-limited residue (= the TNA arbitration list from 4C) is: the 010 fee-payer
name; the 010 "[no/as] other Sheriffe" verb; the 008 L75 tokens; the 008
patronym; the 009 favor/fewer + foul[l]d/found crux; the 009 post-"in" cluster;
the 010 interline tokens "some what / f[a]rre"; the 010 "Boyd" terminal; the
010 "[ack?]nowled[?] & 6d" note; plus the DORSE imaging orders (001, 007,
007's unfolded edge) and the 010 head jotting from item (v).

