import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { scoreContent } from '@/lib/moderation/scorer';

const BASE = 'https://business-api.tiktok.com/open_api/v1.3';

function getToken(cookieStore) {
  const raw = cookieStore.get('acct_token')?.value;
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export async function POST(request) {
  const cookieStore = await cookies();
  const token = getToken(cookieStore);
  if (!token) return NextResponse.json({ error: 'Not connected' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const maxVideos = body.maxVideos && Number.isInteger(body.maxVideos) && body.maxVideos > 0 ? body.maxVideos : null;

  const businessId = token.business_id ?? token.open_id;
  const headers = { 'Access-Token': token.access_token, 'Content-Type': 'application/json' };

  // Fetch videos
  const videos = [];
  let videoCursor = 0;
  while (true) {
    const pageSize = maxVideos ? Math.min(maxVideos - videos.length, 20) : 20;
    const fields = 'id,title,create_time,cover_image_url,view_count,like_count,comment_count';
    const res = await fetch(
      `${BASE}/business/video/list/?business_id=${encodeURIComponent(businessId)}&fields=${fields}&cursor=${videoCursor}&page_size=${pageSize}`,
      { headers }
    );
    const json = await res.json();
    if (json.code && json.code !== 0) break;
    const page = json.data?.videos ?? [];
    videos.push(...page);
    if (!json.data?.has_more || page.length === 0) break;
    if (maxVideos && videos.length >= maxVideos) break;
    videoCursor = json.data.cursor;
  }

  let synced = 0, hidden = 0;

  for (const video of videos) {
    let commentCursor = 0;
    while (true) {
      const res = await fetch(
        `${BASE}/business/comment/list/?business_id=${encodeURIComponent(businessId)}&video_id=${encodeURIComponent(video.id)}&fields=comment_id,text,username,create_time,like_count,status&cursor=${commentCursor}`,
        { headers }
      );
      const json = await res.json();
      const comments = json.data?.comments ?? [];

      for (const comment of comments) {
        const { score, action } = scoreContent(comment.text ?? '');
        synced++;
        if (action === 'hide' && comment.status !== 'HIDDEN') {
          await fetch(`${BASE}/business/comment/hide/`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ business_id: businessId, comment_id: comment.comment_id, is_hidden: true, video_id: video.id }),
          });
          hidden++;
        }
      }

      if (!json.data?.has_more || comments.length === 0) break;
      commentCursor = json.data.cursor;
    }
  }

  return NextResponse.json({ synced, hidden });
}
