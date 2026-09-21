import { NextResponse } from 'next/server';
import { timingSafeEqual } from './lib/auth.js';

// CSP is built per-request so script-src can carry a fresh nonce instead of
// 'unsafe-inline'. Next.js reads the Content-Security-Policy request header
// during dynamic rendering and stamps the nonce onto its inline scripts
// (root layout forces dynamic rendering for this reason). The static
// security headers (HSTS etc.) still live in next.config.js.

// IP-based blocking used to live here (checked against a blocklist managed
// at /admin/security). Removed — IP is trivially rotated/spoofed (mobile
// carrier CGNAT alone made it unreliable all session), so blocking now
// happens purely on the client's persistentMarker (see DeviceGate.js /
// app/api/fingerprint/check, lib/fingerprint/persistentMarker.js), a
// randomly-generated, client-stored value that survives IP changes and,
// unlike a passive browser fingerprint, can never collide between two
// different real devices.

function buildCsp(nonce) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    // No 'unsafe-inline' here (Aikido "CSP config allows inline CSS", risk
    // 20). This is safe despite ~500 React style={{}} props across the
    // app: every route is wrapped in DeviceGate (app/layout.js), which
    // renders ONLY a loading spinner server-side and swaps in real content
    // client-side once its own fingerprint check resolves — so no page's
    // real content, inline styles included, is ever present in the raw
    // server-rendered HTML the browser parses. style-src only restricts
    // style set via markup parsed by the HTML parser (a literal
    // style="..." attribute or a <style> element) and does NOT restrict
    // style already-permitted script applies at runtime via the DOM
    // (React's style prop reconciles through node.style, the same CSSOM
    // path). Verified directly: zero securitypolicyviolation events with
    // 'unsafe-inline' removed, across every major page (including both
    // moderation panels) and real interactions (expand/collapse, menu
    // toggles). There's also no dangerouslySetInnerHTML anywhere in this
    // codebase, so there's no path for attacker-controlled markup to land
    // an inline style in the first place. Converting style={{}} props to
    // CSS classes (in progress piecemeal — see app/*.css colocated files)
    // remains good hygiene/defense-in-depth in case a future route ever
    // renders real content server-side, but is not required for this.
    "style-src 'self'",
    // TikTok's image CDN spans several distinct domain families (regional
    // CDN hosts, an Akamai-fronted edge, and legacy Bytedance CDN domains)
    // beyond tiktokcdn.com/tiktok.com — enumerated here instead of a bare
    // 'https:' wildcard, which Aikido correctly flagged as too permissive.
    // https://tile.openstreetmap.org: raw map tile PNGs for the admin
    // location-map preview (app/admin/security/page.js) — plain <img>
    // requests, not a JS-driven embed, so it needs no frame-src (that
    // was tried first, using osm.org's iframe embed, and swapped out for
    // this precisely to remove the third-party-script-in-a-frame failure
    // mode). No API key, no account, OSM's own tile server, within their
    // documented acceptable-use policy for this volume.
    "img-src 'self' data: blob: https://*.tiktokcdn.com https://*.tiktokcdn-us.com https://*.tiktokcdn-eu.com https://*.tiktokcdn-in.com https://*.tiktok.com https://*.tiktokv.com https://*.muscdn.com https://*.ibyteimg.com https://*.ibytedtos.com https://*.akamaized.net https://tile.openstreetmap.org",
    // Device fingerprinting (lib/fingerprint/) is entirely same-origin
    // bundled code now — no external CDN or identify-data endpoint to
    // allowlist, unlike the third-party SDK this replaced.
    "connect-src 'self'",
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
