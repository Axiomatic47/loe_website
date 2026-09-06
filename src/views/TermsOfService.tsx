// src/views/TermsOfService.tsx — Terms of Service (vite renderer). Body shared with
// app/terms-of-service/page.tsx via TermsBody; rewritten 2026-09-06 (owner direction).
import React from 'react';
import { Link } from 'react-router-dom';
import { PageLayout } from '@/components/PageLayout';
import { Reveal } from '@/components/Reveal';
import { TermsBody } from '@/components/legal/TermsBody';
import { LEGAL_LINK_CLASS } from '@/components/legal/prose';

const TermsOfService: React.FC = () => (
  <PageLayout>
    <main className="container mx-auto px-4 py-12">
      <Reveal>
        <TermsBody
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

export default TermsOfService;
