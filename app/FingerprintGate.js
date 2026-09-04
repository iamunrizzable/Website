'use client';

import { useEffect, useState } from 'react';
import { useVisitorData } from '@fingerprint/react';

// Blocks the whole site for visitors whose identification event fails the
// Fingerprint ruleset (rs_4ns6PcOeU2RspQ — forbidden IPs, VPN detection,
// etc, configured in the Fingerprint dashboard). The verdict check runs
// AFTER the page has already rendered normally, so legitimate visitors see
// zero added latency; a blocked visitor gets swapped to the block screen
// once the server-side verdict comes back a moment later.
//
// The check itself (app/api/fingerprint/check) fails OPEN on any error, so
// a Fingerprint outage or misconfiguration can only ever result in nobody
// being blocked — never in the site going down, unlike the earlier
// Fingerprint install that crashed on a missing key.
export default function FingerprintGate({ children }) {
  const { data } = useVisitorData({ immediate: true });
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (!data?.event_id) return;
    let cancelled = false;

    fetch('/api/fingerprint/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId: data.event_id }),
    })
      .then((res) => (res.ok ? res.json() : { blocked: false }))
      .then((result) => {
        if (!cancelled && result?.blocked) setBlocked(true);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [data?.event_id]);

  if (blocked) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: '#0f172a',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: 24,
          zIndex: 999999,
        }}
      >
        <div>
          <h1 style={{ fontSize: 20, marginBottom: 8 }}>Access denied</h1>
          <p style={{ opacity: 0.8 }}>This request was blocked for security reasons.</p>
        </div>
      </div>
    );
  }

  return children;
}
