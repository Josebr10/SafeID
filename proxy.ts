import type { NextFetchEvent, NextRequest } from 'next/server';
import { handleMobileApiRequest, isSharedBackendApiPath } from '@/lib/mobile-bridge';

export default async function proxy(req: NextRequest, event: NextFetchEvent) {
  if (isSharedBackendApiPath(req.nextUrl.pathname)) {
    return handleMobileApiRequest(req, event);
  }
}

export const config = {
  matcher: ['/api/:path*'],
};
