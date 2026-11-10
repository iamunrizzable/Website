import { createHash } from 'crypto';
import { getRedis } from '@/lib/tokens';

// A visitor's saved Hallie chat, keyed by a code only they know.
// The code is hashed before it is used as a Redis key. 90 days, refreshed
// on every save. Nothing is stored until they ask to save.

const TTL_SECONDS = 90 * 24 * 60 * 60;
const MAX_MESSAGES = 80;
const MAX_TEXT = 2000;
const CODE_RE = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}(?:-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}){3}$/;

export function normalizeChatCode(input) {
  const raw = String(input ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (raw.length !== 16) return null;
  const code = `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}`;
  return CODE_RE.test(code) ? code : null;
}

function redisKey(code) {
  return `hallie:chat:${createHash('sha256').update(code).digest('hex')}`;
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

export async function saveHallieChat(code, messages) {
  const redis = getRedis();
  if (!redis) throw new Error('Saving is unavailable right now.');
  const clean = sanitizeChatMessages(messages);
  const savedAt = Date.now();
  await redis.set(redisKey(code), JSON.stringify({ savedAt, messages: clean }), { ex: TTL_SECONDS });
  return { savedAt, count: clean.length };
}

export async function loadHallieChat(code) {
  const redis = getRedis();
  if (!redis) throw new Error('Saving is unavailable right now.');
  const raw = await redis.get(redisKey(code));
  if (!raw) return { savedAt: 0, messages: [] };
  return readStored(raw) ?? { savedAt: 0, messages: [] };
}

export async function deleteHallieChat(code) {
  const redis = getRedis();
  if (!redis) throw new Error('Saving is unavailable right now.');
  await redis.del(redisKey(code));
}
