---
name: debugging-playbook
description: Symptom-to-cause playbook for the recurring failure modes of this app — token/auth failures, comment actions silently not working, syncs returning zero, missing emails, broken blocks, and deploy mismatches. Use FIRST when Tyler reports something broken, before proposing any fix (CLAUDE.md forbids speculative fixes).
---

# Debugging Playbook

House rule: **never guess.** Reproduce or trace the failing path to a confirmed root cause; if you can't confirm, present findings and ask. Do not deploy speculative changes.

## "Not connected" / 401 from panels

1. Which panel? `/admin` needs `admin_session` cookie + `x-admin-key`; `/system` needs `acct_token` cookie.
2. Which token does the endpoint need? Rules → advertiser; content/comments → account. Check `/api/admin/status` (admin) or `/api/system/status` — they report connection state, IDs, and expiry.
3. Expired (`expires_at` in the past)? As of July 2026 the **shared (admin) advertiser and account tokens auto-refresh** 5 minutes before expiry on read (`refreshBusinessTokensIfNeeded` / `refreshAccountTokenIfNeeded` in lib/tokens.js) — but only if a `refresh_token` was captured at connect time (older stored tokens have `refresh_token: null`; one fresh reconnect fixes that). The **system side's per-operator cookie tokens still have NO refresh** — operators re-connect when theirs expire. A reload "fixing" an auth error means the token was never expired (expired cookies don't come back) — that's a transient/cold-start hiccup, not an expiry bug.
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

## Method rules — earned the hard way (July 2026 session)

Every one of these came from a real incident in this repo. Break them and you will re-live that incident.

1. **TikTok's validation errors are documentation.** Error 40002 names the exact missing/misnamed param ("query: value is required but missing" → the param is literally named `query`, not `keyword`), and sending a deliberately bad value makes TikTok list the entire valid enum in the error text (that's how the Benchmark business_category dropdown got its 25 values). When a TikTok call fails, read the error before reading any docs.
2. **Never code against a guessed response shape.** Every field-name guess this session was wrong (`title` → actually `caption`; `keywords` → actually `search_keywords`; objects → actually plain strings). Get one real payload first — admin's "View raw API response" buttons exist for exactly this — then write the renderer against it. Panels showing "No data found" over a `code: 0` response = extractor looking at the wrong key, not an API problem.
3. **iOS "This page couldn't load" is OUR crash page, not a network error.** It's Next.js's client error boundary: server returns 200 (SSR renders the pre-hydration state fine), then the client render throws. Reproduce with headless Chromium against the exact URL with the exact cookies — the crash message (`o.tab is not a function`) is in `page.on('pageerror')`. Do not theorize about timeouts/DNS/redirect loops first; put a browser on it.
4. **Verify the state that actually exercises the code.** The `s.tab` crash shipped because verification rendered admin and the system page's *disconnected* state — the broken panels only mount after connect. Test connected (set an `acct_token` cookie) and click the actual tabs.
5. **A reload fixing an auth error rules out expiry.** Expired/missing cookies don't come back on reload. That symptom = transient server-side hiccup, not a token bug — don't chase it as one.
6. **Scope names lie; verify what an endpoint family actually does before building on it.** "Automated Rules" scope = TikTok's ad-campaign optimizer engine (`apply_objects`, budget rules), zero comment/keyword concepts. Two implementations were built on that wrong assumption before checking the real create-body schema in TikTok's SDK docs. Read the request schema first; if the fields don't fit the feature, it's the wrong API no matter what the name says.
7. **Auto-fill over ask.** If a required value already exists in data the app can fetch (the account's own `username` from `/business/get/`), wire it — never render an input asking the operator to type what the system already knows.
8. **Token refreshes can silently downgrade tokens.** TikTok's account-token refresh response returns `open_id` but never `business_id`; naive re-store would regress comment writes to read-only on the first refresh. When re-storing a refreshed token, explicitly preserve IDs the response omits.
9. **Stale local servers poison verification.** Two test runs this session hit a leftover `next start` from an earlier check and "verified" old code (old error strings gave it away). Always: check `ps` for running servers, use a fresh port, and confirm `✓ Ready` in the *new* log before trusting any curl/browser result.
10. **Never chain `pkill` with git in one command** — it kills the shell mid-chain and the commit/push silently doesn't happen (twice this session). Kill processes and run git as separate commands, and check `git log` afterward.
11. **Static-analysis findings need structural fixes, not runtime checks.** CodeQL's request-forgery rule rejected two rounds of "validate then fetch" (regex host check, allowlist rebuild) and only cleared when the fetch URL became a string literal + charset-constrained token with no response-data loop. If a scanner re-flags a genuinely-safe fix, restructure the data flow so safety is provable, or dismiss with documented reasoning — don't keep half-strengthening.
12. **Re-run the exact failing reproduction after the fix.** Not a proxy, not a different page, not the disconnected state — the same URL/cookies/steps that failed. If the repro can't run in the sandbox (real TikTok data), say so explicitly and get the result from Tyler's next real attempt.
13. **The endpoint name is a hypothesis, not a spec — get the real request example before "fixing" a param.** `hashtag/verify/list` sounds like "submit a hashtag, get told if it's valid"; it's actually a read-only LIST endpoint that takes NO hashtag param (just business_id + username) and returns the account's already-verified hashtags. Five separate "fixes" failed — plural `hashtags`, case, content, mentioner-username — all because they assumed a request shape from the name and error text. The error "no valid hashtag for this username" wasn't rejecting our hashtag; it was reporting the account simply has zero brand hashtags registered (a TikTok-side setup gap no API call from us can create). It only got solved when Tyler pasted TikTok's own example request from the (login-walled) docs. When docs are gated to logged-in accounts and you can't reach them, the move is to have Tyler paste the request/response example, not to keep reverse-engineering from error strings.
14. **iOS-Safari-only visual bugs are unreproducible in headless Chromium — reason from the mechanism, and use Tyler's phrasing as data.** The "colors cut and mismatch at top and bottom" seam took three commits because the first two treated it as a color-matching problem (it's a photo background — no flat color matches) and the third as browser-chrome (theme-color — but Safari's toolbar is translucent). The decisive clue was Tyler saying "the bad spot zooms in and out when I scroll" — that's the signature of `dvh` resizing with the toolbar. When a viewport/scroll visual bug is iOS-only, the culprit is almost always dynamic viewport units (`dvh`/`svh`) or the mobile URL bar; see the frontend-conventions mobile-background section for the confirmed pattern (oversized `lvh`). Screenshot verification proves layout, never Safari chrome behavior.
15. **A "deprecated" warning is not urgent; a severe scanner finding right after your change is.** Renaming middleware.js→proxy.js (Next 16 deprecation) was correct per the warning, verified against Next's own source, built and ran clean locally — then Aikido flagged "CSP header not set" (risk 91) on prod immediately after. Could not confirm from the sandbox whether the rename caused it (no live-prod-header access — network policy blocks the domain), but there ARE documented Vercel deploy failures for this exact rename (ENOENT proxy.js). Reverted rather than leave a possible CSP gap live while investigating. Lesson: when a low-value cleanup precedes a high-severity finding you can't disprove locally, revert first, investigate after — a local build/start passing does NOT rule out a Vercel-specific difference (§"Works locally, broken in prod"). Re-attempt file-convention/build-config changes only with a live post-deploy header check in hand.
16. **Same-endpoint bugs come in layers — fixing the request format doesn't mean the feature works.** hashtag/add's request shape was correct the entire time; the blocker was a TikTok account-setup prerequisite ("brand hashtag" registration) entirely outside our code. And the block-queue "not working" was actually TWO independent failures stacked: (a) Redis isn't configured so the queue never survives to the next cron, AND (b) @sparticuz/chromium wasn't externalized so Puppeteer crashed before reaching a profile anyway. When a fix "should work" but the feature still doesn't, assume another layer, and be honest that a request-format fix is not an end-to-end fix until the whole path is exercised (which for TikTok often means Tyler's real account).

## Method rules, round two (July 2026, second session)

13. **Three separate things paint "the background" on iOS — they must all agree.** ① The page's fixed `body::before` photo-composite layer, ② the `html`/`body` fallback color (shows during overscroll/toolbar transitions), ③ Safari's own chrome tinted by the `theme-color` meta tag (page CSS can NEVER recolor browser chrome). The "colors cut and mismatch at top and bottom" bug took three rounds because each fix addressed only one layer. And the units matter: `100dvh` **live-resizes with Safari's toolbar** — a layer sized with it has a *moving* edge ("the bad spot zooms in and out when I scroll" was
