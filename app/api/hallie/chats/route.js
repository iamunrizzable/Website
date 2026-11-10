import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getRedis } from '@/lib/tokens';
import { accountIdFromToken, accountTag, saveHallieChat, loadHallieChat, deleteHallieChat } from '@/lib/hallie-chats';

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
  const raw = cookieStore.get('acct_token')?.value;
  if (!raw) return null;
  try {
    const token = JSON.parse(raw);
    if (token.expires_at && Date.now() > token.expires_at) return null;
    return accountIdFromToken(token);
  } catch {
    return null;
  }
}

export async function GET(request) {
  if (await limited(clientIp(request)).catch(() => false)) {
    return NextResponse.json({ error: 'Too many tries. Wait a while and try again.' }, { status: 429 });
  }
  const accountId = await signedInAccount();
  if (!accountId) return NextResponse.json({ connected: false });
  try {
    const chat = await loadHallieChat(accountId);
    return NextResponse.json({ connected: true, tag: accountTag(accountId), ...chat });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Saving is unavailable right now.' }, { status: 503 });
  }
}

export async function POST(request) {
  if (await limited(clientIp(request)).catch(() => false)) {
    return NextResponse.json({ error: 'Too many tries. Wait a while and try again.' }, { status: 429 });
  }
  const accountId = await signedInAccount();
  if (!accountId) {
    return NextResponse.json({ connected: false, error: 'Connect your TikTok account to save this chat.' }, { status: 401 });
  }
  let body;
  try { body = await request.json(); } catch { body = {}; }
  try {
    if (body.action === 'save') {
      const saved = await saveHallieChat(accountId, body.messages);
      return NextResponse.json({ ok: true, connected: true, tag: accountTag(accountId), ...saved });
    }
    if (body.action === 'delete') {
      await deleteHallieChat(accountId);
      return NextResponse.json({ ok: true, connected: true });
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Saving is unavailable right now.' }, { status: 503 });
  }
}
