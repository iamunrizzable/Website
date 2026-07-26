---
name: mirrored-admin-system
description: How to make a UI or feature change to the /admin panel and the /hallie/tiktok-moderation/system panel in lockstep. Use whenever adding, changing, or removing any panel, button, API behavior, or display element on either page — they are mirrored and MUST be changed together.
---

# Mirrored UI Changes: /admin ↔ /system

The two panels are the same product for two audiences. A change shipped to only one of them is a bug. Work in this order: change one side fully, then port it, then verify both compile.

## Panel-by-panel mapping

| Feature | `/admin` (app/admin/page.js) | `/system` (app/hallie/tiktok-moderation/system/page.js) |
|---|---|---|
| Account info | `AccountPanel` → `/api/business/account` | `AccountPanel` → `/api/system/account` |
| Videos | `VideosPanel` → `/api/business/videos` | `VideosPanel` → `/api/system/videos` |
| Comment feed + actions | `CommentsPanel` → `/api/business/comments` | `CommentsPanel` → `/api/system/comments` |
| Comment sync | `SyncPanel` → POST `/api/admin/sync-comments` | `SyncPanel` → POST `/api/system/sync` |
| Keyword rules | `AutomatedRulesPanel` → `/api/business/rules` | `AutomatedRulesPanel` → `/api/system/rules` |
| Category filters | `CommentFiltersPanel` → `/api/business/category-filters` | `CommentFiltersPanel` → `/api/system/category-filters` |
| Test scorer | `TestPanel` → `/api/moderate` | `TestPanel` → `/api/moderate` (shared) |
| Token export | `ExportTokenPanel` → `/api/admin/export-token` | — admin-only, no mirror needed |
| Connection status | `ConnectionCard` → `/api/admin/status` | connected gate → `/api/system/status` |
| Mentions / Trending raw response debug | `MentionsPanel`/`TrendingPanel` — has "View raw API response" | — **intentionally admin-only** (see below) |

## Deliberate exceptions to mirroring

Not everything is mirrored on principle — a few things are admin-only by design:
- `ExportTokenPanel` (advertiser token export)
- **ALL debugging/diagnostic tooling, full stop — not just "View raw API response."** Test buttons, raw-response dumps, exploratory API probes (e.g. a "Verify (debug)" button added to poke an untested endpoint), anything whose purpose is internal investigation rather than a usable feature: admin-only, always. This has been violated twice now (the original "View raw API response" buttons, removed from system July 2026; and a "Verify (debug)" hashtag-probe button added to system and reverted the same day in July 2026) — the pattern is: **think "is this a debugging aid or a real feature?" before every Mentions/Trending/API-diagnostics change.** Admin = internal testing surface. System = usable-features-only surface. This is a permanent split, not a one-off exception — don't re-derive it per finding, just apply it every time.

## The three differences you must translate when porting

1. **Auth.** Admin fetches send `headers: { 'x-admin-key': adminKey }` and panel components receive `adminKey` (and often `enabled`) as props. System fetches send nothing — the server reads the `acct_token` HttpOnly cookie. When porting admin→system, strip the header and props; system→admin, add them.

2. **Backend route.** Admin/business routes live in `app/api/admin/*` and `app/api/business/*` and mostly call helpers in `lib/tiktok/business-api.js` (shared token storage via `lib/tokens.js`). System routes live in `app/api/system/*` and call the TikTok API **inline with fetch()**, pulling the token from the cookie — deliberately, so each operator's session stays isolated and nothing leaks into shared Redis/memory. Keep that pattern: don't refactor system routes to use the shared helpers.

3. **Copy/labels.** Admin says "Done — N **new** comments processed" (it dedups seen comments); system says "Done — N comments processed" (it re-scores everything). Behavioral differences like this are fine — the *feature set* is what must match, not every word.

## Response-shape parity

When you add data to one endpoint's response so the UI can render it, add the equivalent to the twin endpoint. Example (July 2026): sync endpoints both return `{ synced, hidden, comments: [{ comment_id, username, text, score, action }] }` and both SyncPanels render the same Hidden/OK badge list. Keep shapes identical so the JSX can be copy-ported with only the auth/route edits.

## The `s` style objects are NOT identical — check every helper before porting

Each page has its own `s` object and they have drifted: admin has helpers system lacks (this exact gap shipped a production crash in July 2026 — `s.tab()` was used by panels ported from admin to system, system's `s` had no `tab`, and the whole page died with Next's "This page couldn't load" error boundary **only in the connected state**, because the panels only mount after connect). Before porting any JSX: grep the ported code for every `s.<name>` and confirm each exists in the target file's `s`. And when verifying, browser-render the system page **with an `acct_token` cookie set** — the disconnected state renders ConnectPrompt only and will happily hide a crash in every panel.

## Checklist for every mirrored change

- [ ] Change applied to `app/admin/page.js` AND `app/hallie/tiktok-moderation/system/page.js`
- [ ] Backend change applied to the `/api/admin/*` or `/api/business/*` route AND the `/api/system/*` twin
- [ ] Admin version passes `x-admin-key`; system version relies on cookie
- [ ] Styles use each file's local `s` style object (they're near-identical; copy styles as-is)
- [ ] `npm run build` passes
- [ ] One commit or clearly-linked commits, pushed to `main`
