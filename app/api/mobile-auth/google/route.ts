/**
 * SYSTEM-MANAGED FILE -- do not edit.
 * GET /api/mobile-auth/google?redirect_uri=<deep link>
 *
 * Starts this app's existing Google sign-in on behalf of a mobile client.
 */
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { MOBILE_OAUTH_COOKIE, signDeepLink, isAllowedDeepLink } from '@/lib/mobile-auth';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const redirectUri = url.searchParams.get('redirect_uri') ?? '';
  if (!redirectUri || !(await isAllowedDeepLink(redirectUri))) {
    // Never redirect to an unvetted target: this flow ends by appending a live session
    // token to that URL, so an open redirect here is account takeover.
    return NextResponse.json({ message: 'Unrecognised redirect_uri' }, { status: 400 });
  }

  const rd = signDeepLink(redirectUri);
  const callbackUrl = `/api/mobile-auth/google/callback?rd=${encodeURIComponent(rd)}`;
  const body = `<!doctype html>
<html><head><meta charset="utf-8"><title>Signing in…</title></head>
<body style="font-family:system-ui;padding:24px">Redirecting to Google…
<form id="f" method="POST" action="/api/auth/signin/google">
  <input type="hidden" name="csrfToken" value="">
  <input type="hidden" name="callbackUrl" value="${callbackUrl.replace(/"/g, '&quot;')}">
</form>
<script>
  fetch('/api/auth/csrf', { credentials: 'same-origin' })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      var f = document.getElementById('f');
      f.csrfToken.value = d.csrfToken;
      f.submit();
    })
    .catch(function () { document.body.textContent = 'Could not start Google sign-in.'; });
</script>
</body></html>`;
  const response = new NextResponse(body, {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
  });
  // Lets the bridge finish this sign-in if the app's own `redirect` callback strands it.
  response.cookies.set(MOBILE_OAUTH_COOKIE, rd, {
    httpOnly: true, sameSite: 'lax', path: '/', maxAge: 300,
  });
  return response;
}
