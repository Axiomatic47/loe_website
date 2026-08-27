// src/components/Reveal.tsx — layout wrapper, ANIMATION RETIRED.
//
// This was a fade-up-on-scroll entrance (opacity + 12px rise per section).
// Owner direction 2026-08-26: the scroll-linked "expansion" is exaggerated
// and should be gone — content simply renders. The component and its props
// survive so the ~50 call sites across both renderers need no churn; `delay`
// is accepted and ignored.

import React from 'react';

interface RevealProps {
  children: React.ReactNode;
  /** ignored — kept for call-site compatibility with the retired animation */
  delay?: number;
  className?: string;
}

export const Reveal: React.FC<RevealProps> = ({ children, className }) => (
  <div className={className}>{children}</div>
);

export default Reveal;
