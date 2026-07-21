// app/partners/page.tsx — server port of src/views/Partners.tsx.
import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SitePageLayout } from '../_components/SitePageLayout';

export const metadata: Metadata = {
  title: 'Partners',
  alternates: { canonical: '/partners' },
};

const BlurPanel = ({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "relative rounded-lg p-8 sm:p-12",
        "bg-card",
        "border border-border",
        "shadow-xl",
        className
      )}
    >
      {children}
    </div>
  );
};

const PartnerSection = ({ title, description }: { title: string; description: string }) => (
  <div className="p-6 rounded-lg bg-card border border-border h-full">
    <h2 className="text-2xl mb-4 text-foreground">{title}</h2>
    <p className="text-muted-foreground">
      {description}
    </p>
  </div>
);

const Partners = () => {
  return (
    <SitePageLayout>
      <div className="container mx-auto px-4 py-12 flex-grow">
        <BlurPanel>
          <Button
            variant="ghost"
            className="text-foreground mb-8 hover:bg-secondary/60"
            asChild
          >
            <Link href="/">← Back to Home</Link>
          </Button>

          <h1 className="text-4xl font-serif mb-8 text-foreground">Our Partners</h1>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <PartnerSection
                title="Partner Name One"
                description="Partner One Description"
              />

              <PartnerSection
                title="Partner Name Two"
                description="Partner Two Description"
              />

              <PartnerSection
                title="Partner Name Three"
                description="Partner Three Description"
              />

              <PartnerSection
                title="Partner Name Four"
                description="Partner Four Description"
              />
            </div>
          </div>
        </BlurPanel>
      </div>
    </SitePageLayout>
  );
};

export default Partners;
