import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BASE = 'https://business-api.tiktok.com/open_api/v1.3';

function getToken(cookieStore) {
  const raw = cookieStore.get('acct_token')?.value;
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
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
  const res = await fetch(
    `${BASE}/business/comment/list/?business_id=${encodeURIComponent(businessId)}&video_id=${encodeURIComponent(videoId)}&fields=${fields}`,
    { headers: { 'Access-Token': token.access_token } }
  );
  const json = await res.json();
  return NextResponse.json(json);
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
    payload = { business_id: businessId, comment_id, is_hidden: action === 'hide', video_id };
  } else if (action === 'delete') {
    endpoint = `${BASE}/business/comment/delete/`;
    payload = { business_id: businessId, comment_id, video_id };
  } else if (action === 'pin') {
    endpoint = `${BASE}/business/comment/pin/`;
    payload = { business_id: businessId, comment_id, video_id };
  } else if (action === 'reply') {
    endpoint = `${BASE}/business/comment/reply/create/`;
    payload = { business_id: businessId, comment_id, text: content, video_id };
  } else {
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }

  const res = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(payload) });
  const json = await res.json();
  return NextResponse.json(json);
}
