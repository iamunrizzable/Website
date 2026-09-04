import { NextResponse } from 'next/server';
import { timingSafeEqual } from './lib/auth.js';
import { isIpBlocked } from './lib/tokens.js';

// CSP is built per-request so script-src can carry a fresh nonce instead of
// 'unsafe-inline'. Next.js reads the Content-Security-Policy request header
// during dynamic rendering and stamps the nonce onto its inline scripts
// (root layout forces dynamic rendering for this reason). The static
// security headers (HSTS etc.) still live in next.config.js.
function buildCsp(nonce) {
  return [
    "default-src 'self'",
    // fpnpmcdn.net: Fingerprint's agent loader, dynamically imported by
    // FingerprintClient (app/layout.js). Covered by 'strict-dynamic' in
    // modern browsers regardless, but listed explicitly as the fallback
    // for browsers that don't support strict-dynamic.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://fpnpmcdn.net`,
    "style-src 'self' 'unsafe-inline'",
    // TikTok's image CDN spans several distinct domain families (regional
    // CDN hosts, an Akamai-fronted edge, and legacy Bytedance CDN domains)
    // beyond tiktokcdn.com/tiktok.com — enumerated here instead of a bare
    // 'https:' wildcard, which Aikido correctly flagged as too permissive.
    "img-src 'self' data: blob: https://*.tiktokcdn.com https://*.tiktokcdn-us.com https://*.tiktokcdn-eu.com https://*.tiktokcdn-in.com https://*.tiktok.com https://*.tiktokv.com https://*.muscdn.com https://*.ibyteimg.com https://*.ibytedtos.com https://*.akamaized.net",
    // fpnpmcdn.net: loader domain (script-src above). api.fpjs.io: the
    // actual identify-data request domain — confirmed via a live
    // securitypolicyviolation report showing requests blocked to
    // https://api.fpjs.io/... (not fpnpmcdn.net, which only serves the
    // agent script itself).
    "connect-src 'self' https://fpnpmcdn.net https://api.fpjs.io",
    "font-src 'self' data:",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join('; ');
}

export async function middleware(request) {
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

  // Site-wide IP blocklist, managed at /admin/security. Fails OPEN — any
  // error checking the list (e.g. Redis unreachable) lets the request
  // through rather than blocking everyone, same fail-open contract as the
  // Fingerprint ruleset gate.
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim();
  try {
    if (ip && (await isIpBlocked(ip))) {
      return withCsp(new NextResponse('Access denied', { status: 403 }));
    }
  } catch {
    // ignore — fail open
  }

  // TikTok domain verification — exact path only. Was startsWith(),
  // which also swallowed /legal/tiktok/agency-guidelines once that page
  // moved under this prefix, serving verification text instead of the
  // page for every route nested under here.
  if (pathname === '/legal/tiktok' || pathname === '/legal/tiktok/') {
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

  // Protect /admin/*, /api/admin/me, and the Hallie writer page
  // (Tyler-only, not a mirrored multi-operator surface like the TikTok
  // system) with the same admin session cookie. Its API route
  // (/api/hallie/draft) is deliberately NOT listed here — like every
  // /api/admin/* and /api/business/* route except /api/admin/me, it does
  // its own auth check (cookie OR x-admin-key) rather than being
  // middleware-gated, so both credential types actually work instead of
  // the cookie-only check here shadowing the route's own x-admin-key
  // fallback.
  if (
    pathname.startsWith('/admin') ||
    pathname === '/api/admin/me' ||
    pathname.startsWith('/hallie/writer')
  ) {
    const session = request.cookies.get('admin_session')?.value;
    if (!session || !process.env.ADMIN_SECRET || !timingSafeEqual(session, process.env.ADMIN_SECRET)) {
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
