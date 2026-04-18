import { kv } from '@vercel/kv';

const TOKEN_KEY = 'tiktok:tokens';
const EVENTS_KEY = 'tiktok:events';
const MAX_EVENTS = 50;

const mem = new Map();

function kvAvailable() {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
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
  if (kvAvailable()) {
    await kv.set(TOKEN_KEY, data);
  } else {
    mem.set(TOKEN_KEY, data);
  }
  return data;
}

export async function getTokens() {
  if (kvAvailable()) {
    return (await kv.get(TOKEN_KEY)) ?? null;
  }
  return mem.get(TOKEN_KEY) ?? null;
}

export async function clearTokens() {
  if (kvAvailable()) {
    await kv.del(TOKEN_KEY);
  } else {
    mem.delete(TOKEN_KEY);
  }
}

export async function pushEvent(event) {
  const entry = { ...event, ts: Date.now() };
  if (kvAvailable()) {
    await kv.lpush(EVENTS_KEY, entry);
    await kv.ltrim(EVENTS_KEY, 0, MAX_EVENTS - 1);
  } else {
    const list = mem.get(EVENTS_KEY) ?? [];
    list.unshift(entry);
    mem.set(EVENTS_KEY, list.slice(0, MAX_EVENTS));
  }
}

export async function getEvents(count = 20) {
  if (kvAvailable()) {
    return (await kv.lrange(EVENTS_KEY, 0, count - 1)) ?? [];
  }
  return (mem.get(EVENTS_KEY) ?? []).slice(0, count);
}
