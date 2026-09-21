import { Redis } from '@upstash/redis';
import crypto from 'crypto';
import { findBestMatch, AUTO_BLOCK_THRESHOLD, NEAR_MISS_THRESHOLD } from './deviceMatch';
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
const NEAR_MISS_KEY = 'site:device_near_misses';
const NEAR_MISS_MAX = 200;
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
// admit someone we can't verify isn't banned. logNearMiss/trimNearMisses/
// getNearMisses are deliberately NOT reverted alongside this — they don't
// gate anyone (near-miss logging is for admin review, after the real
// block/allow decision below has already been made), so failing those
// closed would wall off a borderline-but-unbanned visitor for a failure
// that was never actually a security question.
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

async function recordVelocityEvent(visitorId, ip, country) {
  if (!visitorId) return;
  try {
    const key = `${VELOCITY_KEY_PREFIX}${visitorId}`;
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

export async function getVelocitySignals(visitorId) {
  if (!visitorId) return { eventCount24h: 0, ipCount24h: 0, countryCount24h: 0 };
  try {
    const key = `${VELOCITY_KEY_PREFIX}${visitorId}`;
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
// the original device-intelligence plan. As of the /admin/visitor/list
// page, it also carries the last-known ip/location/userAgent so that page
// has something to show beyond a bare visitor ID — previously this only
// stored firstSeenAt/lastSeenAt/visitCount since nothing displayed more.
//
// Keyed by persistentMarker, NOT visitorId, when a marker is available.
// visitorId is now hashed from only WebGL vendor/renderer/extensions,
// fonts, and environment (see lib/fingerprint/collect.js, changed to
// survive Safari's canvas/audio/webgl-pixel noise) — but on iOS, devices
// of the same model/OS/browser/locale share every one of those fields, so
// two different physical phones can produce the IDENTICAL visitorId.
// Confirmed live: production logs showed one visitorId repeating across
// what the admin confirmed were separate physical devices, collapsing
// them into one /admin/visitor/list entry. persistentMarker (a 128-bit
// value generated once per device and actively stored in localStorage/
// IndexedDB/the Cache API — lib/fingerprint/persistentMarker.js) doesn't
// have this problem: it's never derived from device characteristics, so
// two devices can never coincidentally generate the same one. Falls back
// to visitorId only when no marker was sent (persistentMarker collection
// failed or all three of its storage layers were blocked).
async function recordVisitorHistory(visitorId, persistentMarker, {
  ip, location, userAgent, country, components, botSignals, privacySignals,
} = {}) {
  const historyKey = persistentMarker || visitorId;
  if (!historyKey) return;
  try {
    const now = new Date().toISOString();
    const redis = getRedis();
    const existingRaw = redis
      ? await redis.hget(VISITOR_HISTORY_KEY, historyKey)
      : mem.get(VISITOR_HISTORY_KEY)?.get(historyKey);
    const existing = existingRaw
      ? (typeof existingRaw === 'string' ? JSON.parse(existingRaw) : existingRaw)
      : null;

    // Every visitor now gets the same ASN/Tor/VPN/VM/bot/incognito/
    // suspect-score enrichment a near-miss or ban gets (previously
    // deliberately withheld from ordinary allowed visits — an earlier,
    // explicit performance/privacy tradeoff that's been reconsidered:
    // every visitor should get this, not just already-flagged ones).
    // Computed ONCE per device, exactly like touchBlockedDevice/
    // promoteNearMiss never recomputing on a repeat hit — an attacker (or
    // just a returning visitor) re-loading the page a hundred times must
    // not trigger a hundred ASN/Tor/VPN lookups.
    let enrichment = existing?.enrichment ?? null;
    if (!existing) {
      try {
        const velocity = await getVelocitySignals(visitorId);
        const { buildEnrichment } = await import('./reputation/enrich.js');
        enrichment = await buildEnrichment({ ip, location, components, botSignals, privacySignals, velocity });
      } catch {
        // Enrichment failing must never stop the visit itself from being recorded.
      }
    }

    const record = {
      visitorId: visitorId ?? existing?.visitorId ?? null,
      persistentMarker: persistentMarker ?? existing?.persistentMarker ?? null,
      firstSeenAt: existing?.firstSeenAt ?? now,
      lastSeenAt: now,
      visitCount: (existing?.visitCount ?? 0) + 1,
      lastIp: ip ?? existing?.lastIp ?? null,
      lastLocation: hasLocationData(location) ? location : (existing?.lastLocation ?? null),
      lastUserAgent: userAgent ?? existing?.lastUserAgent ?? null,
      enrichment,
    };

    if (redis) {
      await redis.hset(VISITOR_HISTORY_KEY, { [historyKey]: JSON.stringify(record) });
      try {
        // Per-field hash TTL (Redis 7.4+) — rolling 30-day expiry so a
        // visitor not seen again eventually drops out rather than being
        // retained forever. If unsupported, the record just doesn't
        // self-expire; still fully functional.
        await redis.hexpire(VISITOR_HISTORY_KEY, historyKey, VISITOR_HISTORY_TTL_SECONDS);
      } catch {
        // Non-fatal.
      }
    } else {
      const map = mem.get(VISITOR_HISTORY_KEY) ?? new Map();
      map.set(historyKey, record);
      mem.set(VISITOR_HISTORY_KEY, map);
    }
  } catch {
    // Non-fatal.
  }
}

// Looked up the same way it's recorded: prefer persistentMarker, fall
// back to visitorId. Called from app/api/admin/blocked-devices/route.js
// with a stored ban/near-miss record's own fields.
export async function getVisitorHistory(visitorId, persistentMarker) {
  const historyKey = persistentMarker || visitorId;
  if (!historyKey) return null;
  try {
    const redis = getRedis();
    if (redis) {
      const raw = await redis.hget(VISITOR_HISTORY_KEY, historyKey);
      return raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : null;
    }
    return mem.get(VISITOR_HISTORY_KEY)?.get(historyKey) ?? null;
  } catch {
    return null;
  }
}

// Manual per-row delete for /admin/visitor/list ("delete single logs").
// Keyed the same way every other visitor-history lookup is: persistentMarker
// preferred, visitorId as fallback — so deleting a row actually removes the
// same record the page displayed, not a different key that happens to
// share a field name.
export async function deleteVisitorHistory(visitorId, persistentMarker) {
  const historyKey = persistentMarker || visitorId;
  if (!historyKey) return;
  try {
    const redis = getRedis();
    if (redis) {
      await redis.hdel(VISITOR_HISTORY_KEY, historyKey);
    } else {
      mem.get(VISITOR_HISTORY_KEY)?.delete(historyKey);
    }
  } catch (err) {
    console.error('[deleteVisitorHistory] Redis error:', err?.message ?? err);
    throw err;
  }
}

// Every visitor the site has ever fingerprinted (within the 30-day rolling
// window), for the /admin/visitor/list page — not just banned devices or
// near-misses. `id` is the actual dedup key (persistentMarker when
// available, else visitorId — see recordVisitorHistory) and is what the
// page uses as a unique identity; `visitorId` is kept for display/search
// only and can legitimately repeat across different physical devices of
// the same model. Sorted newest-lastSeen-first, the ordering that page
// shows.
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

// Three-step check per lib/deviceMatch.js's design: exact visitorId/
// persistentMarker match is a cheap fast path; otherwise the weighted
// similarity comparator decides between an auto-block, a near-miss (logged
// for admin review, not blocked), or unrelated. Thresholds are a documented
// starting point (see lib/deviceMatch.js), not tuned against real traffic
// yet.
//
// Enrichment (ASN/Tor/VPN/VM/bot/incognito/suspect-score, see
// lib/reputation/enrich.js) is computed for every first-time visitor via
// recordVisitorHistory below (once per device, never recomputed on a
// repeat visit — see that function's own comment), and also independently
// on the near-miss branch a few lines down for the specific matched-ban
// context a near-miss carries. It's informational only: nothing computed
// here feeds back into the verdict above it.
export async function checkDeviceAgainstBlocklist({
  visitorId, components, persistentMarker, ip, country, userAgent, acceptLanguage,
  location, botSignals, privacySignals,
}) {
  await recordVelocityEvent(visitorId, ip, country);
  await recordVisitorHistory(visitorId, persistentMarker, { ip, location, userAgent, country, components, botSignals, privacySignals });

  const profiles = await getBlockedDevices();

  const exactMatch = profiles.find(
    (p) => (visitorId && p.visitorId === visitorId) || (persistentMarker && p.persistentMarker === persistentMarker)
  );
  if (exactMatch) {
    await touchBlockedDevice(exactMatch.id, location);
    return { verdict: 'blocked', matchedBanId: exactMatch.id, score: 1 };
  }

  const best = findBestMatch(components, profiles);
  if (best && best.score >= AUTO_BLOCK_THRESHOLD) {
    await touchBlockedDevice(best.profile.id, location);
    return { verdict: 'blocked', matchedBanId: best.profile.id, score: best.score };
  }
  if (best && best.score >= NEAR_MISS_THRESHOLD) {
    let enrichment = null;
    try {
      const velocity = await getVelocitySignals(visitorId);
      const { buildEnrichment } = await import('./reputation/enrich.js');
      enrichment = await buildEnrichment({ ip, location, components, botSignals, privacySignals, velocity });
    } catch {
      // Enrichment failing must never stop the near-miss itself from being logged.
    }
    await logNearMiss({
      visitorId, components, persistentMarker, ip, country, userAgent, acceptLanguage,
      matchedBanId: best.profile.id, score: best.score, enrichment,
    });
  }
  return { verdict: 'allowed' };
}

async function trimNearMisses(redis) {
  try {
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
  } catch (err) {
    console.error('[trimNearMisses] Redis error, skipping trim this pass:', err?.message ?? err);
  }
}

// Called from checkDeviceAgainstBlocklist's near-miss branch — a Redis
// error here must not fail the whole check closed (see getBlockedDevices'
// comment above for why), so it's non-fatal: the near-miss just doesn't
// get logged for admin review this one time.
export async function logNearMiss(entry) {
  try {
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
  } catch (err) {
    console.error('[logNearMiss] Redis error, near-miss not recorded:', err?.message ?? err);
    return null;
  }
}

export async function getNearMisses() {
  try {
    const redis = getRedis();
    const entries = redis
      ? readHashEntries(await redis.hgetall(NEAR_MISS_KEY))
      : [...(mem.get(NEAR_MISS_KEY) ?? new Map())].map(([id, record]) => ({ id, ...record }));
    return entries.sort((a, b) => new Date(b.seenAt) - new Date(a.seenAt));
  } catch (err) {
    console.error('[getNearMisses] Redis error, returning empty list:', err?.message ?? err);
    return [];
  }
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
    enrichment: record.enrichment ?? null,
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
