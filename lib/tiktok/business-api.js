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
  // TikTok returns IDs as large integers (19 digits) which exceed JS safe integer range.
  // Parse as text first and quote them before JSON.parse to preserve all digits.
  const text = await res.text();
  const safe = text.replace(/:\s*(\d{16,})(?=\s*[,}\]])/g, ': "$1"');
  return JSON.parse(safe);
}

function actionBody(obj) {
  return JSON.stringify(obj);
}

// ── Account ───────────────────────────────────────────────────────────────────

export async function getAccount() {
  const tokens = await acctAuth();
  const res = await fetch(
    `${OPEN_BASE}/user/info/?fields=display_name,avatar_url,follower_count,video_count,likes_count`,
    { headers: bearerHdrs(tokens) }
  );
  const data = await parseRes(res);
  return data?.data?.user ?? data;
}

// ── Videos ────────────────────────────────────────────────────────────────────

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

export async function listComments({ videoId, cursor = 0, pageSize = 20 }) {
  const tokens = await acctAuth();
  const businessId = tokens.business_id ?? tokens.open_id;
  const params = new URLSearchParams({
    business_id: businessId,
    video_id: videoId,
    cursor,
    page_size: pageSize,
    fields: 'comment_id,text,create_time,username,like_count,status',
  });
  const res = await fetch(`${BASE}/business/comment/list/?${params}`, { headers: hdrs(tokens) });
  return parseRes(res);
}

async function commentAction(endpoint, payload) {
  const tokens = await acctAuth();
  const businessId = tokens.business_id ?? tokens.open_id;
  const body = actionBody({ business_id: businessId, ...payload });
  const res = await fetch(`${BASE}${endpoint}`, { method: 'POST', headers: hdrs(tokens), body });
  const result = await parseRes(res);
  if (result.code && result.code !== 0) {
    result._sent = body;
  }
  return result;
}

export async function hideComment({ commentId, isHidden = true, videoId }) {
  return commentAction('/business/comment/hide/', { video_id: videoId, comment_id: commentId, action: isHidden ? 'HIDE' : 'UNHIDE' });
}

export async function replyToComment({ videoId, commentId, content }) {
  return commentAction('/business/comment/reply/create/', { video_id: videoId, comment_id: commentId, text: content });
}

export async function deleteComment({ commentId, videoId }) {
  return commentAction('/business/comment/delete/', { comment_id: commentId });
}

export async function pinComment({ commentId, isPinned = true, videoId }) {
  return commentAction('/business/comment/pin/', { video_id: videoId, comment_id: commentId, is_pinned: isPinned });
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
