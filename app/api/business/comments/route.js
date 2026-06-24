import { NextResponse } from 'next/server';
import { listComments, updateCommentStatus, replyToComment, deleteComment, pinComment } from '@/lib/tiktok/business-api';

function requireAdmin(request) {
  return request.headers.get('x-admin-key') === process.env.ADMIN_SECRET;
}

export async function GET(request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('video_id');
  if (!videoId) return NextResponse.json({ error: 'Missing video_id' }, { status: 400 });
  try {
    return NextResponse.json(await listComments({ videoId }));
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  try {
    if (body.action === 'hide') return NextResponse.json(await updateCommentStatus({ commentIds: body.comment_ids, status: 'HIDDEN' }));
    if (body.action === 'show') return NextResponse.json(await updateCommentStatus({ commentIds: body.comment_ids, status: 'VISIBLE' }));
    if (body.action === 'reply') return NextResponse.json(await replyToComment({ videoId: body.video_id, commentId: body.comment_id, content: body.content }));
    if (body.action === 'delete') return NextResponse.json(await deleteComment({ commentId: body.comment_id }));
    if (body.action === 'pin') return NextResponse.json(await pinComment({ commentId: body.comment_id, isPinned: body.is_pinned ?? true }));
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
