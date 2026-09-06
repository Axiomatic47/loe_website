// app/legal-disclaimers/page.tsx — Legal Notices (Next renderer). Body shared
// with src/views/LegalDisclaimers.tsx via LegalNoticesBody; rewritten
// 2026-09-06 (owner direction). Route stays /legal-disclaimers.
import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SitePageLayout } from '../_components/SitePageLayout';
import { Reveal } from '@/components/Reveal';
import { LegalNoticesBody, LEGAL_LINK_CLASS } from '@/components/legal/LegalNoticesBody';

export const metadata: Metadata = {
  title: 'Legal Notices',
  description:
    'What lawsofexistence.com is, where its court documents, archive reproductions, writings, and testimony records come from, and how they may be read and reused.',
  alternates: { canonical: '/legal-disclaimers' },
};

export default function LegalDisclaimers() {
  return (
    <SitePageLayout>
      <main className="container mx-auto px-4 py-12">
        <Reveal>
          <LegalNoticesBody
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
