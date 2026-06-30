import { listVideos, listComments, hideComment } from './tiktok/business-api.js';
import { scoreContent, shouldAlert } from './moderation/scorer.js';
import { suggestReply } from './moderation/replies.js';
import { sendModerationAlert } from './email/alerts.js';
import { pushEvent, isCommentSeen, markCommentSeen, queueBlock } from './tokens.js';

export async function syncComments({ videoId, autoHide = false } = {}) {
  const videosRes = await listVideos({ pageSize: 10 });
  if (videosRes.code && videosRes.code !== 0) {
    throw new Error(videosRes.message ?? JSON.stringify(videosRes));
  }

  const videos = videosRes.data?.videos ?? [];
  const targetVideos = videoId ? videos.filter((v) => v.id === videoId) : videos;
  const results = [];

  for (const video of targetVideos) {
    const commentsRes = await listComments({ videoId: video.id });
    const comments = commentsRes.data?.comments ?? [];

    for (const comment of comments) {
      if (await isCommentSeen(comment.comment_id)) continue;

      const { score, flags, action } = scoreContent(comment.text);
      await markCommentSeen(comment.comment_id);

      const event = {
        type: 'comment',
        video_id: video.id,
        comment_id: comment.comment_id,
        author: comment.username,
        text: comment.text,
        score,
        flags,
        action,
      };

      if (action === 'hide' && autoHide) {
        await hideComment({ commentId: comment.comment_id, videoId: video.id });
        event.hidden = true;
      }

      if (flags.includes('potential_minor') && comment.username) {
        await queueBlock(comment.username);
        event.block_queued = true;
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

  return results;
}
