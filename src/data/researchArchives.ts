// src/data/researchArchives.ts — UI configuration for the unlisted primary-source
// research archives published under /research/:archiveId.
//
// Each archive's files are synced from work_station by `npm run sync-archives`
// (scripts/sync-archives.mjs) into public/uploads/research/<id>/, alongside a
// manifest.json the pages consume. This file holds the presentation copy only.
// Intro paragraphs are rendered as markdown (italics for case names etc.).

export interface ResearchArchiveConfig {
  id: string; // slug + uploads directory name
  ref: string; // archival reference, shown in the H1
  caseTitle: string; // e.g. "Lloyd v. Barker (Star Chamber, 1607)" — italicized case name
  leafLabel: string; // "Membrane" | "Folio"
  source: string;
  dated: string;
  intro: string[]; // markdown paragraphs
}

export const RESEARCH_ARCHIVES: Record<string, ResearchArchiveConfig> = {
  "stac-8-203-38": {
    id: "stac-8-203-38",
    ref: "STAC 8/203/38",
    caseTitle: "*Lloyd v. Barker* (Star Chamber, 1607)",
    leafLabel: "Membrane",
    source:
      "The National Archives (UK), Kew — series STAC 8 (Star Chamber Proceedings, James I)",
    dated: "Trinity term, 5 Jac. I (1607)",
    intro: [
      "This is the working record of a first-hand diplomatic transcription of **STAC 8/203/38** — the Star Chamber examinations, interrogatories, answer, and depositions arising from the proceedings against Justice Barker and others, the factual matrix behind *Floyd v. Barker*, 12 Co. Rep. 23 (1607), the foundation of judicial immunity doctrine. The file self-dates to Trinity term, 5 Jac. I; the TNA catalogue styles the cause *Lloyde v. Lewys*, the leaf-001 caption styles it *Lloyd v. Barker & others*, and the membrane-009 endorsement reads *ad sect[am] Barker* — the three styling strata are themselves an open research question.",
    ],
  },
  "hls-ms149-floyd": {
    id: "hls-ms149-floyd",
    ref: "HLS MS 149, ff. 81r–83v",
    caseTitle: "*Floyd v. Barker* — the second account (Star Chamber, 1607)",
    leafLabel: "Folio",
    source:
      "Harvard Law School Library, Historical & Special Collections — Star Chamber Collection, 1607–1623 (HLS MS 149; digitization funded by the Ames Foundation for Legal History)",
    dated: "Pasch. 5 Jac. I (1607) · this copy in a later seventeenth-century hand",
    intro: [
      "These folios carry the “second account with supplementary details” of *Floyd v. Barker* (Star Chamber, Pasch. 5 Jac. I, 1607) — a contemporaneously compiled collection of Jacobean Star Chamber reports, **independent of Coke's printed report** (12 Co. Rep. 23, 77 Eng. Rep. 1305), cited at K.J. Kesselring, *Conspiracy, Crime, and Conflict in the Court of Star Chamber*, 43 Law & Hist. Rev. 693, 705 n.47 (2025). The *Floyd* report runs ff. 81r–83r; f. 83v opens the next term (*Brooke v. Oldfield*), confirming the report's end.",
      "Images were retrieved 2026-06-10 from the Harvard Library IIIF Image API (manifest `URN-3:HLS.LIBR:29137268`), at 2400-pixel width, and are hash-recorded below. The corroborating Star Chamber file — TNA **STAC 8/203/38**, transcribed in [the companion archive](/research/stac-8-203-38) — independently confirms the parties, the sheriff, the packed grand jury, and the missing bill.",
    ],
  },
};
