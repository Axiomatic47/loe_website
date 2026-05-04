// src/pages/Index.tsx

import { HeroButtons } from "@/components/hero/HeroButtons";
import { FeaturedWorkSection } from "@/components/sections/FeaturedWorkSection";
import { PageLayout } from "@/components/PageLayout";
import { cn } from "@/lib/utils";

const HeroPanel = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "relative rounded-2xl bg-card border border-border shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
};

const Index = () => {
  return (
    <PageLayout>
      <main className="container mx-auto px-4 py-16 flex-grow">
        <div className="text-center mb-24">
          <HeroPanel className="p-8 sm:p-12 mb-16 max-w-5xl mx-auto">
            <div className="text-foreground">
              <h1
                className="font-serif"
                style={{
                  fontSize: 'clamp(36px, 6vw, 64px)',
                  lineHeight: '1.05',
                  marginBottom: '24px',
                  letterSpacing: '-0.022em',
                  fontWeight: 580,
                }}
              >
                The Laws of Existence
              </h1>
              <p
                className="text-muted-foreground font-serif"
                style={{
                  fontSize: 'clamp(18px, 2.2vw, 24px)',
                  maxWidth: '800px',
                  margin: '0 auto',
                  marginBottom: '32px',
                  lineHeight: '1.45',
                }}
              >
                A Unified Mathematical Framework for Consciousness, Ethics, and Reality
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mt-8">
                <HeroButtons />
              </div>
            </div>
          </HeroPanel>
        </div>

        <FeaturedWorkSection />
      </main>
    </PageLayout>
  );
};

export default Index;