// app/timeline/page.tsx — Conception Timeline. Events are read from
// content/timeline at build time (the vite side globs the same files),
// normalized and date-sorted here, then handed to the interactive body.
import type { Metadata } from 'next';
import { getTimelineEvents } from '@/lib/content-manifest';
import { normalizeTimelineEvent, getSampleTimelineData } from './timeline-data';
import { TimelineBody } from './TimelineBody';

export const metadata: Metadata = {
  title: 'Conception Timeline',
  description: 'First Documented Human-AI Consciousness Collaboration',
  alternates: { canonical: '/timeline' },
};

export default function TimelinePage() {
  const events = getTimelineEvents().map(normalizeTimelineEvent);
  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return <TimelineBody events={events.length ? events : getSampleTimelineData()} />;
}
