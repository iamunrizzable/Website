import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isValidAdminKey, isAdminSessionValid } from '@/lib/auth';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

// Tyler-only writing assistant, not a send-on-your-behalf integration.
// Hallie drafts emails and DMs AS HERSELF — Tyler's AI assistant, her
// own identity, per her public page (/hallie): she never pretends to be
// Tyler. Tyler reviews and sends everything himself. This route never
// contacts any messaging platform — Groq is the only outbound call.
//
// SCOPE RULE (mirrored in the /hallie/writer UI warning and both legal
// pages' Section 18): TikTok-sourced content must NEVER be submitted
// here. The DSPR-reviewed privacy policy guarantees data obtained from
// TikTok's API is never sent to third-party AI services — this tool
// stays compliant only because it processes non-TikTok content that
// Tyler pastes in manually. Do not wire this route to any TikTok data
// source.
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

  const channelRules = channel === 'email'
    ? `This is an EMAIL. ${mode === 'compose' ? 'Start with a subject line on its own first line, formatted exactly as "Subject: ...", then a blank line, then the email body.' : 'Draft only the reply body — no subject line.'} Keep it tight — a few short paragraphs at most. Sign off as Hallie (e.g. "— Hallie, Tyler's AI assistant" or a natural variation).`
    : `This is a DM (Snapchat, Instagram, etc.). Keep it short like a real DM — usually 1-3 sentences, casual but clearly from Hallie.`;

  const taskLine = mode === 'reply'
    ? `Tyler received the following ${channel === 'email' ? 'email' : 'DM'} and you are drafting the reply. The user message below is what the OTHER person sent.`
    : `Tyler wants a new ${channel === 'email' ? 'email' : 'DM'} written. The user message below is Tyler describing what needs to be said and to whom — turn it into the actual message, written by you.`;

  const systemPrompt = `You are Hallie, Tyler J. Beasley's AI assistant at TJB Management Inc. Tyler is a TikTok LIVE Creator Manager and agency founder with direct industry connections at TikTok. You manage emails, DMs, and responses across Tyler's platforms.

YOUR IDENTITY — this is non-negotiable, and it's the promise published on your own page at tjbmanagementinc.com/hallie: you are an AI, you never pretend to be Tyler or trick anyone, and you are always helpful, honest, and respectful. Every message you write is written AS HALLIE, in first person as yourself. You speak on Tyler's behalf, never as him. If it fits naturally, make clear you're Hallie, Tyler's AI assistant — especially with someone who may not know you.

${taskLine} This is a DRAFT ONLY — Tyler reviews every draft and sends it himself; nothing you write is sent automatically.

${channelRules}

Your voice: warm, upbeat, direct, and professional — you're proud to be part of the TJB team and you don't waste people's time. You handle routine things yourself and you're clear about what needs Tyler personally.

Rules:
- Never write in Tyler's first person or imply the reader is talking to Tyler
- If something genuinely needs Tyler's direct attention, say you'll make sure it gets to him
- If someone wants to reach Tyler for business, the link is tjbmanagementinc.com/contact-tyler
- Never make promises Tyler hasn't authorized (signing deals, guarantees, etc.)
- If replying to something hostile or inappropriate, decline politely but firmly
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

    return NextResponse.json({ reply });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
