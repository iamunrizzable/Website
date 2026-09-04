import { Redis } from '@upstash/redis';

const TOKEN_KEY = 'tiktok:tokens';
const EVENTS_KEY = 'tiktok:events';
const MAX_EVENTS = 50;
const COOKIES_KEY = 'tiktok:browser:cookies';
const BLOCK_QUEUE_KEY = 'tiktok:block_queue';
const BUSINESS_TOKEN_KEY = 'tiktok:business:tokens';
const ACCOUNT_TOKEN_KEY = 'tiktok:account:tokens';
const CUSTOM_RULES_KEY = 'moderation:custom_rules';
const CATEGORY_FILTERS_KEY = 'moderation:category_filters';
const BLOCKED_IPS_KEY = 'site:blocked_ips';

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
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
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

// ── Site-wide IP blocklist ─────────────────────────────────────────────────
// Checked by middleware.js (Edge runtime) on every request; managed via
// app/api/admin/blocked-ips (Node.js runtime). Unlike every other use of
// `mem` in this file, the in-memory fallback here is USELESS, not just
// unreliable: Edge middleware and Node.js route handlers are separate
// runtimes that never share memory, confirmed by testing locally — adding
// an IP via the admin API silently never blocks anything without Redis
// actually configured. isRedisConfigured() is surfaced by the admin API
// so the UI can warn instead of silently pretending it works.

export async function getBlockedIps() {
  const redis = getRedis();
  if (redis) return (await redis.smembers(BLOCKED_IPS_KEY)) ?? [];
  return [...(mem.get(BLOCKED_IPS_KEY) ?? new Set())];
}

export async function addBlockedIp(ip) {
  if (!ip) return;
  const redis = getRedis();
  if (redis) {
    await redis.sadd(BLOCKED_IPS_KEY, ip);
  } else {
    const set = mem.get(BLOCKED_IPS_KEY) ?? new Set();
    set.add(ip);
    mem.set(BLOCKED_IPS_KEY, set);
  }
}

export async function removeBlockedIp(ip) {
  const redis = getRedis();
  if (redis) {
    await redis.srem(BLOCKED_IPS_KEY, ip);
  } else {
    const set = mem.get(BLOCKED_IPS_KEY) ?? new Set();
    set.delete(ip);
    mem.set(BLOCKED_IPS_KEY, set);
  }
}

export async function isIpBlocked(ip) {
  if (!ip) return false;
  const redis = getRedis();
  if (redis) return (await redis.sismember(BLOCKED_IPS_KEY, ip)) === 1;
  return (mem.get(BLOCKED_IPS_KEY) ?? new Set()).has(ip);
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
