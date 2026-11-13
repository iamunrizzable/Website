import { createHash, randomBytes } from 'crypto';
import { getRedis } from '@/lib/tokens';
import { relocateHallieChats } from '@/lib/hallie-chats';

// One Hallie login can hold several connections (Google, Apple, X, TikTok).
// The chat is stored on the login, not on a single TikTok id, so signing in
// with any connected account on another device opens the same chat.

export const SESSION_COOKIE = 'hallie_session';
export const PROVIDERS = ['google', 'apple', 'x', 'tiktok'];

const TTL_SECONDS = 90 * 24 * 60 * 60;

function whoKey(id) {
  return `hallie:who:${id}`;
}

function linkKey(provider, subject) {
  const hash = createHash('sha256').update(`${provider}:${subject}`).digest('hex');
  return `hallie:link:${provider}:${hash}`;
}

export function newSessionId() {
  return randomBytes(32).toString('hex');
}

export function sessionCookieOptions(maxAge = TTL_SECONDS) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge,
    path: '/',
  };
}

export function applySessionCookie(response, id) {
  response.cookies.set(SESSION_COOKIE, id, sessionCookieOptions());
}

export function clearSessionCookie(response) {
  response.cookies.set(SESSION_COOKIE, '', sessionCookieOptions(0));
}

function cleanId(id) {
  return typeof id === 'string' && /^[a-f0-9]{64}$/.test(id) ? id : null;
}

export function publicConnections(identity) {
  return (identity?.connections ?? []).map((c) => ({
    provider: c.provider,
    label: c.label || c.provider,
  }));
}

async function readIdentity(id) {
  const redis = getRedis();
  if (!redis || !cleanId(id)) return null;
  const raw = await redis.get(whoKey(id));
  if (!raw) return null;
  const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
  if (!data || !Array.isArray(data.connections)) return null;
  return data;
}

async function writeIdentity(id, identity) {
  const redis = getRedis();
  if (!redis) throw new Error('Saving is unavailable right now.');
  await redis.set(whoKey(id), JSON.stringify(identity), { ex: TTL_SECONDS });
}

async function findOwner(provider, subject) {
  const redis = getRedis();
  if (!redis) return null;
  const id = await redis.get(linkKey(provider, subject));
  return cleanId(typeof id === 'string' ? id : id ? String(id) : '');
}

async function pointLink(provider, subject, id) {
  const redis = getRedis();
  await redis.set(linkKey(provider, subject), id, { ex: TTL_SECONDS });
}

async function adoptChat(fromSessionId, toSessionId) {
  if (!fromSessionId || fromSessionId === toSessionId) return;
  await relocateHallieChats(`h:${fromSessionId}`, `h:${toSessionId}`);
}

// Attach this provider account to the browser's login. If that account
// already belongs to a login, this browser becomes that login.
export async function connectProvider({ currentId, provider, subject, label }) {
  if (!PROVIDERS.includes(provider)) throw new Error('Unknown connection');
  const who = String(subject ?? '').trim();
  if (who.length < 2 || who.length > 200) throw new Error('That account could not be read.');
  const redis = getRedis();
  if (!redis) throw new Error('Saving is unavailable right now.');

  const current = cleanId(currentId);
  const owner = await findOwner(provider, who);
  let id = owner || current || newSessionId();
  let identity = (await readIdentity(id)) ?? { connections: [] };

  if (owner && current && owner !== current) {
    const prior = await readIdentity(current);
    for (const c of prior?.connections ?? []) {
      if (identity.connections.some((d) => d.provider === c.provider)) continue;
      identity.connections.push(c);
      await pointLink(c.provider, c.subject, owner);
    }
    await adoptChat(current, owner);
    await redis.del(whoKey(current));
    id = owner;
  }

  identity.connections = [
    ...identity.connections.filter((c) => c.provider !== provider),
    { provider, subject: who, label: String(label || provider).slice(0, 80), at: Date.now() },
  ];
  await writeIdentity(id, identity);
  await pointLink(provider, who, id);

  if (provider === 'tiktok') {
    await relocateHallieChats(who, `h:${id}`);
  }
  return id;
}

export async function unlinkProvider(sessionId, provider) {
  const id = cleanId(sessionId);
  if (!id || !PROVIDERS.includes(provider)) return null;
  const identity = await readIdentity(id);
  if (!identity) return null;
  const removed = identity.connections.find((c) => c.provider === provider);
  identity.connections = identity.connections.filter((c) => c.provider !== provider);
  const redis = getRedis();
  if (removed) await redis.del(linkKey(provider, removed.subject));
  if (identity.connections.length === 0) {
    await redis.del(whoKey(id));
    return { connections: [], empty: true };
  }
  await writeIdentity(id, identity);
  return { connections: publicConnections(identity), empty: false };
}

export async function readLogin(sessionId) {
  const id = cleanId(sessionId);
  if (!id) return null;
  const identity = await readIdentity(id);
  if (!identity?.connections?.length) return null;
  return { id, connections: publicConnections(identity) };
}
