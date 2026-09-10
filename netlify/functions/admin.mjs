// netlify/functions/admin.mjs — the owner's console at /admin (owner word
// 2026-09-09). Sign-in is OpenID Connect against Auth0 (netlify/lib/admin-auth.mjs);
// only e-mails in ADMIN_EMAILS get a session. Pages: home, /admin/readings
// (Open Readings queue), /admin/rebuild (build hook), /admin/logout.
// Optional emergency passphrase (MODERATION_KEY) on the sign-in page — delete
// the variable to retire it.
import { timingSafeEqual } from 'node:crypto';
import { authConfig, session, csrfToken, csrfOk, beginLogin, completeLogin, logoutLocation, logoutCookies, sign, SESSION_COOKIE } from '../lib/admin-auth.mjs';
import { page, redirect, flashFrom } from '../lib/admin-ui.mjs';
import { handleReadings, readingsCounts } from '../lib/readings-moderation.mjs';
import { escapeHtml as h } from '../lib/readings-format.mjs';

const origin = url => `https://${process.env.ADMIN_HOST || url.host}`;

function passphraseOk(given) {
  const key = process.env.MODERATION_KEY;
  if (!key || key.length < 16 || !given) return false;
  const a = Buffer.from(String(given)), b = Buffer.from(key);
  return a.length === b.length && timingSafeEqual(a, b);
}

function signInPage(cfg, url) {
  const configured = cfg.missing.length === 0;
  const body = `<h1>Laws of Existence — console</h1><p class="sub">Sign in to moderate Open Readings answers and manage the site.</p>
${configured ? '<p><a class="btn pub" href="/admin/login">Sign in</a></p>' : `<div class="card"><b class="warn">Auth0 sign-in is not configured.</b><br><small>Missing: ${h(cfg.missing.join(', '))}. Set them as environment variables in the Netlify dashboard and redeploy.</small></div>`}
${process.env.MODERATION_KEY ? `<details style="margin-top:2rem"><summary><small>Emergency passphrase</small></summary><form method="post" action="/admin/passphrase" class="card" style="display:grid;gap:.75rem;max-width:28rem;margin-top:.75rem"><label>Passphrase<br><input type="password" name="passphrase" autocomplete="current-password" required></label><div><button type="submit">Sign in</button></div></form></details>` : ''}`;
  return page({ title: 'Console — sign in', body, ...flashFrom(url) });
}

async function home(url, sess, csrf) {
  const c = await readingsCounts();
  const body = `<h1>Console</h1><p class="sub">Signed in as ${h(sess.email)}. Sessions last eight hours.</p>
<p><small>Queue store: ${h(String(c.store))} · Netlify Forms sync: ${process.env.NETLIFY_AUTH_TOKEN && process.env.SITE_ID ? 'on' : 'off'} · Build hook: ${process.env.BUILD_HOOK_URL ? 'set' : 'not set'}</small></p>
<div class="grid">
<div class="card"><div class="n">${c.pending}</div>Open Readings answers waiting<br><a class="btn" style="margin-top:.6rem" href="/admin/readings">Open the queue</a></div>
<div class="card"><div class="n">${c.approved}</div>Approved, publishing at the next build${process.env.BUILD_HOOK_URL ? `<form method="post" action="/admin/rebuild" style="margin-top:.6rem"><input type="hidden" name="csrf" value="${h(csrf)}"><button name="action" value="rebuild">Rebuild now</button></form>` : '<br><small>Publishes with the next integrate.</small>'}</div>
</div>`;
  return page({ title: 'Console', body, sess, ...flashFrom(url) });
}

export default async req => {
  const url = new URL(req.url);
  const cfg = authConfig();
  const path = url.pathname.replace(/\/+$/, '') || '/admin';
  const callbackUri = `${origin(url)}/admin/callback`;

  // --- sign-in flow (no session needed)
  if (path === '/admin/login') {
    if (cfg.missing.length) return redirect('/admin', { flash: `Not configured: ${cfg.missing.join(', ')}`, bad: true });
    const { location, cookie } = beginLogin(cfg, callbackUri);
    return new Response(null, { status: 302, headers: { location, 'set-cookie': cookie, 'cache-control': 'no-store' } });
  }
  if (path === '/admin/callback') {
    if (cfg.missing.length) return redirect('/admin', { flash: 'Not configured.', bad: true });
    const r = await completeLogin(cfg, req, callbackUri);
    if (r.error) return page({ title: 'Sign-in failed', body: `<h1>Sign-in failed</h1><p class="sub">${h(r.error)}</p><p><a class="btn" href="/admin">Back</a></p>`, status: r.status || 401 });
    return redirect('/admin', { cookies: r.cookies, flash: `Signed in as ${r.session.email}.` });
  }
  if (path === '/admin/passphrase' && req.method === 'POST') {
    const form = await req.formData();
    if (!passphraseOk(form.get('passphrase'))) { await new Promise(r => setTimeout(r, 800)); return redirect('/admin', { flash: 'That passphrase did not match.', bad: true }); }
    const iat = Math.floor(Date.now() / 1000);
    const sess = { email: 'passphrase', name: 'emergency passphrase', iat, exp: iat + 4 * 3600 };
    const secretCfg = cfg.clientSecret ? cfg : { clientSecret: process.env.MODERATION_KEY };
    return redirect('/admin', { cookies: [`${SESSION_COOKIE}=${encodeURIComponent(sign(secretCfg, sess))}; Path=/admin; HttpOnly; Secure; SameSite=Lax; Max-Age=14400`], flash: 'Signed in with the emergency passphrase.' });
  }
  if (path === '/admin/logout') {
    const hs = new Headers({ location: cfg.missing.length ? '/admin' : logoutLocation(cfg, `${origin(url)}/admin`), 'cache-control': 'no-store' });
    for (const c of logoutCookies()) hs.append('set-cookie', c);
    return new Response(null, { status: 303, headers: hs });
  }

  // --- everything else needs a session
  const sess = session(req, cfg) || (process.env.MODERATION_KEY && !cfg.clientSecret ? session(req, { clientSecret: process.env.MODERATION_KEY }) : null);
  if (!sess) return path === '/admin' ? signInPage(cfg, url) : redirect('/admin', { flash: 'Please sign in.', bad: true });
  const keyCfg = cfg.clientSecret ? cfg : { clientSecret: process.env.MODERATION_KEY };
  const ctx = { sess, csrf: csrfToken(keyCfg, sess), csrfOk: given => csrfOk(keyCfg, sess, given) };

  if (path === '/admin') return home(url, sess, ctx.csrf);
  if (path === '/admin/readings') return handleReadings(req, url, ctx);
  if (path === '/admin/rebuild' && req.method === 'POST') {
    const form = await req.formData();
    if (!ctx.csrfOk(form.get('csrf'))) return page({ title: 'Refused', body: '<h1>Refused</h1>', status: 403, sess });
    if (!process.env.BUILD_HOOK_URL) return redirect('/admin', { flash: 'No BUILD_HOOK_URL configured.', bad: true });
    const r = await fetch(process.env.BUILD_HOOK_URL, { method: 'POST' });
    return redirect('/admin', { flash: r.ok ? 'Rebuild requested — approved answers publish when it finishes (a few minutes).' : `Build hook answered ${r.status}.`, bad: !r.ok });
  }
  return page({ title: 'Not found', body: '<h1>Not found</h1><p><a class="btn" href="/admin">Console</a></p>', status: 404, sess });
};

export const config = { path: ['/admin', '/admin/*'] };
