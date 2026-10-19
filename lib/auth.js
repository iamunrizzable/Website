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

// Every /api/admin/* and /api/business/* route gates on this: a valid
// admin_session cookie (password + authenticator code at login). The old
// x-admin-key header / ?key= query param (the raw ADMIN_SECRET) is no
// longer accepted on its own — it would skip the authenticator code.
export async function isValidAdminKey(request) {
  const header = request.headers.get('cookie') ?? '';
  const match = header.match(/(?:^|;\s*)admin_session=([^;]+)/);
  return verifyAdminSession(match ? decodeURIComponent(match[1]) : undefined);
}

export function isValidCronSecret(request) {
  const auth = request.headers.get('authorization');
  if (!auth || !process.env.CRON_SECRET) return false;
  return timingSafeEqual(auth, `Bearer ${process.env.CRON_SECRET}`);
}

// For route handlers gating on the admin_session cookie (the same session
// middleware.js already requires for /admin/*). Takes an already-resolved
// cookie store (`await cookies()` from next/headers) rather than reading it
// here, so this file stays free of Node-runtime-only imports.
export async function isAdminSessionValid(cookieStore) {
  return verifyAdminSession(cookieStore.get('admin_session')?.value);
}

// ── Admin session ────────────────────────────────────────────────────────────
// The admin_session cookie is a signed, expiring token issued only after
// username + password + the 6-digit authenticator code (see
// app/api/admin/login). Web Crypto HMAC, so it works in middleware (Edge)
// and route handlers alike. Format: v1.<expiresAtMs>.<base64url HMAC>.
export const ADMIN_SESSION_COOKIE = 'admin_session';
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7; // seconds — log in again weekly

const encoder = new TextEncoder();

async function signAdminSession(payload) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(`admin-session:${process.env.ADMIN_SECRET}`),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(payload)));
  let bin = '';
  for (const b of sig) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function createAdminSession() {
  const payload = `v1.${Date.now() + ADMIN_SESSION_MAX_AGE * 1000}`;
  return `${payload}.${await signAdminSession(payload)}`;
}

export async function verifyAdminSession(token) {
  if (typeof token !== 'string' || !process.env.ADMIN_SECRET) return false;
  const m = token.match(/^v1\.(\d{1,16})\.([A-Za-z0-9_-]+)$/);
  if (!m || Number(m[1]) < Date.now()) return false;
  return timingSafeEqual(m[2], await signAdminSession(`v1.${m[1]}`));
}

export function adminSessionCookieOptions(maxAge = ADMIN_SESSION_MAX_AGE) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge,
    path: '/',
  };
}
