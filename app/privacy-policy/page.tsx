// app/privacy-policy/page.tsx — Privacy Policy (Next renderer). Body shared with
// src/views/PrivacyPolicy.tsx via PrivacyBody; rewritten 2026-09-06 (owner direction).
import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SitePageLayout } from '../_components/SitePageLayout';
import { Reveal } from '@/components/Reveal';
import { PrivacyBody } from '@/components/legal/PrivacyBody';
import { LEGAL_LINK_CLASS } from '@/components/legal/prose';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'What information lawsofexistence.com handles — hosting logs, cookieless analytics, contact-form relay, PayPal contributions, embedded video, browser storage — and your rights over it.',
  alternates: { canonical: '/privacy-policy' },
};

export default function PrivacyPolicy() {
  return (
    <SitePageLayout>
      <main className="container mx-auto px-4 py-12">
        <Reveal>
          <PrivacyBody
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
