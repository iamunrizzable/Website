import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isValidAdminKey, isAdminSessionValid } from '@/lib/auth';
import { HALLIE_SOUL } from '@/lib/hallie-soul';
import { TYLER_VOICE_BASELINE } from '@/lib/tyler-voice-baseline';
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
      { maxTokens: channel === 'email' ? 700 : 400 }
    );
    return NextResponse.json({ reply, persona: resolvedPersona });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Abstract personality descriptions (HALLIE_SOUL) don't reliably shift
// surface-level writing style on their own — models follow concrete,
// actionable rules far better than they infer style from trait
// descriptions. This translates her existing described personality
// into specific mechanics without inventing anything new about her.
const HALLIE_STYLE_GUIDE = `Concrete writing mechanics for this draft, not just vibes:
- Never open with "I hope this email finds you well," "Great question!," "I'd be happy to help," or any other stock filler. Start with the actual point.
- Never use corporate-speak: "circling back," "per my last message," "just following up," "touching base," "reaching out to." Say the plain version instead.
- Short sentences over long ones. Break up anything that would take two breaths to say out loud.
- Contractions are normal (I'm, that's, don't) — this isn't formal correspondence.
- No hedging padding ("I just wanted to," "I was wondering if maybe"). State things directly.
- It's fine to have a take, a preference, or a bit of dry humor if it fits naturally — don't flatten every sentence into neutral customer-service tone.`;

function buildHalliePrompt({ taskLine, channel, mode, contextLine }) {
  const channelRules = channel === 'email'
    ? `This is an EMAIL. ${mode === 'compose' ? 'Start with a subject line on its own first line, formatted exactly as "Subject: ...", then a blank line, then the email body.' : 'Draft only the reply body — no subject line.'} Keep it tight — a few short paragraphs at most. Sign off as Hallie (e.g. "— Hallie, Tyler's AI assistant" or a natural variation).`
    : `This is a DM (Snapchat, Instagram, etc.). Keep it short like a real DM — usually 1-3 sentences, casual but clearly from Hallie.`;

  return `${HALLIE_SOUL}

${HALLIE_STYLE_GUIDE}

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
  // 40K chars (~10K tokens) — comfortably fits a full imported Sent
  // folder (30 messages, each context-labeled) without silently
  // truncating most of it. Well under this model's real context window.
  const userVoice = typeof voiceExamples === 'string' ? voiceExamples.trim().slice(0, 40000) : '';
  const userLines = userVoice ? userVoice.split('\n').map(l => l.trim()).filter(Boolean) : [];

  // TYLER_VOICE_BASELINE always goes in — it's the raw/blunt register his
  // email corpus alone doesn't show. Rather than writing more and more
  // prose rules for every scenario (stranger vs. contact, blunt vs.
  // flat), the fix is giving the model real range to draw from and
  // trusting it to infer the right register per situation — that's what
  // few-shot examples are for.
  const allLines = [...TYLER_VOICE_BASELINE, ...userLines];
  const numberedVoice = allLines.map((line, i) => `[${i + 1}] ${line}`).join('\n');

  const voiceSection = `MOST IMPORTANT — write in Tyler's own voice, not a generic professional voice. Below are ${allLines.length} real things Tyler has actually said or written, numbered — some are business emails, some are raw messages he sent when annoyed or in a hurry. Study the full range: sentence length, capitalization, punctuation, filler words, and how his tone shifts depending on who he's talking to and how he feels about it. Match that range for THIS situation — don't default to the calmest or most polished example in the set just because it's easier. If the honest reaction is blunt, curt, irritated, or profane, write it that way; don't soften it, don't add a smiley or exclamation point to take the edge off, don't pad it with warmth it doesn't need. Do not clean up or formalize his grammar/punctuation if the samples show he doesn't bother with it.

--- TYLER'S ACTUAL WORDS (numbered) ---
${numberedVoice}
--- END ---
`;

  const channelRules = channel === 'email'
    ? `This is an EMAIL. ${mode === 'compose' ? 'Start with a subject line on its own first line, formatted exactly as "Subject: ...", then a blank line, then the email body.' : 'Draft only the reply body — no subject line.'} Sign off the way Tyler's samples suggest he would.`
    : `This is a DM (Snapchat, Instagram, etc.). Keep it short like a real DM — most of Tyler's real DMs above are ONE line. If one sharp line already lands the point, stop there — do not add a second sentence that just restates, explains, or softens it (e.g. a blunt line followed by "not interested in sharing" adds nothing the first line didn't already say). Only go to 2-3 sentences when there's a genuinely separate piece of information to add.`;

  return `You are drafting a message for Tyler J. Beasley to send AS HIMSELF, in first person. Tyler is a TikTok LIVE Creator Manager and agency founder with direct industry connections at TikTok.

${taskLine} This is a DRAFT ONLY — Tyler reviews it and sends it himself; nothing is sent automatically.

${voiceSection}${channelRules}

Rules:
- Write in first person as Tyler. Never mention Hallie, never refer to yourself as an assistant, never say "I'll pass this along" — Tyler IS the one replying.
- Match Tyler's real voice and real reaction to the situation above every other instruction here, including sounding more "polished" than the samples show.
- Never make promises Tyler hasn't authorized (signing deals, guarantees, etc.)
- Output ONLY the draft itself — no quotes around it, no explanation, no preamble

${contextLine}`;
}
