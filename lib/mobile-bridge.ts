/**
 * SYSTEM-MANAGED FILE -- do not edit.
 *
 * Lets a mobile app share this web app's backend:
 *   1. answers CORS preflights for /api/* (the mobile web preview is a
 *      different origin; native apps do not need this),
 *   2. converts `Authorization: Bearer <token>` into this app's NextAuth
 *      session cookie so every existing `getServerSession()` route works
 *      for mobile callers with NO changes to the route handlers.
 *
 * It NEVER bypasses the app's own middleware: the bridged request is handed
 * to it, so routes that are guarded today stay guarded.
 */
// NextRequest is imported as a VALUE (not `import type`): the bridge
// constructs one to carry the injected cookie header.
import { NextRequest, NextResponse } from 'next/server';
import type { NextFetchEvent } from 'next/server';

/**
 * The app's own middleware, as seen by the bridge. Exported so the patched
 * middleware.ts can cast its original default export to it (withAuth and
 * friends have their own request types).
 */
export type ChainedMiddleware = (
  req: NextRequest,
  event: NextFetchEvent,
) => Promise<Response | undefined | void> | Response | undefined | void;

/** Routes that must receive their body/headers untouched (signature verification). */
const RAW_BODY_PATHS: string[] = [];

const MOBILE_AUTH_PREFIX = '/api/mobile-auth';

// NextAuth v4 names its session cookie `next-auth.session-token`; Auth.js (next-auth v5)
// renames it to `authjs.session-token`. Both prefix with `__Secure-` on https. The app's
// version is not knowable here -- and it can change under us when the app upgrades -- so
// every name is accepted on the way in and set on the way out. NextAuth reads the one
// name its own config declares and ignores the rest.
const SESSION_COOKIE_NAMES = [
  '__Secure-next-auth.session-token',
  'next-auth.session-token',
  '__Secure-authjs.session-token',
  'authjs.session-token',
];

function sessionCookiePairs(token: string): string {
  return SESSION_COOKIE_NAMES.map((name) => `${name}=${token}`).join('; ');
}

export function isSharedBackendApiPath(pathname: string): boolean {
  return pathname === '/api' || pathname.startsWith('/api/');
}

// Set by /api/mobile-auth/google for one sign-in. Duplicated, not imported: mobile-auth
// pulls in `crypto`/`next/headers`, which break in middleware's edge runtime.
const MOBILE_OAUTH_COOKIE = 'sb_mobile_oauth';

/** A mobile Google sign-in that completed but was redirected somewhere other than our
 * callback route: returns the redirect that finishes it, or null. The signed deep link is
 * read from the marker cookie and re-verified by the callback route. */
function strandedMobileSignIn(req: NextRequest): Response | null {
  const marker = req.cookies.get(MOBILE_OAUTH_COOKIE)?.value;
  if (!marker || !hasSessionCookie(req)) return null;
  if (req.nextUrl.pathname.startsWith(`${MOBILE_AUTH_PREFIX}/google`)) return null;
  const target = new URL(`${MOBILE_AUTH_PREFIX}/google/callback`, req.nextUrl.origin);
  target.searchParams.set('rd', marker);
  const res = new NextResponse(null, { status: 302, headers: { location: target.toString() } });
  res.cookies.delete(MOBILE_OAUTH_COOKIE);
  return res;
}

function isRawBodyPath(pathname: string): boolean {
  return RAW_BODY_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * The platform's own auth endpoints. They authenticate themselves from the
 * Authorization header and answer 401 on their own, so the app's middleware guard must
 * never see them: a guard covering /api/* would redirect the very login request that
 * has no token yet, to an HTML sign-in page a mobile client cannot follow.
 */
function isMobileAuthPath(pathname: string): boolean {
  return pathname === MOBILE_AUTH_PREFIX || pathname.startsWith(`${MOBILE_AUTH_PREFIX}/`);
}

function applyCorsHeaders(headers: Headers, req: NextRequest): void {
  const origin = req.headers.get('origin');
  headers.set('Access-Control-Allow-Origin', origin ?? '*');
  if (origin) headers.set('Vary', 'Origin');
  headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'authorization, content-type');
  headers.set('Access-Control-Max-Age', '86400');
}

function bearerToken(req: NextRequest): string | null {
  const header = req.headers.get('authorization') ?? '';
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match ? match[1].trim() : null;
}

function hasSessionCookie(req: NextRequest): boolean {
  return SESSION_COOKIE_NAMES.some((name) => Boolean(req.cookies.get(name)));
}

/** A 3xx (redirect to a sign-in page) is how an auth guard says "not authenticated". */
function isRedirect(res: Response): boolean {
  return (res.status >= 300 && res.status < 400) || res.headers.has('location');
}

/**
 * True when the response is a plain `NextResponse.next()` -- i.e. the chained
 * middleware let the request through without rewriting it. Next.js marks these
 * with an internal header.
 */
function isPassThrough(res: Response): boolean {
  return res.headers.has('x-middleware-next');
}

/** Carry over anything the chained middleware set (cookies, custom headers). */
function copyHeaders(from: Response, to: NextResponse): void {
  from.headers.forEach((value, key) => {
    if (key === 'x-middleware-next') return;
    if (key === 'set-cookie') {
      to.headers.append('set-cookie', value);
    } else if (!to.headers.has(key)) {
      to.headers.set(key, value);
    }
  });
}

/**
 * Handle an /api/* request for mobile clients, delegating to the app's own
 * middleware (when there is one) so existing auth guards keep applying.
 *
 * Returns undefined when the caller should fall through to normal handling.
 */
export async function handleMobileApiRequest(
  req: NextRequest,
  event: NextFetchEvent,
  chained?: ChainedMiddleware,
): Promise<Response | undefined> {
  const { pathname } = req.nextUrl;

  // A mobile sign-in whose app hardcoded its own NextAuth redirect destination lands here
  // with the session set and the mobile app still waiting. Gated on the marker cookie our
  // own start route set, so ordinary requests and cookie-less probes are untouched.
  const stranded = strandedMobileSignIn(req);
  if (stranded) return stranded;

  if (!isSharedBackendApiPath(pathname)) return undefined;

  // Signature-verified routes: never touched.
  if (isRawBodyPath(pathname)) {
    return chained ? ((await chained(req, event)) as Response | undefined) : undefined;
  }

  // 1. CORS preflight, answered before any auth guard runs.
  if (req.method === 'OPTIONS') {
    const preflight = new NextResponse(null, { status: 204 });
    applyCorsHeaders(preflight.headers, req);
    return preflight;
  }

  const token = bearerToken(req);

  // 1b. The platform's own auth routes bypass the app's middleware entirely. Login and
  //     signup are unauthenticated by definition, and `me` answers 401 itself, so
  //     handing them to a guard that redirects unauthenticated traffic breaks all three.
  if (isMobileAuthPath(pathname)) {
    const headers = new Headers(req.headers);
    if (token && !hasSessionCookie(req)) {
      // Harmless, and lets any handler using getServerSession() see the caller.
      headers.set('cookie', sessionCookiePairs(token));
    }
    const openResponse = NextResponse.next({ request: { headers } });
    applyCorsHeaders(openResponse.headers, req);
    return openResponse;
  }

  // NextAuth's own routes must see the request exactly as sent.
  // `token !== null` rather than Boolean(token) so the narrowing survives into the branch
  // below, where sessionCookiePairs needs a string.
  const bridgeable = token !== null && !hasSessionCookie(req) && !pathname.startsWith('/api/auth');

  if (!bridgeable) {
    // No bearer token: behaviour must stay byte-identical to before, so the
    // app's own middleware response (including any redirect) is passed through
    // untouched apart from CORS headers.
    const passthrough = chained
      ? ((await chained(req, event)) as Response | undefined) ?? NextResponse.next()
      : NextResponse.next();
    applyCorsHeaders(passthrough.headers, req);
    return passthrough;
  }

  // 2. Present the bearer token as the session cookie, then let the app's own
  //    middleware evaluate the request as if a browser had sent it.
  const headers = new Headers(req.headers);
  const bridged = sessionCookiePairs(token);
  const existingCookie = headers.get('cookie');
  headers.set('cookie', existingCookie ? `${existingCookie}; ${bridged}` : bridged);

  const bridgedReq = new NextRequest(req, { headers });
  const verdict = chained ? ((await chained(bridgedReq, event)) as Response | undefined) : undefined;

  if (verdict && isRedirect(verdict)) {
    // A bearer client cannot follow a redirect to an HTML sign-in page.
    const denied = NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    applyCorsHeaders(denied.headers, req);
    return denied;
  }

  if (verdict && !isPassThrough(verdict)) {
    // A rewrite or a terminal response (e.g. the guard already answered 403):
    // respect it rather than second-guessing the app.
    applyCorsHeaders(verdict.headers, req);
    return verdict;
  }

  // 3. The guard accepted the request. Re-issue `next()` ourselves so the
  //    bridged cookie actually reaches the route handler -- a `next()` built
  //    by the chained middleware would carry the ORIGINAL headers and the
  //    handler's getServerSession() would see no session.
  const response = NextResponse.next({ request: { headers } });
  if (verdict) copyHeaders(verdict, response);
  applyCorsHeaders(response.headers, req);
  return response;
}
