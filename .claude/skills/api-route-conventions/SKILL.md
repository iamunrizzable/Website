---
name: api-route-conventions
description: Auth patterns, response conventions, and boilerplate for adding or modifying API routes in app/api/. Use whenever creating a new route, changing route auth, or deciding which route family a new endpoint belongs in.
---

# API Route Conventions

Every route is a Next.js App Router `route.js` exporting `GET`/`POST`. Pick the family first — it determines auth, token source, and which UI calls it.

## Family cheat sheet

### `/api/admin/*` and `/api/business/*` — Tyler's admin tooling
```js
function requireAdmin(request) {
  const { searchParams } = new URL(request.url);
  const adminKey = request.headers.get('x-admin-key') ?? searchParams.get('key');
  return adminKey === process.env.ADMIN_SECRET;
}
// first line of every handler:
if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
```
(Some older routes omit the `?key=` fallback — header-only is also fine for new routes.) Token source: shared helpers from `lib/tiktok/business-api.js` / `lib/tokens.js`. The admin SPA gets its key from `/api/admin/me` (middleware-gated by the `admin_session` cookie) and stores it in localStorage.

### `/api/system/*` — operator-facing (Hallie product)
No admin key. Auth = presence of the `acct_token` cookie:
```js
const cookieStore = await cookies();           // next/headers
const raw = cookieStore.get('acct_token')?.value;
if (!raw) return NextResponse.json({ error: 'Not connected' }, { status: 401 });
const token = JSON.parse(raw);
```
Call TikTok inline with fetch() using this token — do NOT use the shared `business-api.js` helpers here (they read shared storage and would leak Tyler's token into operator sessions, or vice versa).

### `/api/cron/*` — Vercel Cron
```js
if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`)
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
```
Register the schedule in `vercel.json` `crons`. Return HTTP 200 for expected-failure states (e.g. token not connected) so the cron isn't flagged as failing. Set `export const maxDuration = 60` if the job is slow.

### `/api/moderate` — deliberately unauthenticated internal scorer. Don't add auth without checking both TestPanels, and don't copy its no-auth pattern elsewhere.

## Response conventions

- Always `NextResponse.json(...)`; errors as `{ error: message }` with a real status (400/401/404/500/503)
- TikTok proxy routes pass the TikTok envelope through (`{ code, message, data }`) — the UIs check `data.code !== 0` themselves
- Wrap TikTok calls in try/catch → `{ error: err.message }` 500; the known sentinel errors are `BUSINESS_NOT_AUTHENTICATED` / `ACCOUNT_NOT_AUTHENTICATED` / `NOT_AUTHENTICATED`

## Cookie conventions

Every cookie set or cleared MUST carry the full flag set (Aikido checks this):
```js
{ httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: <seconds or 0 to clear>, path: '/' }
```
Cookies in use: `admin_session` (400d, refreshed by middleware), `biz_token` (30d), `acct_token` (30d), `tiktok_oauth_state` (legacy flow only).

## Middleware interactions (`middleware.js`)

Next.js 16 deprecated this file convention in favor of `proxy.js`/`export function proxy()` — see https://nextjs.org/docs/messages/middleware-to-proxy. Deliberately NOT migrated yet (tried July 2026, reverted same day): the rename immediately preceded an Aikido "CSP header not set" finding (risk 91) on production, and there are documented Vercel-specific deploy failures tied to this exact rename (`ENOENT ... proxy.js` during build — see https://github.com/vercel/next.js/discussions/84842). Couldn't confirm from this environment whether the two are actually connected or coincidental (no direct access to live prod headers or the Vercel deploy dashboard), so reverted to the known-working `middleware.js` rather than leave a possible CSP gap live while investigating. Re-attempt only with a live post-deploy CSP header check in hand, not just a local build/start check — local `next start` verified fine both times, which didn't catch whatever happened (if anything) in the real Vercel environment.

Matcher covers `/admin*`, `/api/admin/me`, `/api/admin/login`, `/legal/tiktok*`. Everything else — including the rest of `/api/admin/*` — is NOT middleware-protected and relies on its in-route `requireAdmin`. `/auth/tiktok/*` passes through freely (OAuth entry routes do their own auth). If you add a page under `/admin/`, it's automatically cookie-gated; a new admin API route must do its own key check.

## Redirect rule

Server-side redirects to app pages go through a `safeRedirect` + `ALLOWED_PATHS` allowlist and `absoluteUrl()` (`lib/site-url.js`). Client-side, only assign `window.location.href` to hardcoded string literals — never interpolate user/state input (Aikido open-redirect findings, fixed July 2026; don't regress).
