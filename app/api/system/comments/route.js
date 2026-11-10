import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BASE = 'https://business-api.tiktok.com/open_api/v1.3';

function getToken(cookieStore) {
  const raw = cookieStore.get('acct_token')?.value;
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

// TikTok's comment and video ids are longer than JS can hold as numbers.
function safeJson(text) {
  return JSON.parse(String(text).replace(/:\s*(\d{16,})(?=\s*[,}\]])/g, ': "$1"'));
}

export async function GET(request) {
  const cookieStore = await cookies();
  const token = getToken(cookieStore);
  if (!token) return NextResponse.json({ error: 'Not connected' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('video_id');
  if (!videoId) return NextResponse.json({ error: 'Missing video_id' }, { status: 400 });

  const businessId = token.business_id ?? token.open_id;
  const fields = encodeURIComponent(JSON.stringify(['comment_id', 'text', 'username', 'create_time', 'like_count', 'status']));
  const comments = [];
  let cursor = 0;
  let first = null;
  for (let page = 0; page < 50; page++) {
    const res = await fetch(
      `${BASE}/business/comment/list/?business_id=${encodeURIComponent(businessId)}&video_id=${encodeURIComponent(videoId)}&fields=${fields}&cursor=${cursor}&page_size=20`,
      { headers: { 'Access-Token': token.access_token } }
    );
    let json;
    try { json = safeJson(await res.text()); } catch { return NextResponse.json({ error: 'Unreadable response from TikTok' }, { status: 502 }); }
    if (page === 0) first = json;
    if (json.code && json.code !== 0) {
      if (page === 0) return NextResponse.json(json);
      break;
    }
    const batch = json.data?.comments ?? [];
    comments.push(...batch);
    if (!json.data?.has_more || batch.length === 0) break;
    const next = json.data.cursor;
    if (next === cursor) break;
    cursor = next;
  }
  return NextResponse.json({ ...first, data: { ...first?.data, comments, has_more: false } });
}

export async function POST(request) {
  const cookieStore = await cookies();
  const token = getToken(cookieStore);
  if (!token) return NextResponse.json({ error: 'Not connected' }, { status: 401 });

  const body = await request.json();
  const { action, comment_id, video_id, content } = body;
  const businessId = token.business_id ?? token.open_id;
  const headers = { 'Access-Token': token.access_token, 'Content-Type': 'application/json' };

  let endpoint, payload;
  if (action === 'hide' || action === 'show') {
    endpoint = `${BASE}/business/comment/hide/`;
    payload = { business_id: businessId, comment_id, action: action === 'hide' ? 'HIDE' : 'UNHIDE', video_id };
  } else if (action === 'delete') {
    endpoint = `${BASE}/business/comment/delete/`;
    payload = { business_id: businessId, comment_id, video_id };
  } else if (action === 'pin') {
    endpoint = `${BASE}/business/comment/pin/`;
    payload = { business_id: businessId, comment_id, video_id, is_pinned: body.is_pinned !== false };
  } else if (action === 'reply') {
    endpoint = `${BASE}/business/comment/reply/create/`;
    payload = { business_id: businessId, comment_id, text: content, video_id };
  } else if (action === 'like' || action === 'unlike') {
    endpoint = `${BASE}/business/comment/like/`;
    payload = { business_id: businessId, comment_id, action: action === 'like' ? 'LIKE' : 'UNLIKE' };
  } else if (action === 'comment') {
    endpoint = `${BASE}/business/comment/create/`;
    payload = { business_id: businessId, video_id, text: content };
  } else {
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }

  const res = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(payload) });
  const json = await res.json();
  return NextResponse.json(json);
}
