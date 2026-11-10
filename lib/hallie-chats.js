import { createHash } from 'crypto';
import { getRedis } from '@/lib/tokens';

// A visitor's saved Hallie chat, keyed by the TikTok account they signed in
// with. The id is hashed before it is used as a Redis key. 90 days,
// refreshed on every save. Nothing is stored until they are connected.

const TTL_SECONDS = 90 * 24 * 60 * 60;
const MAX_MESSAGES = 80;
const MAX_TEXT = 2000;

export function accountIdFromToken(token) {
  if (!token || typeof token !== 'object') return null;
  const id = token.open_id || token.business_id;
  if (typeof id !== 'string') return null;
  const clean = id.trim();
  if (clean.length < 4 || clean.length > 128) return null;
  return clean;
}

export function accountTag(id) {
  return createHash('sha256').update(`tag:${id}`).digest('hex').slice(0, 16);
}

function redisKey(id) {
  return `hallie:chat:acct:${createHash('sha256').update(`acct:${id}`).digest('hex')}`;
}

export function sanitizeChatMessages(messages) {
  if (!Array.isArray(messages)) return [];
  const out = [];
  for (const m of messages.slice(-MAX_MESSAGES)) {
    if (!m || (m.sender !== 'user' && m.sender !== 'hallie') || typeof m.text !== 'string') continue;
    const text = m.text.replace(/\s+/g, ' ').trim().slice(0, MAX_TEXT);
    if (!text) continue;
    out.push({
      id: String(m.id ?? '').slice(0, 40) || String(out.length),
      text,
      sender: m.sender,
      time: typeof m.time === 'string' ? m.time.slice(0, 20) : '',
    });
  }
  return out;
}

function readStored(raw) {
  const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
  if (!data || typeof data !== 'object') return null;
  return { savedAt: Number(data.savedAt) || 0, messages: sanitizeChatMessages(data.messages) };
}

export async function saveHallieChat(accountId, messages) {
  const redis = getRedis();
  if (!redis) throw new Error('Saving is unavailable right now.');
  const clean = sanitizeChatMessages(messages);
  const savedAt = Date.now();
  await redis.set(redisKey(accountId), JSON.stringify({ savedAt, messages: clean }), { ex: TTL_SECONDS });
  return { savedAt, count: clean.length };
}

export async function loadHallieChat(accountId) {
  const redis = getRedis();
  if (!redis) throw new Error('Saving is unavailable right now.');
  const raw = await redis.get(redisKey(accountId));
  if (!raw) return { savedAt: 0, messages: [] };
  return readStored(raw) ?? { savedAt: 0, messages: [] };
}

export async function deleteHallieChat(accountId) {
  const redis = getRedis();
  if (!redis) throw new Error('Saving is unavailable right now.');
  await redis.del(redisKey(accountId));
}
