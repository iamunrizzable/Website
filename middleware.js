import { NextResponse } from 'next/server';

// CSP is built per-request so script-src can carry a fresh nonce instead of
// 'unsafe-inline'. Next.js reads the Content-Security-Policy request header
// during dynamic rendering and stamps the nonce onto its inline scripts
// (root layout forces dynamic rendering for this reason). The static
// security headers (HSTS etc.) still live in next.config.js.
function buildCsp(nonce) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.tiktokcdn.com https://*.tiktok.com https:",
    "connect-src 'self'",
    "font-src 'self' data:",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
}

export function middleware(request) {
  const { pathname } = request.nextUrl;

  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  const withCsp = (response) => {
    response.headers.set('Content-Security-Policy', csp);
    return response;
  };

  // TikTok domain verification
  if (pathname.startsWith('/legal/tiktok')) {
    return withCsp(new NextResponse(
      'tiktok-developers-site-verification=4DwMqQPi2o4xTuuzoEsPVxZVHmktN0O9',
      { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
    ));
  }

  // Login page, login API, and Business OAuth always pass through
  if (
    pathname === '/admin/login' ||
    pathname === '/api/admin/login' ||
    pathname.startsWith('/auth/tiktok/')
  ) {
    return withCsp(NextResponse.next({ request: { headers: requestHeaders } }));
  }

  // Protect /admin/* and /api/admin/me with session cookie
  if (pathname.startsWith('/admin') || pathname === '/api/admin/me') {
    const session = request.cookies.get('admin_session')?.value;
    if (session !== process.env.ADMIN_SECRET) {
      if (pathname.startsWith('/api/')) {
        return withCsp(new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }));
      }
      return withCsp(NextResponse.redirect(new URL('/admin/login', request.url)));
    }
    // Refresh cookie on every valid request so it never expires
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.cookies.set('admin_session', process.env.ADMIN_SECRET, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 400,
      path: '/',
    });
    return withCsp(response);
  }

  return withCsp(NextResponse.next({ request: { headers: requestHeaders } }));
}

export const config = {
  matcher: [
    // Everything except Next static assets and files with static extensions —
    // those can't run inline scripts and shouldn't churn the CDN cache.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:jpeg|jpg|png|gif|svg|ico|webp|txt|xml|mp4|webm)$).*)',
  ],
};
