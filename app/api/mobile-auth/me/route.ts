/**
 * SYSTEM-MANAGED FILE -- do not edit.
 * GET /api/mobile-auth/me  ->  { user }   (401 when the token is missing/invalid)
 */
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { sessionForToken, sessionForCookieHeader } from '@/lib/mobile-auth';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization') ?? '';
  const bearer = /^Bearer\s+(.+)$/i.exec(authHeader)?.[1]?.trim();
  const cookieHeader = request.headers.get('cookie');

  const user = bearer
    ? await sessionForToken(bearer)
    : cookieHeader
      ? await sessionForCookieHeader(cookieHeader)
      : null;

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ user });
}
