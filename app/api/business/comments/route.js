import { NextResponse } from 'next/server';
import { getComments, updateCommentStatus, replyToComment } from '@/lib/tiktok/business-api';

function requireAdmin(request) {
  return request.headers.get('x-admin-key') === process.env.ADMIN_SECRET;
}

// GET /api/business/comments?video_id=...
export async function GET(request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('video_id');
  if (!videoId) return NextResponse.json({ error: 'Missing video_id' }, { status: 400 });
  try {
    const data = await getComments({ videoId });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/business/comments — hide or reply
export async function POST(request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();

  try {
    if (body.action === 'hide') {
      const data = await updateCommentStatus({ commentIds: body.comment_ids, status: 'HIDDEN' });
      return NextResponse.json(data);
    }
    if (body.action === 'show') {
      const data = await updateCommentStatus({ commentIds: body.comment_ids, status: 'VISIBLE' });
      return NextResponse.json(data);
    }
    if (body.action === 'reply') {
      const data = await replyToComment({ videoId: body.video_id, commentId: body.comment_id, content: body.content });
      return NextResponse.json(data);
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
