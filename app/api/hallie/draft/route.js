import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isValidAdminKey, isAdminSessionValid } from '@/lib/auth';
import { VOICE_EXAMPLES, VOICE_NOTES } from '@/lib/hallie-voice';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

// Tyler-only writing assistant, not a send-on-your-behalf integration.
// Drafts emails and DMs in Tyler's voice (few-shot samples in
// lib/hallie-voice.js); he reviews and sends everything himself. This
// route never contacts any messaging platform — Groq is the only
// outbound call.
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

  const { message, context, channel, mode } = body;
  if (!message?.trim()) {
    return NextResponse.json({ error: 'message is required' }, { status: 400 });
  }
  if (!['email', 'dm'].includes(channel)) {
    return NextResponse.json({ error: 'channel must be "email" or "dm"' }, { status: 400 });
  }
  if (!['reply', 'compose'].includes(mode)) {
    return NextResponse.json({ error: 'mode must be "reply" or "compose"' }, { status: 400 });
  }

  const hasVoice = VOICE_EXAMPLES.length > 0;

  const voiceSection = hasVoice
    ? `MOST IMPORTANT — write in Tyler's own voice. Below are real messages Tyler has sent. Study them and imitate exactly how he writes: his capitalization (or lack of it), punctuation habits, slang, abbreviations, emoji use, typical length, and overall energy. The draft should read like Tyler typed it himself, not like an assistant wrote it. Do not clean up or formalize his style.

--- TYLER'S REAL MESSAGES ---
${VOICE_EXAMPLES.map((m, i) => `[${i + 1}] ${m}`).join('\n')}
--- END ---
${VOICE_NOTES ? `\nStyle notes from Tyler: ${VOICE_NOTES}\n` : ''}`
    : '';

  const channelRules = channel === 'email'
    ? `This is an EMAIL. ${mode === 'compose' ? 'Start with a subject line on its own first line, formatted exactly as "Subject: ...", then a blank line, then the email body.' : 'Draft only the reply body — no subject line.'} Keep it tight — a few short paragraphs at most. ${hasVoice ? "Match how formal or casual Tyler's samples are; don't default to stiff business-speak." : ''} Sign off the way Tyler would.`
    : `This is a DM (TikTok, Snapchat, Instagram, etc.). Keep it short like a real DM — usually 1-3 sentences, casual.`;

  const taskLine = mode === 'reply'
    ? `Tyler received the following ${channel === 'email' ? 'email' : 'DM'} and wants a reply drafted. The user message below is what the OTHER person sent him.`
    : `Tyler wants to write a new ${channel === 'email' ? 'email' : 'DM'}. The user message below is Tyler describing what he wants to say and to whom — turn it into the actual message.`;

  const systemPrompt = `You are Hallie, Tyler J. Beasley's AI writing assistant. Tyler is a TikTok LIVE Creator Manager and agency founder with direct industry connections at TikTok.

${taskLine} This is a DRAFT ONLY — Tyler reviews it and sends it himself; nothing you write is sent automatically.

${voiceSection}${channelRules}

Rules:
- Helpful and direct — don't waste people's time
- If someone wants to reach Tyler for business, the link is tjbmanagementinc.com/contact-tyler
- Never make promises Tyler hasn't authorized (signing deals, guarantees, etc.)
- If replying to something hostile or inappropriate, draft a firm decline in Tyler's voice
- Output ONLY the draft itself — no quotes around it, no explanation, no preamble

${context?.trim() ? `Additional context from Tyler: ${context}` : ''}`;

  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: channel === 'email' ? 600 : 300,
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

    return NextResponse.json({ reply, hasVoice });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
