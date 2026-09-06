// src/views/PrivacyPolicy.tsx — Privacy Policy (vite renderer). Body shared with
// app/privacy-policy/page.tsx via PrivacyBody; rewritten 2026-09-06 (owner direction).
import React from 'react';
import { Link } from 'react-router-dom';
import { PageLayout } from '@/components/PageLayout';
import { Reveal } from '@/components/Reveal';
import { PrivacyBody } from '@/components/legal/PrivacyBody';
import { LEGAL_LINK_CLASS } from '@/components/legal/prose';

const PrivacyPolicy: React.FC = () => (
  <PageLayout>
    <main className="container mx-auto px-4 py-12">
      <Reveal>
        <PrivacyBody
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

export default PrivacyPolicy;
