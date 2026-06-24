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

### Comments (use advertiser token Access-Token + open_id as business_id — account token lacks comment scope)
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
- OAuth: `tiktok_advertiser_authorization_url` env var (Business Portal)
- Callback receives: `auth_code`
- Token exchange: `business-api.tiktok.com/open_api/v1.3/oauth2/access_token/` (JSON, `app_id` + `secret`)
- Header: `Access-Token: <token>`
- Param: `advertiser_id` (from `data.advertiser_ids[0]`)
- Used for: automated rules, optimizer rules

### 2. TikTok Account Token (`getTikTokAccountToken()`)
- OAuth: `tiktok_account_authorization_url` env var (Business Portal) — preferred
- **CURRENT VALUE (Login Kit — gives open_id, NOT numeric business_id):**
  `https://www.tiktok.com/v2/auth/authorize?client_key=7654470451766231041&scope=user.info.basic%2Cuser.info.username%2Cuser.info.stats%2Cuser.info.profile%2Cuser.account.type%2Cuser.insights%2Cvideo.list%2Cvideo.insights%2Ccomment.list%2Ccomment.list.manage%2Cvideo.publish%2Cvideo.upload%2Cbiz.spark.auth%2Cdiscovery.search.words%2Cbiz.brand.insights&response_type=code&redirect_uri=https%3A%2F%2Ftjbmanagementinc.com%2Fauth%2Ftiktok%2Faccount-callback`
- **PROBLEM**: Login Kit gives `open_id` = `-000yp9tW9MisgetpAczsWTyM_Z1VHZX70Aq` — works for READ endpoints, rejected by comment WRITE endpoints (hide/delete/pin/reply)
- **FIX NEEDED**: Switch env var to Business Portal account URL → gives `auth_code` → numeric `business_id` → comment actions work
- Callback receives: `auth_code` (Business Portal) or `code` (Login Kit fallback)
- Token exchange if `auth_code`: `business-api.tiktok.com/open_api/v1.3/tt_user/oauth2/token/` (JSON, `app_id` + `secret`)
- Token exchange if `code`: `open.tiktokapis.com/v2/oauth/token/` (form-encoded, `client_key` + `client_secret`)
- Header for Open Platform endpoints (`open.tiktokapis.com/v2`): `Authorization: Bearer <token>`
- Header for Business API content endpoints (`business-api.tiktok.com`): `Access-Token: <token>` with `business_id`
- `business_id` = `data.business_id ?? data.open_id` from token exchange response
- Stored in `acct_token` cookie (30-day)
- Used for: account info, videos, comments, mentions, trending, discovery

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
