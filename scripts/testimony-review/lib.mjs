// Shared scanning + decisions I/O for the temporary testimony curation console.
// Model: a testimony is PUBLISHED iff its directory lives under testimonies/<Set>/,
// QUEUED iff under testimony_queue/<Set> queue/. Sets pair by base name (the
// queue twin carries a trailing " queue"). Keys are location-independent:
// "<baseSet>/<dirname>".
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(__dirname, '../..');
export const PUBLISHED_ROOT = path.join(REPO_ROOT, 'testimonies');
export const QUEUE_ROOT = path.join(REPO_ROOT, 'testimony_queue');
export const DECISIONS_PATH = path.join(REPO_ROOT, '.testimony-decisions.json');

const IMAGE_RE = /\.(png|jpg|jpeg|gif|webp|svg|bmp|tiff)$/i;

export const queueDirName = (baseSet) => `${baseSet} queue`;
export const baseSetName = (dirName) => dirName.replace(/\s+queue$/i, '');

function listDirs(root) {
  if (!fs.existsSync(root)) return [];
  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
    .map((e) => e.name);
}

function walkFiles(dir, rel = '') {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const relPath = rel ? `${rel}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...walkFiles(path.join(dir, entry.name), relPath));
    else out.push(relPath);
  }
  return out;
}

function firstHeading(mdPath) {
  try {
    const text = fs.readFileSync(mdPath, 'utf-8');
    const m = text.match(/^#\s+(.+)$/m);
    return m ? m[1].trim() : null;
  } catch {
    return null;
  }
}

function scanTestimony(setPath, dirname, baseSet, location) {
  const dirPath = path.join(setPath, dirname);
  const files = walkFiles(dirPath);
  const mdFiles = files.filter((f) => f.endsWith('.md'));
  const images = files.filter((f) => IMAGE_RE.test(f));
  const title = mdFiles.length ? firstHeading(path.join(dirPath, mdFiles[0])) : null;
  return {
    key: `${baseSet}/${dirname}`,
    baseSet,
    dirname,
    location, // 'published' | 'queued'
    title: title || dirname,
    mdFiles,
    files,
    imageCount: images.length,
    // The processor only searches root + exhibits/screenshots/images/attachments/evidence;
    // flag images that would be silently skipped (e.g. the typo'd "exihibits/").
    unreachableImages: images.filter((f) => {
      const seg = f.includes('/') ? f.split('/')[0] : null;
      return seg !== null && !['exhibits', 'screenshots', 'images', 'attachments', 'evidence'].includes(seg);
    }),
  };
}

// Returns { sets: { [baseSet]: { baseSet, published: [...], queued: [...] } } }
export function scanAll() {
  const sets = {};
  const ensure = (baseSet) => {
    if (!sets[baseSet]) sets[baseSet] = { baseSet, published: [], queued: [] };
    return sets[baseSet];
  };
  for (const setDir of listDirs(PUBLISHED_ROOT)) {
    const setPath = path.join(PUBLISHED_ROOT, setDir);
    for (const t of listDirs(setPath)) {
      ensure(setDir).published.push(scanTestimony(setPath, t, setDir, 'published'));
    }
  }
  for (const setDir of listDirs(QUEUE_ROOT)) {
    const baseSet = baseSetName(setDir);
    const setPath = path.join(QUEUE_ROOT, setDir);
    for (const t of listDirs(setPath)) {
      ensure(baseSet).queued.push(scanTestimony(setPath, t, baseSet, 'queued'));
    }
  }
  return { sets };
}

export function testimonyAbsPath(t) {
  return t.location === 'published'
    ? path.join(PUBLISHED_ROOT, t.baseSet, t.dirname)
    : path.join(QUEUE_ROOT, queueDirName(t.baseSet), t.dirname);
}

export function loadDecisions() {
  try {
    return JSON.parse(fs.readFileSync(DECISIONS_PATH, 'utf-8'));
  } catch {
    return {};
  }
}

export function saveDecisions(decisions) {
  fs.writeFileSync(DECISIONS_PATH, JSON.stringify(decisions, null, 2) + '\n');
}
