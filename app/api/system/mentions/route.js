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

  const businessId = token.business_id ?? token.open_id;
  const headers = { 'Access-Token': token.access_token };
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') ?? 'videos';
  const username = searchParams.get('username') ?? '';

  if (type === 'tracked_hashtags' && !username) {
    return NextResponse.json({ error: 'A TikTok username is required' }, { status: 400 });
  }

  const endpoints = {
    videos: `${BASE}/business/mention/video/list/?business_id=${encodeURIComponent(businessId)}`,
    comments: `${BASE}/business/mention/comment/list/?business_id=${encodeURIComponent(businessId)}`,
    top_words: `${BASE}/business/mention/top_word/list/?business_id=${encodeURIComponent(businessId)}`,
    top_hashtags: `${BASE}/business/mention/top_hashtag/list/?business_id=${encodeURIComponent(businessId)}`,
    tracked_hashtags: `${BASE}/business/mention/hashtag/manage/list/?business_id=${encodeURIComponent(businessId)}&username=${encodeURIComponent(username)}`,
  };
  const url = endpoints[type] ?? endpoints.videos;

  const res = await fetch(url, { headers });
  return NextResponse.json(await res.json());
}

export async function POST(request) {
  const cookieStore = await cookies();
  const token = getToken(cookieStore);
  if (!token) return NextResponse.json({ error: 'Not connected' }, { status: 401 });

  const businessId = token.business_id ?? token.open_id;
  const headers = { 'Access-Token': token.access_token, 'Content-Type': 'application/json' };
  const body = await request.json();

  if (body.action === 'add_hashtag') {
    if (!body.username) return NextResponse.json({ error: 'A TikTok username is required' }, { status: 400 });
    // Field is `hashtags` (plural array), not `hashtag` (confirmed via
    // TikTok's own error: "hashtags: Missing data for required field.").
    const res = await fetch(`${BASE}/business/mention/hashtag/add/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ business_id: businessId, username: body.username, hashtags: [body.hashtag] }),
    });
    return NextResponse.json(await res.json());
  }
  if (body.action === 'remove_hashtag') {
    if (!body.username) return NextResponse.json({ error: 'A TikTok username is required' }, { status: 400 });
    // Same `hashtags` (plural array) field as add_hashtag above.
    const res = await fetch(`${BASE}/business/mention/hashtag/remove/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ business_id: businessId, username: body.username, hashtags: [body.hashtag] }),
    });
    return NextResponse.json(await res.json());
  }
  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
