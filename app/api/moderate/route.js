import { NextResponse } from 'next/server';
import { scoreContent, shouldAlert } from '@/lib/moderation/scorer';
import { suggestReply } from '@/lib/moderation/replies';
import { sendModerationAlert } from '@/lib/email/alerts';
import { pushEvent } from '@/lib/tokens';

// POST /api/moderate
// Body: { text, type?, author?, video_id?, send_alert? }
// No admin key required — can be called from internal services.
// Protect by only calling from trusted server-side code or add ADMIN_SECRET check if exposed publicly.
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

  if (send_alert && shouldAlert(score)) {
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
