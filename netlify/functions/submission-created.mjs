// netlify/functions/submission-created.mjs — Netlify runs this for every
// verified (non-spam) form submission on the site. Open-reading answers are
// queued as pending records in the private store; the owner decides on them at
// /.netlify/functions/moderate. Other forms are ignored.
import { openStore } from '../lib/readings-store.mjs';
import { FORM_NAME, toPending } from '../lib/readings-format.mjs';

export default async req => {
  let body;
  try { body = await req.json(); } catch { return new Response('bad payload', { status: 400 }); }
  const s = body?.payload;
  if (!s || s.form_name !== FORM_NAME) return new Response('ignored', { status: 200 });
  const store = await openStore();
  const rec = toPending(s);
  if (await store.get(`pending/${rec.id}`) || await store.get(`decided/${rec.id}`)) return new Response('seen', { status: 200 });
  await store.set(`pending/${rec.id}`, rec);
  return new Response('queued', { status: 200 });
};
