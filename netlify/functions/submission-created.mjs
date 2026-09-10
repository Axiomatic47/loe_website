// netlify/functions/submission-created.mjs — Netlify runs this for every
// VERIFIED (non-spam) form submission on the site (filename convention, still
// fully supported per the Netlify docs; the body is {payload: {id, created_at,
// form_name, data}}). Open-reading answers are queued as pending records in the
// private store; the owner decides on them at /admin/readings. Other forms are
// ignored. Errors are logged and returned as 500 so they show in the function
// log instead of vanishing.
import { openStore } from '../lib/readings-store.mjs';
import { FORM_NAME, toPending } from '../lib/readings-format.mjs';

export default async req => {
  let body;
  try { body = await req.json(); } catch { return new Response('bad payload', { status: 400 }); }
  const s = body?.payload ?? (body?.form_name ? body : null);
  if (!s || s.form_name !== FORM_NAME) return new Response('ignored', { status: 200 });
  try {
    const store = await openStore();
    const rec = toPending(s);
    if (await store.get(`pending/${rec.id}`) || await store.get(`decided/${rec.id}`)) return new Response('seen', { status: 200 });
    await store.set(`pending/${rec.id}`, rec);
    console.log(`submission-created: queued ${rec.id} for ${rec.collection}/${rec.item_id}`);
    return new Response('queued', { status: 200 });
  } catch (e) {
    console.error(`submission-created: FAILED to queue ${s.id}: ${e.message}`);
    return new Response(`store error: ${e.message}`, { status: 500 });
  }
};
