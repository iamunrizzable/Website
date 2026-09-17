import { Redis } from '@upstash/redis';
import crypto from 'crypto';
import { findBestMatch, AUTO_BLOCK_THRESHOLD, NEAR_MISS_THRESHOLD } from './deviceMatch';

const TOKEN_KEY = 'tiktok:tokens';
const EVENTS_KEY = 'tiktok:events';
const MAX_EVENTS = 50;
const COOKIES_KEY = 'tiktok:browser:cookies';
const BLOCK_QUEUE_KEY = 'tiktok:block_queue';
const BUSINESS_TOKEN_KEY = 'tiktok:business:tokens';
const ACCOUNT_TOKEN_KEY = 'tiktok:account:tokens';
const CUSTOM_RULES_KEY = 'moderation:custom_rules';
const CATEGORY_FILTERS_KEY = 'moderation:category_filters';
const BLOCKED_DEVICES_KEY = 'site:blocked_devices';
const NEAR_MISS_KEY = 'site:device_near_misses';
const NEAR_MISS_MAX = 200;
const TIKTOK_SUSPENDED_KEY = 'site:tiktok_suspended';

const mem = new Map();

// Checks UPSTASH_REDIS_REST_URL/TOKEN first, falling back to
// KV_REST_API_URL/TOKEN — the same fallback @upstash/redis's own
// Redis.fromEnv() uses. The "Upstash for Redis" Vercel Marketplace
// integration provisions the KV_REST_API_* names (a holdover from when
// this same integration powered the old Vercel KV product), not the
// UPSTASH_REDIS_REST_* names, confirmed from the SDK's own source rather
// than guessed. Also checks the actual prefixed names Vercel generated for
// this project's database (TJB_MGMT_INC_IP_BLACKLIST_KV_REST_API_*,
// confirmed directly from the Environment Variables list — the read-write
// token, not the _READ_ONLY_TOKEN variant, since writes are needed here).
function getRedisEnv() {
  const url = process.env.UPSTASH_REDIS_REST_URL
    || process.env.KV_REST_API_URL
    || process.env.TJB_MGMT_INC_IP_BLACKLIST_KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
    || process.env.KV_REST_API_TOKEN
    || process.env.TJB_MGMT_INC_IP_BLACKLIST_KV_REST_API_TOKEN;
  return url && token ? { url, token } : null;
}

function getRedis() {
  const env = getRedisEnv();
  if (env) return new Redis(env);
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

// Refreshes an advertiser token 5 minutes before it expires. Returns the
// original tokens unchanged (and never throws) if there's no refresh_token,
// it's not close to expiry, or the refresh call itself fails — a failed
// refresh is not worse than today's no-refresh behavior, it just means the
// existing "reconnect via Business Portal" fallback applies as before.
async function refreshBusinessTokensIfNeeded(tokens) {
  if (!tokens?.refresh_token) return tokens;
  if (Date.now() < tokens.expires_at - 5 * 60 * 1000) return tokens;

  try {
    const { refreshBusinessToken } = await import('./tiktok/business-oauth.js');
    const refreshed = await refreshBusinessToken(tokens.refresh_token);
    if (refreshed.code && refreshed.code !== 0) {
      console.error('[tokens] Business token refresh rejected:', refreshed.message);
      return tokens;
    }
    // Preserve the known advertiser_id if the refresh response doesn't
    // include a fresh advertiser_ids list (expected — it shouldn't change).
    if (!refreshed.advertiser_id && !(refreshed.data ?? refreshed).advertiser_ids) {
      refreshed.advertiser_id = tokens.advertiser_id;
    }
    return await storeBusinessTokens(refreshed);
  } catch (e) {
    console.error('[tokens] Business token refresh failed:', e.message);
    return tokens;
  }
}

export async function storeBusinessTokens(raw) {
  const inner = raw.data ?? raw;
  const expiresIn = inner.expires_in ?? 86400;
  const data = {
    access_token: inner.access_token,
    refresh_token: inner.refresh_token ?? null,
    advertiser_id: inner.advertiser_ids?.[0] ?? raw.advertiser_id ?? null,
    open_id: inner.open_id ?? null,
    expires_at: Date.now() + expiresIn * 1000,
    stored_at: Date.now(),
  };
  const redis = getRedis();
  if (redis) {
    await redis.set(BUSINESS_TOKEN_KEY, JSON.stringify(data));
  } else {
    mem.set(BUSINESS_TOKEN_KEY, data);
  }
  return data;
}

export function isRedisConfigured() {
  return !!getRedisEnv();
}

export async function getBusinessTokens() {
  // Pre-stored advertiser token — set TIKTOK_ADVERTISER_TOKEN env var to skip OAuth
  if (process.env.TIKTOK_ADVERTISER_TOKEN) {
    try { return JSON.parse(process.env.TIKTOK_ADVERTISER_TOKEN); } catch { /* ignore */ }
  }

  const redis = getRedis();
  if (redis) {
    const raw = await redis.get(BUSINESS_TOKEN_KEY);
    if (raw) return refreshBusinessTokensIfNeeded(typeof raw === 'string' ? JSON.parse(raw) : raw);
  }

  const memToken = mem.get(BUSINESS_TOKEN_KEY);
  if (memToken) return refreshBusinessTokensIfNeeded(memToken);

  // Cookie fallback — persists without Redis (set during OAuth callback)
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const raw = cookieStore.get('biz_token')?.value;
    if (raw) {
      const parsed = JSON.parse(raw);
      mem.set(BUSINESS_TOKEN_KEY, parsed); // warm the memory cache
      return refreshBusinessTokensIfNeeded(parsed);
    }
  } catch {
    // Not in a request context (e.g. cron job) — normal, ignore
  }

  return null;
}

export async function clearBusinessTokens() {
  const redis = getRedis();
  if (redis) {
    await redis.del(BUSINESS_TOKEN_KEY);
  } else {
    mem.delete(BUSINESS_TOKEN_KEY);
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

// ── TikTok Account Token (for creator content endpoints) ──────────────────────

// Refreshes the shared (admin) account token 5 minutes before it expires.
// Same fallback contract as refreshBusinessTokensIfNeeded: never throws,
// returns the original tokens unchanged if there's no refresh_token, it's
// not close to expiry, or the refresh call fails. Preserves the previously
// known business_id — TikTok's refresh response only returns open_id, and
// losing the numeric business_id would silently break comment write actions
// (hide/delete/pin/reply) that require it.
async function refreshAccountTokenIfNeeded(tokens) {
  if (!tokens?.refresh_token) return tokens;
  if (Date.now() < tokens.expires_at - 5 * 60 * 1000) return tokens;

  try {
    const { refreshTikTokAccountToken } = await import('./tiktok/business-oauth.js');
    const refreshed = await refreshTikTokAccountToken(tokens.refresh_token);
    if (refreshed.error) {
      console.error('[tokens] Account token refresh rejected:', refreshed.error_description ?? refreshed.error);
      return tokens;
    }
    const inner = refreshed.data ?? refreshed;
    if (!refreshed.business_id && !inner.business_id) {
      refreshed.business_id = tokens.business_id;
    }
    return await storeTikTokAccountToken(refreshed);
  } catch (e) {
    console.error('[tokens] Account token refresh failed:', e.message);
    return tokens;
  }
}

export async function storeTikTokAccountToken(raw) {
  const inner = raw.data ?? raw;
  const expiresIn = inner.expires_in ?? 86400;
  const data = {
    access_token: inner.access_token,
    refresh_token: inner.refresh_token ?? null,
    open_id: inner.open_id ?? null,
    business_id: raw.business_id ?? inner.business_id ?? inner.open_id ?? null,
    scope: inner.scope ?? null,
    expires_at: Date.now() + expiresIn * 1000,
    stored_at: Date.now(),
  };
  const redis = getRedis();
  if (redis) {
    await redis.set(ACCOUNT_TOKEN_KEY, JSON.stringify(data));
  } else {
    mem.set(ACCOUNT_TOKEN_KEY, data);
  }
  return data;
}

export async function getTikTokAccountToken() {
  const redis = getRedis();
  if (redis) {
    const raw = await redis.get(ACCOUNT_TOKEN_KEY);
    if (raw) return refreshAccountTokenIfNeeded(typeof raw === 'string' ? JSON.parse(raw) : raw);
  }
  const memToken = mem.get(ACCOUNT_TOKEN_KEY);
  if (memToken) return refreshAccountTokenIfNeeded(memToken);
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const raw = cookieStore.get('acct_token')?.value;
    if (raw) {
      const parsed = JSON.parse(raw);
      mem.set(ACCOUNT_TOKEN_KEY, parsed);
      return refreshAccountTokenIfNeeded(parsed);
    }
  } catch {
    // Not in a request context — ignore
  }
  return null;
}

export async function clearTikTokAccountToken() {
  const redis = getRedis();
  if (redis) {
    await redis.del(ACCOUNT_TOKEN_KEY);
  } else {
    mem.delete(ACCOUNT_TOKEN_KEY);
  }
}

// ── Custom Moderation Rules (keyword → auto-hide, applied during sync) ────────
// Admin/shared only — the system (per-operator) flow stores its own rules in a
// cookie instead, to preserve the same per-operator isolation used elsewhere.

export async function getCustomRules() {
  const redis = getRedis();
  if (redis) {
    const raw = await redis.get(CUSTOM_RULES_KEY);
    if (raw) return typeof raw === 'string' ? JSON.parse(raw) : raw;
    return [];
  }
  return mem.get(CUSTOM_RULES_KEY) ?? [];
}

export async function storeCustomRules(rules) {
  const redis = getRedis();
  if (redis) {
    await redis.set(CUSTOM_RULES_KEY, JSON.stringify(rules));
  } else {
    mem.set(CUSTOM_RULES_KEY, rules);
  }
}

// ── Comment Filters (which built-in scorer categories to apply) ──────────────
// Admin/shared only — the system (per-operator) flow stores its own filter
// selection in a cookie instead, same isolation model as custom rules above.
// null = never configured -> scoreContent() treats every category as enabled.

export async function getCategoryFilters() {
  const redis = getRedis();
  if (redis) {
    const raw = await redis.get(CATEGORY_FILTERS_KEY);
    if (raw === null || raw === undefined) return null;
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  }
  return mem.get(CATEGORY_FILTERS_KEY) ?? null;
}

export async function storeCategoryFilters(categories) {
  const redis = getRedis();
  if (redis) {
    await redis.set(CATEGORY_FILTERS_KEY, JSON.stringify(categories));
  } else {
    mem.set(CATEGORY_FILTERS_KEY, categories);
  }
}

// ── Site-wide device blocklist (in-house fingerprint) ──────────────────────
// Self-hosted Redis hash, same pattern used elsewhere in this file, keyed on
// a generated ban ID rather than the device string itself — each entry
// stores the full profile (visitorId hash, raw components, persistentMarker,
// IP/UA/locale captured at ban time) so a later check can be matched either
// by exact-id fast path or by weighted similarity (lib/deviceMatch.js) when
// a signal has drifted. IP is never the primary key — it's trivially
// rotated (mobile carriers do it constantly) or spoofed, so an IP-only
// blocklist was tried and removed; only used here as corroborating context.
// Checked in app/api/fingerprint/check (Node.js runtime) — the fingerprint
// is only known after the client-side collector runs.

function readHashEntries(rawMap) {
  return Object.entries(rawMap ?? {}).map(([id, raw]) => ({
    id,
    ...(typeof raw === 'string' ? JSON.parse(raw) : raw),
  }));
}

export async function getBlockedDevices() {
  const redis = getRedis();
  if (redis) return readHashEntries(await redis.hgetall(BLOCKED_DEVICES_KEY));
  return [...(mem.get(BLOCKED_DEVICES_KEY) ?? new Map())].map(([id, profile]) => ({ id, ...profile }));
}

// `profile` shape: { visitorId, persistentMarker?, components, ip?, country?,
// userAgent?, acceptLanguage?, note? }. Returns the generated ban ID.
export async function addBlockedDevice(profile) {
  const id = crypto.randomUUID();
  const entry = { ...profile, bannedAt: profile.bannedAt ?? new Date().toISOString() };
  const redis = getRedis();
  if (redis) {
    await redis.hset(BLOCKED_DEVICES_KEY, { [id]: JSON.stringify(entry) });
  } else {
    const map = mem.get(BLOCKED_DEVICES_KEY) ?? new Map();
    map.set(id, entry);
    mem.set(BLOCKED_DEVICES_KEY, map);
  }
  return id;
}

export async function removeBlockedDevice(banId) {
  const redis = getRedis();
  if (redis) {
    await redis.hdel(BLOCKED_DEVICES_KEY, banId);
  } else {
    const map = mem.get(BLOCKED_DEVICES_KEY) ?? new Map();
    map.delete(banId);
    mem.set(BLOCKED_DEVICES_KEY, map);
  }
}

// Three-step check per lib/deviceMatch.js's design: exact visitorId/
// persistentMarker match is a cheap fast path; otherwise the weighted
// similarity comparator decides between an auto-block, a near-miss (logged
// for admin review, not blocked), or unrelated. Thresholds are a documented
// starting point (see lib/deviceMatch.js), not tuned against real traffic
// yet.
export async function checkDeviceAgainstBlocklist({ visitorId, components, persistentMarker, ip, country, userAgent, acceptLanguage }) {
  const profiles = await getBlockedDevices();

  const exactMatch = profiles.find(
    (p) => (visitorId && p.visitorId === visitorId) || (persistentMarker && p.persistentMarker === persistentMarker)
  );
  if (exactMatch) return { verdict: 'blocked', matchedBanId: exactMatch.id, score: 1 };

  const best = findBestMatch(components, profiles);
  if (best && best.score >= AUTO_BLOCK_THRESHOLD) {
    return { verdict: 'blocked', matchedBanId: best.profile.id, score: best.score };
  }
  if (best && best.score >= NEAR_MISS_THRESHOLD) {
    await logNearMiss({
      visitorId, components, persistentMarker, ip, country, userAgent, acceptLanguage,
      matchedBanId: best.profile.id, score: best.score,
    });
  }
  return { verdict: 'allowed' };
}

async function trimNearMisses(redis) {
  if (redis) {
    const all = readHashEntries(await redis.hgetall(NEAR_MISS_KEY));
    if (all.length <= NEAR_MISS_MAX) return;
    const oldest = all.sort((a, b) => new Date(a.seenAt) - new Date(b.seenAt)).slice(0, all.length - NEAR_MISS_MAX);
    if (oldest.length) await redis.hdel(NEAR_MISS_KEY, ...oldest.map((e) => e.id));
  } else {
    const map = mem.get(NEAR_MISS_KEY) ?? new Map();
    if (map.size <= NEAR_MISS_MAX) return;
    const entries = [...map.entries()].sort((a, b) => new Date(a[1].seenAt) - new Date(b[1].seenAt));
    for (const [id] of entries.slice(0, map.size - NEAR_MISS_MAX)) map.delete(id);
  }
}

export async function logNearMiss(entry) {
  const id = crypto.randomUUID();
  const record = { ...entry, seenAt: new Date().toISOString() };
  const redis = getRedis();
  if (redis) {
    await redis.hset(NEAR_MISS_KEY, { [id]: JSON.stringify(record) });
  } else {
    const map = mem.get(NEAR_MISS_KEY) ?? new Map();
    map.set(id, record);
    mem.set(NEAR_MISS_KEY, map);
  }
  await trimNearMisses(redis);
  return id;
}

export async function getNearMisses() {
  const redis = getRedis();
  const entries = redis
    ? readHashEntries(await redis.hgetall(NEAR_MISS_KEY))
    : [...(mem.get(NEAR_MISS_KEY) ?? new Map())].map(([id, record]) => ({ id, ...record }));
  return entries.sort((a, b) => new Date(b.seenAt) - new Date(a.seenAt));
}

export async function removeNearMiss(nearMissId) {
  const redis = getRedis();
  if (redis) {
    await redis.hdel(NEAR_MISS_KEY, nearMissId);
  } else {
    const map = mem.get(NEAR_MISS_KEY) ?? new Map();
    map.delete(nearMissId);
    mem.set(NEAR_MISS_KEY, map);
  }
}

// Turns a near-miss into a full ban (adds a new blocklist profile from its
// captured signals) and removes it from the near-miss queue.
export async function promoteNearMiss(nearMissId) {
  const nearMisses = await getNearMisses();
  const record = nearMisses.find((n) => n.id === nearMissId);
  if (!record) return null;

  const banId = await addBlockedDevice({
    visitorId: record.visitorId,
    persistentMarker: record.persistentMarker,
    components: record.components,
    ip: record.ip,
    country: record.country,
    userAgent: record.userAgent,
    acceptLanguage: record.acceptLanguage,
    note: `Promoted from near-miss (score ${record.score?.toFixed?.(2) ?? record.score})`,
  });

  const redis = getRedis();
  if (redis) {
    await redis.hdel(NEAR_MISS_KEY, nearMissId);
  } else {
    const map = mem.get(NEAR_MISS_KEY) ?? new Map();
    map.delete(nearMissId);
    mem.set(NEAR_MISS_KEY, map);
  }
  return banId;
}

// Manual kill switch for the /agencies/tiktok section — flipped from
// /admin/security, checked by TikTokSuspensionGate on every page load
// under that route. Unlike the Fingerprint device-ban check, this has
// nothing to fail open or closed about: it's a deliberate on/off toggle,
// not a security decision, so a Redis error here just means the toggle
// reads as "off" (site shows normally) rather than accidentally locking
// out every visitor because of an unrelated outage.
export async function isTikTokSuspended() {
  const redis = getRedis();
  // @upstash/redis auto-deserializes the stored 'true' string back into the
  // boolean true on read, so a strict === 'true' string check here would
  // always be false. A truthiness check works for both the boolean and the
  // absent-key (null) case.
  if (redis) return !!(await redis.get(TIKTOK_SUSPENDED_KEY));
  return mem.get(TIKTOK_SUSPENDED_KEY) === true;
}

export async function setTikTokSuspended(suspended) {
  const redis = getRedis();
  if (redis) {
    if (suspended) await redis.set(TIKTOK_SUSPENDED_KEY, 'true');
    else await redis.del(TIKTOK_SUSPENDED_KEY);
  } else if (suspended) {
    mem.set(TIKTOK_SUSPENDED_KEY, true);
  } else {
    mem.delete(TIKTOK_SUSPENDED_KEY);
  }
}

// ── Admin login rate limiting ─────────────────────────────────────────────
// Best-effort brute-force throttle on /api/admin/login, keyed by caller IP.
// Without Redis configured, this only protects within a single warm
// serverless instance (same caveat as everything else that falls back to
// the in-memory Map) — real protection requires UPSTASH_REDIS_* to be set.
const LOGIN_ATTEMPTS_PREFIX = 'admin:login_attempts:';
const LOGIN_ATTEMPT_WINDOW_SECONDS = 15 * 60;
const LOGIN_ATTEMPT_MAX = 10;
const memLoginAttempts = new Map();

export async function isLoginRateLimited(ip) {
  const key = LOGIN_ATTEMPTS_PREFIX + ip;
  const redis = getRedis();
  if (redis) {
    const count = await redis.get(key);
    return Number(count ?? 0) >= LOGIN_ATTEMPT_MAX;
  }
  const entry = memLoginAttempts.get(ip);
  if (!entry || Date.now() > entry.resetAt) return false;
  return entry.count >= LOGIN_ATTEMPT_MAX;
}

export async function recordFailedLogin(ip) {
  const key = LOGIN_ATTEMPTS_PREFIX + ip;
  const redis = getRedis();
  if (redis) {
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, LOGIN_ATTEMPT_WINDOW_SECONDS);
    return;
  }
  const entry = memLoginAttempts.get(ip);
  if (!entry || Date.now() > entry.resetAt) {
    memLoginAttempts.set(ip, { count: 1, resetAt: Date.now() + LOGIN_ATTEMPT_WINDOW_SECONDS * 1000 });
  } else {
    entry.count++;
  }
}

export async function clearLoginAttempts(ip) {
  const key = LOGIN_ATTEMPTS_PREFIX + ip;
  const redis = getRedis();
  if (redis) {
    await redis.del(key);
    return;
  }
  memLoginAttempts.delete(ip);
}
