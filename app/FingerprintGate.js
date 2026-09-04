'use client';

import { useEffect, useRef, useState } from 'react';
import { useVisitorData } from '@fingerprint/react';

// Time to wait for a verdict before giving up and showing the site anyway.
// Bounds the worst case (Fingerprint's script never loads, or the check
// hangs) so a Fingerprint outage can still never take the whole site down
// — it just means the check gets skipped after this long instead of never
// running at all.
const CHECK_TIMEOUT_MS = 3000;

// Blocks the whole site for visitors whose identification event fails the
// Fingerprint ruleset (rs_4ns6PcOeU2RspQ — forbidden IPs, VPN detection,
// etc) or matches the device blocklist at /admin/security. The verdict is
// checked BEFORE showing any page content — a loading screen covers the
// page until the check resolves (or times out), so a blocked visitor never
// sees a flash of real content first.
//
// The check itself (app/api/fingerprint/check) fails OPEN on any error, so
// a Fingerprint outage or misconfiguration can only ever result in nobody
// being blocked — never in the site going down, unlike the earlier
// Fingerprint install that crashed on a missing key.
export default function FingerprintGate({ children }) {
  const { data } = useVisitorData({ immediate: true });
  const [status, setStatus] = useState('checking'); // 'checking' | 'blocked' | 'allowed'
  const resolvedRef = useRef(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!resolvedRef.current) {
        resolvedRef.current = true;
        setStatus('allowed');
      }
    }, CHECK_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!data?.event_id) return;
    let cancelled = false;

    fetch('/api/fingerprint/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId: data.event_id, visitorId: data.visitor_id }),
    })
      .then((res) => (res.ok ? res.json() : { blocked: false }))
      .then((result) => {
        if (cancelled || resolvedRef.current) return;
        resolvedRef.current = true;
        setStatus(result?.blocked ? 'blocked' : 'allowed');
      })
      .catch(() => {
        if (cancelled || resolvedRef.current) return;
        resolvedRef.current = true;
        setStatus('allowed');
      });

    return () => {
      cancelled = true;
    };
  }, [data?.event_id]);

  if (status === 'checking') {
    return (
      <>
        <style>{`
          @keyframes fpSpin { to { transform: rotate(360deg); } }
        `}</style>
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: '#0f172a',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundImage: 'url(/bg-main.jpeg)',
              backgroundPosition: 'center center',
              backgroundSize: '140%',
              backgroundRepeat: 'no-repeat',
              mixBlendMode: 'lighten',
              opacity: 0.13,
              zIndex: -1,
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: '3px solid rgba(168,85,247,0.25)',
              borderTopColor: '#a855f7',
              animation: 'fpSpin 0.8s linear infinite',
            }}
          />
        </div>
      </>
    );
  }

  if (status === 'blocked') {
    return (
      <>
        <style>{`
          @keyframes fpGlowPulse {
            0%, 100% { text-shadow: 0 0 20px rgba(239,68,68,0.6), 0 0 40px rgba(239,68,68,0.3); }
            50% { text-shadow: 0 0 40px rgba(239,68,68,1), 0 0 60px rgba(236,72,153,0.8), 0 0 80px rgba(168,85,247,0.5); }
          }
          @keyframes fpBorderGlow {
            0%, 100% { box-shadow: 0 0 15px rgba(239,68,68,0.4), 0 0 30px rgba(239,68,68,0.2); }
            50% { box-shadow: 0 0 25px rgba(239,68,68,0.7), 0 0 50px rgba(236,72,153,0.4); }
          }
          @keyframes fpPopIn {
            0% { opacity: 0; transform: translateY(20px) scale(0.96); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: '#0f172a',
            zIndex: 999999,
            overflowY: 'auto',
            display: 'flex',
            padding: '40px 12px',
            boxSizing: 'border-box',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundImage: 'url(/bg-main.jpeg)',
              backgroundPosition: 'center center',
              backgroundSize: '140%',
              backgroundRepeat: 'no-repeat',
              mixBlendMode: 'lighten',
              opacity: 0.13,
              zIndex: -1,
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              maxWidth: 480,
              width: '100%',
              margin: 'auto',
              textAlign: 'center',
              color: '#e2e8f0',
              background: 'rgba(15,23,42,0.6)',
              border: '2px solid rgba(239,68,68,0.35)',
              borderRadius: 16,
              padding: '36px 12px',
              position: 'relative',
              zIndex: 10,
              animation: 'fpPopIn 0.6s ease-out, fpBorderGlow 3s ease-in-out infinite',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                background: '#ec4899',
                color: '#fff',
                fontSize: 12,
                fontWeight: 700,
                padding: '5px 14px',
                borderRadius: 999,
                marginBottom: 14,
              }}
            >
              403 · RESTRICTED
            </span>
            <h1
              style={{
                color: '#ef4444',
                fontSize: 24,
                margin: '0 0 16px',
                fontWeight: 800,
                animation: 'fpGlowPulse 3s ease-in-out infinite',
              }}
            >
              Access Denied
            </h1>
            <p style={{ fontSize: 15, lineHeight: 1.7, margin: '0 0 14px' }}>
              <span style={{ color: '#06b6d4' }}>You have been blocked from accessing</span><br />
              <span style={{ color: '#ec4899' }}>TJB Management Inc.'s social media</span><br />
              <span style={{ color: '#a855f7' }}>accounts and systems.</span>
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.7, margin: 0 }}>
              <span style={{ color: '#d946ef' }}>If you believe this was done in error,</span><br />
              <span style={{ display: 'inline-block', whiteSpace: 'nowrap', fontSize: 12.5, lineHeight: 1.7, color: '#06b6d4' }}>
                please email{' '}
                <a
                  href="mailto:support@tjbmanagementinc.com"
                  style={{
                    background: 'linear-gradient(90deg, #d946ef 0%, #a855f7 25%, #3b82f6 50%, #06b6d4 75%, #d946ef 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontWeight: 600,
                    textDecoration: 'underline',
                  }}
                >
                  support@tjbmanagementinc.com
                </a>
              </span><br />
              <span style={{ color: '#ec4899' }}>for assistance.</span>
            </p>
          </div>
        </div>
      </>
    );
  }

  return children;
}
