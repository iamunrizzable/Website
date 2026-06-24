import { getBusinessTokens, getTikTokAccountToken } from '../tokens.js';

const BASE = 'https://business-api.tiktok.com/open_api/v1.3';
const OPEN_BASE = 'https://open.tiktokapis.com/v2';

async function auth() {
  const tokens = await getBusinessTokens();
  if (!tokens) throw new Error('BUSINESS_NOT_AUTHENTICATED');
  return tokens;
}

async function acctAuth() {
  const tokens = await getTikTokAccountToken();
  if (!tokens) throw new Error('ACCOUNT_NOT_AUTHENTICATED');
  return tokens;
}

function hdrs(tokens) {
  return { 'Access-Token': tokens.access_token, 'Content-Type': 'application/json' };
}

function bearerHdrs(tokens) {
  return { 'Authorization': `Bearer ${tokens.access_token}`, 'Content-Type': 'application/json' };
}

async function parseRes(res) {
  const ct = res.headers.get('content-type') ?? '';
  if (!ct.includes('application/json')) {
    return { code: res.status, message: `HTTP ${res.status} — unexpected response` };
  }
  return res.json();
}

// ── Account (Open Platform API — works with user.info.basic/stats scopes) ────

export async function getAccount() {
  const tokens = await acctAuth();
  const res = await fetch(
    `${OPEN_BASE}/user/info/?fields=display_name,avatar_url,follower_count,video_count,likes_count`,
    { headers: bearerHdrs(tokens) }
  );
  const data = await parseRes(res);
  // Unwrap to the user object so callers get a flat { display_name, avatar_url, ... }
  return data?.data?.user ?? data;
}

// ── Videos (Open Platform API — works with video.list scope) ─────────────────

export async function listVideos({ cursor = 0, pageSize = 20 } = {}) {
  const tokens = await acctAuth();
  const res = await fetch(
    `${OPEN_BASE}/video/list/?fields=id,title,create_time,cover_image_url,view_count,like_count,comment_count,share_count`,
    {
      method: 'POST',
      headers: bearerHdrs(tokens),
      body: JSON.stringify({ cursor, max_count: pageSize }),
    }
  );
  return parseRes(res);
}

// ── Comments ──────────────────────────────────────────────────────────────────
// Using the advertiser comment endpoints (confirmed working with advertiser token)

export async function listComments({ videoId, cursor = 0, pageSize = 20 }) {
  const tokens = await auth();
  const params = new URLSearchParams({
    advertiser_id: tokens.advertiser_id,
    video_id: videoId,
    cursor,
    page_size: pageSize,
    fields: 'comment_id,text,create_time,username,like_count,status',
  });
  const res = await fetch(`${BASE}/comment/list/?${params}`, { headers: hdrs(tokens) });
  return parseRes(res);
}

export async function updateCommentStatus({ commentIds, status = 'HIDDEN' }) {
  const tokens = await auth();
  const res = await fetch(`${BASE}/comment/status/update/`, {
    method: 'POST',
    headers: hdrs(tokens),
    body: JSON.stringify({ advertiser_id: tokens.advertiser_id, comment_ids: commentIds, status }),
  });
  return parseRes(res);
}

export async function replyToComment({ videoId, commentId, content }) {
  const tokens = await auth();
  const res = await fetch(`${BASE}/comment/reply/create/`, {
    method: 'POST',
    headers: hdrs(tokens),
    body: JSON.stringify({ advertiser_id: tokens.advertiser_id, video_id: videoId, comment_id: commentId, content }),
  });
  return parseRes(res);
}

export async function deleteComment({ commentId }) {
  const tokens = await auth();
  const res = await fetch(`${BASE}/business/comment/delete/`, {
    method: 'POST',
    headers: hdrs(tokens),
    body: JSON.stringify({ advertiser_id: tokens.advertiser_id, comment_id: commentId }),
  });
  return parseRes(res);
}

export async function pinComment({ commentId, isPinned = true }) {
  const tokens = await auth();
  const res = await fetch(`${BASE}/business/comment/pin/`, {
    method: 'POST',
    headers: hdrs(tokens),
    body: JSON.stringify({ advertiser_id: tokens.advertiser_id, comment_id: commentId, is_pinned: isPinned }),
  });
  return parseRes(res);
}

// ── Mentions (requires TikTok account token) ──────────────────────────────────

export async function listMentionVideos({ cursor = 0, pageSize = 20 } = {}) {
  const tokens = await acctAuth();
  const params = new URLSearchParams({ business_id: tokens.business_id, cursor, page_size: pageSize });
  const res = await fetch(`${BASE}/business/mention/video/list/?${params}`, { headers: hdrs(tokens) });
  return parseRes(res);
}

export async function listMentionComments({ cursor = 0, pageSize = 20 } = {}) {
  const tokens = await acctAuth();
  const params = new URLSearchParams({ business_id: tokens.business_id, cursor, page_size: pageSize });
  const res = await fetch(`${BASE}/business/mention/comment/list/?${params}`, { headers: hdrs(tokens) });
  return parseRes(res);
}

export async function listTopMentionWords() {
  const tokens = await acctAuth();
  const res = await fetch(`${BASE}/business/mention/top_word/list/?business_id=${tokens.business_id}`, { headers: hdrs(tokens) });
  return parseRes(res);
}

export async function listTopMentionHashtags() {
  const tokens = await acctAuth();
  const res = await fetch(`${BASE}/business/mention/top_hashtag/list/?business_id=${tokens.business_id}`, { headers: hdrs(tokens) });
  return parseRes(res);
}

export async function listTrackedHashtags() {
  const tokens = await acctAuth();
  const res = await fetch(`${BASE}/business/mention/hashtag/manage/list/?business_id=${tokens.business_id}`, { headers: hdrs(tokens) });
  return parseRes(res);
}

export async function addTrackedHashtag({ hashtag }) {
  const tokens = await acctAuth();
  const res = await fetch(`${BASE}/business/mention/hashtag/add/`, {
    method: 'POST',
    headers: hdrs(tokens),
    body: JSON.stringify({ business_id: tokens.business_id, hashtag }),
  });
  return parseRes(res);
}

export async function removeTrackedHashtag({ hashtag }) {
  const tokens = await acctAuth();
  const res = await fetch(`${BASE}/business/mention/hashtag/remove/`, {
    method: 'POST',
    headers: hdrs(tokens),
    body: JSON.stringify({ business_id: tokens.business_id, hashtag }),
  });
  return parseRes(res);
}

// ── Trending / Discovery (requires TikTok account token) ──────────────────────

export async function searchTrending({ keyword = '', cursor = 0, pageSize = 20 } = {}) {
  const tokens = await acctAuth();
  const params = new URLSearchParams({ business_id: tokens.business_id, cursor, page_size: pageSize });
  if (keyword) params.set('keyword', keyword);
  const res = await fetch(`${BASE}/discovery/trending/search/?${params}`, { headers: hdrs(tokens) });
  return parseRes(res);
}

export async function getTrendingKeywords({ keyword = '' } = {}) {
  const tokens = await acctAuth();
  const params = new URLSearchParams({ business_id: tokens.business_id });
  if (keyword) params.set('keyword', keyword);
  const res = await fetch(`${BASE}/discovery/trending/search/keyword/?${params}`, { headers: hdrs(tokens) });
  return parseRes(res);
}

export async function getHashtagSuggestions({ keyword = '' } = {}) {
  const tokens = await acctAuth();
  const params = new URLSearchParams({ business_id: tokens.business_id });
  if (keyword) params.set('keyword', keyword);
  const res = await fetch(`${BASE}/business/hashtag/suggestion/?${params}`, { headers: hdrs(tokens) });
  return parseRes(res);
}

export async function getBenchmark() {
  const tokens = await acctAuth();
  const res = await fetch(`${BASE}/business/benchmark/?business_id=${tokens.business_id}`, { headers: hdrs(tokens) });
  return parseRes(res);
}

// ── Automated Rules (keyword → hide) ─────────────────────────────────────────

export async function listRules() {
  const tokens = await auth();
  const res = await fetch(`${BASE}/automated_rule/list/?advertiser_id=${tokens.advertiser_id}`, { headers: hdrs(tokens) });
  return parseRes(res);
}

export async function createRule({ name, keywords }) {
  const tokens = await auth();
  const res = await fetch(`${BASE}/automated_rule/create/`, {
    method: 'POST',
    headers: hdrs(tokens),
    body: JSON.stringify({
      advertiser_id: tokens.advertiser_id,
      rule_name: name,
      status: 'ACTIVE',
      trigger: {
        trigger_type: 'COMMENT',
        conditions: keywords.map(kw => ({ field: 'COMMENT_TEXT', operator: 'CONTAINS', value: kw })),
      },
      action: { action_type: 'HIDE_COMMENT' },
    }),
  });
  return parseRes(res);
}

export async function deleteRule(ruleId) {
  const tokens = await auth();
  const res = await fetch(`${BASE}/automated_rule/delete/`, {
    method: 'POST',
    headers: hdrs(tokens),
    body: JSON.stringify({ advertiser_id: tokens.advertiser_id, rule_id: ruleId }),
  });
  return parseRes(res);
}

// ── Optimizer Rules ───────────────────────────────────────────────────────────

export async function listOptimizerRules({ cursor = 0, pageSize = 20 } = {}) {
  const tokens = await auth();
  const params = new URLSearchParams({ advertiser_id: tokens.advertiser_id, cursor, page_size: pageSize });
  const res = await fetch(`${BASE}/optimizer/rule/list/?${params}`, { headers: hdrs(tokens) });
  return parseRes(res);
}

export async function getOptimizerRule({ ruleId }) {
  const tokens = await auth();
  const res = await fetch(`${BASE}/optimizer/rule/get/?advertiser_id=${tokens.advertiser_id}&rule_id=${ruleId}`, { headers: hdrs(tokens) });
  return parseRes(res);
}

export async function createOptimizerRule({ ruleName, ruleType, conditions, action: actionConfig }) {
  const tokens = await auth();
  const res = await fetch(`${BASE}/optimizer/rule/create/`, {
    method: 'POST',
    headers: hdrs(tokens),
    body: JSON.stringify({ advertiser_id: tokens.advertiser_id, rule_name: ruleName, rule_type: ruleType, conditions, action: actionConfig }),
  });
  return parseRes(res);
}

export async function updateOptimizerRuleStatus({ ruleId, status }) {
  const tokens = await auth();
  const res = await fetch(`${BASE}/optimizer/rule/update/status/`, {
    method: 'POST',
    headers: hdrs(tokens),
    body: JSON.stringify({ advertiser_id: tokens.advertiser_id, rule_id: ruleId, status }),
  });
  return parseRes(res);
}

export async function listOptimizerRuleResults({ ruleId, cursor = 0, pageSize = 20 }) {
  const tokens = await auth();
  const params = new URLSearchParams({ advertiser_id: tokens.advertiser_id, rule_id: ruleId, cursor, page_size: pageSize });
  const res = await fetch(`${BASE}/optimizer/rule/result/list/?${params}`, { headers: hdrs(tokens) });
  return parseRes(res);
}
