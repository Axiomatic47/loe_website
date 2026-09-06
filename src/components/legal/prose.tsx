// src/components/legal/prose.tsx — shared primitives for the three legal
// pages (Legal Notices, Terms of Service, Privacy Policy). Reading typography
// per DESIGN.md: Source Serif 4 body at 430, Inter eyebrows. Both renderers
// import these; pages pass a renderLink so react-router and next/link each
// supply their own client-side link.
import React from 'react';

export type RenderLink = (href: string, children: React.ReactNode) => React.ReactNode;

export const LEGAL_CONTACT_EMAIL = 'contact@lawsofexistence.com';
export const LEGAL_LINK_CLASS =
  'text-primary underline underline-offset-4 decoration-primary/40 hover:decoration-primary transition-colors';

export const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <div
    className="text-xs uppercase tracking-[0.1em] text-muted-foreground font-sans mb-3"
    style={{ fontWeight: 600 }}
  >
    {children}
  </div>
);

export const H1 = ({ children }: { children: React.ReactNode }) => (
  <h1
    className="font-serif text-foreground"
    style={{ fontSize: 'clamp(30px, 4.5vw, 44px)', fontWeight: 580, letterSpacing: '-0.02em', lineHeight: 1.1 }}
  >
    {children}
  </h1>
);

export const Updated = ({ date }: { date: string }) => (
  <p className="text-sm text-muted-foreground mt-4 mb-8 font-sans">Last updated {date}</p>
);

export const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2
    className="font-serif text-foreground mt-12 mb-4"
    style={{ fontSize: '1.5rem', fontWeight: 580, letterSpacing: '-0.018em', lineHeight: 1.2 }}
  >
    {children}
  </h2>
);

export const P = ({ children }: { children: React.ReactNode }) => (
  <p className="font-serif text-foreground/90 mb-4" style={{ fontSize: '1.0625rem', lineHeight: 1.72, fontWeight: 430 }}>
    {children}
  </p>
);

export const UL = ({ children }: { children: React.ReactNode }) => (
  <ul
    className="font-serif text-foreground/90 mb-4 list-disc pl-6 space-y-1.5"
    style={{ fontSize: '1.0625rem', lineHeight: 1.6, fontWeight: 430 }}
  >
    {children}
  </ul>
);

/** Page shell used by all three legal pages: eyebrow, title, date, body. */
export const LegalPage = ({
  eyebrow,
  title,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  children: React.ReactNode;
}) => (
  <div className="max-w-3xl mx-auto">
    <Eyebrow>{eyebrow}</Eyebrow>
    <H1>{title}</H1>
    <Updated date={updated} />
    {children}
  </div>
);
