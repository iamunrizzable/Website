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
