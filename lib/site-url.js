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
// resolved against the trusted origin and thrown away (fallback used) if the
// result lands on any other origin.
export function sameOriginUrl(path, fallback = '/') {
  const base = new URL(SITE_URL);
  try {
    const url = new URL(path, base);
    if (url.origin === base.origin) return url;
  } catch {
    // fall through to the fallback
  }
  return new URL(fallback, base);
}
