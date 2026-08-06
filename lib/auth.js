// Constant-time string comparison — a plain === on secrets leaks timing
// information proportional to the length of the matching prefix.
// Implemented in portable JS (no Node `crypto` import) specifically so it's
// safe to use from middleware.js, which runs on the Edge runtime and can't
// reliably use Node's crypto module — every ADMIN_SECRET / CRON_SECRET
// comparison in the app should go through this instead of comparing
// directly. (lib/oauth-state.js already does the equivalent for OAuth state
// signatures via Node's crypto.timingSafeEqual, safe there because it only
// ever runs in Node-runtime route handlers, never in middleware.)
export function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const maxLen = Math.max(a.length, b.length, 1);
  let result = a.length === b.length ? 0 : 1;
  for (let i = 0; i < maxLen; i++) {
    const ca = i < a.length ? a.charCodeAt(i) : 0;
    const cb = i < b.length ? b.charCodeAt(i) : 0;
    result |= ca ^ cb;
  }
  return result === 0;
}

// Every /api/admin/* and /api/business/* route accepts the admin secret as
// either an x-admin-key header or (legacy) a ?key= query param. See
// api-route-conventions skill: header-only is fine for new routes, but the
// query-param fallback stays for now on existing routes for compatibility.
export function isValidAdminKey(request) {
  const { searchParams } = new URL(request.url);
  const provided = request.headers.get('x-admin-key') ?? searchParams.get('key');
  if (!provided || !process.env.ADMIN_SECRET) return false;
  return timingSafeEqual(provided, process.env.ADMIN_SECRET);
}

export function isValidCronSecret(request) {
  const auth = request.headers.get('authorization');
  if (!auth || !process.env.CRON_SECRET) return false;
  return timingSafeEqual(auth, `Bearer ${process.env.CRON_SECRET}`);
}
