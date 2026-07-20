# TJB Management Inc. — Engineering Handbook

*Blueprints for the next engineer. If you read nothing else before touching this repo, read this.*

Last major revision: July 20, 2026.

---

## 1. What you're holding

One Next.js repo, three products:

1. **Marketing site** — tjbmanagementinc.com, ~15 static-feeling pages for a TikTok LIVE creator agency.
2. **Hallie** — a TikTok comment-moderation platform. Public operators connect their own TikTok Business account at `/hallie/tiktok-moderation/system`.
3. **Admin panel** — `/admin`, Tyler's cockpit. Superset of Hallie plus token management and debug tooling.

Stack: Next.js 16 App Router, React 19, Vercel serverless, no database (cookies + in-memory + optional Upstash Redis), no TypeScript, no test framework, inline styles. Every page is server-rendered per request (forced dynamic — required by the CSP nonce, see §5).

## 2. The five laws (from CLAUDE.md — non-negotiable)

1. **Never change the apply link** `https://www.tiktok.com/t/ZTkgQvTCb/`.
2. **Everything ships to `main`** (which is production — Vercel deploys on push). Keep the dev branch `claude/general-session-v2pLH` synced to main after each push.
3. **Only make changes explicitly requested.**
4. **Never guess at a fix.** Confirm root cause by reproduction or trace, or ask. No speculative deploys.
5. **`/admin` and `/hallie/tiktok-moderation/system` are mirrored.** A feature shipped to one and not the other is a bug — with documented exceptions (token export, raw-API-response debug buttons: admin-only by design).

## 3. Where the knowledge lives

The deep documentation is the **skill library** in `.claude/skills/` — it auto-loads for AI sessions and is readable by humans:

| Skill | Read it when |
|---|---|
| `codebase-map` | You're new, or touching auth/tokens/TikTok code |
| `mirrored-admin-system` | Changing ANY panel/UI on either dashboard |
| `tiktok-tokens-and-oauth` | Anything OAuth, tokens, "Not connected" |
| `tiktok-api-calls` | Writing/altering any TikTok API call |
| `moderation-pipeline` | Scorer, sync, rules, alerts, block queue |
| `api-route-conventions` | Adding/changing any API route |
| `deploy-env-and-security` | Deploys, env vars, CSP, Aikido/CodeQL findings |
| `frontend-conventions` | Building/editing any page or panel |
| `debugging-playbook` | **FIRST**, whenever something is reported broken |

Start with `codebase-map`. When something breaks, start with `debugging-playbook`. The war-story companion to the playbook is `.claude/skills/tiktok-api-calls/reference/todays-work-log.md`.

## 4. The map in one screen

```
app/
  page.js, agency, tyler, hallie, merch, links, contact-*, legal/*  ← marketing pages (dark purple theme; each has a sibling page.css for its background + static styles)
  layout.js               ← root: metadata + viewport themeColor (#0f172a, for iOS Safari chrome)
  globals.css             ← reset + html/body flat fallback bg (#0f172a, matches page overlays)
  admin/page.js                       ← Tyler's dashboard (one big client component)
  hallie/tiktok-moderation/system/page.js  ← operator dashboard (mirror of admin)
  api/
    admin/*, business/*   ← admin-only: x-admin-key header, shared token store
    system/*              ← operator: acct_token cookie, per-operator isolation, inline fetch
    cron/*                ← Vercel Cron, Bearer CRON_SECRET
    moderate, dm, agency  ← unauthenticated by design
lib/
  tokens.js              ← THE data layer (Redis|memory|cookie); token get/store + auto-refresh
  oauth-state.js         ← HMAC-signed OAuth state (CSRF)
  site-url.js            ← absoluteUrl() — redirects use canonical origin, never the request Host
  sync.js               ← shared comment sync (admin + cron); scorer + auto-hide + alerts + block queue
  moderation/scorer.js  ← regex rule engine + custom keyword rules
  tiktok/business-api.js ← main TikTok client (parseRes() fixes 19-digit ID corruption)
  tiktok/business-oauth.js ← auth URLs + token exchange + refresh
  tiktok/browser.js     ← Puppeteer user-blocking (no API exists for it)
middleware.js           ← per-request CSP nonce + admin session gate
next.config.js          ← static security headers (CSP lives in middleware.js); poweredByHeader:false
```

## 5. The things that will bite you (all learned the hard way)

- **TikTok's error message is the documentation.** `40002 "query: value is required but missing"` means the param is literally named `query`. Send a deliberately-bad enum value and TikTok lists every valid one in the error (that's how the Benchmark dropdown got its 25 categories). Read the error before you read any docs or guess.
- **Never render against a guessed response shape.** Every field-name guess this repo made was wrong (`title`→`caption`, `keywords`→`search_keywords`, objects→plain strings). Get one real payload — admin's "View raw API response" button exists for this — then write the display.
- **19-digit IDs.** TikTok returns 19-digit numeric IDs; `JSON.parse` silently corrupts them. Always use `parseRes()` in business-api.js (quotes 16+-digit numbers before parsing). A comment action returning `code:0` that does nothing = corrupted ID.
- **Two token types, don't confuse them.** Advertiser token (rules) vs account token (content/comments). Comment *writes* need the **numeric** `business_id`, not the `open_id` (leading `-`). Read working ≠ write working.
- **Tokens auto-refresh (July 2026) — but only the shared ones.** `lib/tokens.js` refreshes admin advertiser + account tokens 5 min before expiry, only if a `refresh_token` exists (old stored tokens have `null` — one reconnect fixes it). The account-token refresh response omits `business_id`, so the refresh code re-injects it or comment writes silently downgrade to read-only. System per-operator cookie tokens have NO refresh yet.
- **CSP is nonce-based in middleware, not next.config.js.** Every page is `force-dynamic` because of it. Don't add a static CSP header or remove the force-dynamic — you'll double the CSP and break every page.
- **"This page couldn't load" on iOS is OUR crash**, not a network error — it's Next's client error boundary. Reproduce with headless Chromium against the exact URL + cookies; the real error is in `pageerror`. Test the *connected* state (set an `acct_token` cookie) — the disconnected state hides panel crashes.
- **No Redis in prod right now.** Durable state = cookies + env vars only. In-memory "works locally, gone in prod" is expected on serverless. This is why **automated user-blocking has never actually completed end-to-end**: `queueBlock` writes to memory, and the daily cron that drains the queue is a separate (cold-start) invocation that sees an empty queue. It needs `UPSTASH_REDIS_*` set to ever work.
- **Puppeteer/@sparticuz/chromium needs bundler escape hatches.** `next.config.js` must have `serverExternalPackages: ['@sparticuz/chromium','puppeteer-core']` AND `outputFileTracingIncludes` copying `./node_modules/@sparticuz/chromium/**` into each route that uses `lib/tiktok/browser.js`. Missing the second → "input directory .../bin does not exist", a crash that ONLY appears on Vercel, never in local build. Add an `outputFileTracingIncludes` entry for any new browser-using route.
- **The mobile background seam (three commits to solve).** Every page's fixed `body::before` background must be sized `top:-10lvh; height:120lvh` — oversized **large-viewport** units. `dvh` resizes with iOS Safari's toolbar and drags the background edge visibly during scroll ("zooms in and out"); a flat fallback color can't match a photo background; and Safari's translucent toolbar defeats theme-color alone. See frontend-conventions skill. You cannot verify Safari chrome in headless Chromium — confirm on a real phone.
- **`middleware.js` stays named `middleware.js`.** Next 16 wants `proxy.js`; the rename was tried and reverted (an Aikido "CSP header not set" risk-91 finding landed right after, unconfirmable from the sandbox, plus documented Vercel ENOENT failures for that rename). The deprecation warning is harmless. Don't re-rename without a live post-deploy CSP-header check.
- **TikTok exposes no age or bot signal for any user** — not commenters, not even the connected account. "Detect if a commenter is a minor / a bot" is not API-answerable; minor detection is regex on what they literally type, and any bot heuristic must come from scraping their public profile (`getProfileSignals`, admin-debug only, unproven against TikTok's bot detection).
- **Some TikTok endpoints need account-side setup we can't do in code.** `hashtag/add` (Mentions) only enables a hashtag already registered as a "brand hashtag" on the account — a TikTok-portal process, not our API. Five request-shape "fixes" failed before this was understood; the endpoint was never the bug. When docs are needed and the portal is login-walled (all `portal/*` URLs 403 anonymously), have Tyler paste the request example rather than guessing from the endpoint name.

## 6. Definition of done (every change)

1. Confirmed root cause (never a guess).
2. Both `/admin` and `/system` updated if it's a mirrored surface.
3. `npm run build` passes.
4. Verified the way that actually exercises the code — reproduce the exact failing case after the fix (real browser / real cookies, not a proxy or the disconnected state). If it can't be verified in-sandbox (needs live TikTok data), say so and confirm on the next real attempt.
5. Committed straight to `main`, dev branch synced, pushed. (Kill any stale `next start` first; never chain `pkill` with git — it aborts the commit.)

## 7. Operational reflexes

- **Git push rejected (403/fetch-first):** Tyler pushes to `main` too. `git pull origin main --rebase`, then push. Retry network failures with backoff.
- **Dependabot PRs:** minor/patch grouped weekly (safe to merge); **major bumps go to Tyler first** — a broken major hits production with no staging.
- **Scanner findings (Aikido/CodeQL):** many are false positives (JWT findings — there's no JWT here). Real ones need *structural* fixes, not runtime checks (SSRF took 3 rounds to satisfy CodeQL — the winning move was a literal-prefix URL + charset-constrained token, not a validate-then-fetch guard).
- **TikTok Business Messaging API (DSPR/USDS):** the legal doc at `/legal/hallie-tiktok-moderation-system` is the compliance artifact. Keep it *true* — fabricated security claims (there were some) are a disqualifier per TikTok's own rules.

---

*The one line to remember: the API's own error message is the documentation — but when the error keeps lying (see the Mentions hashtag saga: five "fixes" chasing an error that was reporting a missing account setup, not a bad request), get the real request/response example from someone who can reach the login-walled docs. Read the error, read the real payload, THEN write code. Almost every wrong turn in this repo came from writing against a guess — a field name, a response shape, an endpoint's purpose, a viewport unit. Confirm the shape of reality first.*

*Two more that cost the most time recently: (1) production-only failures are real and invisible locally — Redis-less state, Vercel bundling, iOS Safari chrome, deploy-only crashes all pass a local build; when a fix "should work" but Tyler says it doesn't, believe him and look for the layer you can't see from here. (2) Say what you can't verify. Half of this session's dead ends were things confidently called "fixed" that were only fixed in a sandbox that can't render Safari, can't reach TikTok, and isn't a Lambda. Ship the fix, then name exactly what still needs Tyler's real device / real account to confirm.*
