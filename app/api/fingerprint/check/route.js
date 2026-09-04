import { NextResponse } from 'next/server';

// The ruleset configured in the Fingerprint dashboard ("Assess mobile
// device risk (iOS)" — forbidden IPs, VPN detection, etc). Not a secret;
// it's just an identifier, same as it appears in the dashboard's own
// endpoint URL.
const RULESET_ID = 'rs_4ns6PcOeU2RspQ';

// Evaluates a client-collected Fingerprint identification event against
// RULESET_ID and reports whether the visitor should be blocked. Requires
// FINGERPRINT_SERVER_API_KEY (Server API secret key — see .env.example).
//
// Fails OPEN on any problem: missing/invalid eventId, missing server key,
// a Fingerprint API error, or a network failure all resolve to
// { blocked: false }. This endpoint gates the ENTIRE site (FingerprintGate
// in app/layout.js), so if it ever fails closed instead, a Fingerprint
// outage or misconfiguration takes the whole site down with it — exactly
// the kind of outage this Fingerprint integration already caused once.
export async function POST(request) {
  try {
    const { eventId } = await request.json();
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
    const blocked = event?.rule_action?.type === 'block';

    return NextResponse.json({ blocked });
  } catch {
    return NextResponse.json({ blocked: false });
  }
}
