import { getVideoList, getVideoComments, hideComment } from './tiktok/api.js';
import { scoreContent, shouldAlert } from './moderation/scorer.js';
import { suggestReply } from './moderation/replies.js';
import { sendModerationAlert } from './email/alerts.js';
import { pushEvent, isCommentSeen, markCommentSeen, queueBlock } from './tokens.js';

export async function syncComments({ videoId, autoHide = false } = {}) {
  const videosRes = await getVideoList(0, 10);
  if (videosRes.error?.code && videosRes.error.code !== 'ok') {
    throw new Error(JSON.stringify(videosRes.error));
  }

  const videos = videosRes.data?.videos ?? [];
  const targetVideos = videoId ? videos.filter((v) => v.id === videoId) : videos;
  const results = [];

  for (const video of targetVideos) {
    const commentsRes = await getVideoComments(video.id);
    const comments = commentsRes.data?.comments ?? [];

    for (const comment of comments) {
      if (await isCommentSeen(comment.id)) continue;

      const { score, flags, action } = scoreContent(comment.text);
      await markCommentSeen(comment.id);

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
