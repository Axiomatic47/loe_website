// src/views/LegalDisclaimers.tsx — Legal Notices (vite renderer). Body shared
// with app/legal-disclaimers/page.tsx via LegalNoticesBody; rewritten
// 2026-09-06 (owner direction). Route stays /legal-disclaimers.
import React from 'react';
import { Link } from 'react-router-dom';
import { PageLayout } from '@/components/PageLayout';
import { Reveal } from '@/components/Reveal';
import { LegalNoticesBody, LEGAL_LINK_CLASS } from '@/components/legal/LegalNoticesBody';

const LegalDisclaimers: React.FC = () => (
  <PageLayout>
    <main className="container mx-auto px-4 py-12">
      <Reveal>
        <LegalNoticesBody
          renderLink={(href, children) =>
            href.startsWith('mailto:') ? (
              <a href={href} className={LEGAL_LINK_CLASS}>
                {children}
              </a>
            ) : (
              <Link to={href} className={LEGAL_LINK_CLASS}>
                {children}
              </Link>
            )
          }
        />
      </Reveal>
    </main>
  </PageLayout>
);

export default LegalDisclaimers;
