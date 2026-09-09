// netlify/functions/moderate.mjs — the owner's private moderation page for
// Open Readings answers. /.netlify/functions/moderate?key=<MODERATION_KEY>
//
// Publish     → the answer is written to approved/<id> in the standard format
//               and goes live at the NEXT BUILD of main (the owner's next
//               integrate, or the "Rebuild now" button if BUILD_HOOK_URL is set).
// Author only → kept privately for the owner to read; never published.
// Reject      → removed from the queue; never re-appears.
//
// Access: MODERATION_KEY — a passphrase the owner chooses (16+ characters), set in
// the Netlify dashboard as an environment variable. Opening the plain address
// shows a sign-in form; the passphrase is checked in constant time and an
// HttpOnly cookie keeps the owner signed in for 30 days. (?key= in the address
// still works for a bookmark.) The page is noindex and linked from nowhere.
//
// Optional: NETLIFY_AUTH_TOKEN (functions scope) enables "Import from Netlify
// Forms" — pulls submissions that arrived before this function existed.
import { timingSafeEqual } from 'node:crypto';
import { openStore } from '../lib/readings-store.mjs';
import { FORM_NAME, toPending, toPublished, problems, today, escapeHtml as h } from '../lib/readings-format.mjs';

const COOKIE = 'loe_moderate';

function keyMatches(cand) {
  const key = process.env.MODERATION_KEY;
  if (!key || key.length < 16 || !cand) return false;
  const a = Buffer.from(String(cand)), b = Buffer.from(key);
  return a.length === b.length && timingSafeEqual(a, b);
}

function keyOk(req) {
  const url = new URL(req.url);
  const cookie = (req.headers.get('cookie') ?? '').split(/;\s*/).find(c => c.startsWith(COOKIE + '='))?.slice(COOKIE.length + 1);
  return keyMatches(url.searchParams.get('key')) || keyMatches(cookie && decodeURIComponent(cookie));
}

const cookieHeader = () => ({ 'set-cookie': `${COOKIE}=${encodeURIComponent(process.env.MODERATION_KEY)}; Path=/.netlify/functions/moderate; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000` });

function signIn(url, failed) {
  return page('Open Readings — sign in', `<h1>Open Readings — moderation</h1><p class="sub">Enter the moderation passphrase to open the queue.</p>
${failed ? '<p class="bad">That passphrase did not match.</p>' : ''}
<form method="post" class="card" style="display:grid;gap:.75rem;max-width:28rem"><input type="hidden" name="action" value="signin">
<label>Passphrase<br><input type="password" name="passphrase" autocomplete="current-password" autofocus required style="font:inherit;width:100%;padding:.5rem .6rem;border:1px solid var(--line);border-radius:7px;background:var(--bg);color:var(--fg)"></label>
<div><button class="pub" type="submit">Sign in</button></div></form>`, failed ? 401 : 200);
}

function page(title, body, status = 200, extraHeaders = {}) {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${h(title)}</title>
<style>
:root{color-scheme:light dark;--fg:#1d1a16;--muted:#6b6459;--bg:#faf8f4;--card:#fff;--line:#e2ddd3;--ok:#2f6b3a;--warn:#8a5a12;--bad:#8a2a2a}
@media(prefers-color-scheme:dark){:root{--fg:#ebe6dc;--muted:#a39b8e;--bg:#17150f;--card:#1f1c16;--line:#3a352c;--ok:#7fc48a;--warn:#e0a94a;--bad:#e07a7a}}
body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.5 Georgia,'Times New Roman',serif}
main{max-width:52rem;margin:0 auto;padding:2rem 1.25rem 4rem}
h1{font-size:1.5rem;margin:0 0 .25rem}h2{font-size:1.1rem;margin:2rem 0 .75rem;color:var(--muted);font-weight:normal;letter-spacing:.04em;text-transform:uppercase;font-size:.8rem}
.sub{color:var(--muted);margin:0 0 1.5rem}
.card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:1rem 1.25rem;margin-bottom:1rem}
.row{display:grid;grid-template-columns:8rem 1fr;gap:.25rem 1rem;margin:.15rem 0}.k{color:var(--muted);font-size:.85rem;padding-top:.15rem}
.he{font-family:'Noto Serif Hebrew','SBL Hebrew','Times New Roman',serif;font-size:1.15rem;direction:rtl;unicode-bidi:isolate}
.priv{border-top:1px dashed var(--line);margin-top:.75rem;padding-top:.6rem;font-size:.9rem;color:var(--muted)}
.preview{border-left:3px solid var(--line);padding:.5rem .9rem;margin:.75rem 0;background:var(--bg);border-radius:0 8px 8px 0}
.preview .who{font-weight:600}.preview .when{color:var(--muted);float:right;font-size:.85rem}
.actions{display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.9rem}
button{font:inherit;padding:.45rem .95rem;border-radius:7px;border:1px solid var(--line);background:var(--card);color:var(--fg);cursor:pointer}
button.pub{border-color:var(--ok);color:var(--ok);font-weight:600}button.rej{border-color:var(--bad);color:var(--bad)}button:focus-visible{outline:2px solid var(--fg);outline-offset:2px}
.warn{color:var(--warn)}.bad{color:var(--bad)}.ok{color:var(--ok)}.empty{color:var(--muted);font-style:italic}
.flash{background:var(--card);border:1px solid var(--ok);color:var(--ok);border-radius:8px;padding:.6rem 1rem;margin-bottom:1rem}
small{color:var(--muted)}
</style></head><body><main>${body}</main></body></html>`;
  return new Response(html, { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow', ...extraHeaders } });
}

function renderPending(p) {
  const probs = problems(p);
  const pub = toPublished(p);
  const authorOnly = p.publish_choice === 'author_only';
  const preview = `<div class="preview"><span class="when">${h(pub.published)}</span><span class="who">${h(pub.reader.display)}</span>${pub.reader.credentials_summary ? ` <small>· ${h(pub.reader.credentials_summary)}</small>` : ''}<br>Reading <b>${h(pub.letter)}</b>${pub.reading ? ` — <span class="he">${h(pub.reading)}</span>` : ''}${pub.note ? `<div>${h(pub.note)}</div>` : ''}${pub.ack ? '' : '<div><small>Not to be acknowledged by name.</small></div>'}</div>`;
  return `<div class="card">
<div class="row"><span class="k">Item</span><span><a href="/research/${h(p.collection)}/readings/${h(p.item_id)}">${h(p.collection)} / ${h(p.item_id)}</a></span></div>
<div class="row"><span class="k">Received</span><span>${h(p.created.replace('T', ' ').slice(0, 16))} UTC</span></div>
<div class="row"><span class="k">Wishes</span><span>${authorOnly ? '<b class="warn">Author only</b> — must not be published' : 'May be published'} · acknowledgement ${p.ack_consent ? 'yes' : 'no'}${p.anonymous ? ' · asked for anonymity' : ''}</span></div>
${probs.filter(x => !x.startsWith('the reader asked')).map(x => `<div class="row"><span class="k bad">Problem</span><span class="bad">${h(x)}</span></div>`).join('')}
<div class="row"><span class="k">As it publishes</span><span>${preview}</span></div>
<div class="priv">Private, never published — name as written: ${h(p.name) || '<i>none</i>'} · credentials: ${h(p.credentials) || '<i>none</i>'}${p.credentials && !p.credentials_public ? ' (not for publication)' : ''} · contact: ${h(p.contact) || (p.no_contact ? '<i>asked not to be contacted</i>' : '<i>none</i>')}</div>
<form method="post" class="actions"><input type="hidden" name="id" value="${h(p.id)}">
${probs.length ? '' : '<button class="pub" name="decision" value="publish">Publish at next build</button>'}
<button name="decision" value="author_only">Author only</button>
<button class="rej" name="decision" value="reject">Reject</button></form></div>`;
}

function renderApproved(a) {
  return `<div class="card"><div class="preview"><span class="when">${h(a.published)}</span><span class="who">${h(a.reader.display)}</span>${a.reader.credentials_summary ? ` <small>· ${h(a.reader.credentials_summary)}</small>` : ''}<br><a href="/research/${h(a.collection)}/readings/${h(a.item_id)}">${h(a.item_id)}</a> · Reading <b>${h(a.letter)}</b>${a.reading ? ` — <span class="he">${h(a.reading)}</span>` : ''}${a.note ? `<div>${h(a.note)}</div>` : ''}</div>
<form method="post" class="actions"><input type="hidden" name="id" value="${h(a.id)}"><button class="rej" name="decision" value="withdraw">Withdraw</button> <small>Withdrawing before the build keeps it off the site; after the build the page keeps the answer until the next build.</small></form></div>`;
}

async function importFromForms(store) {
  const token = process.env.NETLIFY_AUTH_TOKEN, siteId = process.env.SITE_ID;
  if (!token || !siteId) return 'import is not configured (NETLIFY_AUTH_TOKEN + SITE_ID)';
  const api = async p => { const r = await fetch(`https://api.netlify.com/api/v1${p}`, { headers: { Authorization: `Bearer ${token}` } }); if (!r.ok) throw new Error(`${p} → ${r.status}`); return r.json(); };
  const forms = await api(`/sites/${siteId}/forms`);
  const form = forms.find(f => f.name === FORM_NAME);
  if (!form) return `no form named ${FORM_NAME} on this site`;
  const subs = await api(`/forms/${form.id}/submissions?per_page=100`);
  let n = 0;
  for (const s of subs) {
    const id = String(s.id);
    if (await store.get(`pending/${id}`) || await store.get(`decided/${id}`)) continue;
    await store.set(`pending/${id}`, toPending(s));
    n += 1;
  }
  return `imported ${n} submission(s) from Netlify Forms`;
}

export default async req => {
  const url = new URL(req.url);
  if (!process.env.MODERATION_KEY || process.env.MODERATION_KEY.length < 16) return page('Not configured', '<h1>Moderation is not configured</h1><p class="sub">Set MODERATION_KEY (16+ random characters) as a functions environment variable in the Netlify dashboard, then redeploy.</p>', 503);
  if (!keyOk(req)) {
    if (req.method === 'POST') {
      const form = await req.formData();
      if (form.get('action') === 'signin' && keyMatches(form.get('passphrase'))) return new Response(null, { status: 303, headers: { location: url.pathname, ...cookieHeader() } });
      await new Promise(r => setTimeout(r, 800)); // slow down guessing
      return signIn(url, true);
    }
    return signIn(url, false);
  }
  const store = await openStore();
  const setCookie = url.searchParams.get('key') ? cookieHeader() : {};
  let flash = '';

  if (req.method === 'POST') {
    const form = await req.formData();
    const action = form.get('action');
    if (action === 'import') flash = await importFromForms(store);
    else if (action === 'rebuild') {
      if (!process.env.BUILD_HOOK_URL) flash = 'no BUILD_HOOK_URL configured';
      else { const r = await fetch(process.env.BUILD_HOOK_URL, { method: 'POST' }); flash = r.ok ? 'Rebuild requested — approved answers publish when it finishes (a few minutes).' : `build hook → ${r.status}`; }
    } else {
      const id = String(form.get('id') ?? '').replace(/[^A-Za-z0-9_-]/g, '');
      const decision = String(form.get('decision') ?? '');
      if (decision === 'withdraw') {
        const a = await store.get(`approved/${id}`);
        if (a) { await store.del(`approved/${id}`); await store.set(`decided/${id}`, { decision: 'withdrawn', date: today(), item_id: a.item_id }); flash = `Withdrawn: ${a.item_id}.`; }
      } else {
        const p = await store.get(`pending/${id}`);
        if (!p) flash = 'That submission is no longer pending.';
        else if (decision === 'publish') {
          const probs = problems(p);
          if (probs.length) flash = `Not published: ${probs.join('; ')}.`;
          else {
            await store.set(`approved/${id}`, { ...toPublished(p), collection: p.collection });
            await store.set(`decided/${id}`, { decision: 'published', date: today(), item_id: p.item_id });
            await store.del(`pending/${id}`);
            flash = `Approved: ${p.item_id}, reading ${p.letter}. It publishes at the next build of main.`;
          }
        } else if (decision === 'author_only' || decision === 'reject') {
          if (decision === 'author_only') await store.set(`author-only/${id}`, p);
          await store.set(`decided/${id}`, { decision: decision === 'reject' ? 'rejected' : 'author_only', date: today(), item_id: p.item_id });
          await store.del(`pending/${id}`);
          flash = decision === 'reject' ? `Rejected: ${p.item_id}.` : `Kept for the author only: ${p.item_id}.`;
        }
      }
    }
    // redirect so a refresh never repeats the decision
    return new Response(null, { status: 303, headers: { location: url.pathname + (flash ? `?m=${encodeURIComponent(flash)}` : ''), ...setCookie } });
  }

  const pending = (await Promise.all((await store.list('pending/')).map(k => store.get(k)))).filter(Boolean).sort((a, b) => a.created.localeCompare(b.created));
  const approved = (await Promise.all((await store.list('approved/')).map(k => store.get(k)))).filter(Boolean).sort((a, b) => a.published.localeCompare(b.published));
  const authorOnly = await store.list('author-only/');
  const m = url.searchParams.get('m');
  const body = `<h1>Open Readings — moderation</h1><p class="sub">Publish queues an answer for the next build of main; nothing goes live until that build finishes. The reader's contact stays on this page and in the Netlify dashboard.</p>
${m ? `<div class="flash">${h(m)}</div>` : ''}
<h2>Waiting for a decision (${pending.length})</h2>
${pending.length ? pending.map(renderPending).join('') : '<p class="empty">Nothing waiting.</p>'}
<h2>Approved, publishing at the next build (${approved.length})</h2>
${approved.length ? approved.map(renderApproved).join('') : '<p class="empty">Nothing queued.</p>'}
<form method="post" class="actions">${process.env.BUILD_HOOK_URL ? '<button name="action" value="rebuild">Rebuild now</button>' : '<small>Set BUILD_HOOK_URL to add a “Rebuild now” button; otherwise the next integrate publishes.</small>'}
${process.env.NETLIFY_AUTH_TOKEN ? '<button name="action" value="import">Import from Netlify Forms</button>' : ''}</form>
${authorOnly.length ? `<h2>Kept for the author only (${authorOnly.length})</h2><p class="empty">${authorOnly.length} answer(s) held privately; read them in the store or the Netlify dashboard.</p>` : ''}`;
  return page('Open Readings — moderation', body, 200, setCookie);
};

export const config = { path: '/.netlify/functions/moderate' };
