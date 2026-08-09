import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isValidAdminKey, isAdminSessionValid } from '@/lib/auth';
import { HALLIE_SOUL } from '@/lib/hallie-soul';
import { hallieLLMConfigured, callHallieLLM } from '@/lib/hallie-llm';

// Tyler-only writing assistant, not a send-on-your-behalf integration.
// Two personas, picked per request:
// - 'hallie' — Hallie drafts AS HERSELF, first person, per her public
//   identity promise on /hallie: she never pretends to be Tyler.
// - 'tyler'  — drafts AS TYLER, first person, optionally imitating real
//   messages he provides (voiceExamples, client-supplied — this route
//   has no storage, nothing persists server-side).
// Either way Tyler reviews and sends everything himself. The LLM call
// (lib/hallie-llm.js) is the only outbound call this route makes — never
// inline a provider fetch here, and never wire this to any messaging
// platform.
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

  if (!hallieLLMConfigured()) {
    return NextResponse.json({ error: 'No LLM configured — set GROQ_API_KEY (or HALLIE_LLM_KEY) in Vercel' }, { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { message, context, channel, mode, persona, voiceExamples } = body;
  if (!message?.trim()) {
    return NextResponse.json({ error: 'message is required' }, { status: 400 });
  }
  if (!['email', 'dm'].includes(channel)) {
    return NextResponse.json({ error: 'channel must be "email" or "dm"' }, { status: 400 });
  }
  if (!['reply', 'compose'].includes(mode)) {
    return NextResponse.json({ error: 'mode must be "reply" or "compose"' }, { status: 400 });
  }
  const resolvedPersona = persona === 'tyler' ? 'tyler' : 'hallie';

  const taskLine = mode === 'reply'
    ? `Tyler received the following ${channel === 'email' ? 'email' : 'DM'} and you are drafting the reply. The user message below is what the OTHER person sent.`
    : `Tyler wants a new ${channel === 'email' ? 'email' : 'DM'} written. The user message below is Tyler describing what needs to be said and to whom — turn it into the actual message.`;

  const contextLine = context?.trim() ? `Additional context from Tyler: ${context}` : '';

  const systemPrompt = resolvedPersona === 'tyler'
    ? buildTylerPrompt({ taskLine, channel, mode, contextLine, voiceExamples })
    : buildHalliePrompt({ taskLine, channel, mode, contextLine });

  try {
    const reply = await callHallieLLM(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      { maxTokens: channel === 'email' ? 600 : 300 }
    );
    return NextResponse.json({ reply, persona: resolvedPersona });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function buildHalliePrompt({ taskLine, channel, mode, contextLine }) {
  const channelRules = channel === 'email'
    ? `This is an EMAIL. ${mode === 'compose' ? 'Start with a subject line on its own first line, formatted exactly as "Subject: ...", then a blank line, then the email body.' : 'Draft only the reply body — no subject line.'} Keep it tight — a few short paragraphs at most. Sign off as Hallie (e.g. "— Hallie, Tyler's AI assistant" or a natural variation).`
    : `This is a DM (Snapchat, Instagram, etc.). Keep it short like a real DM — usually 1-3 sentences, casual but clearly from Hallie.`;

  return `${HALLIE_SOUL}

Tyler is a TikTok LIVE Creator Manager and agency founder with direct industry connections at TikTok. You manage emails, DMs, and responses across his platforms.

${taskLine} This is a DRAFT ONLY — Tyler reviews every draft and sends it himself; nothing you write is sent automatically.

${channelRules}

Rules:
- Never write in Tyler's first person or imply the reader is talking to Tyler
- If something genuinely needs Tyler's direct attention, say you'll make sure it gets to him
- If someone wants to reach Tyler for business, the link is tjbmanagementinc.com/contact-tyler
- Never make promises Tyler hasn't authorized (signing deals, guarantees, etc.)
- If replying to something hostile or inappropriate, decline politely but firmly
- Output ONLY the draft itself — no quotes around it, no explanation, no preamble

${contextLine}`;
}

function buildTylerPrompt({ taskLine, channel, mode, contextLine, voiceExamples }) {
  const voice = typeof voiceExamples === 'string' ? voiceExamples.trim().slice(0, 6000) : '';

  const voiceSection = voice
    ? `MOST IMPORTANT — write in Tyler's own voice. Below are real messages Tyler has sent. Study them and imitate exactly how he writes: capitalization (or lack of it), punctuation habits, slang, abbreviations, emoji use, typical message length, and overall energy. The draft should read like Tyler typed it himself. Do not clean up or formalize his style.

--- TYLER'S REAL MESSAGES ---
${voice}
--- END ---
`
    : '';

  const channelRules = channel === 'email'
    ? `This is an EMAIL. ${mode === 'compose' ? 'Start with a subject line on its own first line, formatted exactly as "Subject: ...", then a blank line, then the email body.' : 'Draft only the reply body — no subject line.'} ${voice ? "Sign off the way Tyler's samples suggest he would." : 'Sign off simply, the way a busy founder would (first name is enough).'}`
    : `This is a DM (Snapchat, Instagram, etc.). Keep it short like a real DM — usually 1-3 sentences.`;

  return `You are drafting a message for Tyler J. Beasley to send AS HIMSELF, in first person. Tyler is a TikTok LIVE Creator Manager and agency founder with direct industry connections at TikTok.

${taskLine} This is a DRAFT ONLY — Tyler reviews it and sends it himself; nothing is sent automatically.

${voiceSection}${channelRules}

Rules:
- Write in first person as Tyler. Never mention Hallie, never refer to yourself as an assistant, never say "I'll pass this along" — Tyler IS the one replying.
- ${voice ? "Match Tyler's voice from the samples above — that overrides any generic tone guidance." : 'Keep the tone casual but professional, like a busy founder texting between things.'}
- Never make promises Tyler hasn't authorized (signing deals, guarantees, etc.)
- If replying to something hostile or inappropriate, draft a firm decline in Tyler's voice
- Output ONLY the draft itself — no quotes around it, no explanation, no preamble

${contextLine}`;
}
