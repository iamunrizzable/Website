import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { hallieLLMConfigured, callHallieLLMWithTools } from '@/lib/hallie-llm';
import { verifyPendingAction } from '@/lib/hallie-chat-actions';
import { runToolChat, executeConfirmedAction } from '@/lib/hallie-chat-tools';

const FALLBACK_REPLY = "I've received your message! I'll get back to you soon. You can also email me directly at hallie@tjbmanagementinc.com.";
const ERROR_REPLY = 'Connection error. Please try emailing us at support@tjbmanagementinc.com instead.';

// The visitor's own connected TikTok account, if any — same parsing and
// expiry check as /api/system/status. Returns the identity the confirm
// tokens are bound to, or null (→ the unchanged relay path).
async function connectedIdentity() {
  const raw = (await cookies()).get('acct_token')?.value;
  if (!raw) return null;
  try {
    const token = JSON.parse(raw);
    const expired = token.expires_at && Date.now() > token.expires_at;
    if (expired) return null;
    return String(token.open_id ?? token.business_id ?? '') || null;
  } catch {
    return null;
  }
}

function withCookies(response, setCookies = []) {
  for (const c of setCookies) response.headers.append('set-cookie', c);
  return response;
}

export async function POST(req) {
  try {
    const { message, history, confirm } = await req.json();

    // Confirm tap on a pending change from the tool-enabled path: run
    // exactly the signed action, only for the same connected account.
    if (confirm !== undefined) {
      const identity = await connectedIdentity();
      const verified = identity ? verifyPendingAction(confirm, identity) : { error: 'invalid' };
      if (verified.error) {
        const reply = verified.error === 'expired'
          ? 'That confirmation expired. Ask me again and I will set it up fresh.'
          : "I couldn't confirm that action. Make sure your TikTok account is still connected and ask me again.";
        return NextResponse.json({ reply }, { status: 400 });
      }
      const result = await executeConfirmedAction(verified.tool, verified.args);
      return withCookies(NextResponse.json({ reply: result.reply }), result.setCookies);
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const identity = await connectedIdentity();
    if (identity && hallieLLMConfigured()) {
      try {
        const result = await runToolChat({ message, history, identity, llm: callHallieLLMWithTools });
        const body = { reply: result.reply };
        if (result.pendingAction) body.pendingAction = result.pendingAction;
        return withCookies(NextResponse.json(body), result.setCookies);
      } catch (err) {
        console.error('[chat] tool path failed:', err.message);
        return NextResponse.json({ reply: ERROR_REPLY }, { status: 502 });
      }
    }

    const relayUrl = process.env.HALLIE_RELAY_URL;
    if (!relayUrl) {
      return NextResponse.json({ reply: FALLBACK_REPLY });
    }

    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';

    const upstream = await fetch(`${relayUrl}/chat`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-visitor-ip': ip,
      },
      body: JSON.stringify({ message }),
      signal: AbortSignal.timeout(65_000),
      cache: 'no-store',
    });

    if (!upstream.ok) {
      return NextResponse.json({ reply: ERROR_REPLY }, { status: 502 });
    }
    const data = await upstream.json();
    return NextResponse.json({ reply: typeof data.reply === 'string' && data.reply ? data.reply : ERROR_REPLY });
  } catch (err) {
    return NextResponse.json({ reply: ERROR_REPLY }, { status: 502 });
  }
}
