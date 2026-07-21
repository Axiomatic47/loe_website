// app/individuals-metrics/page.tsx — Individual Supremacism Metrics
// (interactive explorer; sample data lives in the client body).
import type { Metadata } from 'next';
import { MetricsBody } from './MetricsBody';

export const metadata: Metadata = {
  title: 'Individual Supremacism Metrics',
  description:
    'Tracking and analysis of individual leaders using the Supremacist Characterization Framework.',
  alternates: { canonical: '/individuals-metrics' },
};

export default function IndividualsMetricsPage() {
  return <MetricsBody />;
}
