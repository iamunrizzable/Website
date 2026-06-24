# TJB Management Inc. — Claude Context

## Critical Rules
- **NEVER change the apply link**: `https://www.tiktok.com/t/ZTkgQvTCb/`
- **ALWAYS merge dev branch to main after every set of changes**
- **ONLY make changes explicitly requested — nothing more**
- Dev branch: `claude/general-session-v2pLH`

## TikTok Business API — Approved Endpoints

Base URL: `https://business-api.tiktok.com/open_api/v1.3`

### Business / Account & Content (use `business_id` + Bearer token via account OAuth)
- `/business/get/`
- `/business/video/list/`
- `/business/video/publish/`
- `/business/video/settings/`
- `/business/hashtag/suggestion/`
- `/business/publish/status/`
- `/business/publish/location/`
- `/business/photo/publish/`
- `/business/post/authorize/`
- `/business/post/authorize/status/`
- `/business/post/authorize/delete/`
- `/business/post/authorize/setting/`
- `/business/benchmark/`

### Comments (use `advertiser_id` + Access-Token via advertiser OAuth)
- `/business/comment/list/`  ← NOT `/comment/list/`
- `/business/comment/reply/list/`
- `/business/comment/create/`
- `/business/comment/delete/`
- `/business/comment/hide/`
- `/business/comment/reply/create/`
- `/business/comment/like/`
- `/business/comment/pin/`

### Mentions
- `/business/mention/top_word/list/`
- `/business/mention/top_hashtag/list/`
- `/business/mention/video/list/`
- `/business/mention/hashtag/video/list/`
- `/business/mention/video/get/`
- `/business/mention/hashtag/verify/list/`
- `/business/mention/hashtag/manage/list/`
- `/business/mention/hashtag/add/`
- `/business/mention/hashtag/remove/`
- `/business/mention/comment/list/`
- `/business/mention/comment/get/`

### Discovery / Trending
- `/discovery/trending/search/`
- `/discovery/trending/search/keyword/`

### Optimizer Rules
- `/optimizer/rule/create/`
- `/optimizer/rule/update/`
- `/optimizer/rule/batch_bind/`
- `/optimizer/rule/update/status/`
- `/optimizer/rule/get/`
- `/optimizer/rule/list/`
- `/optimizer/rule/result/get/`
- `/optimizer/rule/result/list/`

## Two OAuth Token Types

### 1. Advertiser Token (`getBusinessTokens()`)
- OAuth: `business-api.tiktok.com/portal/auth`
- Header: `Access-Token: <token>`
- Param: `advertiser_id`
- Used for: comment management, automated rules, optimizer rules

### 2. TikTok Account Token (`getTikTokAccountToken()`)
- OAuth: `www.tiktok.com/v2/auth/authorize` (Login Kit, uses `client_key`)
- Token exchange: `open.tiktokapis.com/v2/oauth/token/` (form-encoded, `client_key` + `client_secret`)
- Callback receives `code` (not `auth_code`)
- Header for Open Platform endpoints: `Authorization: Bearer <token>`
- Header for Business API content endpoints: `Access-Token: <token>` with `business_id = open_id`
- Stored in `acct_token` cookie (30-day)
- Used for: account info, videos, mentions, trending, discovery

## Token Persistence
- No Upstash Redis configured — tokens use in-memory + cookie fallback
- Advertiser token: `biz_token` cookie (30-day HttpOnly)
- Account token: `acct_token` cookie (30-day HttpOnly)
- Both set during OAuth callback, read via `next/headers` cookies() in server context

## Open Platform API Fields (video/list)
- Valid fields: `id`, `title`, `create_time`, `cover_image_url`, `view_count`, `like_count`, `comment_count`, `share_count`
- `thumbnail_url` is NOT valid — use `cover_image_url`
- `video_id` is NOT valid — use `id`
- `statistics.*` is NOT valid — fields are flat (not nested)
