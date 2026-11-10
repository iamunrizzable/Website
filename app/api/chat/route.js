import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { hallieLLMConfigured, callHallieLLM, callHallieLLMWithTools } from '@/lib/hallie-llm';
import { verifyPendingAction } from '@/lib/hallie-chat-actions';
import { HALLIE_IDENTITY, runToolChat, executeConfirmedAction, executeConfirmedBatch, connectionReply, parseRelayConnect, selectVisitorTools, visitorPrefetchPlan, TOOLS } from '@/lib/hallie-chat-tools';
import { isAdminSessionValid } from '@/lib/auth';
import { ADMIN_TOOLS, ADMIN_IDENTITY, ADMIN_SYSTEM_PROMPT, logAdminAction, selectAdminTools, adminPrefetchPlan } from '@/lib/hallie-admin-tools';
import { isHallieSuspended } from '@/lib/tokens';

const FALLBACK_REPLY = "I've received your message! I'll get back to you soon. You can also email me directly at hallie@tjbmanagementinc.com.";
const ERROR_REPLY = 'Connection error. Please try emailing us at support@tjbmanagementinc.com instead.';
// Every model I can reach failed (busy, out of quota, or down): say that, not "connection error".
const BUSY_REPLY = "I can't answer right now — my AI isn't responding. Ask me again in a moment.";
// Hallie kill switch (/admin/security/kill/switches) is on.
const OFF_REPLY = 'Hallie is offline right now. Please email support@tjbmanagementinc.com instead.';

function clientIp(req) {
  return (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
}

const failureReply = (err) => (/All LLM providers failed/.test(err?.message ?? '') ? BUSY_REPLY : ERROR_REPLY);

// The VM relay answers /healthz but its POST /chat returns 502. When that
// happens, answer with the same models the rest of the site uses so a dead
// relay process does not take public Hallie down.
async function replyWithoutRelay(message, history) {
  if (!hallieLLMConfigured()) return null;
  const prior = Array.isArray(history)
    ? history
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
      .slice(-6)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }))
    : [];
  return callHallieLLM([
    { role: 'system', content: `You are Hallie™ on tjbmanagementinc.com. The usual relay is down, so answer in your own voice. Plain text, no markdown.\n\n${HALLIE_IDENTITY}` },
    ...prior,
    { role: 'user', content: String(message).slice(0, 4000) },
  ], { maxTokens: 500 });
}

async function runConfirmed(verified, tools) {
  if (verified.tool === '__batch') return executeConfirmedBatch(verified.args?.actions, tools);
  return executeConfirmedAction(verified.tool, verified.args, tools);
}

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

    // Kill switch: before anything else, including admin tools and pending
    // confirms. Fails open on a Redis error, like the other kill switches.
    if (await isHallieSuspended().catch(() => false)) {
      return NextResponse.json({ reply: OFF_REPLY }, { status: 503 });
    }

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
        const done = await runConfirmed(adminPending, ADMIN_TOOLS);
        if (adminPending.tool === '__batch') {
          for (const item of done.results ?? []) {
            await logAdminAction(item.tool, item.args, item.ok ? {} : { error: true });
          }
        } else {
          await logAdminAction(adminPending.tool, adminPending.args, done.ok ? {} : { error: true });
        }
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
      const result = await runConfirmed(verified);
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
          prefetchPlan: adminPrefetchPlan,
        });
        const body = { reply: result.reply };
        if (result.pendingAction) body.pendingAction = result.pendingAction;
        if (result.adminLogin) body.adminLogin = true;
        for (const item of result.ran ?? []) {
          await logAdminAction(item.tool, item.args, item.ok ? {} : { error: true });
        }
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
          prefetchPlan: visitorPrefetchPlan,
          tools: selectVisitorTools([
            ...(Array.isArray(history) ? history.filter((m) => m?.role === 'user' && typeof m.content === 'string').map((m) => m.content) : []),
            message,
          ]),
        });
        const body = { reply: result.reply };
        if (result.pendingAction) body.pendingAction = result.pendingAction;
        if (result.connect) body.connect = true;
        if (result.disconnected) body.disconnected = true;
        return withCookies(NextResponse.json(body), result.setCookies);
      } catch (err) {
        console.error('[chat] tool path failed:', err.message);
        return NextResponse.json({ reply: failureReply(err) }, { status: 502 });
      }
    }

    const relayUrl = process.env.HALLIE_RELAY_URL;
    const ip = clientIp(req);
    let upstream;
    if (relayUrl) {
      try {
        upstream = await fetch(`${relayUrl}/chat`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-visitor-ip': ip,
          },
          body: JSON.stringify({ message }),
          signal: AbortSignal.timeout(65_000),
          cache: 'no-store',
        });
      } catch (err) {
        console.error('[chat] relay unreachable:', err.message);
      }
    }

    if (upstream?.ok) {
      const data = await upstream.json().catch(() => ({}));
      if (typeof data.reply === 'string' && data.reply) {
        const { reply, connect, adminLogin } = parseRelayConnect(data.reply);
        const out = { reply };
        if (connect) out.connect = true;
        if (adminLogin) out.adminLogin = true;
        return NextResponse.json(out);
      }
    }

    try {
      const reply = await replyWithoutRelay(message, history);
      if (reply) return NextResponse.json({ reply });
    } catch (err) {
      console.error('[chat] relay fallback failed:', err.message);
      return NextResponse.json({ reply: failureReply(err) }, { status: 502 });
    }
    return NextResponse.json({ reply: relayUrl ? ERROR_REPLY : FALLBACK_REPLY }, { status: relayUrl ? 502 : 200 });
  } catch (err) {
    return NextResponse.json({ reply: ERROR_REPLY }, { status: 502 });
  }
}
