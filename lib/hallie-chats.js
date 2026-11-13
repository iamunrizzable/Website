import { createHash, randomBytes } from 'crypto';
import { getRedis } from '@/lib/tokens';

// A visitor's saved Hallie chats, keyed by their Hallie login (which can
// hold Google, Apple, X, and TikTok). The id is hashed before it is used
// as a Redis key. 90 days, refreshed on every save. One login can hold
// several conversations. The older single-chat key is still read once and
// folded into the list.

const TTL_SECONDS = 90 * 24 * 60 * 60;
const MAX_MESSAGES = 80;
const MAX_TEXT = 2000;
const MAX_CHATS = 20;

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

function chatsKey(id) {
  return `hallie:chats:acct:${createHash('sha256').update(`acct:${id}`).digest('hex')}`;
}

function newChatId() {
  return randomBytes(8).toString('hex');
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

function titleFrom(messages) {
  const first = messages.find((m) => m.sender === 'user')?.text;
  return (first || 'New chat').slice(0, 42);
}

function readStored(raw) {
  const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
  if (!data || typeof data !== 'object') return null;
  return { savedAt: Number(data.savedAt) || 0, messages: sanitizeChatMessages(data.messages) };
}

function cleanChatId(id) {
  return typeof id === 'string' && /^[a-f0-9]{16}$/.test(id) ? id : null;
}

function readBundle(raw) {
  const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
  if (!data || typeof data !== 'object' || !Array.isArray(data.chats)) return null;
  const chats = [];
  for (const c of data.chats.slice(0, MAX_CHATS)) {
    const id = cleanChatId(c?.id);
    if (!id || chats.some((d) => d.id === id)) continue;
    const messages = sanitizeChatMessages(c.messages);
    chats.push({
      id,
      title: typeof c.title === 'string' && c.title.trim() ? c.title.trim().slice(0, 42) : titleFrom(messages),
      savedAt: Number(c.savedAt) || 0,
      messages,
    });
  }
  const active = cleanChatId(data.active);
  return { active: chats.some((c) => c.id === active) ? active : (chats[0]?.id ?? null), chats };
}

function present(bundle) {
  const active = bundle.chats.find((c) => c.id === bundle.active) || null;
  return {
    active: active?.id || null,
    savedAt: active?.savedAt || 0,
    messages: active?.messages || [],
    chats: bundle.chats.map((c) => ({
      id: c.id,
      title: c.title,
      savedAt: c.savedAt,
      count: c.messages.length,
    })),
  };
}

async function redisOrThrow() {
  const redis = getRedis();
  if (!redis) throw new Error('Saving is unavailable right now.');
  return redis;
}

async function writeBundle(redis, accountId, bundle) {
  await redis.set(chatsKey(accountId), JSON.stringify(bundle), { ex: TTL_SECONDS });
}

async function bundleFor(accountId) {
  const redis = await redisOrThrow();
  const raw = await redis.get(chatsKey(accountId));
  if (raw) {
    const bundle = readBundle(raw);
    if (bundle) return { redis, bundle };
  }
  const legacy = await redis.get(redisKey(accountId));
  let stored = null;
  try { stored = legacy ? readStored(legacy) : null; } catch { stored = null; }
  if (stored?.messages.length) {
    const id = newChatId();
    const bundle = {
      active: id,
      chats: [{ id, title: titleFrom(stored.messages), savedAt: stored.savedAt, messages: stored.messages }],
    };
    await writeBundle(redis, accountId, bundle);
    return { redis, bundle };
  }
  return { redis, bundle: { active: null, chats: [] } };
}

export async function loadHallieChats(accountId) {
  const { bundle } = await bundleFor(accountId);
  return present(bundle);
}

export async function loadHallieChat(accountId) {
  const view = await loadHallieChats(accountId);
  return { savedAt: view.savedAt, messages: view.messages };
}

export async function saveHallieChat(accountId, messages, chatId) {
  const { redis, bundle } = await bundleFor(accountId);
  const clean = sanitizeChatMessages(messages);
  const wanted = cleanChatId(chatId);
  let chat = bundle.chats.find((c) => c.id === (wanted || bundle.active));
  const savedAt = Date.now();
  if (!chat) {
    if (bundle.chats.length >= MAX_CHATS) throw new Error('You can keep 20 conversations. Delete one to start another.');
    chat = { id: newChatId(), title: titleFrom(clean), savedAt, messages: clean };
    bundle.chats.unshift(chat);
  } else {
    chat.messages = clean;
    chat.savedAt = savedAt;
    if (!chat.title || chat.title === 'New chat') chat.title = titleFrom(clean);
  }
  bundle.active = chat.id;
  await writeBundle(redis, accountId, bundle);
  const view = present(bundle);
  return { savedAt, count: clean.length, active: view.active, chats: view.chats };
}

export async function createHallieChat(accountId) {
  const { redis, bundle } = await bundleFor(accountId);
  if (bundle.chats.length >= MAX_CHATS) throw new Error('You can keep 20 conversations. Delete one to start another.');
  const chat = { id: newChatId(), title: 'New chat', savedAt: Date.now(), messages: [] };
  bundle.chats.unshift(chat);
  bundle.active = chat.id;
  await writeBundle(redis, accountId, bundle);
  return present(bundle);
}

export async function openHallieChat(accountId, chatId) {
  const { redis, bundle } = await bundleFor(accountId);
  const id = cleanChatId(chatId);
  if (!id || !bundle.chats.some((c) => c.id === id)) throw new Error('That conversation is gone.');
  bundle.active = id;
  await writeBundle(redis, accountId, bundle);
  return present(bundle);
}

export async function deleteHallieChat(accountId, chatId) {
  const redis = await redisOrThrow();
  const id = cleanChatId(chatId);
  if (!id) {
    await redis.del(redisKey(accountId));
    await redis.del(chatsKey(accountId));
    return present({ active: null, chats: [] });
  }
  const { bundle } = await bundleFor(accountId);
  bundle.chats = bundle.chats.filter((c) => c.id !== id);
  if (bundle.active === id) bundle.active = bundle.chats[0]?.id ?? null;
  await writeBundle(redis, accountId, bundle);
  return present(bundle);
}

// Used when two logins become one. Copies every conversation across when
// the destination does not already have one.
export async function relocateHallieChats(fromId, toId) {
  if (!fromId || fromId === toId) return;
  const from = await bundleFor(fromId);
  const to = await bundleFor(toId);
  const fromHas = from.bundle.chats.some((c) => c.messages.length);
  const toHas = to.bundle.chats.some((c) => c.messages.length);
  if (fromHas && !toHas) await writeBundle(to.redis, toId, from.bundle);
}