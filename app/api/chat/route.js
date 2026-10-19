import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { hallieLLMConfigured, callHallieLLMWithTools } from '@/lib/hallie-llm';
import { verifyPendingAction } from '@/lib/hallie-chat-actions';
import { runToolChat, executeConfirmedAction, connectionReply, parseRelayConnect } from '@/lib/hallie-chat-tools';

const FALLBACK_REPLY = "I've received your message! I'll get back to you soon. You can also email me directly at hallie@tjbmanagementinc.com.";
const ERROR_REPLY = 'Connection error. Please try emailing us at support@tjbmanagementinc.com instead.';

// The visitor's own TikTok connection — same parsing and expiry check as
// /api/system/status. { state: 'none' } (no cookie → the unchanged relay
// path), { state: 'expired' } (cookie present but expired or unreadable),
// or { state: 'connected', identity } (what confirm tokens are bound to).
async function connection() {
  const raw = (await cookies()).get('acct_token')?.value;
  if (!raw) return { state: 'none' };
  try {
    const token = JSON.parse(raw);
    const expired = token.expires_at && Date.now() > token.expires_at;
    const identity = String(token.open_id ?? token.business_id ?? '');
    if (expired || !identity) return { state: 'expired' };
    return { state: 'connected', identity };
  } catch {
    return { state: 'expired' };
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
      const conn = await connection();
      if (conn.state !== 'connected') {
        return NextResponse.json({ reply: connectionReply('not_connected'), connect: true }, { status: 401 });
      }
      const verified = verifyPendingAction(confirm, conn.identity);
      if (verified.error) {
        const reply = verified.error === 'expired'
          ? 'That confirmation expired. Ask me again and I will set it up fresh.'
          : "I couldn't confirm that action. Make sure your TikTok account is still connected and ask me again.";
        return NextResponse.json({ reply }, { status: 400 });
      }
      const result = await executeConfirmedAction(verified.tool, verified.args);
      const body = { reply: result.reply };
      if (result.connect) body.connect = true;
      if (result.disconnected) body.disconnected = true;
      return withCookies(NextResponse.json(body), result.setCookies);
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const conn = await connection();
    if (conn.state !== 'none' && hallieLLMConfigured()) {
      try {
        const result = await runToolChat({
          message,
          history,
          identity: conn.identity,
          connectionExpired: conn.state === 'expired',
          llm: callHallieLLMWithTools,
        });
        const body = { reply: result.reply };
        if (result.pendingAction) body.pendingAction = result.pendingAction;
        if (result.connect) body.connect = true;
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
    if (typeof data.reply === 'string' && data.reply) {
      const { reply, connect } = parseRelayConnect(data.reply);
      return NextResponse.json(connect ? { reply, connect: true } : { reply });
    }
    return NextResponse.json({ reply: ERROR_REPLY });
  } catch (err) {
    return NextResponse.json({ reply: ERROR_REPLY }, { status: 502 });
  }
}
