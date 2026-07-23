// src/data/caseLanding.ts — editorial case-landing config (dossier content).
//
// SHARED between the vite CaseLandingPage and the Next.js [caseSlug] page —
// update docket status/timelines HERE and both renderers stay in sync.
// Timeline entries and status lines are editorial content; document counts
// are derived live from content data by each renderer.

export interface TimelineEntry {
  date: string;
  event: string;
  upcoming?: boolean;
}

export interface KeyDocument {
  label: string;
  doc: string;
  date: string;
  href: string;
}

export interface CaseConfig {
  caption: string;
  court: string;
  caseNo: string;
  judge?: string;
  summary: string;
  status: string;
  deadline?: string;
  operativeHref: string;
  operativeLabel: string;
  matchTitle: string;
  timeline: TimelineEntry[];
  keyDocuments: KeyDocument[];
}

export const CASES: Record<string, CaseConfig> = {
  johnson: {
    caption: "Kirchner v. Johnson, et al.",
    court: "United States District Court for the District of Columbia",
    caseNo: "No. 1:25-cv-02735-ACR",
    judge: "Hon. Ana C. Reyes",
    summary:
      "A pro se constitutional action against the Speaker of the House, the President, the Attorney General, the FCC Chairman, the U.S. House of Representatives, Anthropic, OpenAI, Apple, Comcast, and METR — alleging coordinated constitutional violations across government and the AI industry.",
    status: "Active — motion-to-dismiss briefing underway",
    deadline:
      "All defendants moved to dismiss on July 15, 2026 — the federal defendants (Doc. 69) and the corporate defendants jointly (Doc. 70); Plaintiff’s opposition is due August 28, 2026; replies September 18, 2026.",
    operativeHref: "/kirchner-v-johnson/51",
    operativeLabel: "Read the Third Amended Complaint",
    matchTitle: "johnson",
    timeline: [
      { date: "Aug 19, 2025", event: "Complaint filed" },
      { date: "Aug 20, 2025", event: "Complaint dismissed sua sponte for standing; leave to amend" },
      { date: "Sep 29, 2025", event: "First Amended Complaint filed" },
      { date: "Jan 19, 2026", event: "Second Amended Complaint filed" },
      { date: "Mar 2–3, 2026", event: "Ten defendants served" },
      { date: "Apr 30, 2026", event: "Third Amended Complaint filed (operative pleading)" },
      { date: "May 28, 2026", event: "Status conference; motion-to-dismiss schedule set" },
      { date: "Jul 15, 2026", event: "Federal and corporate defendants’ motions to dismiss filed (Docs. 69, 70)" },
      { date: "Aug 28, 2026", event: "Plaintiff’s opposition due", upcoming: true },
    ],
    keyDocuments: [
      { label: "Third Amended Complaint (operative)", doc: "Doc. 51", date: "Apr 30, 2026", href: "/kirchner-v-johnson/51" },
      { label: "Emergency Motion for Discovery & Preservation", doc: "Doc. 55", date: "May 6, 2026", href: "/kirchner-v-johnson/55" },
      { label: "Emergency Motion for TRO — Anthropic & Comcast", doc: "Doc. 57", date: "May 7, 2026", href: "/kirchner-v-johnson/57" },
      { label: "Federal Defendants’ Motion to Dismiss", doc: "Doc. 69", date: "Jul 15, 2026", href: "/kirchner-v-johnson/69" },
      { label: "Corporate Defendants’ Joint Motion to Dismiss", doc: "Doc. 70", date: "Jul 15, 2026", href: "/kirchner-v-johnson/70" },
      { label: "Plaintiff’s Reply on Service Motions", doc: "Doc. 68", date: "Jun 18, 2026", href: "/kirchner-v-johnson/68" },
      { label: "Second Amended Complaint (superseded)", doc: "Doc. 13", date: "Jan 19, 2026", href: "/kirchner-v-johnson/13" },
    ],
  },
  ellison: {
    caption: "Kirchner v. Ellison",
    court: "United States District Court for the District of Minnesota",
    caseNo: "No. 0:26-cv-00726 · refiled No. 0:26-cv-02594",
    summary:
      "A pro se petition against Minnesota Attorney General Keith Ellison concerning state enforcement obligations under the federal constitutional framework — dismissed at the trial court and summarily affirmed on appeal; the substantive state-law claims proceed in a refiled action in the District of Minnesota.",
    status: "Active — refiled action No. 0:26-cv-02594 in motion-to-dismiss briefing; appeal No. 26-1615 summarily affirmed June 25, 2026",
    deadline:
      "The refiled action is in motion-to-dismiss briefing; Plaintiff’s opposition was filed July 8, 2026.",
    operativeHref: "/kirchner-v-ellison/1",
    operativeLabel: "Read the Petition",
    matchTitle: "ellison",
    // Chronology verified against the ECF record (docket + document stamps),
    // 2026-07-22. Dates are filing dates as stamped.
    timeline: [
      { date: "Jan 27, 2026", event: "Petition filed" },
      { date: "Jan 29, 2026", event: "Emergency motion for TRO and declaratory relief" },
      { date: "Feb 23, 2026", event: "Proceedings stayed; motion-to-dismiss schedule set" },
      { date: "Mar 9, 2026", event: "Defendant’s motion to dismiss" },
      { date: "Mar 27, 2026", event: "Amended Complaint filed" },
      { date: "Mar 30, 2026", event: "Case dismissed" },
      { date: "Mar 31, 2026", event: "Judgment entered" },
      { date: "Apr 1, 2026", event: "Notice of appeal to the Eighth Circuit" },
      { date: "Apr 2, 2026", event: "Appeal docketed — No. 26-1615" },
      { date: "May 12, 2026", event: "Opening brief filed; substantive claims refiled in the District of Minnesota — No. 0:26-cv-02594" },
      { date: "May 14, 2026", event: "Order of recusal entered in the refiled action" },
      { date: "Jun 17, 2026", event: "Defendant’s motion to dismiss the refiled action" },
      { date: "Jun 25, 2026", event: "Eighth Circuit summarily affirms the judgment — No. 26-1615" },
      { date: "Jul 8, 2026", event: "Opposition to the motion to dismiss filed" },
    ],
    keyDocuments: [
      { label: "Petition", doc: "Doc. 1", date: "Jan 27, 2026", href: "/kirchner-v-ellison/1" },
      { label: "Emergency Motion for TRO & Declaratory Relief", doc: "Doc. 6", date: "Jan 29, 2026", href: "/kirchner-v-ellison/6" },
      { label: "Order Dismissing Case", doc: "Doc. 29", date: "Mar 30, 2026", href: "/kirchner-v-ellison/29" },
      { label: "Eighth Circuit Opening Brief", doc: "No. 26-1615", date: "May 12, 2026", href: "/kirchner-v-ellison/8cir-brief" },
      { label: "Refiled Complaint (cv-02594)", doc: "Doc. 1", date: "May 12, 2026", href: "/kirchner-v-ellison/2594-1" },
    ],
  },
  acosta: {
    caption: "Kirchner v. Acosta",
    court: "United States District Court for the Southern District of Florida",
    caseNo: "No. 9:26-cv-80296-DMM",
    judge: "Hon. Donald M. Middlebrooks",
    summary:
      "A pro se action against former U.S. Attorney Alexander Acosta concerning the 2008 Epstein non-prosecution agreement and the limits of prosecutorial authority.",
    status: "Dismissed without prejudice — motion for extension of time to amend pending",
    deadline:
      "Plaintiff has moved for a 90-day extension (through September 16, 2026) to file an amended complaint, or in the alternative for voluntary dismissal without prejudice.",
    operativeHref: "/kirchner-v-acosta/1",
    operativeLabel: "Read the Petition",
    matchTitle: "acosta",
    timeline: [
      { date: "Mar 13, 2026", event: "Petition signed and mailed" },
      { date: "Mar 18, 2026", event: "Complaint filed" },
      { date: "Jun 8, 2026", event: "Complaint dismissed without prejudice (Rules 8 and 10); leave to amend" },
      { date: "Jun 24, 2026", event: "Case dismissed without prejudice; case closed" },
      { date: "Jun 30, 2026", event: "Motion for extension of time to file amended complaint (pending)" },
    ],
    keyDocuments: [
      { label: "Petition", doc: "Doc. 1", date: "Mar 18, 2026", href: "/kirchner-v-acosta/1" },
      { label: "Appendix A — Madisonian Compliance Testing", doc: "Doc. 2", date: "Mar 18, 2026", href: "/kirchner-v-acosta/2" },
      { label: "Order Dismissing Complaint", doc: "DE 13", date: "Jun 8, 2026", href: "/kirchner-v-acosta/14" },
      { label: "Order Dismissing Case", doc: "DE 14", date: "Jun 24, 2026", href: "/kirchner-v-acosta/15" },
      { label: "Motion for Extension of Time to Amend", doc: "DE 16", date: "Jun 30, 2026", href: "/kirchner-v-acosta/17" },
    ],
  },
};
