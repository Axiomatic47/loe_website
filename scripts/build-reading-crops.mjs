// scripts/build-reading-crops.mjs — cut the Open Readings crops from their
// source images (plan §2.2). Never hand-cut a crop: this script is the only
// writer of public/uploads/readings/<collection>/.
//
//   node scripts/build-reading-crops.mjs [--source-dir <dir>] [--collection <id>] [--no-fetch]
//
// For every item: locate the source image — first any file under --source-dir
// (or $READINGS_SOURCE_DIR) whose sha256 equals image.sha256, else the cached
// download in .cache/readings-sources/<sha>.jpg, else (unless --no-fetch) a
// fetch of image.url — VERIFY its sha256 against the export (a mismatch is
// fatal: the transcriber's regions were measured on that exact file), then
// crop `region`, upscale by `zoom` (width capped at 2400 px), and write
//   <id>.jpg         the plate image (zoom×)
//   <id>.thumb.jpg   a 2× rendition for index cards
//   crops.manifest.json  { crops: { id: { sha256, thumb_sha256, source_sha256, region, zoom, width, height } } }
// Items whose licence.republish is false are SKIPPED (no crop; link only) and
// any stale crop for them is removed. The validator cross-checks the manifest.
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'content', 'readings');
const OUT = join(ROOT, 'public', 'uploads', 'readings');
const CACHE = join(ROOT, '.cache', 'readings-sources');
const args = process.argv.slice(2);
const opt = (name, dflt) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : dflt; };
const SOURCE_DIR = opt('--source-dir', process.env.READINGS_SOURCE_DIR || '');
const ONLY = opt('--collection', '');
const NO_FETCH = args.includes('--no-fetch');
const MAX_W = 2400;

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

function indexSourceDir(dir) {
  const map = new Map();
  if (!dir || !existsSync(dir)) return map;
  const walk = (d) => {
    for (const name of readdirSync(d)) {
      const p = join(d, name);
      const st = statSync(p);
      if (st.isDirectory()) walk(p);
      else if (/\.(jpe?g|png|tiff?|webp)$/i.test(name) && st.size > 20_000) map.set(sha256(readFileSync(p)), p);
    }
  };
  walk(dir);
  return map;
}

async function getSource(item, shelf) {
  const want = item.image.sha256;
  if (shelf.has(want)) return { buf: readFileSync(shelf.get(want)), from: shelf.get(want) };
  const cached = join(CACHE, `${want}.jpg`);
  if (existsSync(cached)) return { buf: readFileSync(cached), from: cached };
  if (NO_FETCH) throw new Error(`${item.id}: source ${want.slice(0, 12)}… not on disk and --no-fetch given`);
  const res = await fetch(item.image.url);
  if (!res.ok) throw new Error(`${item.id}: fetch ${item.image.url} → HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  mkdirSync(CACHE, { recursive: true });
  writeFileSync(cached, buf);
  return { buf, from: item.image.url };
}

const shelf = indexSourceDir(SOURCE_DIR);
if (SOURCE_DIR) console.log(`source dir: ${SOURCE_DIR} — ${shelf.size} image(s) indexed`);
const files = readdirSync(DIR).filter(f => f.endsWith('.json') && !f.endsWith('.answers.json') && !f.endsWith('.meta.json'));
let cut = 0, skipped = 0;
for (const f of files) {
  const collection = f.replace(/\.json$/, '');
  if (ONLY && collection !== ONLY) continue;
  const data = JSON.parse(readFileSync(join(DIR, f), 'utf8'));
  const items = Array.isArray(data) ? data : data.items;
  const outDir = join(OUT, collection);
  mkdirSync(outDir, { recursive: true });
  const manifest = { _generated: { by: 'scripts/build-reading-crops.mjs', at: new Date().toISOString().slice(0, 10) }, crops: {} };
  for (const it of items) {
    const plate = join(outDir, `${it.id}.jpg`);
    const thumb = join(outDir, `${it.id}.thumb.jpg`);
    if (it.licence?.republish === false) {
      for (const p of [plate, thumb]) if (existsSync(p)) unlinkSync(p);
      skipped += 1;
      continue;
    }
    const { buf, from } = await getSource(it, shelf);
    const got = sha256(buf);
    if (got !== it.image.sha256) throw new Error(`${it.id}: source sha256 mismatch\n  export: ${it.image.sha256}\n  got:    ${got}\n  from:   ${from}`);
    const meta = await sharp(buf).metadata();
    const { x, y, w, h } = it.region;
    if (x + w > meta.width || y + h > meta.height) throw new Error(`${it.id}: region exceeds source ${meta.width}×${meta.height}`);
    const zoom = it.zoom || 4;
    const targetW = Math.min(Math.round(w * zoom), MAX_W);
    const plateBuf = await sharp(buf).extract({ left: x, top: y, width: w, height: h }).resize({ width: targetW, kernel: 'lanczos3' }).jpeg({ quality: 88, mozjpeg: true }).toBuffer();
    const thumbBuf = await sharp(buf).extract({ left: x, top: y, width: w, height: h }).resize({ width: Math.min(w * 2, 1200), kernel: 'lanczos3' }).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
    writeFileSync(plate, plateBuf);
    writeFileSync(thumb, thumbBuf);
    const pm = await sharp(plateBuf).metadata();
    manifest.crops[it.id] = { sha256: sha256(plateBuf), thumb_sha256: sha256(thumbBuf), source_sha256: it.image.sha256, region: it.region, zoom, width: pm.width, height: pm.height };
    cut += 1;
  }
  writeFileSync(join(outDir, 'crops.manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log(`${collection}: ${Object.keys(manifest.crops).length} crop(s) written → ${outDir}`);
}
console.log(`done — ${cut} cut, ${skipped} link-only (no crop).`);
