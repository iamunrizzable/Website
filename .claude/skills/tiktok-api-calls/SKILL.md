---
name: tiktok-api-calls
description: How to call TikTok Business API and Open Platform endpoints correctly from this repo — approved endpoint list, headers, ID types, valid fields, the big-integer JSON bug, and per-endpoint payload quirks. Use before writing or modifying ANY code that hits business-api.tiktok.com or open.tiktokapis.com.
---

# Calling TikTok APIs

## Rule zero: the approved-endpoints list

CLAUDE.md contains the ONLY TikTok endpoints this app is authorized to call. Never call anything not on that list — TikTok audits API usage per app. If a feature needs a new endpoint, stop and ask Tyler to get it approved first.

Known existing violation to be aware of (do not copy the pattern): `listRules/createRule/deleteRule` in `lib/tiktok/business-api.js` call `/automated_rule/*`, which is not on the list — the approved equivalents are `/optimizer/rule/*` (used by `/api/system/rules`).

## Base URLs and auth headers

| API | Base | Header | Identity param |
|---|---|---|---|
| Business API | `https://business-api.tiktok.com/open_api/v1.3` | `Access-Token: <token>` | `business_id` (account endpoints) or `advertiser_id` (rule endpoints) |
| Open Platform | `https://open.tiktokapis.com/v2` | `Authorization: Bearer <token>` | none (token-scoped) |

Prefer the helpers in `lib/tiktok/business-api.js` for shared-token (admin) code. System (`/api/system/*`) routes call fetch inline with the cookie token — keep that isolation (see mirrored-admin-system skill).

## THE BIG-INTEGER BUG — always use `parseRes()`

TikTok returns 19-digit numeric IDs (video ids, comment ids). `JSON.parse` silently corrupts them past `Number.MAX_SAFE_INTEGER`, so subsequent actions on that ID hit a *different* (nonexistent) object. `parseRes()` in `lib/tiktok/business-api.js` quotes any 16+-digit number before parsing:

```js
const text = await res.text();
const safe = text.replace(/:\s*(\d{16,})(?=\s*[,}\]])/g, ': "$1"');
return JSON.parse(safe);
```

If you write a new inline fetch (system routes) that will act on returned IDs, replicate this. A comment action that returns `code: 0` but does nothing is almost always a corrupted ID.

## Response envelope

Business API: `{ code, message, data }` — `code === 0` is success; anything else is an error even with HTTP 200. Open Platform: `{ data, error }`. Always check `json.code`/`json.error`, never just `res.ok`.

## Valid fields (rejected fields fail the whole request)

- **Open Platform `/video/list/`** (POST, fields in query string): `id`, `title`, `create_time`, `cover_image_url`, `view_count`, `like_count`, `comment_count`, `share_count`. NOT `thumbnail_url`, NOT `video_id`, NOT nested `statistics.*`.
- **Business `/business/video/list/`** (GET, fields = URL-encoded JSON array): `item_id`, `caption`, `create_time`, `thumbnail_url`, `video_views`, `likes`, `comments`. Note the video id key is `item_id` here but `id` on Open Platform — translate when crossing APIs.
- **Business `/business/comment/list/`**: `comment_id`, `text`, `username`, `create_time`, `like_count`, `status`. `status === 'HIDDEN'` means already hidden — check before hiding again.

## Payload quirks

- `/business/comment/hide/` is called two ways in this repo: `{ action: 'HIDE' | 'UNHIDE' }` (business-api.js) and `{ is_hidden: true | false }` (system routes). Both shapes are in production; when editing, keep whichever shape the file already uses.
- Comment writes need the **numeric** `business_id` — an `open_id` (leading `-`) silently fails or 4xxs. See tiktok-tokens-and-oauth skill.
- Pagination: Business API uses `cursor` + `data.has_more` + `data.cursor`; loop pattern is in `lib/sync.js` and `app/api/system/sync/route.js`. Always break on empty page to avoid infinite loops.
- GET endpoints take query params; action endpoints are POST with JSON bodies. Business `video/list` is GET; Open Platform `video/list` is POST. Yes, really.

## Rate/latency reality

Syncs loop videos × comment pages serially — an "All videos" sync can take tens of seconds. Vercel function timeout applies (only `process-blocks` sets `maxDuration: 60`). If a sync route starts timing out, prefer the "Last N videos" mode (`maxVideos` body param) over raising timeouts.
