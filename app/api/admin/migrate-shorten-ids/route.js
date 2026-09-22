import { NextResponse } from 'next/server';
import { isValidAdminKey } from '@/lib/auth';
import { getRedis } from '@/lib/tokens';

// ONE-TIME migration, explicit instruction: rewrite every persistentMarker
// still at the old 32-char length down to the first 16 characters, so
// old and new IDs look and are the same length everywhere (site:visitor_history
// hash keys + the persistentMarker field on site:blocked_devices records).
//
// Known, accepted tradeoff (flagged before running, not silently absorbed):
// a returning visitor's browser still holds their ORIGINAL 32-char marker
// (lib/fingerprint/persistentMarker.js reads whatever's already stored
// first, it never regenerates one that exists) — nothing server-side can
// reach into their browser to shorten it. So their next visit will look up
// the full 32-char value again, find no match under the new 16-char key,
// and create a fresh history row + drop any ban keyed to the old value.
// That's expected, not a bug in this migration — this only rewrites what's
// stored on the server today.
//
// Meant to be deleted after a single run — not a standing feature.
const VISITOR_HISTORY_KEY = 'site:visitor_history';
const BLOCKED_DEVICES_KEY = 'site:blocked_devices';
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
  };

  // site:visitor_history — the marker is the hash KEY itself, so this is a
  // real rename: write under the new short key, delete the old long key.
  const rawHistory = (await redis.hgetall(VISITOR_HISTORY_KEY)) ?? {};
  const usedShortKeys = new Set(Object.keys(rawHistory).filter((k) => k.length <= SHORT_LEN));
  const historySets = {};
  const historyDeletes = [];
  for (const [key, raw] of Object.entries(rawHistory)) {
    result.visitorHistory.total++;
    if (key.length <= SHORT_LEN) continue;
    let shortKey = key.slice(0, SHORT_LEN);
    if (usedShortKeys.has(shortKey)) {
      // Astronomically unlikely for random 64-bit-prefix collisions among a
      // few dozen records, but skip rather than silently overwrite another
      // record if it ever happens.
      result.visitorHistory.collisions++;
      continue;
    }
    usedShortKeys.add(shortKey);
    const record = parse(raw);
    historySets[shortKey] = JSON.stringify({ ...record, persistentMarker: shortKey });
    historyDeletes.push(key);
    result.visitorHistory.shortened++;
  }
  if (Object.keys(historySets).length) await redis.hset(VISITOR_HISTORY_KEY, historySets);
  if (historyDeletes.length) await redis.hdel(VISITOR_HISTORY_KEY, ...historyDeletes);

  // site:blocked_devices — keyed by an opaque ban ID (UUID), not the
  // marker, so this only rewrites the persistentMarker field's value, no
  // key rename needed.
  const rawDevices = (await redis.hgetall(BLOCKED_DEVICES_KEY)) ?? {};
  const deviceUpdates = {};
  for (const [key, raw] of Object.entries(rawDevices)) {
    result.blockedDevices.total++;
    const record = parse(raw);
    if (record.persistentMarker && record.persistentMarker.length > SHORT_LEN) {
      deviceUpdates[key] = JSON.stringify({ ...record, persistentMarker: record.persistentMarker.slice(0, SHORT_LEN) });
      result.blockedDevices.shortened++;
    }
  }
  if (Object.keys(deviceUpdates).length) await redis.hset(BLOCKED_DEVICES_KEY, deviceUpdates);

  return NextResponse.json({ ok: true, result });
}

export async function GET(request) {
  return run(request);
}

export async function POST(request) {
  return run(request);
}
