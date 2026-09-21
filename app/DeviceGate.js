'use client';

import { useEffect, useRef, useState } from 'react';
import './GateSpinner.css';
import './DeviceGate.css';
import { getFingerprint } from '@/lib/fingerprint/collect';
import { getPersistentMarker } from '@/lib/fingerprint/persistentMarker';
import { collectBotSignals } from '@/lib/fingerprint/botSignals';
import { collectPrivacySignals } from '@/lib/fingerprint/privacySignals';

// How long to wait for our OWN local identification — the fingerprint
// (canvas/WebGL/audio/font collection, lib/fingerprint/collect.js) AND the
// persistent storage marker (lib/fingerprint/persistentMarker.js) — before
// concluding it failed. There's no remote script/network round-trip anymore
// (everything is bundled same-origin), so this is now just a watchdog
// against a hung or blocked browser API (a locked-down privacy browser can
// still disable Canvas/AudioContext/IndexedDB outright). This path fails
// CLOSED: if we can never even compute an identity to check, letting the
// visitor through unconditionally would make blocking those APIs an
// unintentional bypass of every device ban on the site.
const IDENTIFY_TIMEOUT_MS = 2000;

// How long to wait for OUR OWN /api/fingerprint/check call once a
// fingerprint IS available, before giving up. Fails CLOSED — any activity
// this can't verify (Redis error, a slow response, a network failure) is
// treated as unverified and blocked, not let through.
const CHECK_TIMEOUT_MS = 5000;

// Friendly labels for the 'unverified' screen's reason line. A purposeful
// block (device-blocklist match, or a high-confidence similarity match)
// shows 'blocked' instead — this map only covers cases where we couldn't
// actually complete verification.
const REASON_LABELS = {
  'fingerprint-error': "We couldn't compute a device identifier in your browser.",
  'check-timeout': 'Our verification service took too long to respond.',
  'check-api-error': 'Our verification service returned an error.',
  'network-error': "We couldn't reach our verification service.",
  'device-blocklist-check-error': "We couldn't confirm your device's status.",
  'no-components': 'Verification data was missing from your request.',
};

function reasonLabel(reason) {
  return REASON_LABELS[reason] ?? reason ?? 'We were unable to complete verification.';
}

// Blocks the whole site for visitors whose device fingerprint matches the
// blocklist at /admin/security — either exactly, or by weighted similarity
// (lib/deviceMatch.js) when a signal has drifted since the ban ('blocked' —
// a purposeful, confirmed block). Anything else we can't actually verify —
// local fingerprint computation failing, our own check call timing out/
// erroring, a Redis error, etc — shows the 'unverified' screen instead,
// with `reason` naming specifically why, since none of those are us
// blocking someone on purpose. The verdict is checked BEFORE showing any
// page content — a loading screen covers the page until it resolves (or
// times out), so nobody sees a flash of real content first.
export default function DeviceGate({ children }) {
  const [status, setStatus] = useState('checking'); // 'checking' | 'blocked' | 'unverified' | 'allowed'
  const [reason, setReason] = useState(null);
  const [visitorId, setVisitorId] = useState(null);
  const resolvedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const watchdog = setTimeout(() => {
      if (!cancelled && !resolvedRef.current) {
        resolvedRef.current = true;
        setReason('fingerprint-error');
        setStatus('unverified');
      }
    }, IDENTIFY_TIMEOUT_MS);

    Promise.all([getFingerprint(), getPersistentMarker(), collectBotSignals(), collectPrivacySignals()])
      .then(([{ visitorId: id, components }, persistentMarker, botSignals, privacySignals]) => {
        if (cancelled || resolvedRef.current) return;
        clearTimeout(watchdog);
        setVisitorId(id);

        const checkTimeout = setTimeout(() => {
          if (!cancelled && !resolvedRef.current) {
            resolvedRef.current = true;
            setReason('check-timeout');
            setStatus('unverified');
          }
        }, CHECK_TIMEOUT_MS);

        fetch('/api/fingerprint/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ visitorId: id, components, persistentMarker, botSignals, privacySignals }),
        })
          .then((res) => (res.ok ? res.json() : { verdict: 'unverified', reason: 'check-api-error' }))
          .then((result) => {
            if (cancelled || resolvedRef.current) return;
            resolvedRef.current = true;
            if (result?.verdict === 'blocked') {
              setStatus('blocked');
            } else if (result?.verdict === 'unverified') {
              setReason(result.reason ?? 'check-api-error');
              setStatus('unverified');
            } else {
              setStatus('allowed');
            }
          })
          .catch(() => {
            if (cancelled || resolvedRef.current) return;
            resolvedRef.current = true;
            setReason('network-error');
            setStatus('unverified');
          })
          .finally(() => clearTimeout(checkTimeout));
      })
      .catch(() => {
        if (cancelled || resolvedRef.current) return;
        resolvedRef.current = true;
        clearTimeout(watchdog);
        setReason('fingerprint-error');
        setStatus('unverified');
      });

    return () => { cancelled = true; clearTimeout(watchdog); };
  }, []);

  if (status === 'checking') {
    return (
      <div className="gate-overlay">
        <div className="gate-overlay-bg" />
        <div className="gate-spinner" />
      </div>
    );
  }

  if (status === 'blocked') {
    return (
      <div className="fp-screen">
        <div className="fp-screen-bg" />
        <div className="fp-card fp-card--blocked">
          <h1 className="fp-h1--blocked">Access Denied</h1>
          <p className="fp-p">
            <span className="fp-c-cyan">You have been blocked from accessing</span><br />
            <span className="fp-c-pink">TJB Management Inc.'s</span><br />
            <span className="fp-c-purple">social media accounts and systems.</span>
          </p>
          <p className="fp-p--final">
            <span className="fp-c-magenta">If you believe this was done in error,</span><br />
            <span className="fp-email-wrap">
              email{' '}
              <a href="mailto:support@tjbmanagementinc.com" className="fp-gradient-link">
                support@tjbmanagementinc.com
              </a>
            </span><br />
            <span className="fp-c-pink">for assistance.</span>
          </p>
          {visitorId && (
            <p className="fp-id-block">
              Your ID: <span className="fp-id-mono">{visitorId}</span>
              <br />
              <span className="fp-c-pink">(make sure to include this in your email,</span><br />
              <span className="fp-c-pink">otherwise we won&apos;t be able to identify you)</span>
            </p>
          )}
        </div>
      </div>
    );
  }

  if (status === 'unverified') {
    return (
      <div className="fp-screen">
        <div className="fp-screen-bg" />
        <div className="fp-card fp-card--unverified">
          <h1 className="fp-h1--unverified">
            We are unable<br />
            to verify you.
          </h1>
          <p className="fp-p">
            <span className="fp-reason-label">Reason: </span>
            <span className="fp-c-pink">{reasonLabel(reason)}</span>
          </p>
          <button onClick={() => window.location.reload()} className="fp-reload">
            reload this page.
          </button>
          <p className="fp-p--small">
            Still not working?<br />
            Email{' '}
            <a href="mailto:support@tjbmanagementinc.com" className="fp-gradient-link">
              support@tjbmanagementinc.com
            </a>
            .
          </p>
        </div>
      </div>
    );
  }

  return children;
}
