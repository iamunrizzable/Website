// Canonical site origin for building redirect URLs.
// OAuth callbacks must never derive the redirect host from the incoming
// request (Host / X-Forwarded-Host are attacker-influenced) — always
// redirect against this trusted origin instead.
const SITE_URL =
  process.env.SITE_URL ??
  (process.env.NODE_ENV === 'production'
    ? 'https://tjbmanagementinc.com'
    : 'http://localhost:3000');

export function absoluteUrl(path) {
  return new URL(path, SITE_URL);
}

// Redirect target that can only ever be on this site: whatever comes in is
// resolved against the trusted origin. Anything that lands on another origin
// (or can't be parsed) goes to the home page with ?notice=redirect-blocked,
// which the home page explains on screen.
export function sameOriginUrl(path) {
  const base = new URL(SITE_URL);
  try {
    const url = new URL(path, base);
    if (url.origin === base.origin) return url;
  } catch {
    // fall through to home
  }
  return new URL('/?notice=redirect-blocked', base);
}
