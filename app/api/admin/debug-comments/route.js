import { NextResponse } from 'next/server';
import { getTikTokAccountToken } from '@/lib/tokens';

function requireAdmin(request) {
  return request.headers.get('x-admin-key') === process.env.ADMIN_SECRET;
}

export async function GET(request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('video_id');
  if (!videoId) return NextResponse.json({ error: 'Missing video_id' }, { status: 400 });

  const tokens = await getTikTokAccountToken();
  if (!tokens) return NextResponse.json({ error: 'No account token' }, { status: 401 });

  const params = new URLSearchParams({
    business_id: tokens.business_id,
    video_id: videoId,
    cursor: 0,
    page_size: 3,
  });

  const res = await fetch(
    `https://business-api.tiktok.com/open_api/v1.3/business/comment/list/?${params}`,
    { headers: { 'Access-Token': tokens.access_token, 'Content-Type': 'application/json' } }
  );

  // Return raw text so we can see exactly what TikTok sends
  const raw = await res.text();
  return new Response(raw, { headers: { 'Content-Type': 'application/json' } });
}
