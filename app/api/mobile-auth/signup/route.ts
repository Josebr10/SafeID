/**
 * SYSTEM-MANAGED FILE -- do not edit.
 * POST /api/mobile-auth/signup  ->  { token, user }
 *
 * Delegates to this app's own signup endpoint so validation, hashing and any
 * related records it creates stay in exactly one place, then logs the new
 * user in and returns a mobile session token.
 */
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { issueSessionTokenForCredentials, sessionForToken, selfOrigin } from '@/lib/mobile-auth';

const SIGNUP_ENDPOINT = '/api/signup';

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
  }

  const signupRes = await fetch(`${await selfOrigin()}${SIGNUP_ENDPOINT}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
    // `manual` is load-bearing: this call carries no session cookie, so a guard
    // covering the signup route answers 3xx to an HTML sign-in page. Following it
    // (the default) yields 200 + HTML, which reads as "signup succeeded" and makes
    // this route report success for an account that was never created.
    redirect: 'manual',
    cache: 'no-store',
  });

  if (signupRes.status >= 300 && signupRes.status < 400) {
    return NextResponse.json(
      {
        message:
          'Signup is unavailable: ' + SIGNUP_ENDPOINT + ' redirected instead of answering. ' +
          'It is behind an auth guard, so no account can be created.',
      },
      { status: 500 },
    );
  }

  if (!signupRes.ok) {
    // Pass the app's own error body through unchanged.
    const text = await signupRes.text().catch(() => '');
    let parsed: unknown = text;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { message: text || 'Signup failed' };
    }
    return NextResponse.json(parsed as Record<string, unknown>, { status: signupRes.status });
  }

  // A 2xx that is not JSON is not this endpoint answering -- most likely an HTML
  // page served in its place. Treat it as a failure rather than assume success.
  const signupType = signupRes.headers.get('content-type') ?? '';
  if (!signupType.includes('json')) {
    return NextResponse.json(
      {
        message:
          'Signup is unavailable: ' + SIGNUP_ENDPOINT + ' answered ' + signupRes.status +
          ' with ' + (signupType || 'no content type') + ' instead of JSON.',
      },
      { status: 500 },
    );
  }

  const credentials: Record<string, string> = {};
  for (const [key, value] of Object.entries(body ?? {})) {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      credentials[key] = String(value);
    }
  }

  const result = await issueSessionTokenForCredentials(credentials);
  if (!result.ok) {
    // The account exists but no session could be issued. This MUST NOT be a 2xx:
    // the published contract says a 201 carries a token, and a client that trusts
    // it stores `null` and silently stays signed out with nothing to show the user.
    return NextResponse.json(
      { message: 'Account created, but sign-in did not complete. Please sign in.' },
      { status: 500 },
    );
  }

  const user = await sessionForToken(result.token);
  return NextResponse.json({ token: result.token, user: user ?? null }, { status: 201 });
}
