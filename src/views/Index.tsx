// src/pages/Index.tsx — editorial front page
//
// Structure:
//   1. Hero — plain-English statement of what this site is, two CTAs
//   2. Featured case dossier — Kirchner v. Johnson (operative pleading, deadlines)
//   3. Three-case status strip
//   4. Featured work — full inline reading (CMS `featured` flags, same as ever:
//      Declaration of Humanity first via featured_order)
//
// Case status lines are editorial content: update them as the dockets move.
// Document counts are derived live from the content store.

import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { FeaturedWorkSection } from "@/components/sections/FeaturedWorkSection";
import { Reveal } from "@/components/Reveal";
import { useCompositionStore } from "@/utils/compositionData";
import { Button } from "@/components/ui/button";
import { ArrowRight, Scale, CalendarClock } from "lucide-react";
// Case registry (manual status lines) lives in src/data/homeContent.ts,
// shared with the Next.js home — update docket status THERE.
import { FEATURED_CASE, CASE_STRIP } from "@/data/homeContent";

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <div
    className="text-xs uppercase tracking-[0.1em] text-muted-foreground font-sans mb-3"
    style={{ fontWeight: 600 }}
  >
    {children}
  </div>
);

const Index = () => {
  const navigate = useNavigate();
  const { constitutional, loadCollections } = useCompositionStore();

  useEffect(() => {
    loadCollections(['constitutional']);
  }, [loadCollections]);

  // Live document count across the three cases
  const totalCaseDocs = constitutional.reduce(
    (sum, c) => sum + (c.sections?.length || 0),
    0
  );
  const docCountFor = (match: string) =>
    constitutional.find((c) => c.title.toLowerCase().includes(match))?.sections
      ?.length || null;

  return (
    <PageLayout>
      <main className="container mx-auto px-4 py-12">
        {/* ------------------------------------------------ 1. Hero */}
        <section className="max-w-4xl mx-auto text-center pt-8 pb-16">
          <Reveal>
            <Eyebrow>A public legal record</Eyebrow>
          </Reveal>
          <Reveal delay={70}>
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
          </Reveal>
          <Reveal delay={140}>
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
          </Reveal>
          <Reveal delay={210}>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md"
                onClick={() => navigate(FEATURED_CASE.operativeHref)}
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
          </Reveal>
        </section>

        {/* ------------------------------------- 2. Featured case dossier */}
        <section className="max-w-4xl mx-auto mb-16">
          <Reveal>
            <Eyebrow>Featured case</Eyebrow>
            <div className="bg-card border border-border rounded-xl shadow-sm p-8 md:p-10">
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
                  <p className="text-sm text-muted-foreground mt-1 font-sans" style={{ fontVariantNumeric: "tabular-nums" }}>
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

              <div className="mt-5 bg-secondary border border-border border-l-2 border-l-primary rounded-md px-4 py-3 flex items-start gap-3">
                <CalendarClock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-foreground/85 font-sans">{FEATURED_CASE.deadline}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Button
                  className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md"
                  onClick={() => navigate(FEATURED_CASE.operativeHref)}
                >
                  Read the complaint
                </Button>
                <Button
                  variant="outline"
                  className="bg-card text-foreground border-border shadow-sm hover:shadow-md hover:bg-secondary/60"
                  onClick={() => navigate(FEATURED_CASE.href)}
                >
                  Case overview
                </Button>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ------------------------------------------ 3. Three-case strip */}
        <section className="max-w-4xl mx-auto mb-20">
          <Reveal>
            <Eyebrow>The cases</Eyebrow>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CASE_STRIP.map((c, i) => (
              <Reveal key={c.caseNo} delay={i * 80}>
                <Link
                  to={c.href}
                  className="group bg-card border border-border rounded-lg p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 flex flex-col h-full"
                >
                  <h3
                    className="font-serif text-foreground group-hover:text-primary transition-colors"
                    style={{ fontSize: "1.125rem", fontWeight: 580, letterSpacing: "-0.014em", lineHeight: 1.3 }}
                  >
                    {c.caption}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1.5 font-sans" style={{ fontVariantNumeric: "tabular-nums" }}>
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
              </Reveal>
            ))}
          </div>
        </section>

        {/* ------------------------- 4. Featured work — full inline reading */}
        <section className="mb-8">
          <Reveal>
            <div className="max-w-4xl mx-auto">
              <Eyebrow>Featured research &amp; evidence</Eyebrow>
            </div>
          </Reveal>
          <FeaturedWorkSection />
        </section>
      </main>
    </PageLayout>
  );
};

export default Index;
