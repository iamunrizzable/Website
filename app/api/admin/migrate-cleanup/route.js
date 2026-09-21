import { NextResponse } from 'next/server';
import { isValidAdminKey } from '@/lib/auth';
import { getRedis } from '@/lib/tokens';

// ONE-TIME migration: strips the dead `visitorId`/`components`/
// `acceptLanguage` fields left over from the removed fingerprint-hash/
// similarity-matching system (see lib/tokens.js's checkDeviceAgainstBlocklist
// rewrite) out of every existing site:visitor_history and site:blocked_devices
// record, and deletes the now-fully-orphaned site:device_near_misses key
// (its own read/write functions were removed with the rest of that system,
// so nothing can reach that data through any route anymore). Existing
// records otherwise keep their real history (firstSeenAt/visitCount/etc) —
// this only removes fields no longer part of the schema, it doesn't touch
// or reset any persistentMarker/ban.
//
// Meant to be deleted after a single run — not a standing feature.
const VISITOR_HISTORY_KEY = 'site:visitor_history';
const BLOCKED_DEVICES_KEY = 'site:blocked_devices';
const NEAR_MISS_KEY = 'site:device_near_misses';

function parse(raw) {
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

async function run(request) {
  if (!isValidAdminKey(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const redis = getRedis();
  if (!redis) return NextResponse.json({ error: 'No Redis connection configured' }, { status: 500 });

  const result = {
    visitorHistory: { total: 0, cleaned: 0, droppedNoMarker: 0 },
    blockedDevices: { total: 0, cleaned: 0 },
    nearMisses: { existed: false, deleted: 0 },
  };

  // site:visitor_history — drop `visitorId`; a handful of very old entries
  // (recorded before persistentMarker existed at all) have no persistentMarker
  // whatsoever, only the legacy hash as their key — those can't be renamed to
  // a real persistentMarker (there isn't one), so they're deleted outright
  // rather than kept under a fingerprint-hash key the rest of the system no
  // longer recognizes.
  const rawHistory = (await redis.hgetall(VISITOR_HISTORY_KEY)) ?? {};
  const historyUpdates = {};
  const historyDeletes = [];
  for (const [key, raw] of Object.entries(rawHistory)) {
    result.visitorHistory.total++;
    const record = parse(raw);
    if (!record.persistentMarker) {
      historyDeletes.push(key);
      result.visitorHistory.droppedNoMarker++;
      continue;
    }
    if ('visitorId' in record) {
      const { visitorId, ...clean } = record;
      historyUpdates[key] = JSON.stringify(clean);
      result.visitorHistory.cleaned++;
    }
  }
  if (Object.keys(historyUpdates).length) await redis.hset(VISITOR_HISTORY_KEY, historyUpdates);
  if (historyDeletes.length) await redis.hdel(VISITOR_HISTORY_KEY, ...historyDeletes);

  // site:blocked_devices — same cleanup, but never deletes a ban outright
  // even without a persistentMarker (an admin may have hand-entered one
  // deliberately) — just strips the dead fields.
  const rawDevices = (await redis.hgetall(BLOCKED_DEVICES_KEY)) ?? {};
  const deviceUpdates = {};
  for (const [key, raw] of Object.entries(rawDevices)) {
    result.blockedDevices.total++;
    const record = parse(raw);
    const dropKeys = ['visitorId', 'components', 'acceptLanguage'].filter((k) => k in record);
    if (dropKeys.length) {
      const clean = { ...record };
      for (const k of dropKeys) delete clean[k];
      deviceUpdates[key] = JSON.stringify(clean);
      result.blockedDevices.cleaned++;
    }
  }
  if (Object.keys(deviceUpdates).length) await redis.hset(BLOCKED_DEVICES_KEY, deviceUpdates);

  // site:device_near_misses — the whole near-miss system was removed;
  // nothing reads or writes this key anymore, so delete it entirely.
  // hlen isn't in the TCP-adapter's method surface (lib/redisTcpClient.js),
  // so count via hgetall instead — same pattern already used elsewhere in
  // this codebase for that key.
  const rawNearMisses = (await redis.hgetall(NEAR_MISS_KEY)) ?? {};
  const nearMissCount = Object.keys(rawNearMisses).length;
  if (nearMissCount > 0) {
    result.nearMisses.existed = true;
    result.nearMisses.deleted = nearMissCount;
    await redis.del(NEAR_MISS_KEY);
  }

  return NextResponse.json({ ok: true, result });
}

// GET alias so this can be triggered with a plain URL fetch (this one-time
// route is only ever invoked directly by an admin, not from any UI button).
export async function GET(request) {
  return run(request);
}

export async function POST(request) {
  return run(request);
}
