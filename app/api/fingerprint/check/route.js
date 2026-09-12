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
// Every verdict this route returns is logged here so a fail-closed block
// (missing key, Redis error, Fingerprint API error/timeout) is
// distinguishable in Vercel's function logs from a real ruleset/blocklist
// block. Errors/misconfig use console.error so they're easy to filter
// for; normal verdicts use console.log.
function logVerdict(blocked, reason, { visitorId, eventId, isError } = {}) {
  const log = isError ? console.error : console.log;
  log(`[fingerprint-check] ${blocked ? 'BLOCKED' : 'allowed'} reason=${reason} visitorId=${visitorId ?? '-'} eventId=${eventId ?? '-'}`);
}

export async function POST(request) {
  const { eventId, visitorId } = await request.json().catch(() => ({}));

  try {
    if (visitorId && typeof visitorId === 'string') {
      const blocked = await isVisitorIdBlocked(visitorId);
      if (blocked) {
        logVerdict(true, 'device-blocklist', { visitorId, eventId });
        return NextResponse.json({ blocked: true });
      }
    }
  } catch (err) {
    logVerdict(true, 'device-blocklist-check-error', { visitorId, eventId, isError: true });
    return NextResponse.json({ blocked: true });
  }

  try {
    if (!eventId || typeof eventId !== 'string') {
      logVerdict(true, 'no-event-id', { visitorId, eventId });
      return NextResponse.json({ blocked: true });
    }

    const apiKey = process.env.FINGERPRINT_SERVER_API_KEY;
    if (!apiKey) {
      logVerdict(true, 'missing-server-key', { visitorId, eventId, isError: true });
      return NextResponse.json({ blocked: true });
    }

    const url = `https://api.fpjs.io/v4/events/${encodeURIComponent(eventId)}?ruleset_id=${RULESET_ID}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      logVerdict(true, `fingerprint-api-error-${res.status}`, { visitorId, eventId, isError: true });
      return NextResponse.json({ blocked: true });
    }

    const event = await res.json();
    const rulesetBlocked = event?.rule_action?.type === 'block';

    logVerdict(rulesetBlocked, rulesetBlocked ? 'ruleset' : 'ruleset-clear', { visitorId, eventId });
    return NextResponse.json({ blocked: rulesetBlocked });
  } catch (err) {
    logVerdict(true, `exception-${err?.name || 'unknown'}`, { visitorId, eventId, isError: true });
    return NextResponse.json({ blocked: true });
  }
}
