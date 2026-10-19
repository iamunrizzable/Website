import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { hallieLLMConfigured, callHallieLLMWithTools } from '@/lib/hallie-llm';
import { verifyPendingAction } from '@/lib/hallie-chat-actions';
import { runToolChat, executeConfirmedAction, connectionReply, parseRelayConnect, selectVisitorTools, TOOLS } from '@/lib/hallie-chat-tools';
import { isAdminSessionValid } from '@/lib/auth';
import { ADMIN_TOOLS, ADMIN_IDENTITY, ADMIN_SYSTEM_PROMPT, logAdminAction, selectAdminTools } from '@/lib/hallie-admin-tools';

const FALLBACK_REPLY = "I've received your message! I'll get back to you soon. You can also email me directly at hallie@tjbmanagementinc.com.";
const ERROR_REPLY = 'Connection error. Please try emailing us at support@tjbmanagementinc.com instead.';
// Every model I can reach is busy or out of quota: say that, not "connection error".
const BUSY_REPLY = "I can't think straight for a minute — too many people talking to me at once. Ask me again in a moment.";
const failureReply = (err) => (/All LLM providers failed/.test(err?.message ?? '') ? BUSY_REPLY : ERROR_REPLY);

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

    // Admin tools only exist for a logged-in admin session (password +
    // authenticator code). Anyone else never gets them, whatever they say.
    const admin = await isAdminSessionValid(await cookies());

    // Confirm tap on a pending admin change: signed for the admin identity,
    // and it only runs while the admin session is still valid.
    if (confirm !== undefined) {
      const adminPending = verifyPendingAction(confirm, ADMIN_IDENTITY);
      if (!adminPending.error || adminPending.error === 'expired') {
        if (adminPending.error === 'expired') {
          return NextResponse.json({ reply: 'That confirmation expired. Ask me again and I will set it up fresh.' }, { status: 400 });
        }
        if (!admin) {
          return NextResponse.json({ reply: 'Your admin session expired, so I did not run that. Log in again with the button below and ask me again.', adminLogin: true }, { status: 401 });
        }
        const done = await executeConfirmedAction(adminPending.tool, adminPending.args, ADMIN_TOOLS);
        await logAdminAction(adminPending.tool, adminPending.args, done.ok ? {} : { error: true });
        const body = { reply: done.reply };
        if (done.adminLogin) body.adminLogin = true;
        return NextResponse.json(body);
      }
    }

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

    if (admin && hallieLLMConfigured()) {
      try {
        const result = await runToolChat({
          message,
          history,
          identity: ADMIN_IDENTITY,
          llm: callHallieLLMWithTools,
          tools: {
            web_search: TOOLS.web_search,
            ...selectAdminTools([
              ...(Array.isArray(history) ? history.filter((m) => m?.role === 'user' && typeof m.content === 'string').map((m) => m.content) : []),
              message,
            ]),
          },
          systemPrompt: ADMIN_SYSTEM_PROMPT,
          maxIterations: 8,
        });
        const body = { reply: result.reply };
        if (result.pendingAction) body.pendingAction = result.pendingAction;
        if (result.adminLogin) body.adminLogin = true;
        return NextResponse.json(body);
      } catch (err) {
        console.error('[chat] admin tool path failed:', err.message);
        return NextResponse.json({ reply: failureReply(err) }, { status: 502 });
      }
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
          tools: selectVisitorTools([
            ...(Array.isArray(history) ? history.filter((m) => m?.role === 'user' && typeof m.content === 'string').map((m) => m.content) : []),
            message,
          ]),
        });
        const body = { reply: result.reply };
        if (result.pendingAction) body.pendingAction = result.pendingAction;
        if (result.connect) body.connect = true;
        return withCookies(NextResponse.json(body), result.setCookies);
      } catch (err) {
        console.error('[chat] tool path failed:', err.message);
        return NextResponse.json({ reply: failureReply(err) }, { status: 502 });
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
      const { reply, connect, adminLogin } = parseRelayConnect(data.reply);
      const out = { reply };
      if (connect) out.connect = true;
      if (adminLogin) out.adminLogin = true;
      return NextResponse.json(out);
    }
    return NextResponse.json({ reply: ERROR_REPLY });
  } catch (err) {
    return NextResponse.json({ reply: ERROR_REPLY }, { status: 502 });
  }
}
