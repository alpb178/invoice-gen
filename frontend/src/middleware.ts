import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const handleI18n = createMiddleware(routing);

// Unprefixed URLs redirect to the locale from the NEXT_LOCALE cookie, then
// Accept-Language, then Spanish, keeping the query string.
//  - `/` gets a temporary redirect (307): its target depends on the detected
//    language, and a cached permanent redirect would pin a visitor to the
//    first language they were sent to.
//  - Every other unprefixed URL (public or private: /privacy, /login?next=…,
//    /invoices, /invitations/<token>) moves for good (308), so search engines
//    transfer the old URLs.
// Both vary on the headers the choice depends on.
export default function middleware(request: NextRequest) {
  const response = handleI18n(request);
  if (response.status !== 307 && response.status !== 308) return response;

  const status = request.nextUrl.pathname === '/' ? 307 : 308;
  const redirect = new NextResponse(null, { status, headers: response.headers });
  redirect.headers.set('Vary', 'Accept-Language, Cookie');
  return redirect;
}

export const config = {
  // Skip API routes, Next internals and anything with a file extension
  // (robots.txt, sitemap.xml, icons, images).
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
