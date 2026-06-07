import { NextResponse } from 'next/server';
import { syncComments } from '@/lib/sync';

function requireAdmin(request) {
  return request.headers.get('x-admin-key') === process.env.ADMIN_SECRET;
}

// POST /api/sync/tiktok/comments
// Body (optional): { video_id, auto_hide }
export async function POST(request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));

  try {
    const results = await syncComments({
      videoId: body.video_id,
      autoHide: body.auto_hide ?? false,
    });
    return NextResponse.json({ synced: results.length, results });
  } catch (err) {
    if (err.message === 'NOT_AUTHENTICATED') {
      return NextResponse.json({ error: 'Not authenticated with TikTok' }, { status: 401 });
    }
    console.error('[sync/comments] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
