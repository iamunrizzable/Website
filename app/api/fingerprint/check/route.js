import { NextResponse } from 'next/server';
import { checkDeviceAgainstBlocklist } from '@/lib/tokens';

// Evaluates a client's persistentMarker (lib/fingerprint/persistentMarker.js
// — a randomly-generated value stored across localStorage/IndexedDB/the
// Cache API, never derived from device characteristics) against the device
// blocklist managed at /admin/security. checkDeviceAgainstBlocklist
// (lib/tokens.js) does the actual matching: an exact persistentMarker hit is
// the only way to be blocked — there's no fuzzy/similarity matching, since
// this site's earlier browser-fingerprint-based matching produced real,
// confirmed collisions between unrelated physical devices in production.
//
// Also threads through IP geolocation (free Vercel edge headers), the
// client's WebGL vendor/renderer (for VM detection), and bot/privacy
// heuristic signals (lib/fingerprint/botSignals.js, privacySignals.js) —
// lib/tokens.js turns these into enrichment data attached to every
// first-seen visitor record, purely informational, and none of it is ever
// sent back in this route's response (the client-visible shape below is
// unchanged either way).
//
// Fails CLOSED on any problem: a missing/invalid persistentMarker, or a
// Redis error, both resolve to BLOCKED (well, unverified) rather than
// skipping the check — per explicit instruction, any activity this route
// can't actually verify is treated as unverified and blocked. This endpoint
// gates the ENTIRE site (DeviceGate in app/layout.js), so a Redis outage
// takes the whole site down for everyone rather than letting traffic through
// unchecked — a deliberate tradeoff, not an oversight.
//
// The response distinguishes WHY someone is blocked, since a purposeful
// block (device-blocklist match) and an unverifiable check (our own errors)
// get different copy on the block page:
//   verdict: 'allowed'    — no match against the blocklist.
//   verdict: 'blocked'    — a real, confirmed block (exact persistentMarker
//                           match against a banned profile). `reason` (when
//                           the ban carries a reasonCode — every auto-ban,
//                           and manual bans going forward) is the specific
//                           trigger — 'non-us', 'vpn', 'datacenter', 'tor',
//                           or 'manual' — shown on the block screen instead
//                           of a generic "Access Denied" for everyone. An
//                           older ban with no reasonCode sends `reason: null`
//                           rather than a fabricated one.
//   verdict: 'unverified' — we couldn't actually complete the check;
//                           `reason` carries why, shown on the "unable to
//                           verify you" screen instead of "Access Denied".
//
// `reassignMarker` (present only for a visitor whose browser still holds a
// pre-shortening 32-char marker that's since been renamed — see
// lib/tokens.js's resolveMarkerAlias) tells DeviceGate.js to overwrite its
// own stored marker with this value, so the next visit sends the current
// short ID directly instead of relying on the alias lookup again.
function logVerdict(verdict, reason, { persistentMarker, isError, errorDetail } = {}) {
  const log = isError ? console.error : console.log;
  log(`[fingerprint-check] ${verdict} reason=${reason} marker=${persistentMarker ?? '-'}`);
  if (errorDetail) log(`[fingerprint-check] error detail: ${errorDetail}`);
}

export async function POST(request) {
  const { persistentMarker, webgl, botSignals, privacySignals } = await request.json().catch(() => ({}));

  if (!persistentMarker || typeof persistentMarker !== 'string') {
    logVerdict('unverified', 'no-marker', { persistentMarker });
    return NextResponse.json({ verdict: 'unverified', reason: 'no-marker' });
  }

  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
    const country = request.headers.get('x-vercel-ip-country') || null;
    const userAgent = request.headers.get('user-agent') || null;
    // Free at the edge on every request, no setup needed — see
    // lib/reputation/enrich.js's Location panel in the admin detail view.
    // Only ever attached to a visitor-history/block record, never sent
    // back to the client (the response shape below is unchanged).
    const location = {
      city: request.headers.get('x-vercel-ip-city') ? decodeURIComponent(request.headers.get('x-vercel-ip-city')) : null,
      region: request.headers.get('x-vercel-ip-country-region') || null,
      country,
      lat: request.headers.get('x-vercel-ip-latitude') || null,
      lon: request.headers.get('x-vercel-ip-longitude') || null,
      postalCode: request.headers.get('x-vercel-ip-postal-code') || null,
      timezone: request.headers.get('x-vercel-ip-timezone') || null,
    };

    const result = await checkDeviceAgainstBlocklist({
      persistentMarker, webgl, ip, country, userAgent, location, botSignals, privacySignals,
    });

    if (result.verdict === 'blocked') {
      logVerdict('blocked', 'device-blocklist', { persistentMarker });
      return NextResponse.json({ verdict: 'blocked', reassignMarker: result.reassignMarker, reason: result.blockReason });
    }
    logVerdict('allowed', 'blocklist-clear', { persistentMarker });
    return NextResponse.json({ verdict: 'allowed', reassignMarker: result.reassignMarker });
  } catch (err) {
    logVerdict('unverified', 'device-blocklist-check-error', { persistentMarker, isError: true, errorDetail: err?.message ?? String(err) });
    return NextResponse.json({ verdict: 'unverified', reason: 'device-blocklist-check-error' });
  }
}
