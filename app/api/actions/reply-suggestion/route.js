import { NextResponse } from 'next/server';
import { scoreContent } from '@/lib/moderation/scorer';
import { suggestReply } from '@/lib/moderation/replies';

// POST /api/actions/reply-suggestion
// Body: { text } or { flags }
// Returns a suggested reply for the given content or pre-computed flags.
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  let flags = body.flags;

  if (!flags) {
    if (!body.text || typeof body.text !== 'string') {
      return NextResponse.json({ error: 'Provide text or flags' }, { status: 400 });
    }
    ({ flags } = scoreContent(body.text));
  }

  const reply = suggestReply(flags);
  return NextResponse.json({ reply, flags });
}
