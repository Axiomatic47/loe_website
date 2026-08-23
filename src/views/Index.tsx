// src/pages/Index.tsx — editorial front page
//
// Structure (owner direction 2026-08-22/23 — the articles carry the page;
// no featured case, no case strip; mirrors app/page.tsx):
//   1. Hero — plain-English statement of what this site is, two CTAs
//      (primary: the academic articles)
//   2. Featured works — full inline reading of the Declaration of Humanity
//      set (manuscript `featured` flags; Declaration first)
//
// Document counts are derived live from the content store.

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { FeaturedWorkSection } from "@/components/sections/FeaturedWorkSection";
import { Reveal } from "@/components/Reveal";
import { useCompositionStore } from "@/utils/compositionData";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

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

  // Live document count across the three cases (hero line)
  const totalCaseDocs = constitutional.reduce(
    (sum, c) => sum + (c.sections?.length || 0),
    0
  );

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
                onClick={() => navigate("/composition/manuscript")}
              >
                Explore the academic articles
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-card text-foreground border-border shadow-sm hover:shadow-md hover:bg-secondary/60"
                onClick={() => navigate("/composition/constitutional")}
              >
                The litigation record
              </Button>
            </div>
          </Reveal>
        </section>

        {/* ------------------------ 2. Featured works — full inline reading */}
        <section className="mb-8">
          <Reveal>
            <div className="max-w-4xl mx-auto">
              <Eyebrow>Featured works</Eyebrow>
            </div>
          </Reveal>
          <FeaturedWorkSection />
        </section>
      </main>
    </PageLayout>
  );
};

export default Index;
