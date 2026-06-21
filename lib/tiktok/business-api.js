import { getBusinessTokens } from '../tokens.js';

const BASE = 'https://business-api.tiktok.com/open_api/v1.3';

async function getHeaders() {
  const tokens = await getBusinessTokens();
  if (!tokens) throw new Error('BUSINESS_NOT_AUTHENTICATED');
  return {
    'Access-Token': tokens.access_token,
    'Content-Type': 'application/json',
  };
}

async function parseRes(res) {
  const ct = res.headers.get('content-type') ?? '';
  if (!ct.includes('application/json')) {
    return { code: res.status, message: `HTTP ${res.status} — unexpected response` };
  }
  return res.json();
}

// Get comments on a video
export async function getComments({ videoId, cursor = 0, pageSize = 20 }) {
  const headers = await getHeaders();
  const tokens = await getBusinessTokens();
  const res = await fetch(
    `${BASE}/comment/list/?advertiser_id=${tokens.advertiser_id}&video_id=${encodeURIComponent(videoId)}&cursor=${cursor}&page_size=${pageSize}&fields=comment_id,text,create_time,username,like_count,status`,
    { headers }
  );
  return parseRes(res);
}

// Hide or show a comment
export async function updateCommentStatus({ commentIds, status = 'HIDDEN' }) {
  const headers = await getHeaders();
  const tokens = await getBusinessTokens();
  const res = await fetch(`${BASE}/comment/status/update/`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ advertiser_id: tokens.advertiser_id, comment_ids: commentIds, status }),
  });
  return parseRes(res);
}

// Reply to a comment
export async function replyToComment({ videoId, commentId, content }) {
  const headers = await getHeaders();
  const tokens = await getBusinessTokens();
  const res = await fetch(`${BASE}/comment/reply/create/`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ advertiser_id: tokens.advertiser_id, video_id: videoId, comment_id: commentId, content }),
  });
  return parseRes(res);
}

// List automated rules
export async function listRules() {
  const headers = await getHeaders();
  const tokens = await getBusinessTokens();
  const res = await fetch(
    `${BASE}/automated_rule/list/?advertiser_id=${tokens.advertiser_id}`,
    { headers }
  );
  return parseRes(res);
}

// Create an automated keyword-hide rule
export async function createRule({ name, keywords }) {
  const headers = await getHeaders();
  const tokens = await getBusinessTokens();
  const res = await fetch(`${BASE}/automated_rule/create/`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      advertiser_id: tokens.advertiser_id,
      rule_name: name,
      status: 'ACTIVE',
      trigger: {
        trigger_type: 'COMMENT',
        conditions: keywords.map(kw => ({
          field: 'COMMENT_TEXT',
          operator: 'CONTAINS',
          value: kw,
        })),
      },
      action: { action_type: 'HIDE_COMMENT' },
    }),
  });
  return parseRes(res);
}

// Delete an automated rule
export async function deleteRule(ruleId) {
  const headers = await getHeaders();
  const tokens = await getBusinessTokens();
  const res = await fetch(`${BASE}/automated_rule/delete/`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ advertiser_id: tokens.advertiser_id, rule_id: ruleId }),
  });
  return parseRes(res);
}
