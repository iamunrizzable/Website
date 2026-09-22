import { Redis } from '@upstash/redis';
import crypto from 'crypto';
import { getTcpRedisAdapter } from './redisTcpClient';

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
// Old (pre-shortening) 32-char persistentMarker -> its new 16-char
// replacement. A visitor's browser keeps sending whatever marker it
// already has stored (lib/fingerprint/persistentMarker.js never
// regenerates one that exists) — nothing server-side can reach into their
// storage directly, so this table lets a stale long marker still resolve
// to the correct, already-renamed record, AND tells the client (via
// checkDeviceAgainstBlocklist's `reassignMarker` return value) to
// overwrite its own storage going forward. 90-day TTL: comfortably past
// the 30-day visitor-history retention window, so an alias never outlives
// the record it points to.
const MARKER_ALIAS_KEY = 'site:marker_aliases';
const MARKER_ALIAS_TTL_SECONDS = 90 * 24 * 60 * 60;
const TIKTOK_SUSPENDED_KEY = 'site:tiktok_suspended';
const C2_SUSPENDED_KEY = 'site:c2_suspended';
const SITE_MAINTENANCE_KEY = 'site:maintenance';
const VELOCITY_KEY_PREFIX = 'velocity:';
const VELOCITY_WINDOW_MS = 24 * 60 * 60 * 1000;
const VELOCITY_KEY_TTL_SECONDS = 25 * 60 * 60;
const VISITOR_HISTORY_KEY = 'site:visitor_history';
// Rolling window since a visitor's last visit — was 90 days, changed to 30
// per explicit instruction ("delete logs I don't need, by default of 30
// days"). Applies going forward only; Redis hash-field TTLs aren't
// retroactively shortened for entries that already had the old 90-day
// expiry set, they just keep counting down on whatever value was written
// at the time.
const VISITOR_HISTORY_TTL_SECONDS = 30 * 24 * 60 * 60;

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

// This project's actual provisioned database turned out to be Redis Cloud
// (Vercel's native "Redis" Marketplace product), which only ever exposes a
// plain `REDIS_URL`-style TCP connection string — confirmed directly from
// the value shown in the Vercel dashboard, not guessed — never the
// KV_REST_API_*/UPSTASH_REDIS_REST_* names @upstash/redis needs. That REST
// client can't speak `redis://` under any configuration, so a TCP URL
// falls back to a separate TCP-backed adapter (lib/redisTcpClient.js) that
// mimics the same method surface, rather than being unusable.
//
// TJB_MANAGEMENT_INC_SITE_DATA_REDIS_URL is the current database
// ("tjb-management-inc-site-data") — Vercel prefixes the var name with
// the resource's own name when connecting it to a project, so it's never
// just bare REDIS_URL. Bare REDIS_URL is kept as a fallback in case a
// future database gets connected without a prefix.
function getTcpRedisUrl() {
  return process.env.TJB_MANAGEMENT_INC_SITE_DATA_REDIS_URL || process.env.REDIS_URL || null;
}

// Exported for lib/reputation/ipLists.js, which needs the same Redis
// connection/fallback logic to cache the Tor/VPN/datacenter reputation
// lists — reusing this rather than duplicating the env-var detection above.
export function getRedis() {
  const env = getRedisEnv();
  if (env) return new Redis(env);
  const tcpUrl = getTcpRedisUrl();
  if (tcpUrl) return getTcpRedisAdapter(tcpUrl);
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
  return !!getRedisEnv() || !!getTcpRedisUrl();
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

// ── Site-wide device blocklist ──────────────────────────────────────────────
// Self-hosted Redis hash, same pattern used elsewhere in this file, keyed on
// a generated ban ID rather than the device string itself — each entry
// stores the full profile (persistentMarker, IP/UA/locale captured at ban
// time) so a later check can be matched by an exact persistentMarker
// comparison. persistentMarker (lib/fingerprint/persistentMarker.js) is a
// randomly-generated value stored client-side across localStorage/IndexedDB/
// the Cache API — never derived from device characteristics, so unlike a
// passive browser fingerprint it cannot legitimately be shared by two
// different real devices, and a match is certain, not just probable. The
// tradeoff: a full storage wipe on the client gets a fresh marker, same as
// clearing cookies always has — there's no way around that for any
// approach that doesn't rely on device characteristics, and device
// characteristics are exactly what caused real collisions between two
// unrelated physical devices in production (see git history). IP is never
// the primary key — it's trivially rotated (mobile carriers do it
// constantly) or spoofed, so an IP-only blocklist was tried and removed;
// only used here as corroborating context. Checked in
// app/api/fingerprint/check (Node.js runtime) — the marker is only known
// after the client-side collector runs.

function readHashEntries(rawMap) {
  return Object.entries(rawMap ?? {}).map(([id, raw]) => ({
    id,
    ...(typeof raw === 'string' ? JSON.parse(raw) : raw),
  }));
}

// Runs on EVERY single check (checkDeviceAgainstBlocklist, which gates the
// whole site via DeviceGate). Deliberately fails CLOSED: if the ban list
// can't actually be read, we can't know whether this visitor is banned, so
// the error is logged (for diagnosis — previously not even that) and then
// re-thrown, which propagates up to app/api/fingerprint/check/route.js's
// catch and returns verdict: 'unverified' rather than letting the visit
// through. This was briefly changed to fail OPEN (return an empty list,
// letting everyone through) during the emergency where Redis Cloud's
// connection was failing entirely and blocking 100% of real visitors —
// that was the right call while the actual crash was unfixed, but explicit
// instruction reverted it once the connection was confirmed genuinely
// working: a Redis hiccup should lock visitors out again, not silently
// admit someone we can't verify isn't banned.
export async function getBlockedDevices() {
  const redis = getRedis();
  if (redis) {
    try {
      return readHashEntries(await redis.hgetall(BLOCKED_DEVICES_KEY));
    } catch (err) {
      console.error('[getBlockedDevices] Redis error — failing closed (visitor will be unverified):', err?.message ?? err);
      throw err;
    }
  }
  return [...(mem.get(BLOCKED_DEVICES_KEY) ?? new Map())].map(([id, profile]) => ({ id, ...profile }));
}

// `profile` shape: { persistentMarker, ip?, country?, userAgent?,
// acceptLanguage?, note?, enrichment? }. Returns the generated ban ID.
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

// ── Velocity (distinct IPs/countries/events in 24h) and Visitor History
// (first-seen/last-seen/visit count) ───────────────────────────────────────
// Unlike everything else in this file, these two write on EVERY check,
// including fully clean/allowed ones — deliberately, and it's a real cost,
// not a free addition. Both are structurally impossible to compute from
// flagged-only data: velocity needs the full visit population to know
// what's normal, and "first seen 14 days ago" on a clean device only works
// if every visitor's identification timeline is tracked, not just the ones
// that get flagged. This is the one place a clean visit now leaves a
// trace where it didn't before — see the plan/privacy-policy note this
// shipped with. Both are non-fatal by design (try/catch, never throw) —
// this enrichment data failing must never affect the block/allow verdict.

async function recordVelocityEvent(persistentMarker, ip, country) {
  if (!persistentMarker) return;
  try {
    const key = `${VELOCITY_KEY_PREFIX}${persistentMarker}`;
    const now = Date.now();
    const redis = getRedis();
    if (redis) {
      await redis.zadd(key, { score: now, member: JSON.stringify({ ip: ip ?? null, country: country ?? null, ts: now }) });
      await redis.expire(key, VELOCITY_KEY_TTL_SECONDS);
    } else {
      const list = mem.get(key) ?? [];
      list.push({ ip: ip ?? null, country: country ?? null, ts: now });
      mem.set(key, list);
    }
  } catch {
    // Non-fatal.
  }
}

export async function getVelocitySignals(persistentMarker) {
  if (!persistentMarker) return { eventCount24h: 0, ipCount24h: 0, countryCount24h: 0 };
  try {
    const key = `${VELOCITY_KEY_PREFIX}${persistentMarker}`;
    const cutoff = Date.now() - VELOCITY_WINDOW_MS;
    const redis = getRedis();
    let entries;
    if (redis) {
      await redis.zremrangebyscore(key, 0, cutoff);
      const members = await redis.zrange(key, 0, -1);
      entries = members.map((m) => (typeof m === 'string' ? JSON.parse(m) : m));
    } else {
      const list = (mem.get(key) ?? []).filter((e) => e.ts >= cutoff);
      mem.set(key, list);
      entries = list;
    }
    const ips = new Set(entries.map((e) => e.ip).filter(Boolean));
    const countries = new Set(entries.map((e) => e.country).filter(Boolean));
    return { eventCount24h: entries.length, ipCount24h: ips.size, countryCount24h: countries.size };
  } catch {
    return { eventCount24h: 0, ipCount24h: 0, countryCount24h: 0 };
  }
}

// Records/updates the visitor-history entry for EVERY check (not just
// flagged ones) — this is the one deliberate hot-path cost called out in
// the original device-intelligence plan. It also carries the last-known
// ip/location/userAgent so /admin/visitor/list has something to show
// beyond a bare device marker.
//
// Keyed by persistentMarker — a 64-bit value generated once per device
// and actively stored in localStorage/IndexedDB/the Cache API (see
// lib/fingerprint/persistentMarker.js), never derived from device
// characteristics, so unlike a passive browser fingerprint it can never be
// shared by two different real devices. This site previously also hashed a
// canvas/WebGL/audio/font/environment fingerprint (visitorId) as a second
// identity signal, precisely so a banned device could still be recognized
// after a full storage wipe — but that signal produced real, confirmed
// production collisions between two entirely unrelated physical devices
// (different models, different platforms, different cities) that happened
// to share enough observable browser/hardware characteristics, because
// browsers deliberately don't expose any truly-unique-per-device
// identifier to JavaScript. persistentMarker alone can't survive a full
// storage wipe (same as clearing cookies always has), but it guarantees
// exactly one ID per device with zero collision risk, which is the
// tradeoff this site now makes deliberately.
async function recordVisitorHistory(persistentMarker, {
  ip, location, userAgent, country, webgl, botSignals, privacySignals,
} = {}) {
  if (!persistentMarker) return;
  try {
    const now = new Date().toISOString();
    const redis = getRedis();
    const existingRaw = redis
      ? await redis.hget(VISITOR_HISTORY_KEY, persistentMarker)
      : mem.get(VISITOR_HISTORY_KEY)?.get(persistentMarker);
    const existing = existingRaw
      ? (typeof existingRaw === 'string' ? JSON.parse(existingRaw) : existingRaw)
      : null;

    // Every visitor gets ASN/Tor/VPN/VM/bot/incognito/suspect-score
    // enrichment. Computed ONCE per device, exactly like
    // touchBlockedDevice never recomputing on a repeat hit — an attacker
    // (or just a returning visitor) re-loading the page a hundred times
    // must not trigger a hundred ASN/Tor/VPN lookups.
    let enrichment = existing?.enrichment ?? null;
    if (!existing) {
      try {
        const velocity = await getVelocitySignals(persistentMarker);
        const { buildEnrichment } = await import('./reputation/enrich.js');
        enrichment = await buildEnrichment({ ip, location, webgl, botSignals, privacySignals, velocity });
      } catch {
        // Enrichment failing must never stop the visit itself from being recorded.
      }
    }

    const record = {
      persistentMarker,
      firstSeenAt: existing?.firstSeenAt ?? now,
      lastSeenAt: now,
      visitCount: (existing?.visitCount ?? 0) + 1,
      lastIp: ip ?? existing?.lastIp ?? null,
      lastLocation: hasLocationData(location) ? location : (existing?.lastLocation ?? null),
      lastUserAgent: userAgent ?? existing?.lastUserAgent ?? null,
      enrichment,
    };

    if (redis) {
      await redis.hset(VISITOR_HISTORY_KEY, { [persistentMarker]: JSON.stringify(record) });
      try {
        // Per-field hash TTL (Redis 7.4+) — rolling 30-day expiry so a
        // visitor not seen again eventually drops out rather than being
        // retained forever. If unsupported, the record just doesn't
        // self-expire; still fully functional.
        await redis.hexpire(VISITOR_HISTORY_KEY, persistentMarker, VISITOR_HISTORY_TTL_SECONDS);
      } catch {
        // Non-fatal.
      }
    } else {
      const map = mem.get(VISITOR_HISTORY_KEY) ?? new Map();
      map.set(persistentMarker, record);
      mem.set(VISITOR_HISTORY_KEY, map);
    }
  } catch {
    // Non-fatal.
  }
}

// Called from app/api/admin/blocked-devices/route.js with a stored ban
// record's own persistentMarker.
export async function getVisitorHistory(persistentMarker) {
  if (!persistentMarker) return null;
  try {
    const redis = getRedis();
    if (redis) {
      const raw = await redis.hget(VISITOR_HISTORY_KEY, persistentMarker);
      return raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : null;
    }
    return mem.get(VISITOR_HISTORY_KEY)?.get(persistentMarker) ?? null;
  } catch {
    return null;
  }
}

// Manual per-row delete for /admin/visitor/list ("delete single logs").
export async function deleteVisitorHistory(persistentMarker) {
  if (!persistentMarker) return;
  try {
    const redis = getRedis();
    if (redis) {
      await redis.hdel(VISITOR_HISTORY_KEY, persistentMarker);
    } else {
      mem.get(VISITOR_HISTORY_KEY)?.delete(persistentMarker);
    }
  } catch (err) {
    console.error('[deleteVisitorHistory] Redis error:', err?.message ?? err);
    throw err;
  }
}

// Every visitor the site has ever identified (within the 30-day rolling
// window), for the /admin/visitor/list page — not just banned devices.
// `id` is the persistentMarker itself, the record's Redis hash key and its
// guaranteed-unique identity. Sorted newest-lastSeen-first, the ordering
// that page shows.
export async function getAllVisitorHistory() {
  try {
    const redis = getRedis();
    let raw;
    if (redis) {
      raw = (await redis.hgetall(VISITOR_HISTORY_KEY)) ?? {};
    } else {
      raw = Object.fromEntries(mem.get(VISITOR_HISTORY_KEY) ?? new Map());
    }
    const visitors = Object.entries(raw).map(([id, value]) => ({
      id,
      ...(typeof value === 'string' ? JSON.parse(value) : value),
    }));
    visitors.sort((a, b) => new Date(b.lastSeenAt ?? 0) - new Date(a.lastSeenAt ?? 0));
    return visitors;
  } catch {
    return [];
  }
}

// Repeat visit from an ALREADY-banned device — just bumps lastSeenAt/
// matchCount/location. Deliberately does NOT recompute enrichment: the
// ASN/Tor/VPN lookups are meant to run once per device (at first near-miss
// or first ban), not on every retry an attacker controls the rate of.
//
// `location` is always a non-null object from the caller (app/api/
// fingerprint/check/route.js builds one from the x-vercel-ip-* headers
// even when every field comes back empty, e.g. requests that never pass
// through Vercel's edge) — so a plain `location ?? entry.lastSeenLocation`
// would never fall through to the previous value, clobbering good location
// data with an all-null object on the next touch. hasLocationData() checks
// for at least one real field before overwriting.
function hasLocationData(location) {
  return !!location && Object.values(location).some((v) => v != null);
}

export async function touchBlockedDevice(banId, location) {
  try {
    const nextLocation = hasLocationData(location) ? location : undefined;
    const redis = getRedis();
    if (redis) {
      const raw = await redis.hget(BLOCKED_DEVICES_KEY, banId);
      if (!raw) return;
      const entry = typeof raw === 'string' ? JSON.parse(raw) : raw;
      const updated = {
        ...entry,
        lastSeenAt: new Date().toISOString(),
        matchCount: (entry.matchCount ?? 1) + 1,
        lastSeenLocation: nextLocation ?? entry.lastSeenLocation ?? null,
      };
      await redis.hset(BLOCKED_DEVICES_KEY, { [banId]: JSON.stringify(updated) });
    } else {
      const map = mem.get(BLOCKED_DEVICES_KEY) ?? new Map();
      const entry = map.get(banId);
      if (!entry) return;
      map.set(banId, {
        ...entry,
        lastSeenAt: new Date().toISOString(),
        matchCount: (entry.matchCount ?? 1) + 1,
        lastSeenLocation: nextLocation ?? entry.lastSeenLocation ?? null,
      });
      mem.set(BLOCKED_DEVICES_KEY, map);
    }
  } catch {
    // Non-fatal.
  }
}

// Looks up a stale (pre-shortening) marker in the alias table built by the
// one-time migration that renamed existing records to 16 chars — returns
// the current replacement if one exists, otherwise the marker unchanged.
// Never throws: a lookup failure just means this one request doesn't get
// reassigned, not a broken check.
async function resolveMarkerAlias(persistentMarker) {
  if (!persistentMarker) return persistentMarker;
  try {
    const redis = getRedis();
    const alias = redis
      ? await redis.hget(MARKER_ALIAS_KEY, persistentMarker)
      : mem.get(MARKER_ALIAS_KEY)?.get(persistentMarker);
    return alias || persistentMarker;
  } catch {
    return persistentMarker;
  }
}

// Sole identity check: an exact persistentMarker match against the
// blocklist. persistentMarker (lib/fingerprint/persistentMarker.js) is a
// randomly-generated, client-stored value, never derived from device
// characteristics — the only signal that can guarantee one real device
// never collides with another, unlike any passive browser fingerprint
// (WebGL, fonts, canvas, etc.), which this site used to also match on and
// which produced real, confirmed collisions between unrelated physical
// devices in production. There is deliberately no similarity/fuzzy
// matching and no human-review queue for near matches — a match is either
// exact (certain) or there's no match at all.
//
// Enrichment (ASN/Tor/VPN/VM/bot/incognito/suspect-score, see
// lib/reputation/enrich.js) is computed for every first-time visitor via
// recordVisitorHistory below (once per device, never recomputed on a
// repeat visit — see that function's own comment). It's informational
// only: nothing computed here feeds back into the verdict below.
//
// A returning visitor whose browser still holds a pre-shortening 32-char
// marker gets resolved through the alias table first — the rest of this
// function only ever sees the current (short) value, so history/velocity/
// ban-matching stay correct for them. `reassignMarker` is set on the
// response whenever the resolved value differs from what was sent, so
// app/DeviceGate.js can overwrite the client's stored marker — after that
// one round trip, their browser sends the short value directly and no
// longer needs the alias.
export async function checkDeviceAgainstBlocklist({
  persistentMarker, webgl, ip, country, userAgent,
  location, botSignals, privacySignals,
}) {
  const resolvedMarker = await resolveMarkerAlias(persistentMarker);
  const reassignMarker = resolvedMarker !== persistentMarker ? resolvedMarker : undefined;

  await recordVelocityEvent(resolvedMarker, ip, country);
  await recordVisitorHistory(resolvedMarker, { ip, location, userAgent, country, webgl, botSignals, privacySignals });

  const profiles = await getBlockedDevices();
  const match = resolvedMarker ? profiles.find((p) => p.persistentMarker === resolvedMarker) : null;
  if (match) {
    await touchBlockedDevice(match.id, location);
    // reasonCode is only set on bans created with one (auto-bans, and
    // manual entries going forward) — an older ban created before this
    // existed has none, and the blocked screen falls back to generic
    // copy rather than fabricating a reason we don't actually have.
    return { verdict: 'blocked', matchedBanId: match.id, reassignMarker, blockReason: match.reasonCode ?? null };
  }

  // Auto-ban: explicit instruction to block everyone outside the US,
  // closed against the two realistic ways to fake being in the US — a VPN
  // or Tor exit node whose own IP happens to geolocate as US. A "blanket
  // VPN ban" only on country=US traffic would miss exactly that case, so
  // Tor/VPN/datacenter detection runs regardless of what country the IP
  // reports, not only as a fallback when the country check doesn't fire.
  // Checked fresh on every visit — isTorExitNode/checkVpnReputation
  // (lib/reputation/ipLists.js) are cached-list lookups refreshed daily by
  // cron, not a live network call per request, so this is cheap. A
  // null/unresolved country does NOT trigger the country half — banning on
  // missing geo data isn't something to guess at. Every reason produces a
  // real, permanent entry in the same blocklist a manual ban creates
  // (visible and reversible from /admin/security), not a silent gate.
  //
  // Known, honest gap: a residential/ISP proxy service routes through a
  // real home IP address, not a datacenter/VPN-provider range or a Tor
  // exit node — indistinguishable from a genuine US home connection with
  // IP-reputation lists alone. No IP-based signal closes that; flagging it
  // rather than claiming this is airtight.
  let reasonCode = null;
  let noteDetail = null;
  if (country && country !== 'US') {
    reasonCode = 'non-us';
    noteDetail = `visitor outside the US (country=${country})`;
  }
  if (!reasonCode && ip) {
    const { isTorExitNode, checkVpnReputation } = await import('./reputation/ipLists.js');
    const [tor, vpnRep] = await Promise.all([isTorExitNode(ip), checkVpnReputation(ip)]);
    if (tor) { reasonCode = 'tor'; noteDetail = 'Tor exit node'; }
    else if (vpnRep.vpn) { reasonCode = 'vpn'; noteDetail = 'VPN IP'; }
    else if (vpnRep.datacenter) { reasonCode = 'datacenter'; noteDetail = 'datacenter/hosting IP'; }
  }
  if (reasonCode && resolvedMarker) {
    const banId = await addBlockedDevice({
      persistentMarker: resolvedMarker, ip, country, userAgent, reasonCode,
      note: `Auto-banned: ${noteDetail}`,
    });
    return { verdict: 'blocked', matchedBanId: banId, reassignMarker, blockReason: reasonCode };
  }

  return { verdict: 'allowed', reassignMarker };
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

// Manual kill switch for /agencies/c2 — same shape and same "nothing to
// fail open/closed about, it's a deliberate toggle" reasoning as the
// TikTok one above.
export async function isC2Suspended() {
  const redis = getRedis();
  if (redis) return !!(await redis.get(C2_SUSPENDED_KEY));
  return mem.get(C2_SUSPENDED_KEY) === true;
}

export async function setC2Suspended(suspended) {
  const redis = getRedis();
  if (redis) {
    if (suspended) await redis.set(C2_SUSPENDED_KEY, 'true');
    else await redis.del(C2_SUSPENDED_KEY);
  } else if (suspended) {
    mem.set(C2_SUSPENDED_KEY, true);
  } else {
    mem.delete(C2_SUSPENDED_KEY);
  }
}

// Site-wide maintenance kill switch — same shape again, but checked by
// MaintenanceGate wrapping the ENTIRE app/layout.js (every route), not one
// agency subtree.
export async function isSiteInMaintenance() {
  const redis = getRedis();
  if (redis) return !!(await redis.get(SITE_MAINTENANCE_KEY));
  return mem.get(SITE_MAINTENANCE_KEY) === true;
}

export async function setSiteInMaintenance(maintenance) {
  const redis = getRedis();
  if (redis) {
    if (maintenance) await redis.set(SITE_MAINTENANCE_KEY, 'true');
    else await redis.del(SITE_MAINTENANCE_KEY);
  } else if (maintenance) {
    mem.set(SITE_MAINTENANCE_KEY, true);
  } else {
    mem.delete(SITE_MAINTENANCE_KEY);
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
