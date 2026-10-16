/**
 * SYSTEM-MANAGED FILE -- do not edit.
 * GET /api/mobile-auth/google/callback?rd=<signed deep link>
 *
 * NextAuth redirects here after a successful Google sign-in; the session cookie is
 * already set. Hands its value to the mobile app over the deep link.
 */
export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { MOBILE_OAUTH_COOKIE, SESSION_COOKIE_NAMES, verifyDeepLink } from '@/lib/mobile-auth';

function redirectTo(target: string): Response {
  // A plain Response, not NextResponse.redirect: the target is usually a custom scheme
  // (myapp://) and Next's helper insists on an http(s) URL.
  return new Response(null, {
    status: 302,
    headers: {
      location: target,
      'cache-control': 'no-store',
      'set-cookie': `${MOBILE_OAUTH_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`,
    },
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const deepLink = await verifyDeepLink(url.searchParams.get('rd') ?? '');
  if (!deepLink) {
    return new Response('Invalid sign-in callback', { status: 400 });
  }

  const jar = await cookies();
  let token: string | undefined;
  for (const name of SESSION_COOKIE_NAMES) {
    const value = jar.get(name)?.value;
    if (value) { token = value; break; }
  }

  const separator = deepLink.includes('?') ? '&' : '?';
  if (!token) {
    // Sign-in was denied, or the app's own callbacks sent the browser elsewhere first.
    return redirectTo(`${deepLink}${separator}error=${encodeURIComponent('google_sign_in_failed')}`);
  }
  return redirectTo(`${deepLink}${separator}token=${encodeURIComponent(token)}`);
}
