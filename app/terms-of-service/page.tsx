// app/terms-of-service/page.tsx — Terms of Service (Next renderer). Body shared with
// src/views/TermsOfService.tsx via TermsBody; rewritten 2026-09-06 (owner direction).
import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SitePageLayout } from '../_components/SitePageLayout';
import { Reveal } from '@/components/Reveal';
import { TermsBody } from '@/components/legal/TermsBody';
import { LEGAL_LINK_CLASS } from '@/components/legal/prose';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms on which lawsofexistence.com may be used: what the site provides, how its material may be used, third-party services, contributions, warranties, liability, and governing law.',
  alternates: { canonical: '/terms-of-service' },
};

export default function TermsOfService() {
  return (
    <SitePageLayout>
      <main className="container mx-auto px-4 py-12">
        <Reveal>
          <TermsBody
            renderLink={(href, children) =>
              href.startsWith('mailto:') ? (
                <a href={href} className={LEGAL_LINK_CLASS}>
                  {children}
                </a>
              ) : (
                <Link href={href} className={LEGAL_LINK_CLASS}>
                  {children}
                </Link>
              )
            }
          />
        </Reveal>
      </main>
    </SitePageLayout>
  );
}
