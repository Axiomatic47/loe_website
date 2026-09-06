// src/pages/Index.tsx — editorial front page
//
// Structure (owner direction 2026-08-22/23 — the articles carry the page;
// no featured case, no case strip; mirrors app/page.tsx):
//   1. Hero — plain-English statement of what this site is, two CTAs
//      (primary: the academic articles), then the rotating quote field
//      (words of others, src/data/hero-quotes.json — owner 2026-09-05)
//   2. Prynne epigraph — one quote summarizing why the originals are here
//   3. From the archives — the two Star Chamber primary-source archives
//   4. Featured works — full inline reading of the Declaration of Humanity
//      set (manuscript `featured` flags; Declaration first)

import { Link, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { FeaturedWorkSection } from "@/components/sections/FeaturedWorkSection";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { ArrowRight, ScrollText } from "lucide-react";
import { ARCHIVE_SHELF } from "@/data/homeContent";
import { HERO_QUOTES } from "@/data/heroQuotes";
import { HeroQuoteRotator } from "@/components/HeroQuoteRotator";
import { useArchiveManifest, archiveBase } from "@/views/ResearchArchive";

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

  // first-leaf thumbnails for the archive cards (owner 2026-08-29) — the
  // two archives are a fixed pair, so two hook calls, not a loop
  const stacManifest = useArchiveManifest(ARCHIVE_SHELF[0]?.id).manifest;
  const hlsManifest = useArchiveManifest(ARCHIVE_SHELF[1]?.id).manifest;
  const archiveThumb = (id: string) => {
    const m = id === ARCHIVE_SHELF[0]?.id ? stacManifest : hlsManifest;
    const leaf = m?.leaves?.[0];
    return leaf?.thumb ? `${archiveBase(id)}/${leaf.thumb}` : null;
  };

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
                marginBottom: "32px",
              }}
            >
              A unified mathematical framework for consciousness, ethics, and
              reality — and the public record, from the Star Chamber
              manuscripts of 1607 to the modern federal docket.
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
          <Reveal delay={280}>
            <HeroQuoteRotator
              quotes={HERO_QUOTES}
              className="mt-10"
              renderLink={(href, cls, children) => (
                <Link to={href} className={cls}>
                  {children}
                </Link>
              )}
            />
          </Reveal>
        </section>

        {/* --------------------------------------------- 2. Prynne epigraph */}
        <section className="max-w-4xl mx-auto mb-16">
          <Reveal>
            <figure className="text-center px-4">
              <blockquote>
                <p
                  className="font-serif italic text-foreground/90 mx-auto"
                  style={{
                    fontSize: "clamp(19px, 2.4vw, 26px)",
                    lineHeight: 1.5,
                    letterSpacing: "-0.01em",
                    maxWidth: "44rem",
                  }}
                >
                  “how unsafe it is to take Records upon trust, from the
                  reports of learned Judges, who never read nor perused their
                  originals.”
                </p>
              </blockquote>
              <figcaption className="text-sm text-muted-foreground mt-4 font-sans">
                — William Prynne (1669), Keeper of His Majesties Records in the
                Tower of London
              </figcaption>
            </figure>
          </Reveal>
        </section>

        {/* --------------------------------------- 3. From the archives */}
        <section className="max-w-4xl mx-auto mb-16">
          <Reveal>
            <Eyebrow>From the archives</Eyebrow>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ARCHIVE_SHELF.map((a, i) => (
              <Reveal key={a.id} delay={i * 80}>
                <Link
                  to={`/research/${a.id}`}
                  className="group bg-card border border-border rounded-lg p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 flex flex-col h-full"
                >
                  <div className="flex items-start gap-3">
                    <ScrollText className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div className="min-w-0">
                      <h3
                        className="font-serif text-foreground group-hover:text-primary transition-colors"
                        style={{ fontSize: "1.125rem", fontWeight: 580, letterSpacing: "-0.014em", lineHeight: 1.3 }}
                      >
                        {a.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 font-sans" style={{ fontVariantNumeric: "tabular-nums" }}>
                        {a.ref}
                        <br />
                        {a.detail}
                      </p>
                    </div>
                  </div>
                  {archiveThumb(a.id) && (
                    <div className="mt-4 rounded-md border border-border overflow-hidden bg-muted">
                      <img
                        src={archiveThumb(a.id)!}
                        alt={`${a.ref} — first leaf`}
                        loading="lazy"
                        className="w-full h-44 object-cover object-top group-hover:opacity-90 transition-opacity"
                      />
                    </div>
                  )}
                  <p className="text-sm text-foreground/85 mt-3 font-sans flex-grow">{a.blurb}</p>
                  <p className="text-sm text-primary mt-4 font-sans inline-flex items-center" style={{ fontWeight: 500 }}>
                    Read the manuscript
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ------------------------ 4. Featured works — full inline reading */}
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
