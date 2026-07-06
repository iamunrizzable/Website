---
name: tiktok-tokens-and-oauth
description: The three TikTok OAuth flows, the three token types, where each token lives, and how the callbacks work. Use when debugging "Not connected"/401s, adding OAuth functionality, touching anything in app/auth/tiktok/, lib/tokens.js, or lib/tiktok/*oauth*.js, or when a token needs to be persisted or exported.
---

# TikTok Tokens & OAuth

Three separate flows, three token types, three storage keys. Confusing them is the #1 source of bugs in this repo.

## Token type 1: Advertiser token ("business")

- **Purpose:** optimizer/automated rules (`advertiser_id`-scoped endpoints)
- **Get one:** `/auth/tiktok/business/login` → Business Portal (`tiktok_advertiser_authorization_url` env) → callback `/auth/tiktok/business/callback` receives `auth_code` → exchanged at `business-api.tiktok.com/open_api/v1.3/oauth2/access_token/` (JSON body, `app_id` + `secret`)
- **Identity:** `advertiser_id` = `data.advertiser_ids[0]`
- **Storage lookup order** (`getBusinessTokens()` in lib/tokens.js): ① `TIKTOK_ADVERTISER_TOKEN` env var (JSON string — export it from the admin panel's "Export Advertiser Token" card, paste into Vercel) ② Redis ③ in-memory ④ `biz_token` cookie (30-day, set by callback)
- **Header:** `Access-Token: <token>` + `advertiser_id` param

## Token type 2: Account token

- **Purpose:** everything content-related — account info, videos, comments (read AND write), mentions, trending
- **Two ways to get one, and they are NOT equivalent:**
  - **Business Portal flow** (preferred): callback receives `auth_code` → exchanged at `.../tt_user/oauth2/token/` → yields **numeric `business_id`** → comment WRITE actions (hide/delete/pin/reply) work
  - **Login Kit flow** (fallback): callback receives `code` → exchanged at `open.tiktokapis.com/v2/oauth/token/` (form-encoded, `client_key`/`client_secret`) → yields only `open_id` (starts with `-`) → READ endpoints work, **WRITE endpoints reject it**
- **Known IDs:** numeric Business Center ID `7632045808657368084` (env `TIKTOK_BUSINESS_ID`); Login Kit open_id `-000yp9tW9MisgetpAczsWTyM_Z1VHZX70Aq` (read-only)
- **Storage:** `acct_token` cookie (30-day HttpOnly) always; shared Redis/memory ONLY for the admin flow — the system flow deliberately stores cookie-only for per-operator isolation (see `app/auth/tiktok/account-callback/route.js`)
- **Headers:** Business API → `Access-Token:` + `business_id` param; Open Platform (`open.tiktokapis.com/v2`) → `Authorization: Bearer`

## Token type 3: Legacy Login Kit sandbox token

`lib/tiktok/oauth.js` + `lib/tiktok/api.js` + `/auth/tiktok/login` + `/auth/tiktok/callback`. Only 3 scopes. Has its own refresh logic (`getValidToken()` refreshes 5 min before expiry — the ONLY flow with auto-refresh). Effectively dormant; don't build on it.

## Entry routes and state prefixes

| Route | State prefix | Flow | Lands in |
|---|---|---|---|
| `/auth/tiktok/business/login` | (none) | Advertiser | `biz_token` / shared store |
| `/auth/tiktok/account-business/login` | `acct` | Business Portal account auth via business callback | `acct_token` / shared store |
| `/auth/tiktok/account-login` | (none) | Account (env-URL, currently Login Kit) | `acct_token` / shared store |
| `/auth/tiktok/system-login` | `system` | Account, operator-facing, **no admin auth required** | `acct_token` cookie ONLY |
| `/auth/tiktok/login` | random (cookie-compared) | Legacy sandbox | legacy store |

State tokens are HMAC-signed (`lib/oauth-state.js`, keyed by `ADMIN_SECRET`): format `type:random.hexsig`. `getStateType()` reads the prefix (safe pre-verification because it only ever selects between hardcoded destinations); `verifyState()` must pass before any token exchange.

## Callback redirect rules (security — Aikido-audited)

Every callback redirect MUST go through the local `safeRedirect(path)` helper: destination is checked against an `ALLOWED_PATHS` allowlist and built with `absoluteUrl()` from `lib/site-url.js` (canonical origin, never the request's Host header). When adding a new post-OAuth destination, add it to `ALLOWED_PATHS` in that callback — do not bypass the helper. Login/entry routes accept admin auth from `x-admin-key` header, `?key=` param, OR the `admin_session` cookie (so the admin UI never puts the key in a URL).

## Debugging a "Not connected" / 401

1. Which token does the failing endpoint need? (rules → advertiser; content → account)
2. Cookie present? `biz_token` / `acct_token` are HttpOnly, 30-day; the browser that completed OAuth holds them. A different browser/device = not connected (no Redis configured → no shared persistence across serverless instances except env var).
3. Expired? Tokens store `expires_at` (ms). **No auto-refresh in the business flows** — re-run OAuth.
4. Comment write rejected with a read-capable token? You have an `open_id`, not a numeric `business_id` — redo auth via the Business Portal flow.
5. Serverless cold start lost in-memory tokens? Expected — that's why the env var + cookie fallbacks exist. For the advertiser token, set `TIKTOK_ADVERTISER_TOKEN` in Vercel (export from admin panel).
