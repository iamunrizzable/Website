import { NextResponse } from 'next/server';
import { isVisitorIdBlocked } from '@/lib/tokens';

// The ruleset configured in the Fingerprint dashboard ("Assess mobile
// device risk (iOS)" — forbidden IPs, VPN detection, etc). Not a secret;
// it's just an identifier, same as it appears in the dashboard's own
// endpoint URL.
const RULESET_ID = 'rs_4ns6PcOeU2RspQ';

// Evaluates a client-collected Fingerprint visitor against two things:
// 1. Our own device blocklist (visitorId, managed at /admin/security) —
//    a persistent, IP-independent ban, since Fingerprint's visitor_id
//    stays stable across the IP rotation that made IP-only blocking
//    unreliable.
// 2. The Fingerprint ruleset (RULESET_ID — forbidden IPs, VPN detection,
//    etc, configured in Fingerprint's own dashboard). Requires
//    FINGERPRINT_SERVER_API_KEY (Server API secret key — see .env.example).
//
// Fails CLOSED on any problem: missing/invalid ids, missing server key, a
// Fingerprint API error, a Redis error, or a network failure all resolve
// to BLOCKED rather than skipping the check — per explicit instruction,
// any activity this route can't actually verify is treated as unverified
// and blocked. This endpoint gates the ENTIRE site (FingerprintGate in
// app/layout.js), so an outage in Fingerprint's API or in Redis now takes
// the whole site down for everyone rather than letting traffic through
// unchecked — that tradeoff was made deliberately, overriding this
// route's prior fail-open design (which existed because fail-closed
// caused a site-wide outage once before).
//
// The response distinguishes WHY someone is blocked, since a purposeful
// block (device-blocklist match, ruleset says block) and an unverifiable
// check (our own errors/timeouts) get different copy on the block page:
//   verdict: 'allowed'    — passed the blocklist and the ruleset cleanly.
//   verdict: 'blocked'    — a real, confirmed block (banned device, or
//                           Fingerprint's ruleset flagged them).
//   verdict: 'unverified' — we couldn't actually complete the check;
//                           `reason` carries why, shown on the "unable to
//                           verify you" screen instead of "Access Denied".
//
// Every verdict this route returns is logged here so a fail-closed block
// (missing key, Redis error, Fingerprint API error/timeout) is
// distinguishable in Vercel's function logs from a real ruleset/blocklist
// block. Errors/misconfig use console.error so they're easy to filter
// for; normal verdicts use console.log.
function logVerdict(verdict, reason, { visitorId, eventId, isError } = {}) {
  const log = isError ? console.error : console.log;
  log(`[fingerprint-check] ${verdict} reason=${reason} visitorId=${visitorId ?? '-'} eventId=${eventId ?? '-'}`);
}

export async function POST(request) {
  const { eventId, visitorId } = await request.json().catch(() => ({}));

  try {
    if (visitorId && typeof visitorId === 'string') {
      const blocked = await isVisitorIdBlocked(visitorId);
      if (blocked) {
        logVerdict('blocked', 'device-blocklist', { visitorId, eventId });
        return NextResponse.json({ verdict: 'blocked' });
      }
    }
  } catch (err) {
    logVerdict('unverified', 'device-blocklist-check-error', { visitorId, eventId, isError: true });
    return NextResponse.json({ verdict: 'unverified', reason: 'device-blocklist-check-error' });
  }

  try {
    if (!eventId || typeof eventId !== 'string') {
      logVerdict('unverified', 'no-event-id', { visitorId, eventId });
      return NextResponse.json({ verdict: 'unverified', reason: 'no-event-id' });
    }

    const apiKey = process.env.FINGERPRINT_SERVER_API_KEY;
    if (!apiKey) {
      logVerdict('unverified', 'missing-server-key', { visitorId, eventId, isError: true });
      return NextResponse.json({ verdict: 'unverified', reason: 'missing-server-key' });
    }

    const url = `https://api.fpjs.io/v4/events/${encodeURIComponent(eventId)}?ruleset_id=${RULESET_ID}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      const reason = `fingerprint-api-error-${res.status}`;
      logVerdict('unverified', reason, { visitorId, eventId, isError: true });
      return NextResponse.json({ verdict: 'unverified', reason });
    }

    const event = await res.json();
    const rulesetBlocked = event?.rule_action?.type === 'block';

    if (rulesetBlocked) {
      logVerdict('blocked', 'ruleset', { visitorId, eventId });
      return NextResponse.json({ verdict: 'blocked' });
    }
    logVerdict('allowed', 'ruleset-clear', { visitorId, eventId });
    return NextResponse.json({ verdict: 'allowed' });
  } catch (err) {
    const reason = `exception-${err?.name || 'unknown'}`;
    logVerdict('unverified', reason, { visitorId, eventId, isError: true });
    return NextResponse.json({ verdict: 'unverified', reason });
  }
}
