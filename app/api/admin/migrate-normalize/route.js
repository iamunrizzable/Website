import { NextResponse } from 'next/server';
import { isValidAdminKey } from '@/lib/auth';
import { getRedis } from '@/lib/tokens';

// ONE-TIME migration, round 2: the previous cleanup (migrate-cleanup, now
// removed) only stripped the dead `visitorId` field — it left every
// pre-existing site:visitor_history record in whatever key order/shape it
// already had, which is NOT the same shape recordVisitorHistory
// (lib/tokens.js) writes today. Most old records are missing the
// `enrichment` key outright (some have it explicitly as `null`, most don't
// have the key at all — created before that field existed and never
// rewritten since), so "Show JSON" on an old row looks structurally
// different from a freshly-created one. This rebuilds every record as a
// new object literal in the exact key order/shape recordVisitorHistory
// uses, defaulting a genuinely-missing `enrichment` to `null` rather than
// fabricating a value — no ASN/Tor/VPN lookups are re-run against
// possibly-stale IPs.
//
// Meant to be deleted after a single run — not a standing feature.
const VISITOR_HISTORY_KEY = 'site:visitor_history';

function parse(raw) {
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

// The exact field set/order recordVisitorHistory writes today.
function canonicalize(record) {
  return {
    persistentMarker: record.persistentMarker ?? null,
    firstSeenAt: record.firstSeenAt ?? null,
    lastSeenAt: record.lastSeenAt ?? null,
    visitCount: record.visitCount ?? 0,
    lastIp: record.lastIp ?? null,
    lastLocation: record.lastLocation ?? null,
    lastUserAgent: record.lastUserAgent ?? null,
    enrichment: record.enrichment ?? null,
  };
}

async function run(request) {
  if (!isValidAdminKey(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const redis = getRedis();
  if (!redis) return NextResponse.json({ error: 'No Redis connection configured' }, { status: 500 });

  const result = { total: 0, rewritten: 0, alreadyClean: 0 };

  const raw = (await redis.hgetall(VISITOR_HISTORY_KEY)) ?? {};
  const updates = {};
  for (const [key, value] of Object.entries(raw)) {
    result.total++;
    const record = parse(value);
    const clean = canonicalize(record);
    const cleanJson = JSON.stringify(clean);
    if (cleanJson !== JSON.stringify(record)) {
      updates[key] = cleanJson;
      result.rewritten++;
    } else {
      result.alreadyClean++;
    }
  }
  if (Object.keys(updates).length) await redis.hset(VISITOR_HISTORY_KEY, updates);

  return NextResponse.json({ ok: true, result });
}

export async function GET(request) {
  return run(request);
}

export async function POST(request) {
  return run(request);
}
