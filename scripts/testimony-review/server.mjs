// Temporary testimony curation console — local review server.
// Binds 127.0.0.1 ONLY. Never deployed, never imported by src/.
import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import {
  PUBLISHED_ROOT,
  QUEUE_ROOT,
  scanAll,
  testimonyAbsPath,
  loadDecisions,
  saveDecisions,
} from './lib.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 4180);

const MIME = {
  '.md': 'text/plain; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.sig': 'text/plain; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
};

const json = (res, code, body) => {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
};

// Resolve a requested file strictly inside one of the two testimony roots.
function resolveSandboxed(key, location, relFile) {
  const slash = key.indexOf('/');
  if (slash < 0) return null;
  const t = { baseSet: key.slice(0, slash), dirname: key.slice(slash + 1), location };
  const base = testimonyAbsPath(t);
  const abs = path.resolve(base, relFile);
  const roots = [PUBLISHED_ROOT, QUEUE_ROOT];
  if (!roots.some((r) => abs.startsWith(r + path.sep))) return null;
  if (!abs.startsWith(base + path.sep) && abs !== base) return null;
  return abs;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => {
      chunks.push(c);
      if (Buffer.concat(chunks).length > 1_000_000) reject(new Error('body too large'));
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);

  try {
    if (req.method === 'GET' && url.pathname === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(fs.readFileSync(path.join(__dirname, 'ui.html')));
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/state') {
      const { sets } = scanAll();
      json(res, 200, { sets, decisions: loadDecisions() });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/doc') {
      const abs = resolveSandboxed(
        url.searchParams.get('key') || '',
        url.searchParams.get('loc') || '',
        url.searchParams.get('f') || '',
      );
      if (!abs || !fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
        json(res, 404, { error: 'not found' });
        return;
      }
      const ext = path.extname(abs).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      res.end(fs.readFileSync(abs));
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/decide') {
      const { key, decision } = JSON.parse(await readBody(req));
      if (typeof key !== 'string' || !key.includes('/')) {
        json(res, 400, { error: 'bad key' });
        return;
      }
      if (!['publish', 'queue', 'remove', undefined, null].includes(decision)) {
        json(res, 400, { error: 'bad decision' });
        return;
      }
      const decisions = loadDecisions();
      if (decision) decisions[key] = decision;
      else delete decisions[key];
      saveDecisions(decisions);
      json(res, 200, { ok: true, decisions });
      return;
    }

    json(res, 404, { error: 'no such endpoint' });
  } catch (err) {
    json(res, 500, { error: String(err && err.message ? err.message : err) });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('Testimony curation console (temporary tool)');
  console.log(`  http://127.0.0.1:${PORT}`);
  console.log('  Decisions -> .testimony-decisions.json (gitignored)');
  console.log('  Apply     -> npm run testimonies:apply  (dry run; add -- --execute)');
});
