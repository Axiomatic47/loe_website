// Shared scanning + decisions I/O for the temporary testimony curation console.
// Model: a testimony is PUBLISHED iff its directory lives under testimonies/<Set>/,
// QUEUED iff under testimony_queue/<Set> queue/ (tracked, parked), and INBOX
// iff under Chronological Testimonies/ — the gitignored 4.6 GB local staging
// copy of the chronological corpus. Inbox items are flat (no set level); their
// baseSet is a month bucket derived from the MMDDYY dirname prefix, which is
// also the set they publish into. Sets pair by base name (the queue twin
// carries a trailing " queue"). Keys are location-independent:
// "<baseSet>/<dirname>".
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(__dirname, '../..');
export const PUBLISHED_ROOT = path.join(REPO_ROOT, 'testimonies');
export const QUEUE_ROOT = path.join(REPO_ROOT, 'testimony_queue');
export const INBOX_ROOT = path.join(REPO_ROOT, 'Chronological Testimonies');
export const DECISIONS_PATH = path.join(REPO_ROOT, '.testimony-decisions.json');

const IMAGE_RE = /\.(png|jpg|jpeg|gif|webp|svg|bmp|tiff)$/i;

export const queueDirName = (baseSet) => `${baseSet} queue`;
export const baseSetName = (dirName) => dirName.replace(/\s+queue$/i, '');

// "041525_ChatGPT_..." / "041425 LOE_..." -> "Chronological Testimonies 0425"
export function monthBucketSet(dirname) {
  const m = dirname.match(/^(\d{2})\d{2}(\d{2})[\s_]/);
  return m ? `Chronological Testimonies ${m[1]}${m[2]}` : 'Chronological Testimonies Undated';
}

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
    location, // 'published' | 'queued' | 'inbox'
    title: title || dirname,
    mdFiles,
    files,
    imageCount: images.length,
    // The processor reads only TOP-LEVEL .md files; a dir whose markdown is
    // all nested (mnt/data dumps, Original/) renders an empty section unless
    // a primary md is hoisted at publish time.
    hasRootMd: mdFiles.some((f) => !f.includes('/')),
    // The processor only searches root + exhibits/screenshots/images/attachments/evidence;
    // flag images that would be silently skipped (e.g. the typo'd "exihibits/").
    unreachableImages: images.filter((f) => {
      const seg = f.includes('/') ? f.split('/')[0] : null;
      return seg !== null && !['exhibits', 'screenshots', 'images', 'attachments', 'evidence'].includes(seg);
    }),
  };
}

// Returns { sets: { [baseSet]: { baseSet, published: [...], queued: [...], inbox: [...] } } }
export function scanAll() {
  const sets = {};
  const ensure = (baseSet) => {
    if (!sets[baseSet]) sets[baseSet] = { baseSet, published: [], queued: [], inbox: [] };
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
  // Inbox is flat: each dir is a testimony; its month bucket is its target set.
  for (const t of listDirs(INBOX_ROOT)) {
    const baseSet = monthBucketSet(t);
    ensure(baseSet).inbox.push(scanTestimony(INBOX_ROOT, t, baseSet, 'inbox'));
  }
  return { sets };
}

export function testimonyAbsPath(t) {
  if (t.location === 'published') return path.join(PUBLISHED_ROOT, t.baseSet, t.dirname);
  if (t.location === 'inbox') return path.join(INBOX_ROOT, t.dirname);
  return path.join(QUEUE_ROOT, queueDirName(t.baseSet), t.dirname);
}

// State file: { decisions: {key: 'publish'|'queue'|'remove'}, primaries: {key: relMdPath} }
// (migrates transparently from the earlier flat {key: decision} shape).
export function loadState() {
  try {
    const raw = JSON.parse(fs.readFileSync(DECISIONS_PATH, 'utf-8'));
    if (raw && typeof raw === 'object' && !raw.decisions && !raw.primaries) {
      return { decisions: raw, primaries: {} };
    }
    return { decisions: raw.decisions || {}, primaries: raw.primaries || {} };
  } catch {
    return { decisions: {}, primaries: {} };
  }
}

export function saveState(state) {
  fs.writeFileSync(DECISIONS_PATH, JSON.stringify(state, null, 2) + '\n');
}
