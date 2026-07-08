// src/pages/Index.tsx — editorial front page
//
// Replaces the former stacked-PDF homepage. Structure:
//   1. Hero — plain-English statement of what this site is, two CTAs
//   2. Featured case dossier — Kirchner v. Johnson (operative pleading, deadlines)
//   3. Three-case status strip
//   4. Featured work — compact link cards (no embedded PDF viewers)
//   5. Explore — quiet links to the feature pages
//
// Case status lines are editorial content: update them as the dockets move.
// Document counts are derived live from the content store.

import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { useCompositionStore } from "@/utils/compositionData";
import { Button } from "@/components/ui/button";
import { ArrowRight, Scale, CalendarClock } from "lucide-react";

// ---------------------------------------------------------------------------
// Case registry (manual status lines — keep current with the dockets)
// ---------------------------------------------------------------------------
const FEATURED_CASE = {
  caption: "Kirchner v. Johnson, et al.",
  court: "United States District Court for the District of Columbia",
  caseNo: "No. 1:25-cv-02735-ACR",
  judge: "Hon. Ana C. Reyes",
  defendants:
    "the Speaker of the House, the President, the Attorney General, the FCC Chairman, the U.S. House of Representatives, Anthropic, OpenAI, Apple, Comcast, and METR",
  operative: "Third Amended Complaint (Doc. 51), filed April 30, 2026",
  deadline:
    "Defendants’ motions to dismiss are due July 15, 2026; Plaintiff’s opposition is due August 28, 2026.",
  href: "/kirchner-v-johnson",
  browseHref: "/composition/constitutional/composition/3/section/1",
};

const CASE_STRIP = [
  {
    caption: "Kirchner v. Johnson, et al.",
    court: "U.S. District Court, D.D.C.",
    caseNo: "1:25-cv-02735-ACR",
    status: "Active — motion-to-dismiss briefing underway",
    href: "/kirchner-v-johnson",
    matchTitle: "johnson",
  },
  {
    caption: "Kirchner v. Ellison",
    court: "U.S. District Court, D. Minn.",
    caseNo: "0:26-cv-00726",
    status: "On appeal — Eighth Circuit No. 26-1615",
    href: "/kirchner-v-ellison",
    matchTitle: "ellison",
  },
  {
    caption: "Kirchner v. Acosta",
    court: "U.S. District Court, S.D. Fla.",
    caseNo: "9:26-cv-80296-DMM",
    status: "Dismissed without prejudice — motion to amend pending",
    href: "/kirchner-v-acosta",
    matchTitle: "acosta",
  },
];

const EXPLORE_LINKS = [
  { label: "Research", href: "/composition/manuscript" },
  { label: "Evidence", href: "/composition/data" },
  { label: "Video Evidence", href: "/videos" },
  { label: "Copyright Notifications", href: "/composition/copyright" },
  { label: "SCOTUS Shadow Docket", href: "/scotus-shadow-docket" },
  { label: "Constitutional Accountability", href: "/constitutional-accountability" },
  { label: "Timeline", href: "/timeline" },
  { label: "World Map", href: "/worldmap" },
];

const COLLECTION_LABELS: Record<string, string> = {
  manuscript: "Research",
  data: "Evidence",
  timeline: "Timeline",
  map: "World Map",
  copyright: "Copyright",
};

// Strip markdown syntax for plain-text preview snippets
const toSnippet = (md: string, max = 180): string => {
  const text = md
    .replace(/^#{1,6}\s.*$/gm, "")
    .replace(/[*_`>#\[\]]/g, "")
    .replace(/\(https?:[^)]*\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? text.slice(0, max).replace(/\s\S*$/, "") + "…" : text;
};

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <div
    className="text-xs uppercase tracking-[0.08em] text-muted-foreground font-sans mb-3"
    style={{ fontWeight: 600 }}
  >
    {children}
  </div>
);

const Index = () => {
  const navigate = useNavigate();
  const { manuscript, data, constitutional, timeline, map, refreshCompositions } =
    useCompositionStore();

  useEffect(() => {
    refreshCompositions();
  }, [refreshCompositions]);

  // Live document count across the three cases
  const totalCaseDocs = constitutional.reduce(
    (sum, c) => sum + (c.sections?.length || 0),
    0
  );
  const docCountFor = (match: string) =>
    constitutional.find((c) => c.title.toLowerCase().includes(match))?.sections
      ?.length || null;

  // Featured work: explicitly-featured sections from the non-case collections
  // (the cases have their own dossier above). Same flag logic as before.
  const featuredWork = (() => {
    const items: {
      title: string;
      collection: string;
      snippet: string;
      href: string;
      order: number;
    }[] = [];
    const collect = (comps: typeof manuscript, collection: string) => {
      comps.forEach((comp, compIndex) => {
        const anySectionFeatured = comp.sections?.some((s) => Boolean(s.featured));
        comp.sections?.forEach((section, sectionIndex) => {
          const show = section.featured || (comp.featured && !anySectionFeatured);
          if (!show) return;
          // Prefer the curated description, but skip verification/file boilerplate
          const desc = section.description || "";
          const descIsBoilerplate = /cryptographic verification|\.sig\b|^file:/i.test(desc);
          items.push({
            title: section.title,
            collection: COLLECTION_LABELS[collection] || collection,
            snippet:
              (!descIsBoilerplate && desc) ||
              toSnippet(section.content_level_3 || section.content_level_1 || ""),
            href: `/composition/${collection}/composition/${compIndex + 1}/section/${sectionIndex + 1}`,
            order: section.featured_order ?? 999,
          });
        });
      });
    };
    collect(manuscript, "manuscript");
    collect(data, "data");
    collect(timeline, "timeline");
    collect(map, "map");
    return items.sort((a, b) => a.order - b.order);
  })();

  return (
    <PageLayout>
      <main className="container mx-auto px-4 py-12">
        {/* ------------------------------------------------ 1. Hero */}
        <section className="max-w-4xl mx-auto text-center pt-8 pb-16">
          <Eyebrow>A public legal record</Eyebrow>
          <h1
            className="font-serif text-foreground"
            style={{
              fontSize: "clamp(36px, 5.5vw, 60px)",
              lineHeight: 1.05,
              letterSpacing: "-0.022em",
              fontWeight: 580,
              marginBottom: "20px",
            }}
          >
            The Laws of Existence
          </h1>
          <p
            className="font-serif text-muted-foreground mx-auto"
            style={{
              fontSize: "clamp(17px, 2vw, 21px)",
              lineHeight: 1.55,
              maxWidth: "46rem",
              marginBottom: "12px",
            }}
          >
            A unified mathematical framework for consciousness, ethics, and
            reality — and the public record of the federal constitutional
            litigation brought by its author, Joseph Kirchner.
          </p>
          <p className="text-sm text-muted-foreground/80 mb-8 font-sans">
            Three federal cases{totalCaseDocs > 0 ? ` · ${totalCaseDocs} court documents` : ""} · published for
            journalists, attorneys, and the public
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md"
              onClick={() => navigate(FEATURED_CASE.href)}
            >
              Read the operative complaint
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-card text-foreground border-border shadow-sm hover:shadow-md hover:bg-secondary/60"
              onClick={() => navigate("/composition/manuscript")}
            >
              Explore the research
            </Button>
          </div>
        </section>

        {/* ------------------------------------- 2. Featured case dossier */}
        <section className="max-w-4xl mx-auto mb-16">
          <Eyebrow>Featured case</Eyebrow>
          <div className="bg-card border border-border rounded-2xl shadow-sm p-8 md:p-10">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/15 flex-shrink-0 hidden sm:block">
                <Scale className="h-6 w-6 text-primary" />
              </div>
              <div className="min-w-0">
                <h2
                  className="font-serif text-foreground"
                  style={{ fontSize: "1.75rem", fontWeight: 580, letterSpacing: "-0.018em", lineHeight: 1.2 }}
                >
                  {FEATURED_CASE.caption}
                </h2>
                <p className="text-sm text-muted-foreground mt-1 font-sans">
                  {FEATURED_CASE.court} · {FEATURED_CASE.caseNo} · {FEATURED_CASE.judge}
                </p>
              </div>
            </div>

            <p className="font-serif text-foreground/90 mt-5" style={{ fontSize: "1.0625rem", lineHeight: 1.65 }}>
              A pro se constitutional action against {FEATURED_CASE.defendants} —
              alleging coordinated constitutional violations across government and
              the AI industry.
            </p>

            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-5 text-sm text-muted-foreground font-sans">
              <span>
                <span className="text-foreground/85" style={{ fontWeight: 600 }}>Operative pleading:</span>{" "}
                {FEATURED_CASE.operative}
              </span>
              {docCountFor("johnson") && (
                <span>
                  <span className="text-foreground/85" style={{ fontWeight: 600 }}>Docket on this site:</span>{" "}
                  {docCountFor("johnson")} documents
                </span>
              )}
            </div>

            <div className="mt-5 bg-secondary border border-border border-l-2 border-l-primary rounded-lg px-4 py-3 flex items-start gap-3">
              <CalendarClock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-foreground/85 font-sans">{FEATURED_CASE.deadline}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md"
                onClick={() => navigate(FEATURED_CASE.href)}
              >
                Read the complaint
              </Button>
              <Button
                variant="outline"
                className="bg-card text-foreground border-border shadow-sm hover:shadow-md hover:bg-secondary/60"
                onClick={() => navigate("/composition/constitutional")}
              >
                All constitutional challenges
              </Button>
            </div>
          </div>
        </section>

        {/* ------------------------------------------ 3. Three-case strip */}
        <section className="max-w-4xl mx-auto mb-20">
          <Eyebrow>The cases</Eyebrow>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CASE_STRIP.map((c) => (
              <Link
                key={c.caseNo}
                to={c.href}
                className="group bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 flex flex-col"
              >
                <h3
                  className="font-serif text-foreground group-hover:text-primary transition-colors"
                  style={{ fontSize: "1.125rem", fontWeight: 580, letterSpacing: "-0.014em", lineHeight: 1.3 }}
                >
                  {c.caption}
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5 font-sans">
                  {c.court}
                  <br />
                  {c.caseNo}
                </p>
                <p className="text-sm text-foreground/85 mt-3 font-sans flex-grow">{c.status}</p>
                <p className="text-sm text-primary mt-4 font-sans inline-flex items-center" style={{ fontWeight: 500 }}>
                  {docCountFor(c.matchTitle)
                    ? `${docCountFor(c.matchTitle)} documents`
                    : "View documents"}
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* --------------------------------------------- 4. Featured work */}
        {featuredWork.length > 0 && (
          <section className="max-w-4xl mx-auto mb-20">
            <Eyebrow>Featured research &amp; evidence</Eyebrow>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featuredWork.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="group bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 flex flex-col"
                >
                  <div
                    className="text-[11px] uppercase tracking-[0.08em] text-primary font-sans mb-2"
                    style={{ fontWeight: 600 }}
                  >
                    {item.collection}
                  </div>
                  <h3
                    className="font-serif text-foreground group-hover:text-primary transition-colors"
                    style={{ fontSize: "1.1875rem", fontWeight: 580, letterSpacing: "-0.014em", lineHeight: 1.3 }}
                  >
                    {item.title}
                  </h3>
                  {item.snippet && (
                    <p className="text-sm text-muted-foreground mt-2.5 leading-relaxed font-sans line-clamp-3 flex-grow">
                      {item.snippet}
                    </p>
                  )}
                  <p className="text-sm text-primary mt-4 font-sans inline-flex items-center" style={{ fontWeight: 500 }}>
                    Read
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* -------------------------------------------------- 5. Explore */}
        <section className="max-w-4xl mx-auto pb-8">
          <div className="border-t border-border pt-8">
            <Eyebrow>Explore</Eyebrow>
            <div className="flex flex-wrap gap-x-7 gap-y-3">
              {EXPLORE_LINKS.map((l) => (
                <Link
                  key={l.href}
                  to={l.href}
                  className="text-sm text-foreground/80 hover:text-primary font-sans underline-offset-4 hover:underline transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </PageLayout>
  );
};

export default Index;
