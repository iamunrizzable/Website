import { NextResponse } from 'next/server';
import { scoreContent, shouldAlert } from '@/lib/moderation/scorer';
import { suggestReply } from '@/lib/moderation/replies';
import { sendModerationAlert } from '@/lib/email/alerts';
import { pushEvent } from '@/lib/tokens';
import { isValidAdminKey } from '@/lib/auth';

// POST /api/moderate
// Body: { text, type?, author?, video_id?, send_alert? }
// Scoring itself is intentionally unauthenticated — both TestPanels (admin
// and system) call this to preview how a comment would score, and always
// pass send_alert:false. The alert-sending side effect is a different story:
// it's a real email to Tyler built from these same request fields, so
// send_alert is only honored when the caller also supplies a valid
// x-admin-key — otherwise anyone could spam his inbox at will with
// arbitrary attacker-chosen text/author/video_id.
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { text, type = 'manual', author, video_id, send_alert = true } = body;

  if (!text || typeof text !== 'string') {
    return NextResponse.json({ error: 'text is required' }, { status: 400 });
  }

  const { score, flags, action } = scoreContent(text);
  const suggestedReply = flags.length > 0 ? suggestReply(flags) : null;

  const event = { type, author, video_id, text, score, flags, action, suggested_reply: suggestedReply };
  await pushEvent(event);

  if (send_alert && isValidAdminKey(request) && shouldAlert(score)) {
    await sendModerationAlert({
      type,
      content: text,
      author,
      score,
      flags,
      videoId: video_id,
      suggestedReply,
    }).catch((e) => console.error('[moderate] Email alert failed:', e.message));
  }

  return NextResponse.json({ score, flags, action, suggested_reply: suggestedReply });
}
