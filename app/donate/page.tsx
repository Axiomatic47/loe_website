// app/donate/page.tsx — donation page (PayPal SDK client body).
import type { Metadata } from 'next';
import { DonateBody } from './DonateBody';

export const metadata: Metadata = {
  title: 'Support the Project',
  description:
    'Support the research, development, and open-access mission of the Laws of Existence Framework.',
  alternates: { canonical: '/donate' },
};

export default function DonatePage() {
  return <DonateBody />;
}
