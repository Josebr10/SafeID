export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
export async function POST() {
  return NextResponse.json({ message: 'Use /api/auth/callback/credentials via signIn()' }, { status: 200 });
}
