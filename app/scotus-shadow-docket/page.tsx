// app/scotus-shadow-docket/page.tsx — SCOTUS Shadow Docket archive.
// Reads both public/scotus-cases indexes at build (the vite side fetches
// the same files at runtime; missing index → null, matching its `if ok`
// guards) and hands them to the interactive sidebar/PDF-viewer body.
import fs from 'fs';
import path from 'path';
import type { Metadata } from 'next';
import { ShadowDocketBody } from './ShadowDocketBody';

export const metadata: Metadata = {
  title: 'SCOTUS Shadow Docket',
  description:
    'Supreme Court emergency-docket research archive, 1952–present: case law and statistical analysis.',
  alternates: { canonical: '/scotus-shadow-docket' },
};

function readJsonIfExists(rel: string) {
  const p = path.join(process.cwd(), 'public', 'scotus-cases', rel);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

export default function SCOTUSShadowDocketPage() {
  return (
    <ShadowDocketBody
      index={readJsonIfExists('index.json')}
      analysisIndex={readJsonIfExists('analysis-index.json')}
    />
  );
}
