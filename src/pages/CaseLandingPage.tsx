// src/pages/CaseLandingPage.tsx — per-case landing page (dossier pattern).
//
// Mounted at the bare case URLs (/kirchner-v-johnson, /kirchner-v-ellison,
// /kirchner-v-acosta). Deep links (/:docId) continue to redirect straight into
// the section reader and are untouched.
//
// Timeline entries and status lines are editorial content — update them as the
// dockets move. Document counts are derived live from the content store.

import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { Reveal } from "@/components/Reveal";
import { useCompositionStore } from "@/utils/compositionData";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useCanonical } from "@/hooks/useCanonical";
import { sectionUrl } from "@/utils/urls";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CalendarClock, FileText, Scale } from "lucide-react";

interface TimelineEntry {
  date: string;
  event: string;
  upcoming?: boolean;
}

interface KeyDocument {
  label: string;
  doc: string;
  date: string;
  href: string;
}

interface CaseConfig {
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

const CASES: Record<string, CaseConfig> = {
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
      "A pro se petition against Minnesota Attorney General Keith Ellison concerning state enforcement obligations under the federal constitutional framework — dismissed at the trial court, now proceeding on two tracks: an appeal before the Eighth Circuit and a refiled action in the District of Minnesota.",
    status: "Two active tracks — Eighth Circuit appeal No. 26-1615; refiled action No. 0:26-cv-02594",
    deadline:
      "The refiled action is in motion-to-dismiss briefing; Plaintiff’s opposition has been filed.",
    operativeHref: "/kirchner-v-ellison/1",
    operativeLabel: "Read the Petition",
    matchTitle: "ellison",
    timeline: [
      { date: "Jan 27, 2026", event: "Petition filed" },
      { date: "Jan 29, 2026", event: "Emergency motion for TRO and declaratory relief" },
      { date: "Mar 9, 2026", event: "Defendant’s motion to dismiss" },
      { date: "Mar 27, 2026", event: "Amended Complaint filed" },
      { date: "Mar 30, 2026", event: "Case dismissed" },
      { date: "Mar 31, 2026", event: "Judgment entered" },
      { date: "Apr 1, 2026", event: "Notice of appeal to the Eighth Circuit" },
      { date: "Apr 2, 2026", event: "Appeal docketed — No. 26-1615" },
      { date: "Apr 6, 2026", event: "Opening brief filed" },
      { date: "May 13, 2026", event: "Action refiled in the District of Minnesota — No. 0:26-cv-02594" },
      { date: "May 14, 2026", event: "Order of recusal entered in the refiled action" },
    ],
    keyDocuments: [
      { label: "Petition", doc: "Doc. 1", date: "Jan 27, 2026", href: "/kirchner-v-ellison/1" },
      { label: "Emergency Motion for TRO & Declaratory Relief", doc: "Doc. 6", date: "Jan 29, 2026", href: "/kirchner-v-ellison/6" },
      { label: "Order Dismissing Case", doc: "Doc. 29", date: "Mar 30, 2026", href: "/kirchner-v-ellison/29" },
      { label: "Eighth Circuit Opening Brief", doc: "No. 26-1615", date: "Apr 6, 2026", href: "/kirchner-v-ellison/8cir-brief" },
      { label: "Refiled Complaint (cv-02594)", doc: "Doc. 1", date: "May 13, 2026", href: "/kirchner-v-ellison/2594-1" },
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

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <div
    className="text-xs uppercase tracking-[0.1em] text-muted-foreground font-sans mb-3"
    style={{ fontWeight: 600 }}
  >
    {children}
  </div>
);

const CaseLandingPage = ({ caseKey }: { caseKey: keyof typeof CASES }) => {
  const c = CASES[caseKey];
  const caseSlug = `kirchner-v-${caseKey}`;
  const navigate = useNavigate();
  const { refreshCompositions, getCaseComposition } = useCompositionStore();

  useCanonical(`/${caseSlug}`);
  useDocumentMeta(c.caption, c.summary, `/${caseSlug}`);

  useEffect(() => {
    refreshCompositions();
  }, [refreshCompositions]);

  const composition = getCaseComposition(caseSlug);
  const docCount = composition?.sections?.length || null;
  // "Browse the full docket" opens the first section's reader in canonical form.
  const docketHref =
    composition && composition.sections?.[0]
      ? sectionUrl(composition, composition.sections[0])
      : c.operativeHref;

  return (
    <PageLayout>
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back link */}
          <Reveal>
            <Link
              to="/composition/constitutional"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 font-sans"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              All cases
            </Link>
          </Reveal>

          {/* Case header */}
          <Reveal delay={60}>
            <Eyebrow>{c.court}</Eyebrow>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/15 flex-shrink-0 hidden sm:block mt-1">
                <Scale className="h-6 w-6 text-primary" />
              </div>
              <div className="min-w-0">
                <h1
                  className="font-serif text-foreground"
                  style={{
                    fontSize: "clamp(28px, 4vw, 42px)",
                    fontWeight: 580,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.1,
                  }}
                >
                  {c.caption}
                </h1>
                <p
                  className="text-sm text-muted-foreground mt-2 font-sans"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {c.caseNo}
                  {c.judge ? ` · ${c.judge}` : ""}
                  {docCount ? ` · ${docCount} documents on this site` : ""}
                </p>
              </div>
            </div>

            <p
              className="font-serif text-foreground/90 mt-6"
              style={{ fontSize: "1.0625rem", lineHeight: 1.68 }}
            >
              {c.summary}
            </p>

            {/* Status */}
            <div className="mt-6 bg-secondary border border-border border-l-2 border-l-primary rounded-md px-4 py-3">
              <div className="flex items-start gap-3">
                <CalendarClock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-foreground font-sans" style={{ fontWeight: 600 }}>
                    {c.status}
                  </p>
                  {c.deadline && (
                    <p className="text-sm text-foreground/80 font-sans mt-1">{c.deadline}</p>
                  )}
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md"
                onClick={() => navigate(c.operativeHref)}
              >
                {c.operativeLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="bg-card text-foreground border-border shadow-sm hover:shadow-md hover:bg-secondary/60"
                onClick={() => navigate(docketHref)}
              >
                Browse the full docket{docCount ? ` (${docCount} documents)` : ""}
              </Button>
            </div>
          </Reveal>

          {/* Timeline + key documents */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            <Reveal delay={120}>
              <div className="bg-card border border-border rounded-xl shadow-sm p-6 md:p-7 h-full">
                <Eyebrow>Procedural history</Eyebrow>
                <ol className="relative border-l border-border ml-1.5 space-y-5 mt-4">
                  {c.timeline.map((t, i) => (
                    <li key={i} className="ml-5">
                      <span
                        className={
                          t.upcoming
                            ? "absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full border-2 border-primary bg-card"
                            : "absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-primary"
                        }
                      />
                      <p
                        className="text-xs text-muted-foreground font-sans"
                        style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}
                      >
                        {t.date}
                        {t.upcoming && (
                          <span className="ml-2 text-primary uppercase tracking-wide text-[10px]">
                            Upcoming
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-foreground/90 font-sans mt-0.5 leading-snug">
                        {t.event}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>

            <Reveal delay={180}>
              <div className="bg-card border border-border rounded-xl shadow-sm p-6 md:p-7 h-full flex flex-col">
                <Eyebrow>Key documents</Eyebrow>
                <div className="mt-2 flex-grow">
                  {c.keyDocuments.map((d) => (
                    <Link
                      key={d.href}
                      to={d.href}
                      className="group flex items-start gap-3 rounded-md px-3 py-2.5 -mx-3 hover:bg-secondary transition-colors"
                    >
                      <FileText className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p
                          className="text-sm text-foreground group-hover:text-primary transition-colors leading-snug font-sans"
                          style={{ fontWeight: 550 }}
                        >
                          {d.label}
                        </p>
                        <p
                          className="text-xs text-muted-foreground mt-0.5 font-sans"
                          style={{ fontVariantNumeric: "tabular-nums" }}
                        >
                          {d.doc} · {d.date}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link
                  to={docketHref}
                  className="inline-flex items-center text-sm text-primary hover:text-primary/80 font-sans mt-4 pt-4 border-t border-border transition-colors"
                  style={{ fontWeight: 550 }}
                >
                  Browse the full docket
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Related cases */}
          <Reveal delay={220}>
            <div className="mt-10 pt-6 border-t border-border flex flex-wrap gap-x-7 gap-y-2">
              <span className="text-xs uppercase tracking-[0.1em] text-muted-foreground font-sans" style={{ fontWeight: 600 }}>
                Related cases
              </span>
              {Object.entries(CASES)
                .filter(([k]) => k !== caseKey)
                .map(([k, rc]) => (
                  <Link
                    key={k}
                    to={`/kirchner-v-${k}`}
                    className="text-sm text-foreground/80 hover:text-primary font-sans underline-offset-4 hover:underline transition-colors"
                    style={{ fontWeight: 500 }}
                  >
                    {rc.caption}
                  </Link>
                ))}
            </div>
          </Reveal>
        </div>
      </main>
    </PageLayout>
  );
};

export default CaseLandingPage;
