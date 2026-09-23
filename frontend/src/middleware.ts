import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const handleI18n = createMiddleware(routing);

// Public, indexed pages that existed before the locale prefix. Their old
// unprefixed URLs move for good, so search engines transfer them; every other
// unprefixed URL (private app pages, invitation links) gets a temporary
// redirect. The target locale comes from the NEXT_LOCALE cookie, then
// Accept-Language, then Spanish.
const PERMANENT = new Set(['/', '/privacy', '/terms', '/cookies']);

export default function middleware(request: NextRequest) {
  const response = handleI18n(request);

  if (response.status === 307 && PERMANENT.has(request.nextUrl.pathname)) {
    return new NextResponse(null, { status: 308, headers: response.headers });
  }
  return response;
}

export const config = {
  // Skip API routes, Next internals and anything with a file extension
  // (robots.txt, sitemap.xml, icons, images).
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
