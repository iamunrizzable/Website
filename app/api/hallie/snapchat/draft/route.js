import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isValidAdminKey, isAdminSessionValid } from '@/lib/auth';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

// Tyler-only draft-assist tool, not a send-on-your-behalf integration —
// see the Snapchat moderation system page for why. This drafts a suggested
// reply from a Snapchat message Tyler pastes in; he reviews and sends it
// himself in the Snapchat app. Nothing here ever touches Snapchat directly.
export async function POST(request) {
  const cookieStore = await cookies();
  if (!isValidAdminKey(request) && !isAdminSessionValid(cookieStore)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: 'GROQ_API_KEY is not configured' }, { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { message, context } = body;
  if (!message?.trim()) {
    return NextResponse.json({ error: 'message is required' }, { status: 400 });
  }

  const systemPrompt = `You are Hallie, Tyler J. Beasley's AI assistant. Tyler is a TikTok LIVE Creator Manager and agency founder with direct industry connections at TikTok.

You are drafting a suggested reply to a Snapchat message Tyler received. This is a DRAFT ONLY — Tyler will review it and send it himself; nothing you write is sent automatically. Keep the draft:
- Friendly but professional
- Concise (2-4 sentences max)
- On-brand for a creator manager / agency founder
- Helpful and direct — don't waste people's time
- If someone wants to contact Tyler directly for business, direct them to tjbmanagementinc.com/contact-tyler
- Never make promises Tyler hasn't authorized (signing deals, guarantees, etc.)
- If the message is hostile or inappropriate, draft a firm, polite decline

${context?.trim() ? `Additional context: ${context}` : ''}`;

  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 300,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message ?? `Groq API error (${res.status})`);
    }

    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      throw new Error('Groq returned an empty response');
    }

    return NextResponse.json({ reply });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
