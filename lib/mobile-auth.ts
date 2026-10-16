/**
 * SYSTEM-MANAGED FILE -- do not edit.
 *
 * Issues a session token for mobile clients by replaying THIS app's own
 * NextAuth credentials flow server-side. Because the app's real
 * `authorize()` does the verification, this works regardless of the user
 * model, password field name or extra checks, and it cannot drift when the
 * app's auth changes.
 */
import { createHmac, timingSafeEqual } from 'crypto';
import { headers } from 'next/headers';

// v4 (`next-auth.`) and Auth.js v5 (`authjs.`), with and without the https `__Secure-` prefix.
export const SESSION_COOKIE_NAMES = [
  '__Secure-next-auth.session-token',
  'next-auth.session-token',
  '__Secure-authjs.session-token',
  'authjs.session-token',
];

/** Marks a mobile Google sign-in as in flight; see strandedMobileSignIn in the bridge. */
export const MOBILE_OAUTH_COOKIE = 'sb_mobile_oauth';

/** Schemes a mobile client may be sent back to, with the token appended. */
// `: string[]` is load-bearing: the list is usually empty (enablement runs before the
// mobile app exists) and a bare `[]` infers `never[]`, breaking tsc on `.includes` below.
const ALLOWED_DEEP_LINK_SCHEMES: string[] = [];

/** The shape our scaffold writes into app.json (`abacusai<epoch>`). Accepted in production
 * because enablement usually runs before the mobile app exists, so the exact scheme is not
 * baked in yet; weaker than exact, but abusing it needs an app of this shape already
 * installed on the victim's device -- unlike `exp`, which is every Expo Go. */
const GENERATED_SCHEME_RE = /^abacusai\d+$/;

/** `next dev` (the app's preview) vs `next start` (the deployed app). */
const IS_PREVIEW = process.env.NODE_ENV !== 'production';

/** A sibling pod on this preview's own domain -- the mobile half's web preview, whose
 * per-computer origin cannot be baked in at enablement. Needs a parent of two or more
 * labels so a bare TLD can never match. */
async function isSiblingPreviewOrigin(parsed: URL): Promise<boolean> {
  try {
    const parent = new URL(await selfOrigin()).hostname.toLowerCase().split('.').slice(1);
    if (parent.length < 2) return false;
    return parsed.hostname.toLowerCase().endsWith(`.${parent.join('.')}`);
  } catch {
    return false;
  }
}

/** Is this a redirect target we are willing to append a live session token to? An
 * allowlist, not a sanity check: the target is chosen by whoever STARTS the flow, who need
 * not be who finishes it, so anything reachable from here is an account-takeover vector. */
export async function isAllowedDeepLink(target: string): Promise<boolean> {
  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return false;
  }
  const scheme = parsed.protocol.replace(/:$/, '').toLowerCase();
  const isHttp = scheme === 'http' || scheme === 'https';
  // The only custom schemes a deployed app will hand a token to.
  if (ALLOWED_DEEP_LINK_SCHEMES.includes(scheme)) return true;
  if (GENERATED_SCHEME_RE.test(scheme)) return true;
  if (isHttp) {
    try {
      if (parsed.origin === new URL(await selfOrigin()).origin) return true;
    } catch {
      // selfOrigin() is unusable; fall through rather than widen.
    }
  }
  if (!IS_PREVIEW) return false;
  // Preview only: `exp` is every Expo Go, so it must never be reachable from a deployed
  // app; localhost and a sibling preview pod are how the web preview comes back.
  if (scheme === 'exp') return true;
  if (!isHttp) return false;
  const host = parsed.hostname.toLowerCase();
  return host === 'localhost' || host === '127.0.0.1' || (await isSiblingPreviewOrigin(parsed));
}

function deepLinkSecret(): string {
  // The secret NextAuth already signs its own session with.
  return process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || '';
}

function sign(value: string): string {
  return createHmac('sha256', deepLinkSecret()).update(value).digest('base64url');
}

/** Round-trips the deep link through Google without letting anyone else choose it. */
export function signDeepLink(target: string): string {
  const encoded = Buffer.from(target, 'utf8').toString('base64url');
  return `${encoded}.${sign(encoded)}`;
}

/** The signed deep link, or null if it was absent, malformed or tampered with. */
export async function verifyDeepLink(signed: string): Promise<string | null> {
  const dot = signed.lastIndexOf('.');
  if (dot <= 0) return null;
  const encoded = signed.slice(0, dot);
  const provided = signed.slice(dot + 1);
  const expected = sign(encoded);
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const target = Buffer.from(encoded, 'base64url').toString('utf8');
  return (await isAllowedDeepLink(target)) ? target : null;
}

export type MobileLoginResult =
  | { ok: true; token: string }
  | { ok: false; status: number; message: string };

/** Absolute origin of this app, for server-to-server calls back into it. */
export async function selfOrigin(): Promise<string> {
  const configured = process.env.NEXTAUTH_URL || process.env.APP_ORIGIN;
  if (configured) return configured.replace(/\/+$/, '');
  const h = await headers();
  const host = h.get('x-forwarded-host') || h.get('host') || 'localhost:3000';
  const proto = h.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

function parseSetCookie(raw: string[]): { session?: string; jar: string } {
  const pairs: string[] = [];
  let session: string | undefined;
  for (const entry of raw) {
    const [pair] = entry.split(';');
    const eq = pair.indexOf('=');
    if (eq === -1) continue;
    const name = pair.slice(0, eq).trim();
    const value = pair.slice(eq + 1).trim();
    pairs.push(`${name}=${value}`);
    if (SESSION_COOKIE_NAMES.includes(name) && value) session = value;
  }
  return { session, jar: pairs.join('; ') };
}

function readSetCookie(res: Response): string[] {
  // getSetCookie() is the only correct way to read multiple Set-Cookie headers.
  const anyHeaders = res.headers as unknown as { getSetCookie?: () => string[] };
  if (typeof anyHeaders.getSetCookie === 'function') return anyHeaders.getSetCookie();
  const single = res.headers.get('set-cookie');
  return single ? [single] : [];
}

/**
 * Logs in through `/api/auth/callback/credentials` and returns the resulting
 * session token (the value of the NextAuth session cookie).
 *
 * `credentials` is forwarded as-is, so apps whose provider expects
 * `username` (or any other field) instead of `email` work unchanged.
 */
export async function issueSessionTokenForCredentials(
  credentials: Record<string, string>,
): Promise<MobileLoginResult> {
  const origin = await selfOrigin();

  // `manual` everywhere below: these calls carry no session, so a guard over
  // /api/* answers a redirect to an HTML page. Following it would turn "blocked"
  // into a 200 that parses as an empty body and reads as a plain auth failure.
  const csrfRes = await fetch(`${origin}/api/auth/csrf`, { cache: 'no-store', redirect: 'manual' });
  if (!csrfRes.ok) {
    return { ok: false, status: 500, message: 'Authentication is unavailable' };
  }
  const { session: _s, jar } = parseSetCookie(readSetCookie(csrfRes));
  const csrfBody = (await csrfRes.json().catch(() => ({}))) as { csrfToken?: string };
  const csrfToken = csrfBody?.csrfToken;
  if (!csrfToken) {
    return { ok: false, status: 500, message: 'Authentication is unavailable' };
  }

  const form = new URLSearchParams({ csrfToken, json: 'true' });
  for (const [key, value] of Object.entries(credentials)) {
    if (value !== undefined && value !== null) form.set(key, String(value));
  }

  const loginRes = await fetch(`${origin}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      ...(jar ? { cookie: jar } : {}),
    },
    body: form.toString(),
    redirect: 'manual',
    cache: 'no-store',
  });

  const { session } = parseSetCookie(readSetCookie(loginRes));
  if (!session) {
    // NextAuth answers a rejected credentials login with a redirect that
    // carries ?error=, and sets no session cookie.
    return { ok: false, status: 401, message: 'Invalid email or password' };
  }
  return { ok: true, token: session };
}

/** Resolves the session user for a raw cookie header, via NextAuth itself. */
export async function sessionForCookieHeader(
  cookieHeader: string,
): Promise<Record<string, unknown> | null> {
  const res = await fetch(`${await selfOrigin()}/api/auth/session`, {
    headers: { cookie: cookieHeader },
    cache: 'no-store',
    redirect: 'manual',
  });
  if (!res.ok) return null;
  const body = (await res.json().catch(() => null)) as { user?: Record<string, unknown> } | null;
  return body?.user ?? null;
}

/** Fetches the session for a token, so callers can return the user object.
 *
 * Sends the token under every name a NextAuth/Auth.js app might read, for the same reason
 * the bridge does: the app's version is not knowable from here.
 */
export async function sessionForToken(token: string): Promise<Record<string, unknown> | null> {
  return sessionForCookieHeader(SESSION_COOKIE_NAMES.map((name) => `${name}=${token}`).join('; '));
}
