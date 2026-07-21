// app/research/manifest-server.ts — build-time manifest reader for the
// research-archive pages (the vite views fetch the same JSON at runtime).
import fs from 'fs';
import path from 'path';
import type { ArchiveManifest } from '@/lib/research-archive';

export function readArchiveManifest(id: string): ArchiveManifest | null {
  const p = path.join(process.cwd(), 'public', 'uploads', 'research', id, 'manifest.json');
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf-8')) as ArchiveManifest;
}
