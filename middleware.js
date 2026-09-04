import { NextResponse } from 'next/server';
import { timingSafeEqual } from './lib/auth.js';
import { isIpBlocked } from './lib/tokens.js';

// CSP is built per-request so script-src can carry a fresh nonce instead of
// 'unsafe-inline'. Next.js reads the Content-Security-Policy request header
// during dynamic rendering and stamps the nonce onto its inline scripts
// (root layout forces dynamic rendering for this reason). The static
// security headers (HSTS etc.) still live in next.config.js.
const BLOCKED_PAGE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Access Denied</title>
<style>
  html { background-color: #0f172a; }
  body {
    margin: 0;
    min-height: 100vh;
    min-height: 100dvh;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px;
    box-sizing: border-box;
    font-family: system-ui, sans-serif;
  }
  body::before {
    content: "";
    position: fixed;
    inset: 0;
    background-image: url("/bg-main.jpeg");
    background-position: center center;
    background-size: cover;
    background-repeat: no-repeat;
    mix-blend-mode: lighten;
    opacity: 0.13;
    z-index: -1;
    pointer-events: none;
  }
  @keyframes glowPulse {
    0%, 100% { text-shadow: 0 0 20px rgba(239,68,68,0.6), 0 0 40px rgba(239,68,68,0.3); }
    50% { text-shadow: 0 0 40px rgba(239,68,68,1), 0 0 60px rgba(236,72,153,0.8), 0 0 80px rgba(168,85,247,0.5); }
  }
  @keyframes popIn {
    0% { opacity: 0; transform: translateY(20px) scale(0.96); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }
  .card {
    max-width: 480px;
    text-align: center;
    color: #e2e8f0;
    background: rgba(15,23,42,0.6);
    border: 2px solid rgba(239,68,68,0.35);
    border-radius: 16px;
    padding: 36px 12px;
    position: relative;
    z-index: 10;
    animation: popIn 0.6s ease-out;
  }
  h1 {
    color: #ef4444;
    font-size: 24px;
    margin: 0 0 16px;
    font-weight: 800;
    animation: glowPulse 3s ease-in-out infinite;
  }
  p {
    font-size: 15px;
    line-height: 1.7;
    margin: 0 0 14px;
  }
  p:last-child { margin-bottom: 0; }
  .nowrap-line {
    display: inline-block;
    white-space: nowrap;
    font-size: 12.5px;
    line-height: 1.7;
  }
  .rainbow, a {
    background: linear-gradient(90deg, #d946ef 0%, #a855f7 25%, #3b82f6 50%, #06b6d4 75%, #d946ef 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  a { font-weight: 600; text-decoration: underline; }
</style>
</head>
<body>
  <div class="card">
    <h1>Access Denied</h1>
    <p class="rainbow">You have been blocked from accessing<br>TJB Management Inc.'s social media<br>accounts and systems.</p>
    <p class="rainbow">If you believe this was done in error<br><span class="nowrap-line">Please email <a href="mailto:support@tjbmanagementinc.com">support@tjbmanagementinc.com</a></span><br>for assistance.</p>
  </div>
</body>
</html>`;

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

  // no-store on every response middleware touches — the whole site is
  // already force-dynamic (see app/layout.js), so nothing here was ever
  // meant to be cached, but without an explicit header the CDN/browser are
  // free to apply their own default caching heuristics. That's the likely
  // reason an IP block took up to ~a minute to take effect: the visitor's
  // last allowed response could still be served stale for a bit even
  // after Redis was updated.
  const withCsp = (response) => {
    response.headers.set('Content-Security-Policy', csp);
    response.headers.set('Cache-Control', 'no-store');
    return response;
  };

  // Site-wide IP blocklist, managed at /admin/security. Fails OPEN — any
  // error checking the list (e.g. Redis unreachable) lets the request
  // through rather than blocking everyone, same fail-open contract as the
  // Fingerprint ruleset gate.
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim();
  try {
    const blocked = ip ? await isIpBlocked(ip) : false;
    console.log('[ip-block-check]', { ip, blocked });
    if (blocked) {
      return withCsp(new NextResponse(BLOCKED_PAGE_HTML, {
        status: 403,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }));
    }
  } catch (e) {
    console.error('[ip-block-check] error', ip, e?.message ?? String(e));
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
