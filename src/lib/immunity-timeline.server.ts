// src/lib/immunity-timeline.server.ts — build-time loader for /research/immunity-timeline. The one file is
// public/research/immunity-timeline.json (served as the copy a reader can take). Absent → null, and the page answers
// 404: the route exists only when the reviewed content does. IMMUNITY_TIMELINE_JSON points the loader at another file
// for a local build against a draft; it is ignored under CI/NETLIFY, where only the committed file counts.
import fs from 'node:fs';
import path from 'node:path';
import type { ImmunityTimeline } from './immunity-timeline';
import { sortEntries } from './immunity-timeline';

const FILE = path.join(process.cwd(), 'public', 'research', 'immunity-timeline.json');

export function timelinePath(): string {
  const override = process.env.IMMUNITY_TIMELINE_JSON;
  // the tracer cannot see the guard above: a bare path.resolve(override) made Next's output tracing sweep the WHOLE
  // project into the Netlify server handler (1.7 GB — testimonies/, testimony_queue/, every root file; the deploy of
  // main@49564cc died uploading it, 2026-10-16). The hints here and on the fs calls below keep the loader out of the
  // trace altogether: the page is prerendered and the JSON sits under public/, which the handler never reads.
  if (override && !process.env.NETLIFY && !process.env.CI) return path.resolve(/* turbopackIgnore: true */ override);
  return FILE;
}

export function hasImmunityTimeline(): boolean {
  return fs.existsSync(/* turbopackIgnore: true */ timelinePath());
}

export function loadImmunityTimeline(): ImmunityTimeline | null {
  const p = timelinePath();
  if (!fs.existsSync(/* turbopackIgnore: true */ p)) return null;
  const raw = JSON.parse(fs.readFileSync(/* turbopackIgnore: true */ p, 'utf-8')) as ImmunityTimeline;
  return { ...raw, entries: sortEntries(raw.entries ?? []) };
}
