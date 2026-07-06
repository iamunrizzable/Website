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
| scam | 40 | any URL, crypto, telegram/whatsapp handles, money-per-day |
| negativity | 35 | mockery, "L + ratio", "nobody asked" family |
| profanity | 35 | obfuscation-tolerant (`f+[u*]+c+k+`) |
| spam | 25 | f4f, repeated chars, "check my bio" |
| promo | 15 | self-promotion |
| caps | +10 | >70% uppercase on 10+ chars |

Score capped at 100. **Thresholds: ≥ 25 → `action: 'hide'`; ≥ 60 → email alert (`shouldAlert`).** Note 25 means a single spam or promo+caps match triggers hiding — when Tyler says "it's hiding too much / too little," tune pattern lists or these two numbers, nothing else.

Test any scorer change via `POST /api/moderate` `{ text }` (unauthenticated, also drives the TestPanel on both UIs) — it returns `{ score, flags, action, suggested_reply }`.

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

## Email alerts (`lib/email/alerts.js`)

Nodemailer → SMTP (Gmail defaults) → tyler@tjbmanagementinc.com, hardcoded. Skips silently when `SMTP_USER`/`SMTP_PASS` unset — so "no alert arrived" first check is env vars, second is score < 60. Minor detections get a special 🚨 subject + red banner.

## Crons (`vercel.json`)

- `/api/cron/sync-comments` — daily 00:00 UTC, `autoHide: true`, auth `Bearer ${CRON_SECRET}`. Returns 200 (not 5xx) when account token is missing so Vercel doesn't mark the cron as failing.
- `/api/cron/process-blocks` — daily 01:00 UTC.
- Cron auth is a plain string compare — there is no JWT anywhere in this repo (Aikido JWT findings are false positives).
