#!/usr/bin/env node
// Pre-provided auth smoke test: providers -> CSRF -> signup -> credentials login -> session.
// Usage: node scripts/auth-smoke.mjs [email] [password]   (defaults create a throwaway account)
// Exits 0 with "AUTH SMOKE: PASS" or 1 with the first failing step.
const BASE = process.env.AUTH_SMOKE_BASE || `http://localhost:${process.env.PORT || 3000}`;
const email = process.argv[2] || `smoke_${Date.now()}@example.com`;
const password = process.argv[3] || `Smoke!${Date.now()}`;
const jar = {};
const cookies = () => Object.entries(jar).map(([k, v]) => `${k}=${v}`).join('; ');
const save = (res) => (res.headers.getSetCookie?.() || []).forEach((c) => {
  const [kv] = c.split(';'); const i = kv.indexOf('='); jar[kv.slice(0, i)] = kv.slice(i + 1);
});
const step = async (name, fn) => {
  try { await fn(); console.log(`ok   ${name}`); }
  catch (e) { console.error(`FAIL ${name}: ${e.message}`); console.error('AUTH SMOKE: FAIL'); process.exit(1); }
};
const get = async (p) => { const r = await fetch(BASE + p, { headers: { cookie: cookies() }, redirect: 'manual' }); save(r); return r; };

await step('providers reachable', async () => {
  const r = await get('/api/auth/providers');
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
});
let csrfToken;
await step('csrf token', async () => {
  const r = await get('/api/auth/csrf');
  ({ csrfToken } = await r.json());
  if (!csrfToken) throw new Error('no csrfToken in response');
});
await step('signup', async () => {
  const r = await fetch(BASE + '/api/signup', {
    method: 'POST', headers: { 'content-type': 'application/json', cookie: cookies() },
    body: JSON.stringify({ email, password, name: 'Smoke Test' }),
  });
  if (!r.ok && r.status !== 409) throw new Error(`HTTP ${r.status}: ${(await r.text()).slice(0, 200)}`);
});
await step('credentials login', async () => {
  const r = await fetch(BASE + '/api/auth/callback/credentials', {
    method: 'POST', redirect: 'manual',
    headers: { 'content-type': 'application/x-www-form-urlencoded', cookie: cookies() },
    body: new URLSearchParams({ csrfToken, email, password }),
  });
  save(r);
  if (r.status >= 400) throw new Error(`HTTP ${r.status}`);
  const dest = r.headers.get('location') || '';
  if (/error=/i.test(dest)) throw new Error(`redirected to ${dest}`);
});
await step('session established', async () => {
  const r = await get('/api/auth/session');
  const s = await r.json();
  if (!s?.user) throw new Error(`no user in session: ${JSON.stringify(s).slice(0, 200)}`);
});
console.log('AUTH SMOKE: PASS');
