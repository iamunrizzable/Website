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
  // Built piece by piece on the trusted origin: only a plain path (and query)
  // is ever copied in, so the host cannot be changed by the input.
  const url = new URL(SITE_URL);
  const match = typeof path === 'string' && /^(\/(?!\/)[\w\-./]*)(\?[\w\-.=&%]*)?$/.exec(path);
  if (!match) return new URL('/?notice=redirect-blocked', url);
  url.pathname = match[1];
  url.search = match[2] ?? '';
  return url;
}

// Redirect to one of our own known pages. The page comes from a fixed list
// (the input is only used to pick an entry, never copied), and only a few
// known query keys are carried over, each re-encoded.
const CARRIED_QUERY_KEYS = ['error', 'connected', 'account_connected', 'business_connected'];

export function knownPageUrl(target, allowedPaths) {
  const [rawPath, rawQuery = ''] = String(target).split('?');
  const page = allowedPaths.find((p) => p === rawPath) ?? allowedPaths[0];
  const url = new URL(page, SITE_URL);
  const incoming = new URLSearchParams(rawQuery);
  for (const key of CARRIED_QUERY_KEYS) {
    const value = incoming.get(key);
    if (value !== null) url.searchParams.set(key, value.slice(0, 300));
  }
  return url;
}
