// app/for-journalists/page.tsx — press reference page (server port of
// src/views/ForJournalists.tsx).
// Strictly factual: case numbers, courts, statuses, document links, and contact.
// Everything here is independently verifiable on PACER / the courts' dockets.

import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { ArrowRight, FileText, Mail, Scale } from "lucide-react";
import { SitePageLayout } from "../_components/SitePageLayout";

export const metadata: Metadata = {
  title: "For Journalists",
  description:
    "Case numbers, courts, filed documents, and press contact for the Kirchner federal constitutional litigation.",
  alternates: { canonical: "/for-journalists" },
};

const MATTERS = [
  {
    caption: "Kirchner v. Johnson, et al.",
    court: "U.S. District Court, D.D.C. (Hon. Ana C. Reyes)",
    caseNo: "1:25-cv-02735-ACR",
    status: "Active — motions to dismiss due Jul 15, 2026; opposition due Aug 28, 2026",
    operative: { label: "Third Amended Complaint (Doc. 51)", href: "/kirchner-v-johnson/51" },
    landing: "/kirchner-v-johnson",
  },
  {
    caption: "Kirchner v. Ellison",
    court: "U.S. District Court, D. Minn. / U.S. Court of Appeals, 8th Cir.",
    caseNo: "0:26-cv-00726 · appeal 26-1615 · refiled 0:26-cv-02594",
    status: "Refiled action in motion-to-dismiss briefing; appeal summarily affirmed June 25, 2026",
    operative: { label: "Petition (Doc. 1)", href: "/kirchner-v-ellison/1" },
    landing: "/kirchner-v-ellison",
  },
  {
    caption: "Kirchner v. Acosta",
    court: "U.S. District Court, S.D. Fla. (Hon. Donald M. Middlebrooks)",
    caseNo: "9:26-cv-80296-DMM",
    status: "Dismissed without prejudice; motion for extension to amend pending",
    operative: { label: "Petition (Doc. 1)", href: "/kirchner-v-acosta/1" },
    landing: "/kirchner-v-acosta",
  },
  {
    caption: "Amicus — Trump v. Barbara",
    court: "Supreme Court of the United States",
    caseNo: "Nos. 25-364, 25-365",
    status: "Amicus curiae brief mailed to the Clerk March 19, 2026",
    operative: { label: "Amicus Curiae Brief", href: "/scotus-amicus" },
    landing: "/scotus-amicus",
  },
];

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <div
    className="text-xs uppercase tracking-[0.1em] text-muted-foreground font-sans mb-3"
    style={{ fontWeight: 600 }}
  >
    {children}
  </div>
);

const ForJournalists = () => {
  return (
    <SitePageLayout>
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <Eyebrow>Press reference</Eyebrow>
            <h1
              className="font-serif text-foreground"
              style={{ fontSize: "clamp(30px, 4.5vw, 44px)", fontWeight: 580, letterSpacing: "-0.02em", lineHeight: 1.1 }}
            >
              For Journalists
            </h1>
            <p className="font-serif text-foreground/90 mt-5" style={{ fontSize: "1.0625rem", lineHeight: 1.68 }}>
              Joseph Kirchner, a pro se plaintiff, is litigating three federal
              constitutional cases — against the Speaker of the House, the
              President, the Attorney General, the FCC Chairman, the U.S. House
              of Representatives, and the AI companies Anthropic, OpenAI, Apple,
              Comcast, and METR — alleging coordinated constitutional violations
              across government and the AI industry. This site publishes the
              filed record in full. Every document here is the as-filed version
              and can be verified independently against the courts’ dockets.
            </p>
          </Reveal>

          {/* Matters table */}
          <Reveal delay={80}>
            <div className="mt-10">
              <Eyebrow>The matters</Eyebrow>
              <div className="space-y-4">
                {MATTERS.map((m) => (
                  <div key={m.caseNo} className="bg-card border border-border rounded-xl shadow-sm p-5 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={m.landing}
                          className="font-serif text-foreground hover:text-primary transition-colors"
                          style={{ fontSize: "1.25rem", fontWeight: 580, letterSpacing: "-0.014em" }}
                        >
                          {m.caption}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1 font-sans" style={{ fontVariantNumeric: "tabular-nums" }}>
                          {m.court} · {m.caseNo}
                        </p>
                        <p className="text-sm text-foreground/85 mt-2 font-sans">{m.status}</p>
                      </div>
                      <Link
                        href={m.operative.href}
                        className="inline-flex items-center text-sm text-primary hover:text-primary/80 font-sans flex-shrink-0 transition-colors"
                        style={{ fontWeight: 550 }}
                      >
                        <FileText className="h-4 w-4 mr-1.5" />
                        {m.operative.label}
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Verify independently */}
          <Reveal delay={140}>
            <div className="mt-10 bg-secondary border border-border border-l-2 border-l-primary rounded-md px-5 py-4">
              <div className="flex items-start gap-3">
                <Scale className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                <div className="text-sm text-foreground/85 font-sans leading-relaxed">
                  <span style={{ fontWeight: 600 }}>Verify independently.</span>{" "}
                  All district-court filings are available on PACER under the
                  case numbers above (D.D.C., D. Minn., S.D. Fla.); the appeal
                  is docketed with the Eighth Circuit as No. 26-1615. Documents
                  published on this site carry their ECF headers, so page-level
                  comparison against the official record is straightforward.
                </div>
              </div>
            </div>
          </Reveal>

          {/* Background & contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            <Reveal delay={200}>
              <div className="bg-card border border-border rounded-xl shadow-sm p-6 h-full">
                <Eyebrow>Background material</Eyebrow>
                <ul className="space-y-3 mt-2 text-sm font-sans">
                  <li>
                    <Link href="/composition/manuscript" className="text-primary hover:text-primary/80 transition-colors" style={{ fontWeight: 550 }}>
                      The research framework
                    </Link>
                    <span className="text-muted-foreground"> — the Laws of Existence manuscripts underlying the litigation</span>
                  </li>
                  <li>
                    <Link href="/composition/data" className="text-primary hover:text-primary/80 transition-colors" style={{ fontWeight: 550 }}>
                      Evidence collections
                    </Link>
                    <span className="text-muted-foreground"> — AI system testimonies, forensic documentation, simulations</span>
                  </li>
                  <li>
                    <Link href="/scotus-shadow-docket" className="text-primary hover:text-primary/80 transition-colors" style={{ fontWeight: 550 }}>
                      SCOTUS Shadow Docket archive
                    </Link>
                    <span className="text-muted-foreground"> — emergency-docket research, 1952–present</span>
                  </li>
                  <li>
                    <Link href="/videos" className="text-primary hover:text-primary/80 transition-colors" style={{ fontWeight: 550 }}>
                      Video evidence
                    </Link>
                    <span className="text-muted-foreground"> — screen recordings of documented system behavior</span>
                  </li>
                </ul>
              </div>
            </Reveal>

            <Reveal delay={260}>
              <div className="bg-card border border-border rounded-xl shadow-sm p-6 h-full">
                <Eyebrow>Press contact</Eyebrow>
                <div className="flex items-start gap-3 mt-2">
                  <Mail className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                  <div className="text-sm font-sans leading-relaxed">
                    <a
                      href="mailto:contact@lawsofexistence.com"
                      className="text-primary hover:text-primary/80 transition-colors"
                      style={{ fontWeight: 550 }}
                    >
                      contact@lawsofexistence.com
                    </a>
                    <p className="text-muted-foreground mt-2">
                      Interview requests, document questions, and verification
                      inquiries welcome. Plaintiff is pro se; all statements are
                      his own. Please reference the case number in your subject
                      line.
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </main>
    </SitePageLayout>
  );
};

export default ForJournalists;
