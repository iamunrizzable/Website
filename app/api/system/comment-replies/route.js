import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BASE = 'https://business-api.tiktok.com/open_api/v1.3';

function getToken(cookieStore) {
  const raw = cookieStore.get('acct_token')?.value;
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

// Replies under one comment: /business/comment/reply/list/ (approved endpoint).
export async function GET(request) {
  const cookieStore = await cookies();
  const token = getToken(cookieStore);
  if (!token) return NextResponse.json({ error: 'Not connected' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('video_id');
  const commentId = searchParams.get('comment_id');
  if (!videoId) return NextResponse.json({ error: 'Missing video_id' }, { status: 400 });
  if (!commentId) return NextResponse.json({ error: 'Missing comment_id' }, { status: 400 });

  const businessId = token.business_id ?? token.open_id;
  const fields = encodeURIComponent(JSON.stringify(['comment_id', 'text', 'username', 'create_time', 'like_count', 'status']));
  const res = await fetch(
    `${BASE}/business/comment/reply/list/?business_id=${encodeURIComponent(businessId)}&video_id=${encodeURIComponent(videoId)}&comment_id=${encodeURIComponent(commentId)}&fields=${fields}`,
    { headers: { 'Access-Token': token.access_token } }
  );
  const json = await res.json();
  return NextResponse.json(json);
}
