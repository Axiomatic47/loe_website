// netlify/lib/readings-store.mjs — the private queue behind Open Readings.
//
// One key-value store, four prefixes:
//   pending/<id>     a reader's submission as received (INCLUDES contact — private, like the dashboard)
//   approved/<id>    the published entry in the standard format (NO contact) — folded into
//                    content/readings/<collection>.answers.json by scripts/pull-reading-answers.mjs
//                    at the next build of main
//   decided/<id>     {decision, date, item_id} — what the owner decided and when
//   author-only/<id> the full record of an answer the owner may read but must not publish
//
// WHERE IT LIVES
//   In a Netlify function: Netlify Blobs, ALWAYS. @netlify/blobs configures itself from
//   the function environment; if that fails the error is rethrown with a plain message so
//   it shows in the function log. (An earlier version fell back to a local directory here,
//   which inside a read-only function bundle failed silently — submissions were lost.)
//   In a Netlify build: Blobs via NETLIFY_BLOBS_CONTEXT, else SITE_ID + NETLIFY_AUTH_TOKEN,
//   else a WARNING and an empty local store (nothing publishes that build).
//   Anywhere else (local dev/tests): .cache/readings-store/ as JSON files.

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const STORE_NAME = 'open-readings';
const LOCAL_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '.cache', 'readings-store');

export const inFunction = () => Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY_BLOBS_CONTEXT || globalThis.netlifyBlobsContext || process.env.NETLIFY_DEV);
export const inBuild = () => process.env.NETLIFY === 'true' && !inFunction();

async function blobStore() {
  const { getStore } = await import('@netlify/blobs');
  if (process.env.NETLIFY_BLOBS_CONTEXT || globalThis.netlifyBlobsContext || inFunction()) {
    // functions: let the client read its own environment (env var or injected context)
    if (!inFunction() || process.env.NETLIFY_BLOBS_CONTEXT || globalThis.netlifyBlobsContext) return getStore(STORE_NAME);
    try { return getStore(STORE_NAME); } catch (e) {
      if (process.env.SITE_ID && process.env.NETLIFY_AUTH_TOKEN) return getStore({ name: STORE_NAME, siteID: process.env.SITE_ID, token: process.env.NETLIFY_AUTH_TOKEN });
      throw new Error(`Netlify Blobs is not configured for this function (${e.message}). Set SITE_ID + NETLIFY_AUTH_TOKEN in the Functions scope as a fallback.`);
    }
  }
  if (process.env.SITE_ID && process.env.NETLIFY_AUTH_TOKEN) return getStore({ name: STORE_NAME, siteID: process.env.SITE_ID, token: process.env.NETLIFY_AUTH_TOKEN });
  return null;
}

function wrapBlobs(s) {
  return {
    kind: 'blobs',
    async get(key) { return (await s.get(key, { type: 'json' })) ?? null; },
    async set(key, obj) { await s.setJSON(key, obj); },
    async del(key) { await s.delete(key); },
    async list(prefix) { const { blobs } = await s.list({ prefix }); return blobs.map(b => b.key); },
  };
}

function localStore(dir = LOCAL_DIR, readonly = false) {
  const file = key => join(dir, key.replace(/\//g, '__') + '.json');
  return {
    kind: readonly ? 'local-empty' : `local:${dir}`,
    async get(key) { return !readonly && existsSync(file(key)) ? JSON.parse(readFileSync(file(key), 'utf8')) : null; },
    async set(key, obj) { if (readonly) throw new Error('store is read-only here'); mkdirSync(dir, { recursive: true }); writeFileSync(file(key), JSON.stringify(obj, null, 2) + '\n'); },
    async del(key) { if (!readonly) rmSync(file(key), { force: true }); },
    async list(prefix) {
      if (readonly || !existsSync(dir)) return [];
      const p = prefix.replace(/\//g, '__');
      return readdirSync(dir).filter(f => f.startsWith(p) && f.endsWith('.json')).map(f => f.slice(0, -5).replace(/__/g, '/')).sort();
    },
  };
}

/** returns { kind, get(key), set(key, obj), del(key), list(prefix) → keys[] } */
export async function openStore() {
  if (inFunction()) {
    const s = await blobStore(); // throws with a plain message if unconfigured — never a silent local fallback in a function
    return wrapBlobs(s);
  }
  if (inBuild()) {
    const s = await blobStore();
    if (s) return wrapBlobs(s);
    console.warn('readings-store: WARNING — Netlify build without Blobs access (no NETLIFY_BLOBS_CONTEXT, no SITE_ID+NETLIFY_AUTH_TOKEN). Approved answers are NOT available to this build.');
    return localStore(LOCAL_DIR, true);
  }
  return localStore();
}
