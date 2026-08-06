import { NextResponse } from 'next/server';
import { listComments, hideComment, replyToComment, deleteComment, pinComment } from '@/lib/tiktok/business-api';
import { isValidAdminKey } from '@/lib/auth';

export async function GET(request) {
  if (!isValidAdminKey(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
  if (!isValidAdminKey(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  try {
    if (body.action === 'hide') return NextResponse.json(await hideComment({ commentId: body.comment_id, isHidden: true, videoId: body.video_id }));
    if (body.action === 'show') return NextResponse.json(await hideComment({ commentId: body.comment_id, isHidden: false, videoId: body.video_id }));
    if (body.action === 'reply') return NextResponse.json(await replyToComment({ videoId: body.video_id, commentId: body.comment_id, content: body.content }));
    if (body.action === 'delete') return NextResponse.json(await deleteComment({ commentId: body.comment_id, videoId: body.video_id }));
    if (body.action === 'pin') return NextResponse.json(await pinComment({ commentId: body.comment_id, isPinned: body.is_pinned ?? true, videoId: body.video_id }));
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
