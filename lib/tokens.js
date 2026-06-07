import { Redis } from '@upstash/redis';

const TOKEN_KEY = 'tiktok:tokens';
const EVENTS_KEY = 'tiktok:events';
const MAX_EVENTS = 50;
const COOKIES_KEY = 'tiktok:browser:cookies';
const BLOCK_QUEUE_KEY = 'tiktok:block_queue';

const mem = new Map();

function getRedis() {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return null;
}

export async function storeTokens(raw) {
  const data = {
    access_token: raw.access_token,
    refresh_token: raw.refresh_token,
    open_id: raw.open_id,
    scope: raw.scope,
    expires_at: Date.now() + raw.expires_in * 1000,
    refresh_expires_at: Date.now() + (raw.refresh_expires_in ?? 86400 * 30) * 1000,
    stored_at: Date.now(),
  };
  const redis = getRedis();
  if (redis) {
    await redis.set(TOKEN_KEY, JSON.stringify(data));
  } else {
    mem.set(TOKEN_KEY, data);
  }
  return data;
}

export async function getTokens() {
  const redis = getRedis();
  if (redis) {
    const raw = await redis.get(TOKEN_KEY);
    return raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : null;
  }
  return mem.get(TOKEN_KEY) ?? null;
}

export async function clearTokens() {
  const redis = getRedis();
  if (redis) {
    await redis.del(TOKEN_KEY);
  } else {
    mem.delete(TOKEN_KEY);
  }
}

export async function pushEvent(event) {
  const entry = { ...event, ts: Date.now() };
  const redis = getRedis();
  if (redis) {
    await redis.lpush(EVENTS_KEY, JSON.stringify(entry));
    await redis.ltrim(EVENTS_KEY, 0, MAX_EVENTS - 1);
  } else {
    const list = mem.get(EVENTS_KEY) ?? [];
    list.unshift(entry);
    mem.set(EVENTS_KEY, list.slice(0, MAX_EVENTS));
  }
}

export async function getEvents(count = 20) {
  const redis = getRedis();
  if (redis) {
    const raw = await redis.lrange(EVENTS_KEY, 0, count - 1);
    return (raw ?? []).map(e => typeof e === 'string' ? JSON.parse(e) : e);
  }
  return (mem.get(EVENTS_KEY) ?? []).slice(0, count);
}

const SEEN_TTL = 60 * 60 * 24 * 30;

export async function getBrowserCookies() {
  const redis = getRedis();
  if (redis) {
    const raw = await redis.get(COOKIES_KEY);
    return raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : null;
  }
  return mem.get(COOKIES_KEY) ?? null;
}

export async function setBrowserCookies(cookies) {
  const redis = getRedis();
  if (redis) {
    await redis.set(COOKIES_KEY, JSON.stringify(cookies));
  } else {
    mem.set(COOKIES_KEY, cookies);
  }
}

export async function queueBlock(username) {
  if (!username) return;
  const redis = getRedis();
  if (redis) {
    await redis.sadd(BLOCK_QUEUE_KEY, username);
  } else {
    const set = mem.get(BLOCK_QUEUE_KEY) ?? new Set();
    set.add(username);
    mem.set(BLOCK_QUEUE_KEY, set);
  }
}

export async function getBlockQueue() {
  const redis = getRedis();
  if (redis) return (await redis.smembers(BLOCK_QUEUE_KEY)) ?? [];
  return [...(mem.get(BLOCK_QUEUE_KEY) ?? new Set())];
}

export async function removeFromBlockQueue(username) {
  const redis = getRedis();
  if (redis) {
    await redis.srem(BLOCK_QUEUE_KEY, username);
  } else {
    const set = mem.get(BLOCK_QUEUE_KEY) ?? new Set();
    set.delete(username);
    mem.set(BLOCK_QUEUE_KEY, set);
  }
}

export async function isCommentSeen(commentId) {
  const redis = getRedis();
  if (redis) {
    return (await redis.exists(`tiktok:seen:${commentId}`)) === 1;
  }
  return mem.has(`seen:${commentId}`);
}

export async function markCommentSeen(commentId) {
  const redis = getRedis();
  if (redis) {
    await redis.set(`tiktok:seen:${commentId}`, '1', { ex: SEEN_TTL });
  } else {
    mem.set(`seen:${commentId}`, true);
  }
}
