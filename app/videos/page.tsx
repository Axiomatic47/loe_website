// app/videos/page.tsx — video evidence gallery. The body is fully
// interactive (category filter, inline player), so it lives in the
// VideosBody client island; this wrapper owns the route metadata.
import type { Metadata } from 'next';
import { VideosBody } from './VideosBody';

export const metadata: Metadata = {
  title: 'Video Evidence',
  description: 'Screen recordings documenting AI system behavior and targeting',
  alternates: { canonical: '/videos' },
};

export default function VideosPage() {
  return <VideosBody />;
}
