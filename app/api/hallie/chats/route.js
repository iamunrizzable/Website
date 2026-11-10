import { NextResponse } from 'next/server';
import { getRedis } from '@/lib/tokens';
import { normalizeChatCode, saveHallieChat, loadHallieChat, deleteHallieChat } from '@/lib/hallie-chats';

const WINDOW_SECONDS = 60 * 60;
const MAX_TRIES = 40;

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

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { body = {}; }
  const code = normalizeChatCode(body.code);
  if (!code) return NextResponse.json({ error: 'That code is not valid.' }, { status: 400 });
  if (await limited(clientIp(request)).catch(() => false)) {
    return NextResponse.json({ error: 'Too many tries. Wait a while and try again.' }, { status: 429 });
  }
  try {
    if (body.action === 'save') {
      const saved = await saveHallieChat(code, body.messages);
      return NextResponse.json({ ok: true, ...saved });
    }
    if (body.action === 'load') {
      return NextResponse.json({ ok: true, ...(await loadHallieChat(code)) });
    }
    if (body.action === 'delete') {
      await deleteHallieChat(code);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Saving is unavailable right now.' }, { status: 503 });
  }
}
