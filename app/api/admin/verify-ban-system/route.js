import { NextResponse } from 'next/server';
import { isValidAdminKey } from '@/lib/auth';
import { checkDeviceAgainstBlocklist, removeBlockedDevice, deleteVisitorHistory } from '@/lib/tokens';

// ONE-TIME live verification: exercises the REAL, deployed
// checkDeviceAgainstBlocklist against REAL production Redis — not a local
// copy — with disposable, clearly-marked test markers, then deletes every
// trace it created. Requested before disabling the site-wide maintenance
// kill switch, to confirm the ban pipeline itself (not just each piece in
// isolation, tested locally, over the course of tonight) actually works
// end to end on the exact code that's live right now.
//
// Meant to be deleted after a single run — not a standing feature.
const TEST_PREFIX = 'verifyban';

function testMarker(name) {
  return `${TEST_PREFIX}${name}${Date.now().toString(36)}`.slice(0, 30);
}

async function run(request) {
  if (!isValidAdminKey(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const results = [];
  const createdBanIds = [];
  const createdMarkers = [];

  async function scenario(name, params, expect) {
    const result = await checkDeviceAgainstBlocklist(params);
    if (result.matchedBanId) createdBanIds.push(result.matchedBanId);
    if (params.persistentMarker) createdMarkers.push(params.persistentMarker);
    const pass = expect(result);
    results.push({ name, verdict: result.verdict, reason: result.blockReason ?? null, pass });
    return result;
  }

  // 1. Non-US country -> must be blocked, reasonCode 'non-us'.
  const m1 = testMarker('nonus');
  await scenario('non-US country blocks', { persistentMarker: m1, ip: '203.0.113.5', country: 'DE', userAgent: 'verify-ban-system' },
    (r) => r.verdict === 'blocked' && r.blockReason === 'non-us');

  // 2. Same marker, second visit -> must match the EXISTING ban (not create a second one).
  await scenario('repeat visit matches existing ban, no duplicate', { persistentMarker: m1, ip: '203.0.113.5', country: 'DE', userAgent: 'verify-ban-system' },
    (r) => r.verdict === 'blocked' && r.blockReason === 'non-us');

  // 3. US country, known Google datacenter IP -> must be blocked, reasonCode 'datacenter' (blanket VPN/datacenter ban applies regardless of reported country).
  const m2 = testMarker('dc');
  await scenario('US-reporting datacenter IP still blocked', { persistentMarker: m2, ip: '8.8.8.8', country: 'US', userAgent: 'verify-ban-system' },
    (r) => r.verdict === 'blocked' && r.blockReason === 'datacenter');

  // 4. US country, ordinary residential-looking IP -> must be allowed.
  const m3 = testMarker('clean');
  await scenario('US residential IP allowed', { persistentMarker: m3, ip: '73.42.11.5', country: 'US', userAgent: 'verify-ban-system' },
    (r) => r.verdict === 'allowed');

  // 5. Unknown/missing country, non-VPN IP -> must be allowed (never ban on missing geo data).
  const m4 = testMarker('unk');
  await scenario('unknown country not auto-banned', { persistentMarker: m4, ip: '73.42.11.6', country: null, userAgent: 'verify-ban-system' },
    (r) => r.verdict === 'allowed');

  // Clean up every trace this created — real production data must not be
  // left with test entries.
  const cleanup = { bansRemoved: 0, historyRemoved: 0, errors: [] };
  for (const banId of createdBanIds) {
    try { await removeBlockedDevice(banId); cleanup.bansRemoved++; } catch (e) { cleanup.errors.push(`ban ${banId}: ${e.message}`); }
  }
  for (const marker of createdMarkers) {
    try { await deleteVisitorHistory(marker); cleanup.historyRemoved++; } catch (e) { cleanup.errors.push(`history ${marker}: ${e.message}`); }
  }

  const allPassed = results.every((r) => r.pass);
  return NextResponse.json({ allPassed, results, cleanup });
}

export async function GET(request) {
  return run(request);
}
