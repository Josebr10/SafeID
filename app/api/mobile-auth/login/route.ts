/**
 * SYSTEM-MANAGED FILE -- do not edit.
 * POST /api/mobile-auth/login  ->  { token, user }
 *
 * Mobile clients send the returned token as `Authorization: Bearer <token>`;
 * lib/mobile-bridge.ts turns it back into this app's session cookie.
 */
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { issueSessionTokenForCredentials, sessionForToken } from '@/lib/mobile-auth';

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
  }

  const credentials: Record<string, string> = {};
  for (const [key, value] of Object.entries(body ?? {})) {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      credentials[key] = String(value);
    }
  }
  const identifier = credentials.email || credentials.username;
  if (!identifier || !credentials.password) {
    return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
  }

  const result = await issueSessionTokenForCredentials(credentials);
  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: result.status });
  }

  const user = await sessionForToken(result.token);
  return NextResponse.json({ token: result.token, user: user ?? null });
}
