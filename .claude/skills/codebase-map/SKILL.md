---
name: codebase-map
description: Orientation map of the TJB Management codebase — what every directory, route family, and lib file does, and which parts are load-bearing. Read this first when starting any non-trivial task, when unsure where something lives, or before touching auth, tokens, or TikTok API code.
---

# Codebase Map — TJB Management Inc.

Next.js 15 App Router site on Vercel serverless. One repo, three jobs:

1. **Marketing site** for the TikTok LIVE creator agency (public pages)
2. **Moderation platform** ("Hallie") that scores, hides, and reports TikTok comments
3. **Admin tooling** for Tyler to manage tokens, rules, and syncs

## The two control panels (MIRRORED — see mirrored-admin-system skill)

| | `/admin` | `/hallie/tiktok-moderation/system` |
|---|---|---|
| Audience | Tyler (owner) | External operators ("Hallie" product) |
| Auth | `admin_session` cookie (middleware) + `x-admin-key` header on API calls | `acct_token` cookie only |
| API family | `/api/admin/*`, `/api/business/*` | `/api/system/*` |
| OAuth entry | `/auth/tiktok/business/login`, `/auth/tiktok/account-login`, `/auth/tiktok/account-business/login` | `/auth/tiktok/system-login` |
| File | `app/admin/page.js` (single big client component file) | `app/hallie/tiktok-moderation/system/page.js` (same) |

**Any feature added to one panel must be added to the other.** This is a Critical Rule in CLAUDE.md.

## Directory tour

### `lib/` — all real logic lives here
- `lib/tokens.js` — **the data layer.** Redis (Upstash) if configured, else in-memory Map, else cookie fallback. Stores: legacy tokens, advertiser (`biz_token`) tokens, account (`acct_token`) tokens, event feed, seen-comment dedup, block queue, browser cookies. `getBusinessTokens()` checks `TIKTOK_ADVERTISER_TOKEN` env var FIRST.
- `lib/oauth-state.js` — HMAC-SHA256-signed OAuth state (`type:random.sig`, keyed by `ADMIN_SECRET`). `generateState('system')` / `generateState('acct')` prefixes select post-callback behavior.
- `lib/site-url.js` — `absoluteUrl(path)` builds redirects against the canonical origin (`SITE_URL` env / tjbmanagementinc.com). **Never build redirects from the request Host header.**
- `lib/sync.js` — `syncComments()`: paginate videos → paginate comments → score → auto-hide → queue minor-blocks → email alerts → push events. Skips already-seen comments. Used by admin sync + cron. (The system panel has its OWN inline copy in `app/api/system/sync/route.js` — cookie-scoped, no seen-dedup.)
- `lib/moderation/scorer.js` — regex rule engine. Score ≥ 25 → hide. Score ≥ 60 → email alert. `potential_minor` flag → block queue.
- `lib/moderation/replies.js` — canned reply templates picked by flag.
- `lib/email/alerts.js` — nodemailer alerts to tyler@tjbmanagementinc.com. Silently skips if SMTP not configured.
- `lib/tiktok/business-api.js` — **the main TikTok client.** Advertiser-token functions (`auth()`) + account-token functions (`acctAuth()`). Contains the big-integer JSON parsing fix (see tiktok-api-calls skill).
- `lib/tiktok/business-oauth.js` — auth URL builders + token exchanges for both Business Portal flows.
- `lib/tiktok/oauth.js` + `lib/tiktok/api.js` — **LEGACY** Login Kit sandbox flow (3 scopes only). Used by `/auth/tiktok/login` + `/auth/tiktok/callback`. Kept for reference; the real flows are the business ones.
- `lib/tiktok/browser.js` — Puppeteer + @sparticuz/chromium automation that blocks TikTok users via the web UI (no API exists for blocking). Needs browser cookies uploaded via `/api/admin/cookies`.

### `app/api/` route families and their auth (see api-route-conventions skill)
- `/api/admin/*` — `x-admin-key` header (or `?key=`) === `ADMIN_SECRET`
- `/api/business/*` — same `x-admin-key` pattern; uses shared tokens from `lib/tokens.js`
- `/api/system/*` — reads `acct_token` cookie directly; per-user isolation
- `/api/cron/*` — `Authorization: Bearer ${CRON_SECRET}`; called by Vercel Cron (see `vercel.json`)
- `/api/moderate` — **unauthenticated by design** (internal scoring utility)
- `/api/dm` — Anthropic-powered DM reply generator (Hallie persona), **unauthenticated**
- `/api/agency` — agency application form: POST stores to Redis + emails Tyler; GET returns stored applications

### `app/auth/tiktok/` — OAuth routes (see tiktok-tokens-and-oauth skill)

### Marketing pages
`/` (home), `/agency`, `/tyler`, `/hallie`, `/merch`, `/links`, `/contact-*`, `/streaming-basics`, `/tiktok-guidelines`, `/legal/*`. Plain JSX, inline styles, dark purple theme (`#a855f7` accent, `#1e293b` cards, `bg-main.jpeg` fixed background).

**CRITICAL: the TikTok apply link `https://www.tiktok.com/t/ZTkgQvTCb/` must NEVER be changed.**

### Infrastructure
- `middleware.js` — runs on every non-asset request: builds the per-request **CSP with a script nonce + strict-dynamic** (no unsafe-inline/unsafe-eval); admin session gate for `/admin/*` + `/api/admin/me`; serves TikTok domain-verification text at `/legal/tiktok*`; refreshes the session cookie on every hit (400-day sliding window). Pairs with `export const dynamic = 'force-dynamic'` in `app/layout.js` — don't remove either half.
- `next.config.js` — `poweredByHeader: false` + the static security headers (HSTS, XFO, etc.; CSP lives in middleware). **Do not add headers to vercel.json** (that caused duplicate-header Aikido findings, removed 2026-07).
- `vercel.json` — crons only: sync-comments daily 00:00 UTC, process-blocks daily 01:00 UTC. (Old comment in the cron route saying "every 15 minutes" is stale.)
- `jsconfig.json` — `@/*` path alias to repo root.

## Known quirks / debt (flagged, intentionally not "fixed" without approval)
- "Automated Comment Rules" (`/api/business/rules`, `/api/system/rules`) is **local keyword storage, not a TikTok API call** — `/optimizer/rule/*` turned out to be TikTok's ad-campaign automation engine, not applicable to comment moderation. See the moderation-pipeline skill for the full story before touching this again.
- `/business/comment/hide/` is called with two different payload shapes: `action: 'HIDE'|'UNHIDE'` (business-api.js) vs `is_hidden: true|false` (system routes). Both have worked; don't unify without testing.
- `/api/admin/me` returns `ADMIN_SECRET` as JSON to anyone holding the `admin_session` cookie — by design, it's how the admin SPA gets its `x-admin-key`, but treat it as sensitive.
- `/api/system/rules`, `/api/dm`, and `/api/agency` GET have no caller auth. Known; change only if Tyler asks.
- No test suite, no linter config, no TypeScript. Verification = `npm run build` + manual testing on the deployed site.

## Critical rules (from CLAUDE.md — never violate)
1. Never change the apply link
2. Merge dev branch to main after every set of changes (in practice: work is committed straight to `main`, which is what deploys)
3. Only make changes explicitly requested
4. Never deploy speculative fixes — confirm root cause or ask
5. Mirrored UIs change together
6. Only call TikTok endpoints on the approved list in CLAUDE.md
