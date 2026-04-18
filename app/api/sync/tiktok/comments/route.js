import { NextResponse } from 'next/server';
import { getVideoList, getVideoComments, hideComment } from '@/lib/tiktok/api';
import { scoreContent, shouldAlert } from '@/lib/moderation/scorer';
import { suggestReply } from '@/lib/moderation/replies';
import { sendModerationAlert } from '@/lib/email/alerts';
import { pushEvent } from '@/lib/tokens';

function requireAdmin(request) {
  return request.headers.get('x-admin-key') === process.env.ADMIN_SECRET;
}

// POST /api/sync/tiktok/comments
// Body (optional): { video_id, auto_hide }
export async function POST(request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // NOTE: video.comment.list and video.comment.moderate scopes are NOT yet approved.
  // This endpoint is built and ready — once TikTok approves those scopes, it will work.
  // Current approved scopes: user.info.profile, user.info.stats, video.list
  const body = await request.json().catch(() => ({}));
  const autoHide = body.auto_hide ?? false;

  try {
    // Get recent videos
    const videosRes = await getVideoList(0, 10);
    if (videosRes.error?.code && videosRes.error.code !== 'ok') {
      return NextResponse.json({ error: videosRes.error }, { status: 502 });
    }

    const videos = videosRes.data?.videos ?? [];
    const targetVideos = body.video_id
      ? videos.filter((v) => v.id === body.video_id)
      : videos;

    const results = [];

    for (const video of targetVideos) {
      const commentsRes = await getVideoComments(video.id);
      const comments = commentsRes.data?.comments ?? [];

      for (const comment of comments) {
        const { score, flags, action } = scoreContent(comment.text);

        const event = {
          type: 'comment',
          video_id: video.id,
          comment_id: comment.id,
          author: comment.username,
          text: comment.text,
          score,
          flags,
          action,
        };

        if (action === 'hide' && autoHide) {
          await hideComment(video.id, comment.id);
          event.hidden = true;
        }

        if (shouldAlert(score)) {
          const suggestedReply = suggestReply(flags);
          event.suggested_reply = suggestedReply;
          await sendModerationAlert({
            type: 'comment',
            content: comment.text,
            author: comment.username,
            score,
            flags,
            videoId: video.id,
            suggestedReply,
          }).catch((e) => console.error('[sync] Email alert failed:', e.message));
        }

        await pushEvent(event);
        results.push(event);
      }
    }

    return NextResponse.json({ synced: results.length, results });
  } catch (err) {
    if (err.message === 'NOT_AUTHENTICATED') {
      return NextResponse.json({ error: 'Not authenticated with TikTok' }, { status: 401 });
    }
    console.error('[sync/comments] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
