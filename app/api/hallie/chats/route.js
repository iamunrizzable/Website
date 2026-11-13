import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getRedis } from '@/lib/tokens';
import { accountTag, saveHallieChat, loadHallieChats, deleteHallieChat, createHallieChat, openHallieChat, accountIdFromToken } from '@/lib/hallie-chats';
import {
  SESSION_COOKIE, connectProvider, readLogin, unlinkProvider, clearSessionCookie, applySessionCookie,
} from '@/lib/hallie-identity';

const WINDOW_SECONDS = 60 * 60;
const MAX_TRIES = 300;

function clientIp(req) {
  return (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
}

async function limited(ip) {
  const redis = getRedis();
  if (!redis) return false;
  const key = `hallie:chat:tries:${ip}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, WINDOW_SECONDS);
  return count > MAX_TRIES;
}

async function signedInAccount() {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(SESSION_COOKIE)?.value ?? null;
  let minted = null;
  if (!sessionId) {
    const raw = cookieStore.get('acct_token')?.value;
    if (raw) {
      try {
        const token = JSON.parse(raw);
        if (!token.expires_at || Date.now() <= token.expires_at) {
          const subject = accountIdFromToken(token);
          if (subject) {
            try {
              minted = await connectProvider({ currentId: null, provider: 'tiktok', subject, label: 'TikTok' });
              sessionId = minted;
            } catch { /* Redis is down: the TikTok tools still work, saving does not */ }
          }
        }
      } catch { /* the TikTok cookie is unreadable; they can connect again */ }
    }
  }
  const login = await readLogin(sessionId);
  if (!login) return null;
  return { ...login, accountId: `h:${login.id}`, minted };
}

function withSession(body, login, status) {
  const response = NextResponse.json(body, status ? { status } : undefined);
  if (login?.minted) applySessionCookie(response, login.minted);
  return response;
}

export async function GET(request) {
  if (await limited(clientIp(request)).catch(() => false)) {
    return NextResponse.json({ error: 'Too many tries. Wait a while and try again.' }, { status: 429 });
  }
  const login = await signedInAccount();
  if (!login) return NextResponse.json({ connected: false, connections: [] });
  try {
    const chat = await loadHallieChats(login.accountId);
    return withSession({ connected: true, tag: accountTag(login.accountId), connections: login.connections, ...chat }, login);
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Saving is unavailable right now.' }, { status: 503 });
  }
}

export async function POST(request) {
  if (await limited(clientIp(request)).catch(() => false)) {
    return NextResponse.json({ error: 'Too many tries. Wait a while and try again.' }, { status: 429 });
  }
  const login = await signedInAccount();
  if (!login) {
    return NextResponse.json({ connected: false, connections: [], error: 'Sign in to save this chat.' }, { status: 401 });
  }
  let body;
  try { body = await request.json(); } catch { body = {}; }
  try {
    if (body.action === 'save') {
      const saved = await saveHallieChat(login.accountId, body.messages, body.chatId);
      return withSession({ ok: true, connected: true, tag: accountTag(login.accountId), connections: login.connections, ...saved }, login);
    }
    if (body.action === 'new') {
      const chat = await createHallieChat(login.accountId);
      return withSession({ ok: true, connected: true, connections: login.connections, ...chat }, login);
    }
    if (body.action === 'open') {
      const chat = await openHallieChat(login.accountId, body.chatId);
      return withSession({ ok: true, connected: true, connections: login.connections, ...chat }, login);
    }
    if (body.action === 'delete') {
      const chat = await deleteHallieChat(login.accountId, body.chatId);
      return withSession({ ok: true, connected: true, connections: login.connections, ...chat }, login);
    }
    if (body.action === 'unlink') {
      const result = await unlinkProvider(login.id, body.provider);
      if (!result) return NextResponse.json({ error: 'Unknown connection' }, { status: 400 });
      const response = NextResponse.json({
        ok: true,
        connected: !result.empty,
        connections: result.connections,
      });
      if (body.provider === 'tiktok') {
        response.cookies.set('acct_token', '', {
          httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 0, path: '/',
        });
      }
      if (result.empty) clearSessionCookie(response);
      else if (login.minted) applySessionCookie(response, login.minted);
      return response;
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Saving is unavailable right now.' }, { status: 503 });
  }
}
