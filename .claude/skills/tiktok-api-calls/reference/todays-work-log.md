# Session Log & Field Manual — 2026-07-07/08

Written by the outgoing engineer for whoever picks this up next — human or AI.
Read the `.claude/skills/*` files first; this is the war-story companion to them.

## What we shipped today (newest first)

**Token durability**
- Auto-refresh the shared **account** token 5 min before expiry (endpoint confirmed from TikTok's own docs; preserves numeric `business_id` the refresh response omits).
- Auto-refresh the shared **advertiser** token 5 min before expiry (endpoint from third-party sources; fails safe).

**Mentions / Trending & Discovery (built this session, both `/admin` + `/system`)**
- New MentionsPanel (Videos, Comments, Top Words, Top Hashtags, Tracked Hashtags) and TrendingPanel (Trending, Keywords, Hashtag Suggestions, Benchmark).
- New `/api/system/mentions`, `/api/system/trending` (cookie-scoped, per operator).
- Keywords: TikTok wants param `query`, not `keyword`.
- Hashtag Suggestions: require input, don't auto-fire empty; render `{name, view_count}` as `#name · N views`.
- Tracked Hashtags: needs `username` — auto-filled from account data, no input shown.
- Benchmark: needs `business_category` — dropdown of the 25 valid values TikTok's error message revealed.
- "View raw API response" is **admin-only** (removed from public system page — info-disclosure risk).

**Automated Rules — rebuilt**
- Was calling `/optimizer/rule/*` (TikTok's ad-campaign engine — wrong API for comments). Now a local `{id,name,keywords}` list applied by the scorer during Comment Sync. No TikTok call.

**Comments UX**
- Photo-post links (`/photo/…`) and `tiktok.com/t/…` share links now resolve (SSRF-safe resolver).
- OK/Hidden badge on every loaded comment, amber Hidden, matching sync layout, via shared `s.statusBadge`.

**Security / infra**
- CSP: removed `unsafe-eval`, replaced `unsafe-inline` with per-request nonce + `strict-dynamic` (middleware).
- SSRF fix on the link resolver (literal-prefix URL, charset-constrained code).
- Dependabot enabled; react 19 + next 16 upgrades verified; `actions/checkout@v5`.
- DSPR legal doc: removed fabricated claims (Oracle MFA, annual pentest), corrected to reality.

**Menus**
- All 13 pages: added Hallie Moderation System + Admin Panel links, regrouped, renamed.

## The rules (also in debugging-playbook — internalize these)

1. Never guess a fix — reproduce or trace to confirmed cause, else ask.
2. TikTok error messages ARE the docs (they name the wrong param; bad values dump the enum).
3. Never render against a guessed response shape — get one real payload first.
4. "This page couldn't load" on iOS = our client crash; reproduce in headless Chromium.
5. Verify the state that runs the code (connected, real cookies, click the tab).
6. A reload fixing auth = transient, not expiry.
7. Scope/endpoint names lie — verify the request schema fits the feature.
8. Auto-fill values the app already has; don't ask the user to type them.
9. Refreshes can downgrade tokens — preserve IDs the refresh response omits.
10. Kill stale local servers; verify `✓ Ready` on a fresh port before trusting a test.
11. Never chain `pkill` with git — separate commands; check `git log` after.
12. Static-analysis findings need structural fixes, not runtime checks.
13. Mirror `/admin` ↔ `/system` unless there's a documented reason not to.
14. `npm run build` + real verification before every push; commit straight to `main`.
