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
// Fails OPEN on any problem: missing/invalid ids, missing server key, a
// Fingerprint API error, a Redis error, or a network failure all resolve
// to that check being skipped rather than blocking. This endpoint gates
// the ENTIRE site (FingerprintGate in app/layout.js), so if it ever
// fails closed instead, an outage here takes the whole site down with
// it — exactly the kind of outage this Fingerprint integration already
// caused once.
export async function POST(request) {
  const { eventId, visitorId } = await request.json().catch(() => ({}));

  let blocked = false;
  try {
    if (visitorId && typeof visitorId === 'string') {
      blocked = await isVisitorIdBlocked(visitorId);
    }
  } catch {
    // ignore — fail open
  }

  if (blocked) {
    return NextResponse.json({ blocked: true });
  }

  try {
    if (!eventId || typeof eventId !== 'string') {
      return NextResponse.json({ blocked: false });
    }

    const apiKey = process.env.FINGERPRINT_SERVER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ blocked: false });
    }

    const url = `https://api.fpjs.io/v4/events/${encodeURIComponent(eventId)}?ruleset_id=${RULESET_ID}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return NextResponse.json({ blocked: false });
    }

    const event = await res.json();
    const rulesetBlocked = event?.rule_action?.type === 'block';

    return NextResponse.json({ blocked: rulesetBlocked });
  } catch {
    return NextResponse.json({ blocked: false });
  }
}
