import { NextResponse } from 'next/server';
import { checkDeviceAgainstBlocklist } from '@/lib/tokens';

// Evaluates a client-collected device fingerprint (lib/fingerprint/collect.js
// — our own in-house canvas/WebGL/audio/font/environment signal collector,
// no third-party service involved) against the device blocklist managed at
// /admin/security. checkDeviceAgainstBlocklist (lib/tokens.js) does the
// actual matching: an exact visitorId/persistentMarker hit is a fast-path
// block; otherwise a weighted similarity comparison (lib/deviceMatch.js)
// against every banned profile's raw components decides between a
// confirmed block, a near-miss logged for admin review, or allowed — this
// is what catches a banned device after a browser/OS update shifts its
// canvas/WebGL output just enough to change the exact hash.
//
// Fails CLOSED on any problem: missing/invalid components, or a Redis
// error, both resolve to BLOCKED rather than skipping the check — per
// explicit instruction, any activity this route can't actually verify is
// treated as unverified and blocked. This endpoint gates the ENTIRE site
// (DeviceGate in app/layout.js), so a Redis outage takes the whole site
// down for everyone rather than letting traffic through unchecked — a
// deliberate tradeoff, not an oversight.
//
// The response distinguishes WHY someone is blocked, since a purposeful
// block (device-blocklist match, similarity match) and an unverifiable
// check (our own errors) get different copy on the block page:
//   verdict: 'allowed'    — no match against the blocklist.
//   verdict: 'blocked'    — a real, confirmed block (exact or similarity
//                           match against a banned profile).
//   verdict: 'unverified' — we couldn't actually complete the check;
//                           `reason` carries why, shown on the "unable to
//                           verify you" screen instead of "Access Denied".
function logVerdict(verdict, reason, { visitorId, isError, score } = {}) {
  const log = isError ? console.error : console.log;
  log(`[fingerprint-check] ${verdict} reason=${reason} visitorId=${visitorId ?? '-'} score=${score ?? '-'}`);
}

export async function POST(request) {
  const { visitorId, components, persistentMarker } = await request.json().catch(() => ({}));

  if (!components || typeof components !== 'object') {
    logVerdict('unverified', 'no-components', { visitorId });
    return NextResponse.json({ verdict: 'unverified', reason: 'no-components' });
  }

  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
    const country = request.headers.get('x-vercel-ip-country') || null;
    const userAgent = request.headers.get('user-agent') || null;
    const acceptLanguage = request.headers.get('accept-language') || null;

    const result = await checkDeviceAgainstBlocklist({
      visitorId, components, persistentMarker, ip, country, userAgent, acceptLanguage,
    });

    if (result.verdict === 'blocked') {
      logVerdict('blocked', 'device-blocklist', { visitorId, score: result.score });
      return NextResponse.json({ verdict: 'blocked' });
    }
    logVerdict('allowed', 'blocklist-clear', { visitorId });
    return NextResponse.json({ verdict: 'allowed' });
  } catch (err) {
    logVerdict('unverified', 'device-blocklist-check-error', { visitorId, isError: true });
    return NextResponse.json({ verdict: 'unverified', reason: 'device-blocklist-check-error' });
  }
}
