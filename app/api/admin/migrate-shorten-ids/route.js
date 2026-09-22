import { NextResponse } from 'next/server';
import { isValidAdminKey } from '@/lib/auth';
import { getRedis } from '@/lib/tokens';

// ONE-TIME migration: rewrite every 32-char persistentMarker still on
// record down to a 16-char value, WITHOUT losing continuity for a
// returning visitor. Unlike a plain rename, this also writes an alias
// table (site:marker_aliases: old 32-char -> new 16-char) that
// lib/tokens.js's checkDeviceAgainstBlocklist consults on every check —
// so a visitor whose browser still holds their old value keeps matching
// the right history/ban record, AND gets told (via the check response's
// `reassignMarker`) to overwrite their own stored marker going forward.
// After that one round trip their browser sends the short value directly
// and the alias entry is no longer needed (left in place regardless — see
// the 90-day TTL note below, no harm in it outliving its usefulness).
//
// Meant to be deleted after a single run — not a standing feature.
const VISITOR_HISTORY_KEY = 'site:visitor_history';
const BLOCKED_DEVICES_KEY = 'site:blocked_devices';
const MARKER_ALIAS_KEY = 'site:marker_aliases';
const MARKER_ALIAS_TTL_SECONDS = 90 * 24 * 60 * 60;
const SHORT_LEN = 16;

function parse(raw) {
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

async function run(request) {
  if (!isValidAdminKey(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const redis = getRedis();
  if (!redis) return NextResponse.json({ error: 'No Redis connection configured' }, { status: 500 });

  const result = {
    visitorHistory: { total: 0, shortened: 0, collisions: 0 },
    blockedDevices: { total: 0, shortened: 0 },
    aliases: { written: 0 },
  };

  // Build one canonical old -> new mapping up front from every distinct
  // long marker across BOTH collections, so a marker that appears in both
  // site:visitor_history and site:blocked_devices resolves to the exact
  // same new value in each — not two independently-truncated values that
  // could drift apart from each other.
  const rawHistory = (await redis.hgetall(VISITOR_HISTORY_KEY)) ?? {};
  const rawDevices = (await redis.hgetall(BLOCKED_DEVICES_KEY)) ?? {};

  const longMarkers = new Set();
  for (const key of Object.keys(rawHistory)) {
    result.visitorHistory.total++;
    if (key.length > SHORT_LEN) longMarkers.add(key);
  }
  const deviceRecords = {};
  for (const [key, raw] of Object.entries(rawDevices)) {
    result.blockedDevices.total++;
    const record = parse(raw);
    deviceRecords[key] = record;
    if (record.persistentMarker && record.persistentMarker.length > SHORT_LEN) longMarkers.add(record.persistentMarker);
  }

  const usedShortKeys = new Set([
    ...Object.keys(rawHistory).filter((k) => k.length <= SHORT_LEN),
    ...Object.values(deviceRecords).map((r) => r.persistentMarker).filter((m) => m && m.length <= SHORT_LEN),
  ]);
  const aliasMap = {};
  for (const oldMarker of longMarkers) {
    let shortKey = oldMarker.slice(0, SHORT_LEN);
    if (usedShortKeys.has(shortKey)) {
      // Astronomically unlikely for random 64-bit-prefix collisions among a
      // few dozen records, but skip rather than silently overwrite another
      // record if it ever happens.
      result.visitorHistory.collisions++;
      continue;
    }
    usedShortKeys.add(shortKey);
    aliasMap[oldMarker] = shortKey;
  }

  // Rename site:visitor_history records to their new key.
  const historySets = {};
  const historyDeletes = [];
  for (const [key, raw] of Object.entries(rawHistory)) {
    const shortKey = aliasMap[key];
    if (!shortKey) continue;
    const record = parse(raw);
    historySets[shortKey] = JSON.stringify({ ...record, persistentMarker: shortKey });
    historyDeletes.push(key);
    result.visitorHistory.shortened++;
  }
  if (Object.keys(historySets).length) await redis.hset(VISITOR_HISTORY_KEY, historySets);
  if (historyDeletes.length) await redis.hdel(VISITOR_HISTORY_KEY, ...historyDeletes);

  // Update site:blocked_devices' persistentMarker field (keyed by an
  // opaque ban ID, not the marker, so no key rename needed here).
  const deviceUpdates = {};
  for (const [key, record] of Object.entries(deviceRecords)) {
    const shortKey = record.persistentMarker ? aliasMap[record.persistentMarker] : null;
    if (!shortKey) continue;
    deviceUpdates[key] = JSON.stringify({ ...record, persistentMarker: shortKey });
    result.blockedDevices.shortened++;
  }
  if (Object.keys(deviceUpdates).length) await redis.hset(BLOCKED_DEVICES_KEY, deviceUpdates);

  // Write the alias table itself so future checks from a visitor still
  // sending an old value resolve correctly (see resolveMarkerAlias in
  // lib/tokens.js).
  if (Object.keys(aliasMap).length) {
    await redis.hset(MARKER_ALIAS_KEY, aliasMap);
    try {
      await redis.expire(MARKER_ALIAS_KEY, MARKER_ALIAS_TTL_SECONDS);
    } catch {
      // Non-fatal — the alias table just doesn't self-expire.
    }
    result.aliases.written = Object.keys(aliasMap).length;
  }

  return NextResponse.json({ ok: true, result });
}

export async function GET(request) {
  return run(request);
}

export async function POST(request) {
  return run(request);
}
