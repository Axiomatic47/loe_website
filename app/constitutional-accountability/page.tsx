// app/constitutional-accountability/page.tsx — Constitutional Authority Map.
// Reads public/data/constitutional-authority-map.json at build time (the vite
// side fetches the same file at runtime) and hands it to the interactive
// client body.
import fs from 'fs';
import path from 'path';
import type { Metadata } from 'next';
import type { ConstitutionalAuthorityMap } from '@/data/constitutionalAuthority';
import { AccountabilityBody } from './AccountabilityBody';

export const metadata: Metadata = {
  title: 'Constitutional Accountability',
  description:
    'Interactive Constitutional Authority Map based on the Madisonian Separation of Powers Compliance Framework.',
  alternates: { canonical: '/constitutional-accountability' },
};

export default function ConstitutionalAccountabilityPage() {
  const data = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), 'public', 'data', 'constitutional-authority-map.json'),
      'utf-8'
    )
  ) as ConstitutionalAuthorityMap;

  return <AccountabilityBody data={data} />;
}
