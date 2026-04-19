import { getTokens, storeTokens } from '../tokens.js';
import { refreshAccessToken } from './oauth.js';

const BASE = 'https://open.tiktokapis.com/v2';

async function getValidToken() {
  const tokens = await getTokens();
  if (!tokens) throw new Error('NOT_AUTHENTICATED');

  // Refresh 5 minutes before expiry
  if (Date.now() > tokens.expires_at - 300_000) {
    if (Date.now() > tokens.refresh_expires_at) {
      throw new Error('REFRESH_TOKEN_EXPIRED');
    }
    const refreshed = await refreshAccessToken(tokens.refresh_token);
    const stored = await storeTokens(refreshed);
    return stored.access_token;
  }

  return tokens.access_token;
}

export async function getUserInfo() {
  const token = await getValidToken();
  const res = await fetch(
    `${BASE}/user/info/?fields=display_name,avatar_url,follower_count,video_count,likes_count`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.json();
}

export async function getVideoList(cursor = 0, maxCount = 20) {
  const token = await getValidToken();
  const res = await fetch(`${BASE}/video/list/?fields=id,title,comment_count,create_time,view_count`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ cursor, max_count: maxCount }),
  });
  return res.json();
}

// Requires video.comment.list scope — apply in TikTok Developer Portal
export async function getVideoComments(videoId, cursor = 0, maxCount = 20) {
  const token = await getValidToken();
  const res = await fetch(
    `${BASE}/video/comment/list/?fields=id,text,like_count,reply_count,create_time,username`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ video_id: videoId, cursor, max_count: maxCount }),
    }
  );
  return res.json();
}

// Requires video.comment.moderate scope — apply in TikTok Developer Portal
export async function hideComment(videoId, commentId) {
  const token = await getValidToken();
  const res = await fetch(`${BASE}/video/comment/moderate/`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ video_id: videoId, comment_id: commentId, action: 'hide' }),
  });
  return res.json();
}
