---
name: debugging-playbook
description: Symptom-to-cause playbook for the recurring failure modes of this app — token/auth failures, comment actions silently not working, syncs returning zero, missing emails, broken blocks, and deploy mismatches. Use FIRST when Tyler reports something broken, before proposing any fix (CLAUDE.md forbids speculative fixes).
---

# Debugging Playbook

House rule: **never guess.** Reproduce or trace the failing path to a confirmed root cause; if you can't confirm, present findings and ask. Do not deploy speculative changes.

## "Not connected" / 401 from panels

1. Which panel? `/admin` needs `admin_session` cookie + `x-admin-key`; `/system` needs `acct_token` cookie.
2. Which token does the endpoint need? Rules → advertiser; content/comments → account. Check `/api/admin/status` (admin) or `/api/system/status` — they report connection state, IDs, and expiry.
3. Expired (`expires_at` in the past)? Business-flow tokens have **no auto-refresh** — re-run OAuth.
4. Different browser/device than the one that OAuth'd? Cookies are the only persistence (no Redis) — reconnect, or for the advertiser token set `TIKTOK_ADVERTISER_TOKEN` in Vercel.
5. `TIKTOK_ADVERTISER_TOKEN` env var set but stale? It shadows everything else in `getBusinessTokens()` — a bad env value can't be fixed by re-OAuth; update the env var.

## Comment hide/delete/pin/reply "succeeds" but nothing happens

- Token has `open_id` (starts with `-`) instead of numeric `business_id` → writes rejected. Fix: re-auth via the Business Portal flow. (Read endpoints working ≠ write endpoints working.)
- 19-digit ID corrupted by `JSON.parse` → action targets a nonexistent ID. Any new fetch code must use the digit-quoting `parseRes()` pattern (see tiktok-api-calls skill).
- Check the actual TikTok envelope: `code !== 0` with HTTP 200 is a failure. Failed `commentAction` calls attach `_sent` (the exact body sent) for diagnosis.
- Comment already `status: 'HIDDEN'`? Hiding again is a no-op the UI may report as success.

## Sync returns 0 / too few comments

- Admin sync dedups: comments already processed within 30 days are skipped (`isCommentSeen`) — "0 new" right after a successful run is CORRECT behavior, not a bug.
- System sync has no dedup — 0 there means the videos really have no comments, pagination broke (check `has_more` loop), or the video list call failed silently (`json.code !== 0` breaks the loop early).
- Only some videos? `maxVideos` ("Last N videos" mode) caps the video pages fetched, and Business `video/list` vs Open Platform `video/list` return different field names (`item_id` vs `id`) — a wrong field yields undefined video IDs and empty comment queries.

## No alert email arrived

Order: ① score actually ≥ 60? (`POST /api/moderate` the exact text to check) ② `SMTP_USER`/`SMTP_PASS` set? (unset = silent skip, only a console.warn) ③ Gmail app-password valid / not rate-limited? ④ Recipient is hardcoded `tyler@tjbmanagementinc.com` in `lib/email/alerts.js`.

## Block queue not processing

① Cron ran? Daily 01:00 UTC only. ② `NO_BROWSER_COOKIES` → upload fresh TikTok web cookies via admin `POST /api/admin/cookies` (Cookie-Editor export). ③ `SELECTOR_NOT_FOUND:*` → TikTok changed their web DOM; update selectors in `lib/tiktok/browser.js`. ④ Function timeout — `maxDuration: 60` covers ~a handful of blocks per run; a long queue drains over days.

## OAuth callback lands on an error

- `?error=...` on /admin or /system → TikTok rejected the authorization (denied consent, bad redirect URI, expired portal URL). The message is TikTok's, URL-encoded.
- `State mismatch — possible CSRF` → signed-state verification failed: `ADMIN_SECRET` rotated mid-flow, URL truncated, or a genuinely forged/stale link. Restart the flow.
- Token exchange error mentions status 4xx → check which exchange endpoint fired: `auth_code` (Business Portal, JSON) vs `code` (Login Kit, form-encoded). The wrong portal URL in the env var sends the wrong param type.

## Works locally, broken in prod (or vice versa)

- In-memory state: local dev server keeps one process (state persists); Vercel spreads across instances (it doesn't). Anything that "works locally" via `mem` needs cookie/env persistence in prod.
- `secure` cookies don't set over http; `SITE_URL` defaults differ (localhost:3000 vs prod domain).
- Env vars differ between Vercel and local `.env` — `/api/debug` and `/api/admin/status` help enumerate what prod actually sees.

## Git push rejected (403 / fetch-first)

Tyler pushes to `main` directly from his side. `git pull origin main --rebase`, resolve (his version usually wins for files he touched), push again. Retry network failures with backoff.
