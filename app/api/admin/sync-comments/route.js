import { NextResponse } from 'next/server';
import { syncComments } from '@/lib/sync';
import { isValidAdminKey } from '@/lib/auth';

export async function POST(request) {
  if (!(await isValidAdminKey(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let maxVideos = null;
  try {
    const body = await request.json().catch(() => ({}));
    if (body.maxVideos && Number.isInteger(body.maxVideos) && body.maxVideos > 0) {
      maxVideos = body.maxVideos;
    }
  } catch { /* ignore */ }
  try {
    const results = await syncComments({ autoHide: true, maxVideos });
    return NextResponse.json({
      synced: results.length,
      hidden: results.filter(r => r.hidden).length,
      comments: results.map(r => ({
        comment_id: r.comment_id,
        username: r.author,
        text: r.text ?? '',
        score: r.score,
        action: r.hidden ? 'hidden' : 'ok',
        video_id: r.video_id ? String(r.video_id) : '',
        video_caption: r.video_caption ?? '',
        video_url: r.video_url ?? null,
      })),
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
