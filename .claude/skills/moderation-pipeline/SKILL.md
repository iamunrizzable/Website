---
name: moderation-pipeline
description: How comment moderation works end to end — scoring rules and thresholds, sync flows, dedup, email alerts, the minor-detection block queue, and browser automation. Use when tuning the scorer, changing sync behavior, debugging why a comment was/wasn't hidden, or touching lib/moderation, lib/sync.js, lib/tiktok/browser.js, or the cron routes.
---

# Moderation Pipeline

## Scoring (`lib/moderation/scorer.js`)

Pure regex rule engine — no ML, no API calls, deterministic and free. Categories score once each (first matching pattern per category, then break):

| Category | Points | Notes |
|---|---|---|
| hate_speech | 90 | slur patterns |
| potential_minor | 70 | age statements, grade levels, "minor"/"underage" — ALSO queues an account block |
| harassment | 65 | kys, death wishes, personal attacks |
| scam | 40 | any URL, crypto, telegram/whatsapp handles, money-per-day, tag-a-recovery-account testimonial-bait |
| negativity | 35 | mockery, "L + ratio", "nobody asked" family |
| profanity | 35 | obfuscation-tolerant (`f+[u*]+c+k+`) |
| spam | 25 | f4f, repeated chars, "check my bio" |
| promo | 15 | self-promotion |
| caps | +10 | >70% uppercase on 10+ chars |

Score capped at 100. **Thresholds: ≥ 25 → `action: 'hide'`; ≥ 60 → email alert (`shouldAlert`).** Note 25 means a single spam or promo+caps match triggers hiding — when Tyler says "it's hiding too much / too little," tune pattern lists or these two numbers, nothing else.

Test any scorer change via `POST /api/moderate` `{ text }` (unauthenticated, also drives the TestPanel on both UIs) — it returns `{ score, flags, action, suggested_reply }`. When Tyler screenshots a scam/spam comment that slipped through as "OK", ALWAYS: (1) add the pattern, (2) run the exact reported text through `/api/moderate` to confirm it now scores/hides, (3) test a benign near-miss so the new regex doesn't over-hide. Example added July 2026 — the "tag a fake recovery account + testimonial" template (`@"handle" 💯 help me`, `@handle helped me`, `reach out to @handle`): two `scam` patterns matching a tagged/quoted handle near testimonial words (help me / reach out / recommend / life saver / legit / god bless), verified to match the report and NOT match innocent shoutouts (`shoutout @friend love your videos`).

### `potential_minor` detection = regex only, high-recall by design

It fires on explicit self-stated age 4–17 ("i'm 14", "14 years old", "age: 12"), school grades ("7th grade", "middle school", "freshman"/"sophomore"), and the literal words "minor"/"underage". It is pure keyword matching — no context, no account lookup. It will NOT catch indirect signals (birth year, "my mom won't let me", talking about homework) and WILL false-positive ("freshman year of college"). Deliberately over-flags to avoid missing a real minor. If Tyler asks "why doesn't it detect minors / bots from their account," the answer is: TikTok's API exposes no age or bot field for any user (see tiktok-api-calls), so detection is limited to what the commenter literally types plus (future) the public-profile scrape heuristic.

## Custom keyword rules ("Automated Rules" panel) — local storage, NOT a TikTok API

The "Automated Comment Rules" panel on both `/admin` and `/system` manages a simple `{ id, name, keywords[] }` list — **not** a TikTok API resource. `scoreContent(text, customRules)` takes an optional second argument: any custom rule whose keywords substring-match the comment text forces `score = max(score, 25)` and `action: 'hide'`, tagged with flag `custom:<rule name>`. Rules only take effect the next time Comment Sync runs (manual or cron) — there is no real-time hook.

Storage: admin's rules live in `lib/tokens.js` (`getCustomRules`/`storeCustomRules`, Redis-or-memory, same pattern as everything else there) and are passed into `lib/sync.js`'s `syncComments()` once per run. System's rules live in a `custom_rules` HttpOnly cookie (per-operator, no shared storage — same isolation model as `acct_token`) and are read once per run in `app/api/system/sync/route.js`.

**Why not just call TikTok's Automated Rules API?** Because `/optimizer/rule/*` (the endpoint family CLAUDE.md's approved-endpoints list calls "Automated Rules scope," and which the TikTok developer portal genuinely does grant under that name) is **TikTok's ad-campaign automation engine** — budget/bid/status rules bound to ads, ad groups, or campaigns. Confirmed from TikTok's own public SDK docs (`github.com/tiktok/tiktok-business-api-sdk`, `python_sdk/docs/OptimizerRuleCreateBody.md` and `OptimizerRuleCreateBodyRules.md`): a real create call requires `rules: [{ name, conditions[], actions[], apply_objects[], notification, rule_exec_info }]` — `apply_objects` binds to ad-campaign objects, and there's no comment/keyword concept anywhere in the schema. Two earlier implementations (`/automated_rule/*`, then `/optimizer/rule/*`) both silently failed to do anything for comment moderation because neither one is the right tool — not a payload bug, an architectural mismatch. Don't reach for `/optimizer/rule/*` for anything comment-related; the local custom-rules system above is the real mechanism.

`app/api/business/optimizer/route.js` still exists as raw (unused-by-any-UI) plumbing to the real Optimizer Rule API via `lib/tiktok/business-api.js`'s `listOptimizerRules`/`createOptimizerRule`/`updateOptimizerRuleStatus`/`listOptimizerRuleResults` — kept because it's the correct low-level access for genuine future ad-campaign automation, but its current payload shape (flat `rule_name`/`rule_type`/`conditions`/`action`) does **not** match the real schema above. Fix that shape before ever building a UI on top of it.

## The two sync implementations (intentionally separate)

1. **Shared sync — `lib/sync.js` `syncComments()`** (admin panel + daily cron): paginates videos (Open Platform) → comments (Business API) → **skips seen comments** (`isCommentSeen`, 30-day Redis TTL) → scores → `autoHide` hides ≥25 → `potential_minor` queues username in block queue → ≥60 sends email with suggested reply → pushes event to the feed (last 50, shown on admin page). Returns full event objects.
2. **System sync — inline in `app/api/system/sync/route.js`** (operator panel): cookie token, NO seen-dedup (re-scores everything each run), no alerts/block-queue/event-feed — just score + hide. Returns `{ synced, hidden, comments: [...] }`.

Don't merge them: the shared one has side effects (email, shared Redis state) that must not fire for external operators' accounts.

## Both sync UIs show the processed-comments list

`{ comments: [{ comment_id, username, text, score, action: 'hidden'|'ok' }] }` rendered with red Hidden / green OK badges, hidden first. Keep response shapes in lockstep (mirrored-admin-system skill).

## Minor detection → block queue → browser automation

No TikTok API exists for blocking users, so:
1. `potential_minor` flag → `queueBlock(username)` (Redis set `tiktok:block_queue`)
2. Email alert with red banner + "Block @user" link goes out immediately
3. Cron `/api/cron/process-blocks` (daily 01:00 UTC, `maxDuration: 60`) runs `blockTikTokUser()` — Puppeteer + @sparticuz/chromium loads the profile, clicks ⋯ → Block → confirm
4. Requires TikTok web-session cookies uploaded via `POST /api/admin/cookies` (Cookie-Editor export format is normalized to Puppeteer format). `NO_BROWSER_COOKIES` error → Tyler must re-export cookies from a logged-in browser
5. Failures stay in queue for retry; selector errors (`SELECTOR_NOT_FOUND:*`) usually mean TikTok changed their DOM — update the selector lists in `lib/tiktok/browser.js`

**Two reasons this whole path has likely NEVER run end-to-end in prod (both real, both found July 2026):**
- **Redis isn't configured** (`UPSTASH_REDIS_*` unset), so `queueBlock` writes to an in-memory `Map`. On Vercel that Map lives in one function invocation; the daily `process-blocks` cron is a *different* invocation (guaranteed cold start), so the queue is empty by the time the cron reads it. The block queue cannot survive from "flag" to "act" without Redis. Same gap silently breaks anything relying on `mem` across requests.
- **`@sparticuz/chromium` must be externalized from the bundler OR Puppeteer crashes before it opens a page**, with `The input directory ".../@sparticuz/chromium/bin" does not exist`. Next.js bundles the package by default, which breaks its runtime binary extraction. Fix (in `next.config.js`): `serverExternalPackages: ['@sparticuz/chromium', 'puppeteer-core']` AND `outputFileTracingIncludes: { '/api/cron/process-blocks': ['./node_modules/@sparticuz/chromium/**'], '/api/admin/debug-profile': ['./node_modules/@sparticuz/chromium/**'] }`. The first stops relocation; the SECOND is what actually copies the binary into the deployed function (serverExternalPackages alone left the dir missing — the error persisted until both were present). Verify by grepping the built `.next/server/app/api/.../route.js.nft.json` for `chromium.br` — that trace manifest is what Vercel packages. **Any new route importing `lib/tiktok/browser.js` needs its own `outputFileTracingIncludes` entry.**

## Commenter profile signals (`getProfileSignals`, admin-debug only)

`lib/tiktok/browser.js` `getProfileSignals(username)` anonymously loads a commenter's public profile (same stealth Puppeteer as blocking, no login cookies) and extracts TikTok's embedded `__UNIVERSAL_DATA_FOR_REHYDRATION__` / `SIGI_STATE` JSON + visible DOM stats. Goal: a bot-likelihood heuristic from public signals (followers/following/bio/avatar/verified). **Age is NOT obtainable** — TikTok exposes no birthdate for any user (not even the connected account) to third-party apps, so "is this commenter over 18" is not answerable by any endpoint or scrape; drop that goal. Wired to `GET /api/admin/debug-profile?username=X` (admin-only per the debug-tooling rule). Not yet in the sync pipeline — first confirm anonymous scraping even gets past TikTok's datacenter-IP bot detection (Vercel IPs are the risky kind) via a live test.

## Email alerts (`lib/email/alerts.js`)

Nodemailer → SMTP (Gmail defaults) → tyler@tjbmanagementinc.com, hardcoded. Skips silently when `SMTP_USER`/`SMTP_PASS` unset — so "no alert arrived" first check is env vars, second is score < 60. Minor detections get a special 🚨 subject + red banner.

## Crons (`vercel.json`)

- `/api/cron/sync-comments` — daily 00:00 UTC, `autoHide: true`, auth `Bearer ${CRON_SECRET}`. Returns 200 (not 5xx) when account token is missing so Vercel doesn't mark the cron as failing.
- `/api/cron/process-blocks` — daily 01:00 UTC.
- Cron auth is a plain string compare — there is no JWT anywhere in this repo (Aikido JWT findings are false positives).
